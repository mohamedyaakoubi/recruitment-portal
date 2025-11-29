// src/services/interview.ts
import { google } from 'googleapis';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { getAuthenticatedClient } from '@/lib/googleOAuth'; // 👈 CHANGE
import { sendCancellationEmail } from './email';
import logger from '@/lib/logger';
import crypto from 'crypto';

const generateMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randomBytes = crypto.randomBytes(5); // Generate 5 random bytes for 10 chars (3+4+3)

  const part1 = Array.from({ length: 3 }, (_, i) => chars[randomBytes[i]! % chars.length]).join('');
  const part2 = Array.from({ length: 4 }, (_, i) => chars[randomBytes[i % 5]! % chars.length]).join(
    ''
  );
  const part3 = Array.from(
    { length: 3 },
    (_, i) => chars[randomBytes[(i + 2) % 5]! % chars.length]
  ).join('');

  return `https://meet.google.com/${part1}-${part2}-${part3}`;
};

export const scheduleInterview = async (
  candidateId: string,
  candidateEmail: string,
  candidateName: string,
  interviewDate: string,
  interviewTime: string,
  duration = 30,
  jobTitle: string,
  adminEmail: string,
  notes: string,
  origin: string
): Promise<{
  meetLink: string;
  calendarEventId: string;
  interviewTimestampISO: string;
}> => {
  if (!candidateEmail || !candidateName || !interviewDate || !interviewTime) {
    throw new Error('Missing required fields');
  }

  const interviewDateTime = new Date(`${interviewDate}T${interviewTime}:00`);

  if (isNaN(interviewDateTime.getTime())) {
    throw new Error('Invalid date or time format');
  }

  const endDateTime = new Date(interviewDateTime.getTime() + duration * 60 * 1000);

  // Fetch the candidate document to check for an existing event
  const db = getFirestoreAdmin(); // 👈 CHANGE: Get Admin DB instance
  const candidateRef = db.collection('candidates').doc(candidateId); // 👈 CHANGE: Use Admin SDK syntax
  const candidateDoc = await candidateRef.get(); // 👈 CHANGE: Use Admin SDK syntax
  const existingEventId = candidateDoc.exists ? candidateDoc.data()?.calendarEventId : null; // 👈 CHANGE: Use Admin SDK syntax

  let meetLink = '';
  let calendarEventId = '';

  try {
    const auth = await getAuthenticatedClient();
    if (!auth) {
      throw new Error(
        'Google Calendar is not connected. Please connect an account in the admin settings.'
      );
    }
    const calendar = google.calendar({ version: 'v3', auth });

    const eventDetails = {
      summary: `Interview: ${jobTitle || 'Position'} - ${candidateName}`,
      description: `Interview scheduled with ${candidateName} for ${jobTitle || 'the position'} at International Skills Labor Company.\n\nCandidate Email: ${candidateEmail}\nDuration: ${duration} minutes${notes ? `\n\nNotes: ${notes}` : ''}`,
      start: {
        dateTime: interviewDateTime.toISOString(),
        timeZone: 'Europe/Helsinki',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Helsinki',
      },
      attendees: [
        {
          email: candidateEmail,
          displayName: candidateName,
          responseStatus: 'needsAction',
        },
        {
          email: adminEmail || 'wassim@internationalskills.fi',
          displayName: 'International Skills Hiring',
          responseStatus: 'accepted',
        },
      ],
      conferenceData: {
        createRequest: {
          requestId: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
      sendUpdates: 'all',
    };

    let response;
    if (existingEventId) {
      logger.info('Updating existing Google Calendar event', { eventId: existingEventId });
      response = await calendar.events.update({
        calendarId: 'primary',
        eventId: existingEventId,
        sendUpdates: 'all',
        conferenceDataVersion: 1,
        requestBody: eventDetails,
      });
    } else {
      logger.info('Inserting new Google Calendar event');
      response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: eventDetails,
      });
    }

    if (response.data) {
      calendarEventId = response.data.id || '';
      meetLink =
        response.data.conferenceData?.entryPoints?.[0]?.uri ||
        response.data.hangoutLink ||
        generateMeetLink();
    }
  } catch (googleError) {
    logger.error('Google Calendar API error', googleError);
    // Fallback to manual link generation if API fails but we don't want to block the whole process
    meetLink = generateMeetLink();
    // Re-throw if it's an auth error
    if (googleError instanceof Error && googleError.message.includes('not connected')) {
      throw googleError;
    }
  }

  try {
    const updateResponse = await fetch(`${origin}/api/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId,
        newStatus: 'interview_scheduled',
        interviewTimestampISO: interviewDateTime.toISOString(),
        meetLink: meetLink, // 👈 ADD THIS
        calendarEventId: calendarEventId, // 👈 ADD THIS
        duration: duration, // 👈 ADD THIS
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      logger.error('Failed to update candidate status', null, errorData);
      throw new Error(errorData.error || 'Failed to update status');
    }
  } catch (updateError) {
    logger.error('Database update error', updateError);
  }

  return {
    meetLink: meetLink,
    calendarEventId: calendarEventId,
    interviewTimestampISO: interviewDateTime.toISOString(),
  };
};

export const cancelInterview = async (candidateId: string, reason: string): Promise<void> => {
  if (!candidateId) {
    throw new Error('Candidate ID is required');
  }

  const db = getFirestoreAdmin(); // 👈 CHANGE: Get Admin DB instance
  const candidateRef = db.collection('candidates').doc(candidateId); // 👈 CHANGE: Use Admin SDK syntax
  const candidateDoc = await candidateRef.get(); // 👈 CHANGE: Use Admin SDK syntax

  if (!candidateDoc.exists) {
    throw new Error('Candidate not found');
  }

  const candidateData = candidateDoc.data();
  if (!candidateData) {
    throw new Error('Candidate data not found');
  }

  if (candidateData.calendarEventId) {
    try {
      const auth = await getAuthenticatedClient();
      if (auth) {
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
          calendarId: 'primary',
          eventId: candidateData.calendarEventId,
          sendUpdates: 'all',
        });

        logger.info('Google Calendar event deleted successfully', {
          eventId: candidateData.calendarEventId,
        });
      } else {
        logger.warn('Could not delete Google Calendar event: User is not authenticated');
      }
    } catch (googleError) {
      logger.error('Failed to delete Google Calendar event', googleError);
    }
  }

  await candidateRef.update({
    // 👈 CHANGE: Use Admin SDK syntax
    status: 'submitted',
    interviewDate: null,
    calendarEventId: null,
    meetLink: null,
    duration: null,
  });

  if (candidateData.email) {
    try {
      await sendCancellationEmail({
        candidateEmail: candidateData.email,
        candidateName: candidateData.fullName,
        jobTitle: candidateData.jobTitleText,
        reason,
      });
    } catch (emailError) {
      logger.error('Failed to send cancellation email', emailError);
    }
  }
};

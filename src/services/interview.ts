// src/services/interview.ts
import { google } from 'googleapis';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getGoogleAuth } from './google';
import { sendCancellationEmail } from './email';

const generateMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  
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
) => {
  if (!candidateEmail || !candidateName || !interviewDate || !interviewTime) {
    throw new Error('Missing required fields');
  }

  const interviewDateTime = new Date(`${interviewDate}T${interviewTime}:00`);

  if (isNaN(interviewDateTime.getTime())) {
    throw new Error('Invalid date or time format');
  }

  const endDateTime = new Date(interviewDateTime.getTime() + (duration * 60 * 1000));

  let meetLink = '';
  let calendarEventId = '';

  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const eventDetails = {
      summary: `Interview: ${jobTitle || 'Position'} - ${candidateName}`,
      description: `Interview scheduled with ${candidateName} for ${jobTitle || 'the position'} at International Skills Labor Company.\n\nCandidate Email: ${candidateEmail}\nDuration: ${duration} minutes${notes ? `\n\nNotes: ${notes}` : ''}`,
      start: {
        dateTime: interviewDateTime.toISOString(),
        timeZone: 'Europe/Helsinki'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Helsinki'
      },
      attendees: [
        { 
          email: candidateEmail, 
          displayName: candidateName,
          responseStatus: 'needsAction'
        },
        { 
          email: adminEmail || 'wassim@internationalskills.fi', 
          displayName: 'Interviewer',
          responseStatus: 'accepted'
        }
      ],
      conferenceData: {
        createRequest: {
          requestId: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 }
        ]
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
      sendUpdates: 'all'
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: eventDetails
    });

    if (response.data) {
      calendarEventId = response.data.id || '';
      meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || 
                 response.data.hangoutLink || 
                 generateMeetLink();
    }

  } catch (googleError) {
    console.error('Google Calendar API error:', googleError);
    meetLink = generateMeetLink();
  }

  try {
    const updateResponse = await fetch(`${origin}/api/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        candidateId, 
        newStatus: 'interview_scheduled', 
        interviewTimestampISO: interviewDateTime.toISOString()
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Failed to update candidate status:', errorData);
      throw new Error(errorData.error || 'Failed to update status');
    }
  } catch (updateError) {
    console.error('Database update error:', updateError);
  }

  return {
    interviewDateTime: interviewDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    duration: duration,
    meetLink: meetLink,
    calendarEventId: calendarEventId,
    emailsSent: {
      candidate: candidateEmail,
      interviewer: adminEmail || 'wassim@internationalskills.fi'
    }
  };
};

export const cancelInterview = async (candidateId: string, reason: string) => {
  if (!candidateId) {
    throw new Error('Candidate ID is required');
  }

  const candidateRef = doc(db, 'candidates', candidateId);
  const candidateDoc = await getDoc(candidateRef);
  
  if (!candidateDoc.exists()) {
    throw new Error('Candidate not found');
  }

  const candidateData = candidateDoc.data();
  
  if (candidateData.calendarEventId) {
    try {
      const auth = getGoogleAuth();
      const calendar = google.calendar({ version: 'v3', auth });
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: candidateData.calendarEventId,
        sendUpdates: 'all'
      });
      
      console.log('Google Calendar event deleted successfully:', candidateData.calendarEventId);
    } catch (googleError) {
      console.error('Failed to delete Google Calendar event:', googleError);
    }
  }

  await updateDoc(candidateRef, {
    status: 'submitted',
    interviewDate: null,
    calendarEventId: null,
    meetLink: null,
    duration: null
  });

  if (candidateData.email) {
    try {
      await sendCancellationEmail({
        candidateEmail: candidateData.email,
        candidateName: candidateData.fullName,
        jobTitle: candidateData.jobTitleText,
        reason
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }
  }
};
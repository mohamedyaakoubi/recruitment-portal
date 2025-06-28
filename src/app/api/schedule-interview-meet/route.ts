// src/app/api/schedule-interview-meet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export async function POST(request: NextRequest) {
  try {
    const { candidateEmail, candidateName, interviewDateTime, jobTitle, interviewerEmail } = await request.json();

    if (!candidateEmail || !candidateName || !interviewDateTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // For now, we'll create a simple calendar event structure
    // In production, you would need to set up proper OAuth credentials
    // and authentication flow for Google Calendar API
    
    // This is a placeholder implementation that shows the structure
    // The actual implementation would require:
    // 1. Google Cloud project setup
    // 2. OAuth 2.0 credentials
    // 3. Proper authentication flow
    
    const meetingDetails = {
      summary: `Interview: ${jobTitle || 'Position'} - ${candidateName}`,
      description: `Interview scheduled with ${candidateName} for ${jobTitle || 'the position'} at International Skills Labor Company.`,
      start: {
        dateTime: new Date(interviewDateTime).toISOString(),
        timeZone: 'Europe/Helsinki'
      },
      end: {
        dateTime: new Date(new Date(interviewDateTime).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
        timeZone: 'Europe/Helsinki'
      },
      attendees: [
        { email: candidateEmail, displayName: candidateName },
        { email: interviewerEmail || 'wassim@internationalskills.fi', displayName: 'Interviewer' }
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
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }       // 30 minutes before
        ]
      }
    };

    // For now, return the meeting structure that would be created
    // In production, this would actually create the calendar event
    console.log('Would create Google Calendar event:', meetingDetails);

    // Simulate a Google Meet link (in production, this would come from the actual API response)
    const simulatedMeetLink = `https://meet.google.com/abc-defg-hij`;

    // Send email notification with meeting details
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Scheduled</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #1e3a8a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .meeting-details {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .meet-link {
            background-color: #4285f4;
            color: white;
            padding: 15px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 10px 0;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://internationalskills.fi/wp-content/uploads/2023/07/logo-skills.png" alt="International Skills" style="max-width: 200px; margin-bottom: 20px;">
          <h1>Interview Scheduled</h1>
        </div>
        
        <div class="content">
          <p>Dear ${candidateName},</p>
          
          <p>We are pleased to inform you that your interview for ${jobTitle || 'the position'} at International Skills Labor Company has been scheduled.</p>
          
          <div class="meeting-details">
            <h3>📅 Interview Details:</h3>
            <p><strong>Date & Time:</strong> ${new Date(interviewDateTime).toLocaleString('en-US', { 
              timeZone: 'Europe/Helsinki',
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</p>
            <p><strong>Duration:</strong> Approximately 1 hour</p>
            <p><strong>Format:</strong> Video interview via Google Meet</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${simulatedMeetLink}" class="meet-link">🎥 Join Google Meet</a>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">
              Meeting Link: <a href="${simulatedMeetLink}">${simulatedMeetLink}</a>
            </p>
          </div>
          
          <h3>📋 What to Expect:</h3>
          <ul>
            <li>Please join the meeting 5 minutes before the scheduled time</li>
            <li>Ensure you have a stable internet connection</li>
            <li>Test your camera and microphone beforehand</li>
            <li>Have your resume and any relevant documents ready</li>
            <li>Prepare questions about the role and company</li>
          </ul>
          
          <h3>📞 Contact Information:</h3>
          <p>If you have any questions or need to reschedule, please contact us:</p>
          <p><strong>Email:</strong> wassim@internationalskills.fi</p>
          <p><strong>Phone:</strong> +358 452644966 | +216 29 581 180</p>
          
          <p>We look forward to speaking with you!</p>
          
          <div class="footer">
            <p>Best regards,<br>
            <strong>International Skills Labor Company</strong><br>
            Human Resources Department</p>
            
            <p><em>Please save this email for your records. The Google Meet link will remain active for the scheduled interview time.</em></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // In a real implementation, you would send this email using your SMTP configuration
    console.log('Would send interview scheduling email to:', candidateEmail);

    return NextResponse.json({ 
      success: true, 
      message: 'Interview scheduled successfully',
      meetingDetails: {
        meetLink: simulatedMeetLink,
        dateTime: interviewDateTime,
        attendees: [candidateEmail, interviewerEmail || 'wassim@internationalskills.fi']
      },
      note: 'This is a placeholder implementation. In production, this would create an actual Google Calendar event with a real Google Meet link.'
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { error: 'Failed to schedule interview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to create Google Calendar event (for future implementation)
async function createGoogleCalendarEvent(eventDetails: any, authClient: OAuth2Client) {
  // This would be implemented when proper Google OAuth is set up
  const calendar = google.calendar({ version: 'v3', auth: authClient });
  
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: eventDetails
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}


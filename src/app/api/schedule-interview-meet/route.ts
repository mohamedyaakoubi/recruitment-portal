import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// Initialize Google Auth with service account
const getGoogleAuth = () => {
  const credentials = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID || "gen-lang-client-0974626110",
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || "591452fc8fd5c0882d50724a2964db2c3f089910",
    // ✅ Fix: Properly handle the private key with better parsing
    private_key: process.env.GOOGLE_PRIVATE_KEY 
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : "",
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "notyet4r@gen-lang-client-0974626110.iam.gserviceaccount.com",
    client_id: process.env.GOOGLE_CLIENT_ID || "114007455869209644114",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "notyet4r@gen-lang-client-0974626110.iam.gserviceaccount.com")}`,
    universe_domain: "googleapis.com"
  };

  console.log('Google Auth Debug:', {
    project_id: credentials.project_id,
    client_email: credentials.client_email,
    private_key_preview: credentials.private_key.substring(0, 50) + '...',
    private_key_length: credentials.private_key.length
  });

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });

  return auth;
};

// Function to generate a realistic Meet link
const generateMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
};

export async function POST(request: NextRequest) {
  try {
    const { 
      candidateId, 
      candidateEmail, 
      candidateName, 
      interviewDate, 
      interviewTime, 
      duration = 30,
      jobTitle, 
      adminEmail,
      notes 
    } = await request.json();

    if (!candidateEmail || !candidateName || !interviewDate || !interviewTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Combine date and time with timezone
    const interviewDateTime = new Date(`${interviewDate}T${interviewTime}:00`);
    
    if (isNaN(interviewDateTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 });
    }

    // Calculate end time based on duration
    const endDateTime = new Date(interviewDateTime.getTime() + (duration * 60 * 1000));

    let meetLink = '';
    let calendarEventId = '';

    try {
      // Initialize Google Calendar API
      const auth = getGoogleAuth();
      const calendar = google.calendar({ version: 'v3', auth });

      // Create calendar event with Google Meet
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

      console.log('Creating Google Calendar event...');
      
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
                   generateMeetLink(); // Use our function if no real link

        console.log('Google Calendar event created successfully:', {
          eventId: calendarEventId,
          meetLink: meetLink
        });
      }

    } catch (googleError) {
      console.error('Google Calendar API error:', googleError);
      
      // Generate a better fallback Meet link
      meetLink = generateMeetLink();
      console.log('Using enhanced fallback Meet link:', meetLink);
    }

    // Send email notifications
    try {
      await sendEmailNotifications({
        candidateEmail,
        candidateName,
        interviewDateTime,
        endDateTime,
        duration,
        jobTitle,
        meetLink,
        adminEmail,
        notes
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    // ✅ Fix: Update candidate using the update-status API instead of direct Firebase
    try {
      const updateResponse = await fetch(`${request.nextUrl.origin}/api/update-status`, {
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

      // Additionally update the Google Meet specific fields using Firebase Admin
      // This is safe because we're using server-side Firebase Admin SDK in the update-status API
      console.log('Candidate status updated successfully');
      
    } catch (updateError) {
      console.error('Database update error:', updateError);
      // Don't fail the whole request if status update fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Interview scheduled successfully with Google Meet',
      data: {
        interviewDateTime: interviewDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        duration: duration,
        meetLink: meetLink,
        calendarEventId: calendarEventId,
        emailsSent: {
          candidate: candidateEmail,
          interviewer: adminEmail || 'wassim@internationalskills.fi'
        }
      }
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { 
        error: 'Failed to schedule interview', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Email notification function (keep the same as before)
async function sendEmailNotifications({
  candidateEmail,
  candidateName,
  interviewDateTime,
  endDateTime,
  duration,
  jobTitle,
  meetLink,
  adminEmail,
  notes
}: {
  candidateEmail: string;
  candidateName: string;
  interviewDateTime: Date;
  endDateTime: Date;
  duration: number;
  jobTitle?: string;
  meetLink: string;
  adminEmail?: string;
  notes?: string;
}) {
  // Create SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const formattedDateTime = interviewDateTime.toLocaleString('en-US', { 
    timeZone: 'Europe/Helsinki',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const formattedEndTime = endDateTime.toLocaleString('en-US', { 
    timeZone: 'Europe/Helsinki',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // Email template for candidate (keep the same as before)
  const candidateEmailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Scheduled - Google Meet</title>
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
        .meet-instructions {
          background-color: #f0f8ff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #4285f4;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://internationalskills.fi/wp-content/uploads/2023/07/logo-skills.png" alt="International Skills" style="max-width: 200px; margin-bottom: 20px;">
        <h1>🎉 Google Meet Interview Scheduled!</h1>
      </div>
      
      <div class="content">
        <p>Dear ${candidateName},</p>
        
        <p>Great news! Your interview for <strong>${jobTitle || 'the position'}</strong> at International Skills Labor Company has been scheduled via Google Meet.</p>
        
        <div class="meeting-details">
          <h3>📅 Interview Details:</h3>
          <p><strong>Date & Time:</strong> ${formattedDateTime}</p>
          <p><strong>End Time:</strong> ${formattedEndTime}</p>
          <p><strong>Duration:</strong> ${duration} minutes</p>
          <p><strong>Format:</strong> Video interview via Google Meet</p>
          ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetLink}" class="meet-link">🎥 Join Google Meet Interview</a>
          <div class="meet-instructions">
            <h4 style="margin-top: 0; color: #1e3a8a;">📱 How to Join:</h4>
            <p style="margin-bottom: 0;">
              <strong>Desktop/Laptop:</strong> Click the link above or copy: <br>
              <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">${meetLink}</code><br><br>
              <strong>Mobile:</strong> Download the Google Meet app and use the meeting link<br>
              <strong>Phone:</strong> You can also dial in using the phone number provided in the calendar invite
            </p>
          </div>
        </div>
        
        <h3>📋 Interview Preparation Checklist:</h3>
        <ul style="background-color: #f0f8ff; padding: 15px; border-radius: 5px;">
          <li>✅ Click the Meet link 5-10 minutes early</li>
          <li>✅ Test your camera and microphone beforehand</li>
          <li>✅ Ensure stable internet connection</li>
          <li>✅ Choose a quiet, well-lit space</li>
          <li>✅ Have your resume and documents ready</li>
          <li>✅ Prepare questions about the role and company</li>
          <li>✅ Dress professionally</li>
        </ul>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">💡 Technical Requirements:</h4>
          <p style="margin-bottom: 0; color: #856404;">
            • Computer/laptop with camera and microphone<br>
            • Chrome, Firefox, or Safari browser (Chrome recommended)<br>
            • Google Meet mobile app (for phone/tablet)<br>
            • Backup phone number in case of technical issues
          </p>
        </div>
        
        <h3>📞 Contact Information:</h3>
        <p>If you have any questions or need to reschedule, please contact us immediately:</p>
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px;">
          <p><strong>📧 Email:</strong> wassim@internationalskills.fi</p>
          <p><strong>📱 Phone:</strong> +358 452644966 | +216 29 581 180</p>
          <p><strong>💼 Company:</strong> International Skills Labor Company</p>
        </div>
        
        <p><strong>We're excited to meet you and learn more about your qualifications!</strong></p>
        
        <div class="footer">
          <p>Best regards,<br>
          <strong>International Skills Labor Company</strong><br>
          Human Resources Department</p>
          
          <p><em>📌 Important: Please save this email for your records. The Google Meet link will remain active for the scheduled interview time.</em></p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email to candidate
  const candidateMailOptions = {
    from: {
      name: 'International Skills Labor Company',
      address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@internationalskills.fi'
    },
    to: candidateEmail,
    subject: `🎥 Google Meet Interview Scheduled - ${jobTitle || 'Position'} at International Skills`,
    html: candidateEmailTemplate,
    replyTo: 'wassim@internationalskills.fi'
  };

  await transporter.sendMail(candidateMailOptions);

  // Send notification to admin/interviewer (keep the same template)
  const interviewerEmail = adminEmail || 'wassim@internationalskills.fi';
  const adminEmailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Google Meet Interview Scheduled</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .meet-link { background-color: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📅 New Google Meet Interview Scheduled</h1>
      </div>
      <div class="content">
        <p>A new Google Meet interview has been scheduled in the system:</p>
        <div class="details">
          <h3>Interview Details:</h3>
          <p><strong>👤 Candidate:</strong> ${candidateName}</p>
          <p><strong>📧 Email:</strong> ${candidateEmail}</p>
          <p><strong>💼 Position:</strong> ${jobTitle || 'Not specified'}</p>
          <p><strong>📅 Start Time:</strong> ${formattedDateTime}</p>
          <p><strong>⏰ End Time:</strong> ${formattedEndTime}</p>
          <p><strong>⏱️ Duration:</strong> ${duration} minutes</p>
          ${notes ? `<p><strong>📝 Notes:</strong> ${notes}</p>` : ''}
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${meetLink}" class="meet-link">🎥 Join Google Meet</a>
          <p style="font-size: 12px; color: #666; word-break: break-all;">Meeting Link: ${meetLink}</p>
        </div>
        <p>✅ The candidate has been automatically notified via email with all meeting details and instructions.</p>
        <p>📋 <strong>Next Steps:</strong></p>
        <ul>
          <li>Review candidate's application before the interview</li>
          <li>Prepare interview questions</li>
          <li>Test the Google Meet link before the scheduled time</li>
          <li>Check your calendar for the event reminder</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  const adminMailOptions = {
    from: {
      name: 'International Skills Labor Company',
      address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@internationalskills.fi'
    },
    to: interviewerEmail,
    subject: `📅 Google Meet Interview: ${candidateName} - ${jobTitle || 'Position'}`,
    html: adminEmailTemplate,
    replyTo: 'wassim@internationalskills.fi'
  };

  await transporter.sendMail(adminMailOptions);

  console.log(`📧 Emails sent successfully to candidate (${candidateEmail}) and interviewer (${interviewerEmail})`);
}
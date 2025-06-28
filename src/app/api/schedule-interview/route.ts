// src/app/api/schedule-interview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { format, addHours } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const { candidateId, candidateEmail, candidateName, interviewDate, interviewTime, jobTitle, adminEmail } = await request.json();

    if (!candidateEmail || !candidateName || !interviewDate || !interviewTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse the interview date and time
    const interviewDateTime = new Date(`${interviewDate}T${interviewTime}`);
    const interviewEndTime = addHours(interviewDateTime, 1); // 1 hour interview

    // Generate Google Meet link (simplified - in production, use Google Calendar API)
    const meetingId = `interview-${candidateId}-${Date.now()}`;
    const googleMeetLink = `https://meet.google.com/${meetingId}`;

    // Create SMTP transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email template for candidate
    const candidateHtmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Invitation - International Skills</title>
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
          .logo {
            max-width: 200px;
            margin-bottom: 20px;
          }
          .meeting-details {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .meeting-link {
            background-color: #1976d2;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 10px 0;
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
          <img src="https://internationalskills.fi/wp-content/uploads/2023/07/logo-skills.png" alt="International Skills" class="logo">
          <h1>Interview Invitation</h1>
        </div>
        
        <div class="content">
          <p>Dear ${candidateName},</p>
          
          <p>Congratulations! We are pleased to invite you for an interview for ${jobTitle ? `the ${jobTitle} position` : 'a position'} at International Skills Labor Company.</p>
          
          <div class="meeting-details">
            <h3>📅 Interview Details:</h3>
            <p><strong>Date:</strong> ${format(interviewDateTime, 'EEEE, MMMM dd, yyyy')}</p>
            <p><strong>Time:</strong> ${format(interviewDateTime, 'HH:mm')} - ${format(interviewEndTime, 'HH:mm')} (1 hour)</p>
            <p><strong>Format:</strong> Online via Google Meet</p>
            
            <p><strong>Join the meeting:</strong></p>
            <a href="${googleMeetLink}" class="meeting-link">Join Google Meet</a>
            
            <p><em>Please join the meeting 5 minutes before the scheduled time.</em></p>
          </div>
          
          <h3>📋 What to Expect:</h3>
          <ul>
            <li>Discussion about your background and experience</li>
            <li>Overview of the role and company</li>
            <li>Opportunity for you to ask questions</li>
            <li>Next steps in the hiring process</li>
          </ul>
          
          <h3>📝 Preparation Tips:</h3>
          <ul>
            <li>Test your camera and microphone beforehand</li>
            <li>Ensure you have a stable internet connection</li>
            <li>Find a quiet, well-lit space for the interview</li>
            <li>Have a copy of your resume and any questions ready</li>
          </ul>
          
          <p>If you need to reschedule or have any questions, please contact us as soon as possible at <a href="mailto:wassim@internationalskills.fi">wassim@internationalskills.fi</a> or call +358 452644966.</p>
          
          <p>We look forward to speaking with you!</p>
          
          <div class="footer">
            <p>Best regards,<br>
            <strong>International Skills Labor Company</strong><br>
            Human Resources Department</p>
            
            <p><strong>Contact Information:</strong><br>
            Email: wassim@internationalskills.fi<br>
            Phone: +358 452644966 | +216 29 581 180<br>
            Website: <a href="https://internationalskills.fi">internationalskills.fi</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Calendar event (ICS format)
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//International Skills//Interview Scheduler//EN
BEGIN:VEVENT
UID:${meetingId}@internationalskills.fi
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}
DTSTART:${format(interviewDateTime, "yyyyMMdd'T'HHmmss")}
DTEND:${format(interviewEndTime, "yyyyMMdd'T'HHmmss")}
SUMMARY:Interview - ${candidateName} - ${jobTitle || 'Position'}
DESCRIPTION:Interview with ${candidateName} for ${jobTitle || 'a position'} at International Skills Labor Company.\\n\\nGoogle Meet: ${googleMeetLink}
LOCATION:${googleMeetLink}
ORGANIZER:mailto:${adminEmail || 'wassim@internationalskills.fi'}
ATTENDEE:mailto:${candidateEmail}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    // Send email to candidate
    const candidateMailOptions = {
      from: {
        name: 'International Skills Labor Company',
        address: process.env.SMTP_USER || 'noreply@internationalskills.fi'
      },
      to: candidateEmail,
      subject: `Interview Invitation - ${jobTitle || 'Position'} - International Skills`,
      html: candidateHtmlTemplate,
      replyTo: 'wassim@internationalskills.fi',
      attachments: [
        {
          filename: 'interview.ics',
          content: icsContent,
          contentType: 'text/calendar'
        }
      ]
    };

    await transporter.sendMail(candidateMailOptions);

    // Send notification to admin if admin email is provided
    if (adminEmail) {
      const adminHtmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Interview Scheduled - Admin Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Interview Scheduled</h2>
          <p>An interview has been scheduled with the following details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Candidate:</strong> ${candidateName}</p>
            <p><strong>Email:</strong> ${candidateEmail}</p>
            <p><strong>Position:</strong> ${jobTitle || 'Not specified'}</p>
            <p><strong>Date:</strong> ${format(interviewDateTime, 'EEEE, MMMM dd, yyyy')}</p>
            <p><strong>Time:</strong> ${format(interviewDateTime, 'HH:mm')} - ${format(interviewEndTime, 'HH:mm')}</p>
            <p><strong>Google Meet:</strong> <a href="${googleMeetLink}">${googleMeetLink}</a></p>
          </div>
          
          <p>The candidate has been notified and will receive a calendar invitation.</p>
        </body>
        </html>
      `;

      const adminMailOptions = {
        from: {
          name: 'International Skills Labor Company',
          address: process.env.SMTP_USER || 'noreply@internationalskills.fi'
        },
        to: adminEmail,
        subject: `Interview Scheduled - ${candidateName} - ${format(interviewDateTime, 'MMM dd, yyyy')}`,
        html: adminHtmlTemplate,
        attachments: [
          {
            filename: 'interview.ics',
            content: icsContent,
            contentType: 'text/calendar'
          }
        ]
      };

      await transporter.sendMail(adminMailOptions);
    }

    console.log(`Interview scheduled for ${candidateName} on ${format(interviewDateTime, 'yyyy-MM-dd HH:mm')}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Interview scheduled and invitations sent successfully',
      meetingLink: googleMeetLink,
      interviewDateTime: interviewDateTime.toISOString()
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { error: 'Failed to schedule interview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


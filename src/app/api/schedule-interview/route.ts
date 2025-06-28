// src/app/api/schedule-interview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { 
      candidateId, 
      candidateEmail, 
      candidateName, 
      interviewDate, 
      interviewTime, 
      jobTitle, 
      adminEmail 
    } = await request.json();

    if (!candidateEmail || !candidateName || !interviewDate || !interviewTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Combine date and time
    const interviewDateTime = new Date(`${interviewDate}T${interviewTime}:00`);
    
    if (isNaN(interviewDateTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 });
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generate a simulated Google Meet link (in production, this would come from Google Calendar API)
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 3)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 3)}`;

    // Email template for candidate
    const candidateEmailTemplate = `
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
            <p><strong>Date & Time:</strong> ${interviewDateTime.toLocaleString('en-US', { 
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
            <a href="${meetLink}" class="meet-link">🎥 Join Google Meet</a>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">
              Meeting Link: <a href="${meetLink}">${meetLink}</a>
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

    const candidateTextTemplate = `
Dear ${candidateName},

We are pleased to inform you that your interview for ${jobTitle || 'the position'} at International Skills Labor Company has been scheduled.

Interview Details:
Date & Time: ${interviewDateTime.toLocaleString('en-US', { 
  timeZone: 'Europe/Helsinki',
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
})}
Duration: Approximately 1 hour
Format: Video interview via Google Meet

Google Meet Link: ${meetLink}

What to Expect:
- Please join the meeting 5 minutes before the scheduled time
- Ensure you have a stable internet connection
- Test your camera and microphone beforehand
- Have your resume and any relevant documents ready
- Prepare questions about the role and company

Contact Information:
If you have any questions or need to reschedule, please contact us:
Email: wassim@internationalskills.fi
Phone: +358 452644966 | +216 29 581 180

We look forward to speaking with you!

Best regards,
International Skills Labor Company
Human Resources Department

Please save this email for your records. The Google Meet link will remain active for the scheduled interview time.
    `;

    // Send email to candidate
    const candidateMailOptions = {
      from: {
        name: 'International Skills Labor Company',
        address: process.env.SMTP_USER || 'noreply@internationalskills.fi'
      },
      to: candidateEmail,
      subject: `Interview Scheduled - ${jobTitle || 'Position'} at International Skills Labor Company`,
      text: candidateTextTemplate,
      html: candidateEmailTemplate,
      replyTo: 'wassim@internationalskills.fi'
    };

    await transporter.sendMail(candidateMailOptions);

    // Send notification email to admin/interviewer
    const interviewerEmail = adminEmail || 'wassim@internationalskills.fi';
    const adminEmailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Interview Scheduled - Admin Notification</title>
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
          <h1>Interview Scheduled - Admin Notification</h1>
        </div>
        <div class="content">
          <p>An interview has been scheduled in the system:</p>
          <div class="details">
            <h3>Interview Details:</h3>
            <p><strong>Candidate:</strong> ${candidateName}</p>
            <p><strong>Email:</strong> ${candidateEmail}</p>
            <p><strong>Position:</strong> ${jobTitle || 'Not specified'}</p>
            <p><strong>Date & Time:</strong> ${interviewDateTime.toLocaleString('en-US', { 
              timeZone: 'Europe/Helsinki',
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</p>
          </div>
          <div style="text-align: center;">
            <a href="${meetLink}" class="meet-link">Join Google Meet</a>
          </div>
          <p>The candidate has been notified via email with the meeting details.</p>
        </div>
      </body>
      </html>
    `;

    const adminMailOptions = {
      from: {
        name: 'International Skills Labor Company',
        address: process.env.SMTP_USER || 'noreply@internationalskills.fi'
      },
      to: interviewerEmail,
      subject: `Interview Scheduled: ${candidateName} - ${jobTitle || 'Position'}`,
      html: adminEmailTemplate,
      replyTo: 'wassim@internationalskills.fi'
    };

    await transporter.sendMail(adminMailOptions);

    console.log(`Interview scheduled for ${candidateName} at ${interviewDateTime.toISOString()}`);
    console.log(`Emails sent to candidate (${candidateEmail}) and interviewer (${interviewerEmail})`);

    return NextResponse.json({ 
      success: true, 
      message: 'Interview scheduled successfully',
      interviewDateTime: interviewDateTime.toISOString(),
      meetLink: meetLink,
      emailsSent: {
        candidate: candidateEmail,
        interviewer: interviewerEmail
      }
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { error: 'Failed to schedule interview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


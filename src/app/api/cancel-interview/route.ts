import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Initialize Google Auth with service account
const getGoogleAuth = () => {
  const credentials = {
    type: "service_account",
    project_id: "gen-lang-client-0974626110",
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || "591452fc8fd5c0882d50724a2964db2c3f089910",
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "",
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "notyet4r@gen-lang-client-0974626110.iam.gserviceaccount.com",
    client_id: process.env.GOOGLE_CLIENT_ID || "114007455869209644114",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "notyet4r@gen-lang-client-0974626110.iam.gserviceaccount.com")}`,
    universe_domain: "googleapis.com"
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });

  return auth;
};

export async function POST(request: NextRequest) {
  try {
    const { candidateId, reason = 'Cancelled by admin' } = await request.json();

    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    // Get candidate data from Firebase
    const candidateRef = doc(db, 'candidates', candidateId);
    const candidateDoc = await getDoc(candidateRef);
    
    if (!candidateDoc.exists()) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const candidateData = candidateDoc.data();
    
    // Delete Google Calendar event if it exists
    if (candidateData.calendarEventId) {
      try {
        const auth = getGoogleAuth();
        const calendar = google.calendar({ version: 'v3', auth });
        
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: candidateData.calendarEventId,
          sendUpdates: 'all' // Notify attendees about cancellation
        });
        
        console.log('Google Calendar event deleted successfully:', candidateData.calendarEventId);
      } catch (googleError) {
        console.error('Failed to delete Google Calendar event:', googleError);
        // Continue with the process even if calendar deletion fails
      }
    }

    // Update candidate status in Firebase
    await updateDoc(candidateRef, {
      status: 'submitted', // Revert back to submitted status
      interviewDate: null,
      calendarEventId: null,
      meetLink: null,
      duration: null
    });

    // Send cancellation email to candidate
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
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Interview cancelled successfully' 
    });

  } catch (error) {
    console.error('Error cancelling interview:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel interview', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Email notification function for cancellation
async function sendCancellationEmail({
  candidateEmail,
  candidateName,
  jobTitle,
  reason
}: {
  candidateEmail: string;
  candidateName: string;
  jobTitle?: string;
  reason: string;
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

  const cancellationEmailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Cancelled</title>
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
          background-color: #dc2626;
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
        .notice {
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin: 20px 0;
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
        <h1>⚠️ Interview Cancelled</h1>
      </div>
      
      <div class="content">
        <p>Dear ${candidateName},</p>
        
        <div class="notice">
          <p><strong>We regret to inform you that your scheduled interview for ${jobTitle || 'the position'} at International Skills Labor Company has been cancelled.</strong></p>
        </div>
        
        <p><strong>Reason:</strong> ${reason}</p>
        
        <p>We apologize for any inconvenience this may cause. Our hiring process is dynamic, and sometimes we need to make adjustments to our interview schedule.</p>
        
        <h3>📋 What happens next:</h3>
        <ul>
          <li>Your application remains active in our system</li>
          <li>We may reschedule the interview at a later date</li>
          <li>You may apply for other suitable positions</li>
          <li>We will contact you if there are new opportunities that match your profile</li>
        </ul>
        
        <h3>📞 Contact Us:</h3>
        <p>If you have any questions or concerns, please don't hesitate to contact us:</p>
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px;">
          <p><strong>📧 Email:</strong> wassim@internationalskills.fi</p>
          <p><strong>📱 Phone:</strong> +358 452644966 | +216 29 581 180</p>
          <p><strong>💼 Company:</strong> International Skills Labor Company</p>
        </div>
        
        <p>Thank you for your understanding, and we appreciate your continued interest in International Skills Labor Company.</p>
        
        <div class="footer">
          <p>Best regards,<br>
          <strong>International Skills Labor Company</strong><br>
          Human Resources Department</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: {
      name: 'International Skills Labor Company',
      address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@internationalskills.fi'
    },
    to: candidateEmail,
    subject: `⚠️ Interview Cancelled - ${jobTitle || 'Position'} at International Skills`,
    html: cancellationEmailTemplate,
    replyTo: 'wassim@internationalskills.fi'
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Cancellation email sent to ${candidateEmail}`);
}
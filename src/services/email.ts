// src/services/email.ts
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM_EMAIL;

const smtpConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM;

if (!smtpConfigured) {
    console.warn("SMTP environment variables are not fully set. Email notifications will be disabled.");
}

const transporter = smtpConfigured ? nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
}) : null;

export const sendNotificationEmail = async (to: string, status: string, candidateName: string, interviewDate?: Date) => {
    if (!transporter) {
        console.log("SMTP not configured, skipping email notification.");
        return;
    }

    let subject = '';
    let htmlBody = '';
    const companyName = "Your Company Name";

    if (status === 'rejected') {
        subject = `Update on your application with ${companyName}`;
        htmlBody = `
            <p>Dear ${candidateName},</p>
            <p>Thank you for your interest in ${companyName} and for taking the time to apply.</p>
            <p>We received a large number of applications, and after careful consideration, we have decided not to move forward with your candidacy at this time.</p>
            <p>This was a difficult decision due to the high caliber of applicants. We wish you the best in your job search.</p>
            <p>Sincerely,</p>
            <p>The ${companyName} Hiring Team</p>
        `;
    } else if (status === 'interview_scheduled' && interviewDate) {
        subject = `Interview Invitation from ${companyName}`;
        const formattedDate = interviewDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = interviewDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
        htmlBody = `
            <p>Dear ${candidateName},</p>
            <p>Thank you for your application to ${companyName}. We were impressed with your background and would like to invite you for an interview.</p>
            <p>Your interview is scheduled for:</p>
            <p><b>Date:</b> ${formattedDate}</p>
            <p><b>Time:</b> ${formattedTime}</p>
            <p>[Optional: Add details about interview format, location/link, interviewer name, etc. here]</p>
            <p>Please confirm if this time works for you. If not, please let us know your availability.</p>
            <p>We look forward to speaking with you.</p>
            <p>Sincerely,</p>
            <p>The ${companyName} Hiring Team</p>
        `;
    } else {
        console.log(`No email template for status: ${status}`);
        return;
    }

    const mailOptions = {
        from: SMTP_FROM,
        to: to,
        subject: subject,
        html: htmlBody,
    };

    try {
        console.log(`Sending ${status} email to ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendRejectionEmail = async (candidateEmail: string, candidateName: string, jobTitle: string) => {
  if (!candidateEmail || !candidateName) {
    throw new Error('Missing required fields');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update</title>
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
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 14px;
          color: #666;
        }
        .contact-info {
          margin-top: 20px;
          padding: 15px;
          background-color: #e3f2fd;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://internationalskills.fi/wp-content/uploads/2023/07/logo-skills.png" alt="International Skills" class="logo">
        <h1>Application Status Update</h1>
      </div>
      
      <div class="content">
        <p>Dear ${candidateName},</p>
        
        <p>Thank you for your interest in ${jobTitle ? `the ${jobTitle} position` : 'opportunities'} at International Skills Labor Company and for taking the time to submit your application.</p>
        
        <p>After careful consideration of your qualifications and experience, we have decided to move forward with other candidates whose background more closely aligns with our current requirements.</p>
        
        <p>We appreciate the time and effort you invested in the application process. Your skills and experience are valuable, and we encourage you to apply for future positions that match your qualifications.</p>
        
        <p>We will keep your resume on file and may contact you if a suitable opportunity arises in the future.</p>
        
        <p>Thank you again for your interest in International Skills Labor Company. We wish you the best of luck in your job search.</p>
        
        <div class="contact-info">
          <h3>Contact Information:</h3>
          <p><strong>Email:</strong> wassim@internationalskills.fi</p>
          <p><strong>Phone:</strong> +358 452644966 | +216 29 581 180</p>
          <p><strong>Website:</strong> <a href="https://internationalskills.fi">internationalskills.fi</a></p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>
          <strong>International Skills Labor Company</strong><br>
          Human Resources Department</p>
          
          <p><em>This is an automated message. Please do not reply to this email.</em></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textTemplate = `
Dear ${candidateName},

Thank you for your interest in ${jobTitle ? `the ${jobTitle} position` : 'opportunities'} at International Skills Labor Company and for taking the time to submit your application.

After careful consideration of your qualifications and experience, we have decided to move forward with other candidates whose background more closely aligns with our current requirements.

We appreciate the time and effort you invested in the application process. Your skills and experience are valuable, and we encourage you to apply for future positions that match your qualifications.

We will keep your resume on file and may contact you if a suitable opportunity arises in the future.

Thank you again for your interest in International Skills Labor Company. We wish you the best of luck in your job search.

Contact Information:
Email: wassim@internationalskills.fi
Phone: +358 452644966 | +216 29 581 180
Website: internationalskills.fi

Best regards,
International Skills Labor Company
Human Resources Department

This is an automated message. Please do not reply to this email.
  `;

  const mailOptions = {
    from: {
      name: 'International Skills Labor Company',
      address: process.env.SMTP_USER || 'noreply@internationalskills.fi'
    },
    to: candidateEmail,
    subject: `Application Status Update - International Skills Labor Company`,
    text: textTemplate,
    html: htmlTemplate,
    replyTo: 'wassim@internationalskills.fi'
  };

  await transporter.sendMail(mailOptions);
};

export const sendCancellationEmail = async ({
  candidateEmail,
  candidateName,
  jobTitle,
  reason
}: {
  candidateEmail: string;
  candidateName: string;
  jobTitle?: string;
  reason: string;
}) => {
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
};
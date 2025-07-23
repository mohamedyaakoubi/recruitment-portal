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

// 🔥 UPDATED: Proper SSL configuration for port 465
const transporter = smtpConfigured ? nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    // 🔥 UPDATED: Better timeout configurations for SSL
    connectionTimeout: 15000, // 15 seconds for SSL
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 20000,     // 20 seconds for SSL
    pool: true,               // Use connection pooling
    maxConnections: 3,        // Reduce concurrent connections for stability
    maxMessages: 50,          // Reduce messages per connection
    // 🔥 NEW: Additional SSL options
    tls: {
        rejectUnauthorized: false, // Accept self-signed certificates if needed
        minVersion: 'TLSv1.2'
    },
    debug: process.env.NODE_ENV === 'development', // Enable debug in development
    logger: process.env.NODE_ENV === 'development'  // Enable logging in development
}) : null;

// Test the connection on startup
if (transporter && process.env.NODE_ENV === 'development') {
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ SMTP connection failed:', error);
        } else {
            console.log('✅ SMTP server is ready to take our messages');
        }
    });
}

export const sendNotificationEmail = async (to: string, status: string, candidateName: string, interviewDate?: Date) => {
    if (!transporter) {
        console.log("SMTP not configured, skipping email notification.");
        return;
    }

    let subject = '';
    let htmlBody = '';
    const companyName = "International Skills Labor Company";

    if (status === 'rejected') {
        subject = `Application Status Update - ${companyName}`;
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
        from: {
            name: 'International Skills Labor Company',
            address: SMTP_FROM || 'noreply@internationalskills.fi'
        },
        to: to,
        subject: subject,
        html: htmlBody,
        replyTo: 'Apply@internationalskills.fi'
    };

    try {
        console.log(`📧 Sending ${status} email to ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error; // Re-throw to let caller handle
    }
};

export const sendApplicationConfirmationEmail = async ({
    candidateEmail,
    candidateName,
    jobTitle,
    jobCategory,
    specialty,
    applicationId,
    submissionDate
}: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    jobCategory?: string;
    specialty?: string;
    applicationId: string;
    submissionDate: Date;
}) => {
    if (!transporter) {
        console.warn("SMTP not configured, skipping confirmation email.");
        return;
    }

    const formattedDate = submissionDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Helsinki'
    });

    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Confirmation - International Skills</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 650px;
                    margin: 0 auto;
                    padding: 0;
                    background-color: #f5f7fa;
                }
                .container {
                    background-color: white;
                    margin: 20px;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background: linear-gradient(135deg, #003A70 0%, #004080 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                    position: relative;
                }
                .header::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 20px solid transparent;
                    border-right: 20px solid transparent;
                    border-top: 10px solid #004080;
                }
                .logo {
                    max-width: 220px;
                    height: auto;
                    margin-bottom: 15px;
                    filter: brightness(1.1);
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                .header .subtitle {
                    margin: 8px 0 0 0;
                    font-size: 16px;
                    opacity: 0.9;
                    font-weight: 300;
                }
                .content {
                    padding: 35px 30px;
                }
                .success-badge {
                    display: inline-flex;
                    align-items: center;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
                }
                .success-badge svg {
                    margin-right: 8px;
                }
                .application-details {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 10px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 5px solid #003A70;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .detail-label {
                    font-weight: 600;
                    color: #475569;
                    font-size: 14px;
                }
                .detail-value {
                    color: #1e293b;
                    font-weight: 500;
                    text-align: right;
                    flex: 1;
                    margin-left: 15px;
                }
                .next-steps {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    border-radius: 10px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 5px solid #3b82f6;
                }
                .next-steps h3 {
                    margin: 0 0 15px 0;
                    color: #1e40af;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                }
                .next-steps h3 svg {
                    margin-right: 10px;
                }
                .step-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .step-list li {
                    padding: 8px 0;
                    display: flex;
                    align-items: flex-start;
                }
                .step-list li::before {
                    content: '✓';
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    font-size: 12px;
                    font-weight: bold;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .contact-section {
                    background: linear-gradient(135deg, #fef3e2 0%, #fed7aa 100%);
                    border-radius: 10px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 5px solid #f59e0b;
                }
                .contact-section h3 {
                    margin: 0 0 15px 0;
                    color: #92400e;
                    display: flex;
                    align-items: center;
                }
                .contact-section h3 svg {
                    margin-right: 10px;
                }
                .contact-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    color: #92400e;
                    font-size: 14px;
                }
                .contact-item svg {
                    margin-right: 8px;
                    flex-shrink: 0;
                }
                .footer {
                    background: #f8fafc;
                    padding: 25px 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                .footer p {
                    margin: 5px 0;
                    color: #64748b;
                    font-size: 14px;
                }
                .disclaimer {
                    font-style: italic;
                    color: #94a3b8;
                    font-size: 12px;
                    margin-top: 15px;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 10px;
                    }
                    .content {
                        padding: 25px 20px;
                    }
                    .detail-row {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .detail-value {
                        text-align: left;
                        margin-left: 0;
                        margin-top: 5px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://internationalskills.fi/wp-content/uploads/2023/07/logo-skills.png" alt="International Skills" class="logo">
                    <h1>✅ Application Received!</h1>
                    <p class="subtitle">Thank you for applying to join our team</p>
                </div>
                
                <div class="content">
                    <div class="success-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Application Successfully Submitted
                    </div>
                    
                    <p>Dear <strong>${candidateName}</strong>,</p>
                    
                    <p>We have successfully received your application for the <strong>${jobTitle}</strong> position at International Skills Labor Company. Thank you for your interest in joining our team!</p>
                    
                    <div class="application-details">
                        <h3 style="margin: 0 0 20px 0; color: #003A70; font-size: 18px;">📋 Application Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Application ID:</span>
                            <span class="detail-value"><strong>#${applicationId}</strong></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Position Applied:</span>
                            <span class="detail-value">${jobTitle}</span>
                        </div>
                        ${jobCategory ? `
                        <div class="detail-row">
                            <span class="detail-label">Job Category:</span>
                            <span class="detail-value">${jobCategory}</span>
                        </div>` : ''}
                        ${specialty ? `
                        <div class="detail-row">
                            <span class="detail-label">Specialty:</span>
                            <span class="detail-value">${specialty}</span>
                        </div>` : ''}
                        <div class="detail-row">
                            <span class="detail-label">Submission Date:</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value" style="color: #10b981; font-weight: 700;">Under Review</span>
                        </div>
                    </div>
                    
                    <div class="next-steps">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            What Happens Next?
                        </h3>
                        <ul class="step-list">
                            <li>Our recruitment team will carefully review your application and documents</li>
                            <li>We will assess your qualifications against our job requirements</li>
                            <li>If your profile matches our needs, we will contact you for an interview</li>
                            <li>You will receive email updates about your application status</li>
                            <li>The entire process typically takes 1-2 weeks</li>
                        </ul>
                    </div>
                    
                    <div class="contact-section">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Need Help? Contact Us
                        </h3>
                        <div class="contact-info">
                            <div class="contact-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                Apply@internationalskills.fi
                            </div>
                            <div class="contact-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                                </svg>
                                +358 452644966
                            </div>
                            <div class="contact-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                                </svg>
                                +216 29 581 180
                            </div>
                            <div class="contact-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                                </svg>
                                internationalskills.fi
                            </div>
                        </div>
                    </div>
                    
                    <p><strong>Important:</strong> Please keep this confirmation email for your records. You may need the Application ID for future reference.</p>
                    
                    <p>We appreciate your interest in International Skills Labor Company and look forward to potentially welcoming you to our team!</p>
                </div>
                
                <div class="footer">
                    <p><strong>International Skills Labor Company</strong></p>
                    <p>Human Resources Department</p>
                    <p class="disclaimer">This is an automated confirmation email. Please do not reply to this message. For inquiries, please use the contact information provided above.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textTemplate = `
Dear ${candidateName},

✅ APPLICATION SUCCESSFULLY RECEIVED!

We have successfully received your application for the ${jobTitle} position at International Skills Labor Company. Thank you for your interest in joining our team!

APPLICATION DETAILS:
- Application ID: #${applicationId}
- Position Applied: ${jobTitle}
${jobCategory ? `- Job Category: ${jobCategory}` : ''}
${specialty ? `- Specialty: ${specialty}` : ''}
- Submission Date: ${formattedDate}
- Status: Under Review

WHAT HAPPENS NEXT?
✓ Our recruitment team will carefully review your application and documents
✓ We will assess your qualifications against our job requirements  
✓ If your profile matches our needs, we will contact you for an interview
✓ You will receive email updates about your application status
✓ The entire process typically takes 1-2 weeks

NEED HELP? CONTACT US:
📧 Email: Apply@internationalskills.fi
📱 Phone: +358 452644966 | +216 29 581 180
🌐 Website: internationalskills.fi

IMPORTANT: Please keep this confirmation email for your records. You may need the Application ID for future reference.

We appreciate your interest in International Skills Labor Company and look forward to potentially welcoming you to our team!

Best regards,
International Skills Labor Company
Human Resources Department

This is an automated confirmation email. Please do not reply to this message. For inquiries, please use the contact information provided above.
    `;

    const mailOptions = {
        from: {
            name: 'International Skills Labor Company',
            address: SMTP_FROM || 'noreply@internationalskills.fi'
        },
        to: candidateEmail,
        subject: `✅ Application Confirmed - ${jobTitle} Position | Application #${applicationId}`,
        text: textTemplate,
        html: htmlTemplate,
        replyTo: 'Apply@internationalskills.fi'
    };

    try {
        console.log(`📧 Sending confirmation email to ${candidateEmail}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending confirmation email:', error);
        throw error;
    }
};

export const sendRejectionEmail = async (candidateEmail: string, candidateName: string, jobTitle: string) => {
  if (!candidateEmail || !candidateName) {
    throw new Error('Missing required fields');
  }

  if (!transporter) {
    console.warn("SMTP not configured, skipping rejection email.");
    return;
  }

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
          <p><strong>Email:</strong> Apply@internationalskills.fi</p>
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
Email: Apply@internationalskills.fi
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
      address: SMTP_FROM || 'noreply@internationalskills.fi'
    },
    to: candidateEmail,
    subject: `Application Status Update - International Skills Labor Company`,
    text: textTemplate,
    html: htmlTemplate,
    replyTo: 'Apply@internationalskills.fi'
  };

  try {
    console.log(`📧 Sending rejection email to ${candidateEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    throw error;
  }
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
  if (!transporter) {
    console.warn("SMTP not configured, skipping cancellation email.");
    return;
  }

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
          <p><strong>📧 Email:</strong> Apply@internationalskills.fi</p>
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
      address: SMTP_FROM || 'noreply@internationalskills.fi'
    },
    to: candidateEmail,
    subject: `⚠️ Interview Cancelled - ${jobTitle || 'Position'} at International Skills`,
    html: cancellationEmailTemplate,
    replyTo: 'Apply@internationalskills.fi'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Cancellation email sent to ${candidateEmail}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    throw error;
  }
};
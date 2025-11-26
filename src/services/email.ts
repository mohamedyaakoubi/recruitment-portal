import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import path from 'path';
import logger from '@/lib/logger';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM_EMAIL;

const smtpConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM;

if (!smtpConfigured) {
  logger.warn(
    'SMTP environment variables are not fully set. Email notifications will be disabled.'
  );
}

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    })
  : null;

if (transporter && process.env.NODE_ENV === 'development') {
  transporter.verify((error, _success) => {
    if (error) {
      logger.error('SMTP connection failed', error);
    } else {
      logger.info('SMTP server is ready to take our messages');
    }
  });
}

const getTemplate = (templateName: string, type: 'html' | 'txt') => {
  const filePath = path.join(
    process.cwd(),
    'src',
    'lib',
    'emailTemplates',
    `${templateName}.${type}`
  );
  return readFileSync(filePath, 'utf8');
};

export const sendNotificationEmail = async (
  to: string,
  status: string,
  candidateName: string,
  interviewDate?: Date,
  _meetLink?: string
) => {
  if (!transporter) {
    logger.info('SMTP not configured, skipping email notification');
    return;
  }

  let subject = '';
  let htmlBody = '';
  let textBody = '';
  const companyName = 'International Skills Labor Company';
  let fromAddress = SMTP_FROM || 'noreply@internationalskills.fi';
  let replyToAddress = 'Apply@internationalskills.fi';

  if (status === 'rejected') {
    subject = `Application Status Update - ${companyName}`;
    htmlBody = getTemplate('statusRejected', 'html')
      .replace(/\${companyName}/g, companyName)
      .replace(/\${candidateName}/g, candidateName);
    textBody = getTemplate('statusRejected', 'txt')
      .replace(/\${companyName}/g, companyName)
      .replace(/\${candidateName}/g, candidateName);
  } else if (status === 'interview_scheduled' && interviewDate) {
    subject = `Interview Invitation from ${companyName}`;
    fromAddress = 'recruit@internationalskills.fi';
    replyToAddress = 'recruit@internationalskills.fi';
    const formattedDate = interviewDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = interviewDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
    htmlBody = getTemplate('statusInterviewScheduled', 'html')
      .replace(/\${companyName}/g, companyName)
      .replace(/\${candidateName}/g, candidateName)
      .replace(/\${formattedDate}/g, formattedDate)
      .replace(/\${formattedTime}/g, formattedTime);
    textBody = getTemplate('statusInterviewScheduled', 'txt')
      .replace(/\${companyName}/g, companyName)
      .replace(/\${candidateName}/g, candidateName)
      .replace(/\${formattedDate}/g, formattedDate)
      .replace(/\${formattedTime}/g, formattedTime);
  } else {
    logger.info('No email template for status', { status });
    return;
  }

  const mailOptions = {
    from: {
      name: 'International Skills Labor Company',
      address: fromAddress,
    },
    to: to,
    subject: subject,
    html: htmlBody,
    text: textBody,
    replyTo: replyToAddress,
  };

  try {
    logger.info('Sending email', { status, to });
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { messageId: info.messageId, to });
    return info;
  } catch (error) {
    logger.error('Error sending email', error, { to, status });
    throw error;
  }
};

export const sendApplicationConfirmationEmail = async ({
  candidateEmail,
  candidateName,
  jobTitle,
  jobCategory,
  specialty,
  applicationId,
  submissionDate,
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
    logger.warn('SMTP not configured, skipping confirmation email');
    return;
  }

  const formattedDate = submissionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Helsinki',
  });

  let htmlTemplate = getTemplate('applicationConfirmation', 'html')
    .replace(/\${candidateName}/g, candidateName)
    .replace(/\${jobTitle}/g, jobTitle)
    .replace(/\${applicationId}/g, applicationId)
    .replace(/\${formattedDate}/g, formattedDate);

  let textTemplate = getTemplate('applicationConfirmation', 'txt')
    .replace(/\${candidateName}/g, candidateName)
    .replace(/\${jobTitle}/g, jobTitle)
    .replace(/\${applicationId}/g, applicationId)
    .replace(/\${formattedDate}/g, formattedDate);

  let jobCategoryHtml = '';
  let jobCategoryText = '';
  if (jobCategory) {
    jobCategoryHtml = `
                        <div class="detail-row">
                            <span class="detail-label">Job Category:</span>
                            <span class="detail-value">${jobCategory}</span>
                        </div>`;
    jobCategoryText = `- Job Category: ${jobCategory}`;
  }
  htmlTemplate = htmlTemplate.replace('<!-- JOB_CATEGORY_PLACEHOLDER -->', jobCategoryHtml);
  textTemplate = textTemplate.replace('<!-- JOB_CATEGORY_PLACEHOLDER -->', jobCategoryText);

  let specialtyHtml = '';
  let specialtyText = '';
  if (specialty) {
    specialtyHtml = `
                        <div class="detail-row">
                            <span class="detail-label">Specialty:</span>
                            <span class="detail-value">${specialty}</span>
                        </div>`;
    specialtyText = `- Specialty: ${specialty}`;
  }
  htmlTemplate = htmlTemplate.replace('<!-- SPECIALTY_PLACEHOLDER -->', specialtyHtml);
  textTemplate = textTemplate.replace('<!-- SPECIALTY_PLACEHOLDER -->', specialtyText);

  const mailOptions = {
    from: {
      name: 'International Skills Labor Company',
      address: SMTP_FROM || 'noreply@internationalskills.fi',
    },
    to: candidateEmail,
    subject: `✅ Application Confirmed - ${jobTitle} Position | Application #${applicationId}`,
    text: textTemplate,
    html: htmlTemplate,
    replyTo: 'Apply@internationalskills.fi',
  };

  try {
    logger.info('Sending confirmation email', { candidateEmail });
    const info = await transporter.sendMail(mailOptions);
    logger.info('Confirmation email sent successfully', {
      messageId: info.messageId,
      candidateEmail,
    });
    return info;
  } catch (error) {
    logger.error('Error sending confirmation email', error, { candidateEmail });
    throw error;
  }
};

export const sendRejectionEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string
) => {
  if (!candidateEmail || !candidateName) {
    throw new Error('Missing required fields');
  }

  if (!transporter) {
    logger.warn('SMTP not configured, skipping rejection email');
    return;
  }

  const jobTitleText = jobTitle ? `the ${jobTitle} position` : 'opportunities';

  const htmlTemplate = getTemplate('rejectionEmail', 'html')
    .replace(/\${candidateName}/g, candidateName)
    .replace(/\${jobTitleText}/g, jobTitleText);

  const textTemplate = getTemplate('rejectionEmail', 'txt')
    .replace(/\${candidateName}/g, candidateName)
    .replace(/\${jobTitleText}/g, jobTitleText);

  const mailOptions = {
    from: {
      name: 'International Skills Labor Company',
      address: SMTP_FROM || 'noreply@internationalskills.fi',
    },
    to: candidateEmail,
    subject: `Application Status Update - International Skills Labor Company`,
    text: textTemplate,
    html: htmlTemplate,
    replyTo: 'Apply@internationalskills.fi',
  };

  try {
    logger.info('Sending rejection email', { candidateEmail });
    const info = await transporter.sendMail(mailOptions);
    logger.info('Rejection email sent successfully', { messageId: info.messageId, candidateEmail });
    return info;
  } catch (error) {
    logger.error('Error sending rejection email', error, { candidateEmail });
    throw error;
  }
};

export const sendCancellationEmail = async ({
  candidateEmail,
  candidateName,
  jobTitle,
  reason,
}: {
  candidateEmail: string;
  candidateName: string;
  jobTitle?: string;
  reason: string;
}) => {
  if (!transporter) {
    logger.warn('SMTP not configured, skipping cancellation email');
    return;
  }

  const jobTitleText = jobTitle || 'the position';

  const htmlTemplate = getTemplate('cancellationEmail', 'html')
    .replace(/\${candidateName}/g, candidateName)
    .replace(/\${jobTitleText}/g, jobTitleText)
    .replace(/\${reason}/g, reason);

  const textTemplate = getTemplate('cancellationEmail', 'txt')
    .replace(/\${candidateName}/g, candidateName)
    .replace(/\${jobTitleText}/g, jobTitleText)
    .replace(/\${reason}/g, reason);

  const mailOptions = {
    from: {
      name: 'International Skills Labor Company',
      address: SMTP_FROM || 'noreply@internationalskills.fi',
    },
    to: candidateEmail,
    subject: `⚠️ Interview Cancelled - ${jobTitle || 'Position'} at International Skills`,
    html: htmlTemplate,
    text: textTemplate,
    replyTo: 'Apply@internationalskills.fi',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Cancellation email sent', { messageId: info.messageId, candidateEmail });
    return info;
  } catch (error) {
    logger.error('Error sending cancellation email', error, { candidateEmail });
    throw error;
  }
};

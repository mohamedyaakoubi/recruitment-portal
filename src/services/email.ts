import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import path from 'path';
import logger from '@/lib/logger';
import { EMAIL_ADDRESSES } from '@/lib/constants/emails';
import { sanitizeText } from '@/lib/sanitize';

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
        rejectUnauthorized: process.env.NODE_ENV === 'production',
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

// Cache email templates for better performance
const templateCache = new Map<string, string>();

const getTemplate = (templateName: string, type: 'html' | 'txt') => {
  // During build time, Next.js collects page data which can trigger imports
  // Check if we're in a build context by looking for process.env.NEXT_PHASE
  if (process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined') {
    return '';
  }

  const cacheKey = `${templateName}.${type}`;

  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!;
  }

  try {
    const filePath = path.join(
      process.cwd(),
      'src',
      'lib',
      'emailTemplates',
      `${templateName}.${type}`
    );

    const template = readFileSync(filePath, 'utf8');
    templateCache.set(cacheKey, template);

    return template;
  } catch (error) {
    logger.warn(`Email template ${templateName}.${type} not accessible`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return '';
  }
};

export const sendNotificationEmail = async (
  to: string,
  status: string,
  candidateName: string,
  interviewDate?: Date
) => {
  if (!transporter) {
    logger.info('SMTP not configured, skipping email notification');
    return;
  }

  let subject = '';
  let htmlBody = '';
  let textBody = '';
  const companyName = EMAIL_ADDRESSES.COMPANY_NAME;
  let fromAddress: string = EMAIL_ADDRESSES.NOREPLY;
  let replyToAddress: string = EMAIL_ADDRESSES.APPLY;

  if (status === 'rejected') {
    subject = `Application Status Update - ${companyName}`;
    const safeCandidateName = sanitizeText(candidateName);
    htmlBody = getTemplate('statusRejected', 'html')
      .replace(/\${companyName}/g, companyName)
      .replace(/\${candidateName}/g, safeCandidateName);
    textBody = getTemplate('statusRejected', 'txt')
      .replace(/\${companyName}/g, companyName)
      .replace(/\${candidateName}/g, safeCandidateName);
  } else if (status === 'interview_scheduled' && interviewDate) {
    subject = `Interview Invitation from ${companyName}`;
    fromAddress = EMAIL_ADDRESSES.RECRUIT;
    replyToAddress = EMAIL_ADDRESSES.RECRUIT;
    const safeCandidateName = sanitizeText(candidateName);
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
      .replace(/\${candidateName}/g, safeCandidateName)
      .replace(/\${formattedDate}/g, formattedDate)
      .replace(/\${formattedTime}/g, formattedTime);
    textBody = getTemplate('statusInterviewScheduled', 'txt')
      .replace(/\${companyName}/g, companyName)
      .replace(/\${candidateName}/g, safeCandidateName)
      .replace(/\${formattedDate}/g, formattedDate)
      .replace(/\${formattedTime}/g, formattedTime);
  } else {
    logger.info('No email template for status', { status });
    return;
  }

  const mailOptions = {
    from: {
      name: EMAIL_ADDRESSES.COMPANY_NAME,
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

  const safeCandidateName = sanitizeText(candidateName);
  const safeJobTitle = sanitizeText(jobTitle);
  const safeApplicationId = sanitizeText(applicationId);

  let htmlTemplate = getTemplate('applicationConfirmation', 'html')
    .replace(/\${candidateName}/g, safeCandidateName)
    .replace(/\${jobTitle}/g, safeJobTitle)
    .replace(/\${applicationId}/g, safeApplicationId)
    .replace(/\${formattedDate}/g, formattedDate);

  let textTemplate = getTemplate('applicationConfirmation', 'txt')
    .replace(/\${candidateName}/g, safeCandidateName)
    .replace(/\${jobTitle}/g, safeJobTitle)
    .replace(/\${applicationId}/g, safeApplicationId)
    .replace(/\${formattedDate}/g, formattedDate);

  let jobCategoryHtml = '';
  let jobCategoryText = '';
  if (jobCategory) {
    const safeJobCategory = sanitizeText(jobCategory);
    jobCategoryHtml = `
                        <div class="detail-row">
                            <span class="detail-label">Job Category:</span>
                            <span class="detail-value">${safeJobCategory}</span>
                        </div>`;
    jobCategoryText = `- Job Category: ${safeJobCategory}`;
  }
  htmlTemplate = htmlTemplate.replace('<!-- JOB_CATEGORY_PLACEHOLDER -->', jobCategoryHtml);
  textTemplate = textTemplate.replace('<!-- JOB_CATEGORY_PLACEHOLDER -->', jobCategoryText);

  let specialtyHtml = '';
  let specialtyText = '';
  if (specialty) {
    const safeSpecialty = sanitizeText(specialty);
    specialtyHtml = `
                        <div class="detail-row">
                            <span class="detail-label">Specialty:</span>
                            <span class="detail-value">${safeSpecialty}</span>
                        </div>`;
    specialtyText = `- Specialty: ${safeSpecialty}`;
  }
  htmlTemplate = htmlTemplate.replace('<!-- SPECIALTY_PLACEHOLDER -->', specialtyHtml);
  textTemplate = textTemplate.replace('<!-- SPECIALTY_PLACEHOLDER -->', specialtyText);

  const mailOptions = {
    from: {
      name: EMAIL_ADDRESSES.COMPANY_NAME,
      address: EMAIL_ADDRESSES.NOREPLY,
    },
    to: candidateEmail,
    subject: `✅ Application Confirmed - ${jobTitle} Position | Application #${applicationId}`,
    text: textTemplate,
    html: htmlTemplate,
    replyTo: EMAIL_ADDRESSES.APPLY,
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

  const jobTitleText = jobTitle ? `the ${sanitizeText(jobTitle)} position` : 'opportunities';
  const safeCandidateName = sanitizeText(candidateName);

  const htmlTemplate = getTemplate('rejectionEmail', 'html')
    .replace(/\${candidateName}/g, safeCandidateName)
    .replace(/\${jobTitleText}/g, jobTitleText);

  const textTemplate = getTemplate('rejectionEmail', 'txt')
    .replace(/\${candidateName}/g, safeCandidateName)
    .replace(/\${jobTitleText}/g, jobTitleText);

  const mailOptions = {
    from: {
      name: EMAIL_ADDRESSES.COMPANY_NAME,
      address: EMAIL_ADDRESSES.NOREPLY,
    },
    to: candidateEmail,
    subject: `Application Status Update - ${EMAIL_ADDRESSES.COMPANY_NAME}`,
    text: textTemplate,
    html: htmlTemplate,
    replyTo: EMAIL_ADDRESSES.APPLY,
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
  const safeCandidateName = sanitizeText(candidateName);
  const safeJobTitleText = sanitizeText(jobTitleText);
  const safeReason = sanitizeText(reason);

  const htmlTemplate = getTemplate('cancellationEmail', 'html')
    .replace(/\${candidateName}/g, safeCandidateName)
    .replace(/\${jobTitleText}/g, safeJobTitleText)
    .replace(/\${reason}/g, safeReason);

  const textTemplate = getTemplate('cancellationEmail', 'txt')
    .replace(/\${candidateName}/g, safeCandidateName)
    .replace(/\${jobTitleText}/g, safeJobTitleText)
    .replace(/\${reason}/g, safeReason);

  const mailOptions = {
    from: {
      name: EMAIL_ADDRESSES.COMPANY_NAME,
      address: EMAIL_ADDRESSES.NOREPLY,
    },
    to: candidateEmail,
    subject: `⚠️ Interview Cancelled - ${jobTitle || 'Position'} at International Skills`,
    html: htmlTemplate,
    text: textTemplate,
    replyTo: EMAIL_ADDRESSES.APPLY,
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

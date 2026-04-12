import { Resend } from 'resend';
import React from 'react';
import logger from '@/lib/logger';
import { EMAIL_ADDRESSES } from '@/lib/constants/emails';
import { sanitizeText } from '@/lib/sanitize';
import { ApplicationConfirmationEmail } from '@/components/emails/ApplicationConfirmationEmail';
import { InterviewScheduledEmail } from '@/components/emails/InterviewScheduledEmail';
import { RejectionEmail } from '@/components/emails/RejectionEmail';
import { CancellationEmail } from '@/components/emails/CancellationEmail';
import { AdminOtpEmail } from '@/components/emails/AdminOtpEmail';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  logger.warn('RESEND_API_KEY is not set. Email notifications will be disabled.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const OTP_EXPIRY_MINUTES = 5;

const getEmailMeta = () => ({
  from: `${EMAIL_ADDRESSES.COMPANY_NAME} <${EMAIL_ADDRESSES.NOREPLY}>`,
  replyTo: EMAIL_ADDRESSES.SUPPORT,
  companyName: EMAIL_ADDRESSES.COMPANY_NAME,
  supportEmail: EMAIL_ADDRESSES.SUPPORT,
  contactPhone: EMAIL_ADDRESSES.CONTACT_PHONE || undefined,
});

export const sendNotificationEmail = async (
  to: string,
  status: string,
  candidateName: string,
  interviewDate?: Date
) => {
  if (!resend) {
    logger.info('Resend not configured, skipping email notification');
    return;
  }

  const meta = getEmailMeta();
  const safeCandidateName = sanitizeText(candidateName);

  if (status === 'rejected') {
    const { data, error } = await resend.emails.send({
      from: meta.from,
      to,
      replyTo: meta.replyTo,
      subject: `Application Status Update - ${meta.companyName}`,
      react: React.createElement(RejectionEmail, {
        candidateName: safeCandidateName,
        jobTitleText: 'opportunities',
        companyName: meta.companyName,
        supportEmail: meta.supportEmail,
        contactPhone: meta.contactPhone,
      }),
    });
    if (error) {
      logger.error('Error sending rejection notification email', error, { to, status });
      throw new Error(error.message);
    }
    logger.info('Rejection notification email sent', { messageId: data?.id, to });
    return data;
  }

  if (status === 'interview_scheduled' && interviewDate) {
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
    const { data, error } = await resend.emails.send({
      from: meta.from,
      to,
      replyTo: meta.replyTo,
      subject: `Interview Invitation from ${meta.companyName}`,
      react: React.createElement(InterviewScheduledEmail, {
        candidateName: safeCandidateName,
        companyName: meta.companyName,
        formattedDate,
        formattedTime,
        supportEmail: meta.supportEmail,
      }),
    });
    if (error) {
      logger.error('Error sending interview scheduled email', error, { to, status });
      throw new Error(error.message);
    }
    logger.info('Interview scheduled email sent', { messageId: data?.id, to });
    return data;
  }

  logger.info('No email template for status', { status });
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
  if (!resend) {
    logger.warn('Resend not configured, skipping confirmation email');
    return;
  }

  const meta = getEmailMeta();
  const safeCandidateName = sanitizeText(candidateName);
  const safeJobTitle = sanitizeText(jobTitle);
  const safeApplicationId = sanitizeText(applicationId);

  const formattedDate = submissionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Helsinki',
  });

  const { data, error } = await resend.emails.send({
    from: meta.from,
    to: candidateEmail,
    replyTo: meta.replyTo,
    subject: `Application Confirmed - ${safeJobTitle} | Application #${safeApplicationId}`,
    react: React.createElement(ApplicationConfirmationEmail, {
      candidateName: safeCandidateName,
      jobTitle: safeJobTitle,
      applicationId: safeApplicationId,
      formattedDate,
      companyName: meta.companyName,
      supportEmail: meta.supportEmail,
      contactPhone: meta.contactPhone,
      jobCategory: jobCategory ? sanitizeText(jobCategory) : undefined,
      specialty: specialty ? sanitizeText(specialty) : undefined,
    }),
  });

  if (error) {
    logger.error('Error sending confirmation email', error, { candidateEmail });
    throw new Error(error.message);
  }

  logger.info('Confirmation email sent successfully', { messageId: data?.id, candidateEmail });
  return data;
};

export const sendRejectionEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string
) => {
  if (!candidateEmail || !candidateName) {
    throw new Error('Missing required fields');
  }

  if (!resend) {
    logger.warn('Resend not configured, skipping rejection email');
    return;
  }

  const meta = getEmailMeta();
  const jobTitleText = jobTitle ? `the ${sanitizeText(jobTitle)} position` : 'opportunities';
  const safeCandidateName = sanitizeText(candidateName);

  const { data, error } = await resend.emails.send({
    from: meta.from,
    to: candidateEmail,
    replyTo: meta.replyTo,
    subject: `Application Status Update - ${meta.companyName}`,
    react: React.createElement(RejectionEmail, {
      candidateName: safeCandidateName,
      jobTitleText,
      companyName: meta.companyName,
      supportEmail: meta.supportEmail,
      contactPhone: meta.contactPhone,
    }),
  });

  if (error) {
    logger.error('Error sending rejection email', error, { candidateEmail });
    throw new Error(error.message);
  }

  logger.info('Rejection email sent successfully', { messageId: data?.id, candidateEmail });
  return data;
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
  if (!resend) {
    logger.warn('Resend not configured, skipping cancellation email');
    return;
  }

  const meta = getEmailMeta();
  const jobTitleText = jobTitle || 'the position';
  const safeCandidateName = sanitizeText(candidateName);
  const safeJobTitleText = sanitizeText(jobTitleText);
  const safeReason = sanitizeText(reason);

  const { data, error } = await resend.emails.send({
    from: meta.from,
    to: candidateEmail,
    replyTo: meta.replyTo,
    subject: `Interview Cancelled - ${safeJobTitleText}`,
    react: React.createElement(CancellationEmail, {
      candidateName: safeCandidateName,
      jobTitleText: safeJobTitleText,
      reason: safeReason,
      companyName: meta.companyName,
      supportEmail: meta.supportEmail,
      contactPhone: meta.contactPhone,
    }),
  });

  if (error) {
    logger.error('Error sending cancellation email', error, { candidateEmail });
    throw new Error(error.message);
  }

  logger.info('Cancellation email sent', { messageId: data?.id, candidateEmail });
  return data;
};

export const sendAdminOtpEmail = async (adminEmail: string, otp: string): Promise<void> => {
  if (!resend) {
    logger.warn('Resend not configured, skipping OTP email');
    return;
  }

  const meta = getEmailMeta();

  const { data, error } = await resend.emails.send({
    from: meta.from,
    to: adminEmail,
    subject: `Your ${meta.companyName} Admin verification code — ${otp}`,
    react: React.createElement(AdminOtpEmail, {
      otp,
      companyName: meta.companyName,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    }),
  });

  if (error) {
    logger.error('Error sending admin OTP email', error, { adminEmail });
    throw new Error(error.message);
  }

  logger.info('Admin OTP email sent', { messageId: data?.id, adminEmail });
};

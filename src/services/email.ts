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
import { MagicLinkEmail } from '@/components/emails/MagicLinkEmail';

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
  interviewDate?: Date,
  meetLink?: string
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
        meetLink,
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

export const sendMagicLinkEmail = async ({
  to,
  magicLinkUrl,
  expiryMinutes,
}: {
  to: string;
  magicLinkUrl: string;
  expiryMinutes: number;
}) => {
  if (!resend) {
    logger.warn('Resend not configured, skipping magic link email');
    return;
  }

  const meta = getEmailMeta();

  const { data, error } = await resend.emails.send({
    from: meta.from,
    to,
    subject: `Your sign-in link for ${meta.companyName}`,
    react: React.createElement(MagicLinkEmail, {
      magicLinkUrl,
      companyName: meta.companyName,
      expiryMinutes,
    }),
  });

  if (error) {
    logger.error('Error sending magic link email', error, { to: '[redacted]' });
    throw new Error(error.message);
  }

  logger.info('Magic link email sent', { messageId: data?.id });
  return data;
};

export const sendInterviewerNotificationEmail = async ({
  adminEmail,
  candidateName,
  candidateEmail,
  jobTitle,
  interviewDate,
  duration,
  meetLink,
  notes,
}: {
  adminEmail: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewDate: Date;
  duration: number;
  meetLink: string;
  notes?: string;
}): Promise<void> => {
  if (!resend) {
    logger.info('Resend not configured, skipping interviewer notification email');
    return;
  }

  const meta = getEmailMeta();
  const safeCandidateName = sanitizeText(candidateName);
  const safeJobTitle = sanitizeText(jobTitle);
  const safeNotes = notes ? sanitizeText(notes) : '';

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
    to: adminEmail,
    subject: `Interview Scheduled: ${safeCandidateName} - ${safeJobTitle}`,
    react: React.createElement(
      'div',
      {
        style: {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          lineHeight: '1.6',
          color: '#333',
          maxWidth: '600px',
          margin: '20px auto',
          padding: '0',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              background: 'linear-gradient(135deg, #003A70 0%, #004080 100%)',
              color: 'white',
              padding: '25px 30px',
            },
          },
          React.createElement(
            'p',
            {
              style: { margin: '0', fontSize: '1.2em', fontWeight: 'bold' },
            },
            `Interview Confirmed — ${safeJobTitle}`
          )
        ),
        React.createElement(
          'div',
          {
            style: { padding: '30px', backgroundColor: '#ffffff' },
          },
          React.createElement(
            'p',
            null,
            `An interview has been scheduled with ${safeCandidateName}.`
          ),
          React.createElement(
            'div',
            {
              style: {
                backgroundColor: '#f9f9f9',
                border: '1px solid #eee',
                padding: '20px',
                margin: '20px 0',
                borderRadius: '5px',
              },
            },
            React.createElement(
              'p',
              { style: { margin: '0 0 8px 0', fontWeight: '600' } },
              'Interview Details'
            ),
            React.createElement(
              'p',
              { style: { margin: '4px 0' } },
              React.createElement('strong', null, 'Candidate: '),
              safeCandidateName
            ),
            React.createElement(
              'p',
              { style: { margin: '4px 0' } },
              React.createElement('strong', null, 'Candidate Email: '),
              candidateEmail
            ),
            React.createElement(
              'p',
              { style: { margin: '4px 0' } },
              React.createElement('strong', null, 'Position: '),
              safeJobTitle
            ),
            React.createElement(
              'p',
              { style: { margin: '4px 0' } },
              React.createElement('strong', null, 'Date: '),
              formattedDate
            ),
            React.createElement(
              'p',
              { style: { margin: '4px 0' } },
              React.createElement('strong', null, 'Time: '),
              formattedTime
            ),
            React.createElement(
              'p',
              { style: { margin: '4px 0' } },
              React.createElement('strong', null, 'Duration: '),
              `${duration} minutes`
            ),
            safeNotes
              ? React.createElement(
                  'p',
                  { style: { margin: '4px 0' } },
                  React.createElement('strong', null, 'Notes: '),
                  safeNotes
                )
              : null
          ),
          meetLink
            ? React.createElement(
                'div',
                { style: { textAlign: 'center', margin: '24px 0' } },
                React.createElement(
                  'a',
                  {
                    href: meetLink,
                    style: {
                      backgroundColor: '#003A70',
                      color: '#ffffff',
                      padding: '12px 28px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      display: 'inline-block',
                      fontSize: '15px',
                    },
                  },
                  'Join Google Meet'
                ),
                React.createElement(
                  'p',
                  { style: { margin: '10px 0 0 0', fontSize: '13px', color: '#666' } },
                  'Or copy the link: ',
                  React.createElement(
                    'a',
                    { href: meetLink, style: { color: '#003A70', wordBreak: 'break-all' } },
                    meetLink
                  )
                )
              )
            : null
        ),
        React.createElement(
          'div',
          {
            style: {
              padding: '20px 30px',
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e0e0e0',
              fontSize: '0.9em',
              color: '#666',
            },
          },
          React.createElement(
            'p',
            { style: { margin: '0', fontSize: '12px', color: '#94a3b8' } },
            'This is an automated message from the Hiring Platform.'
          )
        )
      )
    ),
  });

  if (error) {
    logger.error('Error sending interviewer notification email', error, { adminEmail });
    throw new Error(error.message);
  }

  logger.info('Interviewer notification email sent', { messageId: data?.id, adminEmail });
};

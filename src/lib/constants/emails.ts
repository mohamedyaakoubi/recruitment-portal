// Email constants
// Centralized email addresses used throughout the application

export const EMAIL_ADDRESSES = {
  NOREPLY: process.env.SMTP_FROM_EMAIL || 'noreply@internationalskills.fi',
  RECRUIT: 'recruit@internationalskills.fi',
  APPLY: 'Apply@internationalskills.fi',
  COMPANY_NAME: 'International Skills Labor Company',
} as const;

export type EmailAddress = keyof typeof EMAIL_ADDRESSES;

// Email constants
// Centralized email addresses used throughout the application

export const EMAIL_ADDRESSES = {
  NOREPLY: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  SUPPORT: process.env.SUPPORT_EMAIL || 'support@example.com',
  COMPANY_NAME: process.env.COMPANY_NAME || 'International Skills Labor Company',
  CONTACT_PHONE: process.env.CONTACT_PHONE || '',
} as const;

export type EmailAddress = keyof typeof EMAIL_ADDRESSES;

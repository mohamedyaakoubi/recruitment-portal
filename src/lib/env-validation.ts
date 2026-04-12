/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 */

import logger from './logger';

type EnvVarConfig = {
  name: string;
  required: boolean;
  description: string;
};

const ENV_VARS: EnvVarConfig[] = [
  // Firebase Admin SDK
  { name: 'FIREBASE_PROJECT_ID', required: true, description: 'Firebase project ID' },
  { name: 'FIREBASE_CLIENT_EMAIL', required: true, description: 'Firebase admin email' },
  { name: 'FIREBASE_PRIVATE_KEY', required: true, description: 'Firebase private key' },

  // Firebase Client SDK
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    required: true,
    description: 'Firebase client API key',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    required: true,
    description: 'Firebase auth domain',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    required: true,
    description: 'Firebase client project ID',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    required: true,
    description: 'Firebase storage bucket',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    required: true,
    description: 'Firebase messaging sender ID',
  },
  { name: 'NEXT_PUBLIC_FIREBASE_APP_ID', required: true, description: 'Firebase app ID' },

  // Admin Configuration
  { name: 'ADMIN_EMAILS', required: true, description: 'Comma-separated list of admin emails' },

  // Resend Email Configuration (optional — emails disabled when absent)
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for transactional emails',
  },
  {
    name: 'RESEND_FROM_EMAIL',
    required: false,
    description: 'Verified sender email address in Resend',
  },

  // Company Branding (optional — defaults to "The Organization")
  {
    name: 'COMPANY_NAME',
    required: false,
    description: 'Company display name used in emails and UI',
  },
  {
    name: 'SUPPORT_EMAIL',
    required: false,
    description: 'Support contact email shown to candidates',
  },
  {
    name: 'CONTACT_PHONE',
    required: false,
    description: 'Optional support phone number shown in emails',
  },

  // AI Configuration (optional)
  { name: 'GEMINI_API_KEY', required: false, description: 'Gemini AI for scoring' },

  // Google Services (optional)
  {
    name: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    required: false,
    description: 'Google service account email',
  },
  {
    name: 'GOOGLE_PRIVATE_KEY',
    required: false,
    description: 'Google service account private key',
  },
  { name: 'GOOGLE_PROJECT_ID', required: false, description: 'Google Cloud project ID' },
  { name: 'GOOGLE_CLIENT_ID', required: false, description: 'Google OAuth client ID' },
  { name: 'GOOGLE_CLIENT_SECRET', required: false, description: 'Google OAuth client secret' },
  { name: 'GOOGLE_REDIRECT_URI', required: false, description: 'Google OAuth redirect URI' },

  // Security Configuration (optional)
  {
    name: 'SECURITY_ALERT_SLACK_WEBHOOK',
    required: false,
    description: 'Slack webhook for security alerts',
  },

  // Rate Limiting (optional)
  {
    name: 'UPSTASH_REDIS_REST_URL',
    required: false,
    description: 'Upstash Redis URL for rate limiting',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    description: 'Upstash Redis token for rate limiting',
  },

  // Abstract API (optional)
  {
    name: 'ABSTRACT_API_KEY',
    required: false,
    description: 'Abstract API key for email validation',
  },

  // Application URL
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Base URL of the application',
  },
];

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate environment variables
 * Returns validation result with missing required vars and optional warnings
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === '') {
      if (envVar.required) {
        missing.push(`${envVar.name}: ${envVar.description}`);
      } else {
        warnings.push(`${envVar.name}: ${envVar.description} (optional)`);
      }
    }
  }

  return { valid: missing.length === 0, missing, warnings };
}

/**
 * Validate environment and log results
 * Should be called at application startup
 */
export function validateAndLogEnvironment(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    logger.error('Environment validation failed - missing required variables:', {
      missing: result.missing,
    });
    throw new Error(
      `Missing required environment variables:\n${result.missing.map((m) => `  - ${m}`).join('\n')}`
    );
  }

  if (result.warnings.length > 0) {
    logger.warn('Optional environment variables not set:', {
      warnings: result.warnings,
    });
  }

  logger.info('Environment validation successful', {
    requiredVarsCount: ENV_VARS.filter((v) => v.required).length,
    optionalVarsSet: ENV_VARS.filter((v) => !v.required && process.env[v.name]).length,
    optionalVarsMissing: result.warnings.length,
  });
}

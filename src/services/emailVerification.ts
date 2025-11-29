import logger from '@/lib/logger';
import { fetchWithTimeout, TIMEOUT_CONFIG } from '@/lib/apiTimeout';
import { validateEmail as validateEmailDNS } from 'email-validator-dns-provider-rules';
import { resolveMx } from 'dns/promises';
import { getDisposableEmailDomainsArray } from '@/lib/disposableEmailDomains';

interface EmailVerificationResponse {
  isValid: boolean;
  deliverable?: boolean;
  disposable?: boolean;
  role_account?: boolean;
  error?: string;
}

// ============================================
// Abstract API Rate Limiter (1 request/second for free tier)
// ============================================
let lastAbstractApiCall = 0;
const ABSTRACT_API_MIN_INTERVAL_MS = 1100; // 1.1 seconds to be safe

async function waitForAbstractApiThrottle(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastAbstractApiCall;

  if (timeSinceLastCall < ABSTRACT_API_MIN_INTERVAL_MS) {
    const waitTime = ABSTRACT_API_MIN_INTERVAL_MS - timeSinceLastCall;
    logger.info('[Layer 3] Throttling Abstract API call', { waitTime });
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastAbstractApiCall = Date.now();
}

// Custom MX resolver for Node.js environment
async function nodeResolver(emailDomain: string): Promise<string[] | false> {
  try {
    const records = await resolveMx(emailDomain);
    return records.map((rec) => rec.exchange);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ENODATA')) {
      return []; // Empty records = invalid domain
    }
    return false; // Other errors = can't determine, skip this check
  }
}

async function verifyEmailWithAbstractAPI(email: string): Promise<EmailVerificationResponse> {
  try {
    const apiKey = process.env.ABSTRACT_API_KEY;
    if (!apiKey) {
      throw new Error('Abstract API key not configured');
    }

    // Wait for throttle (1 request/second limit on free tier)
    await waitForAbstractApiThrottle();

    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`;

    const response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      TIMEOUT_CONFIG.ABSTRACT_API
    );

    if (!response.ok) {
      throw new Error(`Abstract API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    return {
      isValid: data.deliverability === 'DELIVERABLE' && !data.is_disposable_email?.value,
      deliverable: data.deliverability === 'DELIVERABLE',
      disposable: data.is_disposable_email?.value || false,
      role_account: data.is_role_email?.value || false,
    };
  } catch (error) {
    logger.error('Abstract API verification failed', error);
    throw error;
  }
}

async function verifyEmailWithHunter(email: string): Promise<EmailVerificationResponse> {
  try {
    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey) {
      throw new Error('Hunter API key not configured');
    }

    const response = await fetchWithTimeout(
      `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      TIMEOUT_CONFIG.ABSTRACT_API
    );

    if (!response.ok) {
      throw new Error(`Hunter API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      isValid: data.data.result === 'deliverable',
      deliverable: data.data.result === 'deliverable',
      disposable: data.data.disposable,
      role_account: data.data.role,
    };
  } catch (error) {
    logger.error('Hunter verification failed', error);
    throw error;
  }
}

// Basic email format validation as fallback
function basicEmailValidation(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const verifyEmail = async (email: string): Promise<EmailVerificationResponse> => {
  logger.info('[Layer 1] Starting email verification', { email });

  // ============================================
  // LAYER 1: Basic regex format validation (FREE)
  // ============================================
  logger.info('[Layer 1] Checking basic regex format');
  if (!basicEmailValidation(email)) {
    logger.warn('[Layer 1] FAILED - Invalid email format (basic regex)', { email });
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }
  logger.info('[Layer 1] PASSED - Basic format is valid', { email });

  // ============================================
  // LAYER 2: DNS MX + Provider Rules (FREE - local DNS lookup)
  // ============================================
  logger.info('[Layer 2] Checking DNS MX records and provider rules');
  try {
    const disposableDomains = getDisposableEmailDomainsArray();
    const dnsResult = await validateEmailDNS(email, {
      mxResolver: nodeResolver,
      blocklistDomains: disposableDomains,
    });

    if (!dnsResult.valid) {
      logger.warn('[Layer 2] FAILED - DNS/Provider validation failed', {
        email,
        reasonId: dnsResult.reasonId,
        reasonText: dnsResult.reasonText,
      });
      return {
        isValid: false,
        error: dnsResult.reasonText || 'Email domain validation failed',
      };
    }
    logger.info('[Layer 2] PASSED - DNS MX records valid, provider rules passed', { email });
  } catch (dnsError) {
    // DNS check failed - log but continue to Layer 3
    logger.warn('[Layer 2] DNS check error, continuing to Layer 3', { email, error: dnsError });
  }

  // ============================================
  // LAYER 3: External API verification (COSTS API calls)
  // ============================================
  let verificationResult: EmailVerificationResponse;

  try {
    // Try Abstract API first (recommended)
    if (process.env.ABSTRACT_API_KEY) {
      logger.info('[Layer 3] Calling Abstract API for deep verification', { email });
      verificationResult = await verifyEmailWithAbstractAPI(email);
      logger.info('[Layer 3] Abstract API response', { email, result: verificationResult });
    }
    // Fallback to Hunter.io
    else if (process.env.HUNTER_API_KEY) {
      logger.info('[Layer 3] Calling Hunter API for deep verification', { email });
      verificationResult = await verifyEmailWithHunter(email);
      logger.info('[Layer 3] Hunter API response', { email, result: verificationResult });
    }
    // If no API keys are configured, use Layer 2 result
    else {
      logger.warn('[Layer 3] SKIPPED - No email verification API configured');
      verificationResult = {
        isValid: true, // Allow through since Layer 2 passed
      };
    }
  } catch (error) {
    logger.error('[Layer 3] Email verification service failed', error);

    // In production, be more restrictive with failed verifications
    if (process.env.NODE_ENV === 'production') {
      logger.warn('[Layer 3] API failed in production, rejecting', { email });
      verificationResult = {
        isValid: false,
        error: 'Email verification failed. Please try again or use a different email.',
      };
    } else {
      // In development, allow through since Layer 2 passed
      logger.warn('[Layer 3] API failed in dev mode, allowing through (Layer 2 passed)', { email });
      verificationResult = {
        isValid: true,
        error: 'Verification service temporarily unavailable (dev mode)',
      };
    }
  }

  logger.info('[Layer 3] Final verification result', {
    email,
    isValid: verificationResult.isValid,
  });
  return verificationResult;
};

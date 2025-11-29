import logger from '@/lib/logger';
import { fetchWithTimeout, TIMEOUT_CONFIG } from '@/lib/apiTimeout';

interface EmailVerificationResponse {
  isValid: boolean;
  deliverable?: boolean;
  disposable?: boolean;
  role_account?: boolean;
  error?: string;
}

async function verifyEmailWithAbstractAPI(email: string): Promise<EmailVerificationResponse> {
  try {
    const apiKey = process.env.ABSTRACT_API_KEY;
    if (!apiKey) {
      throw new Error('Abstract API key not configured');
    }

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

// TypeScript version of the async HTTP function
async function _httpGetAsync(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

// Basic email format validation as fallback
function basicEmailValidation(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const verifyEmail = async (email: string): Promise<EmailVerificationResponse> => {
  // Basic format validation first
  if (!basicEmailValidation(email)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  // Try production email verification services
  let verificationResult: EmailVerificationResponse;

  try {
    // Try Abstract API first (recommended)
    if (process.env.ABSTRACT_API_KEY) {
      verificationResult = await verifyEmailWithAbstractAPI(email);
    }
    // Fallback to Hunter.io
    else if (process.env.HUNTER_API_KEY) {
      verificationResult = await verifyEmailWithHunter(email);
    }
    // If no API keys are configured, use basic validation
    else {
      logger.warn('No email verification API configured. Using basic validation only');
      verificationResult = {
        isValid: true, // Allow through for basic validation
      };
    }
  } catch (error) {
    logger.error('Email verification service failed', error);

    // In production, be more restrictive with failed verifications
    // Only allow through if it's a basic format pass
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Email verification failed in production, rejecting', { email });
      verificationResult = {
        isValid: false,
        error: 'Email verification failed. Please try again or use a different email.',
      };
    } else {
      // In development, allow through with warning
      verificationResult = {
        isValid: true,
        error: 'Verification service temporarily unavailable (dev mode)',
      };
    }
  }
  return verificationResult;
};

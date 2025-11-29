import { phonePatterns, getCountryName } from './phoneValidationData';
import logger from '@/lib/logger';

interface PhoneValidationResponse {
  isValid: boolean;
  phone?: string;
  format?: {
    international: string;
    local: string;
  };
  country?: {
    code: string;
    name: string;
    prefix: string;
  };
  location?: string;
  type?: string;
  carrier?: string;
  error?: string;
  fallbackUsed?: 'basic' | 'regex' | 'api' | 'failed';
  validationLevel?: 'high' | 'medium' | 'low';
}

// Rate limiting storage (production: use Redis)
const validationAttempts = new Map<
  string,
  {
    count: number;
    lastAttempt: number;
    failedNumbers: Set<string>;
  }
>();

const _API_DAILY_LIMIT = 80;
const MAX_ATTEMPTS_PER_IP = 3;

// 🔥 STEP 1: Basic validation (most lenient)
export function basicPhoneValidation(fullPhone: string): PhoneValidationResponse {
  const basicPattern = /^\+[1-9]\d{6,14}$/;
  const isValid = basicPattern.test(fullPhone);

  return {
    isValid,
    phone: fullPhone,
    fallbackUsed: 'basic',
    validationLevel: 'low',
    error: isValid ? undefined : 'Phone number must start with + and contain 7-15 digits',
  };
}

// 🔥 STEP 2: Advanced regex validation with comprehensive country patterns
export function validatePhoneWithRegex(fullPhone: string): PhoneValidationResponse {
  // Find matching country code (prioritize longer codes first)
  const sortedCodes = Object.keys(phonePatterns).sort((a, b) => b.length - a.length);
  const countryCode = sortedCodes.find((code) => fullPhone.startsWith(code));

  if (!countryCode) {
    return {
      isValid: false,
      error: 'Unsupported country code',
      fallbackUsed: 'regex',
      validationLevel: 'medium',
    };
  }

  const pattern = phonePatterns[countryCode];
  if (!pattern) {
    return {
      isValid: false,
      phone: fullPhone,
      format: { international: fullPhone, local: fullPhone },
      validationLevel: 'low',
    };
  }

  const isValid = pattern.test(fullPhone);

  return {
    isValid,
    phone: fullPhone,
    format: {
      international: fullPhone,
      local: fullPhone.replace(countryCode, '').trim(),
    },
    country: {
      code: countryCode.replace('+', ''),
      name: getCountryName(countryCode),
      prefix: countryCode,
    },
    fallbackUsed: 'regex',
    validationLevel: 'medium',
    error: isValid ? undefined : `Invalid phone number format for ${getCountryName(countryCode)}`,
  };
}

// HTTP utility function
async function httpGetAsync(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InternationalSkills-PhoneValidator/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 🔥 STEP 3: Abstract API validation (only if regex passes)
export async function validatePhoneWithAbstractAPI(
  fullPhone: string
): Promise<PhoneValidationResponse> {
  try {
    const apiKey = process.env.ABSTRACT_PHONE_API_KEY;
    if (!apiKey) {
      throw new Error('Abstract Phone API key not configured');
    }

    const phoneForAPI = fullPhone.startsWith('+') ? fullPhone.substring(1) : fullPhone;
    const url = `https://phonevalidation.abstractapi.com/v1/?api_key=${apiKey}&phone=${encodeURIComponent(phoneForAPI)}`;

    logger.info('Validating phone via Abstract API', { phone: phoneForAPI });

    const responseText = await httpGetAsync(url);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('Failed to parse Abstract API response', parseError, {
        phone: fullPhone,
        responsePreview: responseText.substring(0, 200),
      });
      throw new Error('Invalid response format from phone validation API');
    }

    return {
      isValid: data.valid === true,
      phone: data.phone,
      format: data.format
        ? {
            international: data.format.international,
            local: data.format.local,
          }
        : undefined,
      country: data.country
        ? {
            code: data.country.code,
            name: data.country.name,
            prefix: data.country.prefix,
          }
        : undefined,
      location: data.location,
      type: data.type,
      carrier: data.carrier,
      fallbackUsed: 'api',
      validationLevel: 'high',
    };
  } catch (error) {
    logger.error('Abstract Phone API validation failed', error, { phone: fullPhone });
    throw error;
  }
}

// Rate limiting with psychological protection
export function checkRateLimit(
  ip: string,
  phoneNumber: string
): {
  allowed: boolean;
  attemptsLeft: number;
  isFailedNumber: boolean;
  reason?: string;
} {
  const today = new Date().toDateString();
  const key = `${ip}-${today}`;

  const current = validationAttempts.get(key) || {
    count: 0,
    lastAttempt: 0,
    failedNumbers: new Set<string>(),
  };

  // Check if this number has already failed validation (psychological protection)
  if (current.failedNumbers.has(phoneNumber)) {
    return {
      allowed: false,
      attemptsLeft: MAX_ATTEMPTS_PER_IP - current.count,
      isFailedNumber: true,
      reason: 'This phone number has already failed validation today',
    };
  }

  if (current.count >= MAX_ATTEMPTS_PER_IP) {
    return {
      allowed: false,
      attemptsLeft: 0,
      isFailedNumber: false,
      reason: 'Daily API limit reached for your IP address',
    };
  }

  return {
    allowed: true,
    attemptsLeft: MAX_ATTEMPTS_PER_IP - current.count,
    isFailedNumber: false,
  };
}

// Update rate limit and track failed numbers
export function updateRateLimit(ip: string, phoneNumber?: string, success: boolean = true) {
  const today = new Date().toDateString();
  const key = `${ip}-${today}`;

  const current = validationAttempts.get(key) || {
    count: 0,
    lastAttempt: 0,
    failedNumbers: new Set<string>(),
  };

  const updated = {
    count: success ? current.count + 1 : current.count,
    lastAttempt: Date.now(),
    failedNumbers: current.failedNumbers,
  };

  // Track failed numbers for psychological protection
  if (!success && phoneNumber) {
    updated.failedNumbers.add(phoneNumber);
  }

  validationAttempts.set(key, updated);
}

// 🔥 CLEANUP: Automatic cleanup for in-memory storage
setInterval(
  () => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [key, data] of validationAttempts.entries()) {
      if (data.lastAttempt < oneDayAgo) {
        validationAttempts.delete(key);
        logger.debug('Cleaned up old rate limit data', { key });
      }
    }
  },
  60 * 60 * 1000
); // Clean every hour

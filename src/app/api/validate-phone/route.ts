import { NextRequest } from 'next/server';
import {
  basicPhoneValidation,
  validatePhoneWithRegex,
  validatePhoneWithAbstractAPI,
  checkRateLimit,
  updateRateLimit,
} from '@/lib/phoneValidationService';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import { z } from 'zod';

// Validation schema for phone validation
const phoneValidationSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required').max(10),
  phoneNumber: z.string().min(1, 'Phone number is required').max(20),
});

// 🔥 MAIN API HANDLER
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = phoneValidationSchema.safeParse(body);

    if (!validatedData.success) {
      // Audit log validation failure
      const context = extractSecurityContext(request);
      logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILED,
        ...context,
        details: { endpoint: '/api/validate-phone', errors: validatedData.error.flatten() },
      });
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const { countryCode, phoneNumber } = validatedData.data;

    const clientIP =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const fullPhone = `${countryCode}${cleanPhone}`;

    logger.info('Starting phone validation', { phone: fullPhone });

    // 🔥 STEP 1: Basic format validation
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Phone validation step 1: Basic format');
    }
    const basicResult = basicPhoneValidation(fullPhone);

    if (!basicResult.isValid) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Basic validation failed', { phone: fullPhone });
      }
      return successResponse({
        ...basicResult,
        message: 'Phone number format is invalid. Please check your input.',
      });
    }
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Basic validation passed', { phone: fullPhone });
    }

    // 🔥 STEP 2: Regex pattern validation
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Phone validation step 2: Regex pattern');
    }
    const regexResult = validatePhoneWithRegex(fullPhone);

    if (!regexResult.isValid) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Regex validation failed', {
          phone: fullPhone,
          country: regexResult.country?.name,
        });
      }
      const clientIPFirst = clientIP.split(',')[0];
      if (clientIPFirst) {
        updateRateLimit(clientIPFirst, fullPhone, false);
      }
      return successResponse({
        ...regexResult,
        message: `Phone number format is invalid for ${regexResult.country?.name || 'this country'}. Please check your input.`,
        suggestion: 'Please verify your phone number format and country code.',
      });
    }
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Regex validation passed', { phone: fullPhone });
    }

    // 🔥 STEP 3: Abstract API validation
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Phone validation step 3: Checking API rate limits');
    }
    const clientIPFirst = clientIP.split(',')[0];
    if (!clientIPFirst) {
      logger.error('No client IP found');
      return ApiErrors.badRequest('Invalid request');
    }
    const rateLimit = checkRateLimit(clientIPFirst, fullPhone);

    if (!rateLimit.allowed) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Rate limit reached', { reason: rateLimit.reason, phone: fullPhone });
      }

      if (rateLimit.isFailedNumber) {
        return successResponse({
          ...regexResult,
          warning: 'This phone number was previously validated. Using cached result.',
          message: '⚠️ Phone number format appears valid (using pattern matching)',
        });
      }

      return successResponse({
        ...regexResult,
        warning: 'API limit reached. Using pattern matching validation.',
        message: '⚠️ Phone number format appears valid (using pattern matching)',
      });
    }

    // Try Abstract API
    try {
      if (process.env.ABSTRACT_PHONE_API_KEY) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Calling Abstract API for phone validation', { phone: fullPhone });
        }
        const apiResult = await validatePhoneWithAbstractAPI(fullPhone);
        if (clientIPFirst) {
          updateRateLimit(clientIPFirst, fullPhone, true);
        }

        logger.info('API validation completed', { phone: fullPhone, isValid: apiResult.isValid });

        if (!apiResult.isValid && clientIPFirst) {
          updateRateLimit(clientIPFirst, fullPhone, false);
        }

        return successResponse({
          ...apiResult,
          message: apiResult.isValid
            ? `✅ Phone number verified for ${apiResult.country?.name || 'your country'}${apiResult.carrier ? ` (${apiResult.carrier})` : ''}`
            : `❌ Phone number verification failed: ${apiResult.error || 'Invalid number'}`,
          attemptsLeft: rateLimit.attemptsLeft - 1,
        });
      } else {
        throw new Error('No API key configured');
      }
    } catch (error) {
      logger.warn('Abstract API failed, using regex result', { phone: fullPhone, error });

      return successResponse({
        ...regexResult,
        warning: 'Phone verification service temporarily unavailable. Using pattern matching.',
        message: '⚠️ Phone number format appears valid (verification service unavailable)',
      });
    }
  } catch (error) {
    logger.error('Phone validation error', error);

    try {
      const { countryCode, phoneNumber } = await request.json();
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const fullPhone = `${countryCode}${cleanPhone}`;
      const basicResult = basicPhoneValidation(fullPhone);

      return successResponse({
        ...basicResult,
        warning: 'Validation service temporarily unavailable. Using basic format check.',
        message: basicResult.isValid
          ? '⚠️ Phone format appears valid (service unavailable)'
          : '❌ Invalid phone number format',
        error: 'Service temporarily unavailable',
      });
    } catch {
      return ApiErrors.internal('Service temporarily unavailable');
    }
  }
}

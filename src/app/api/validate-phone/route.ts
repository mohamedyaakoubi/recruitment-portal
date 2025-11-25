import { NextRequest, NextResponse } from 'next/server';
import {
  basicPhoneValidation,
  validatePhoneWithRegex,
  validatePhoneWithAbstractAPI,
  checkRateLimit,
  updateRateLimit,
} from '@/lib/phoneValidationService';
import logger from '@/lib/logger';

// 🔥 MAIN API HANDLER
export async function POST(request: NextRequest) {
  try {
    const { countryCode, phoneNumber } = await request.json();

    if (!countryCode || !phoneNumber) {
      return NextResponse.json(
        { error: 'Country code and phone number are required' },
        { status: 400 }
      );
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const fullPhone = `${countryCode}${cleanPhone}`;

    logger.info('Starting phone validation', { phone: fullPhone });

    // 🔥 STEP 1: Basic format validation
    logger.debug('Phone validation step 1: Basic format');
    const basicResult = basicPhoneValidation(fullPhone);
    
    if (!basicResult.isValid) {
      logger.debug('Basic validation failed', { phone: fullPhone });
      return NextResponse.json({
        ...basicResult,
        message: 'Phone number format is invalid. Please check your input.'
      });
    }
    logger.debug('Basic validation passed', { phone: fullPhone });

    // 🔥 STEP 2: Regex pattern validation
    logger.debug('Phone validation step 2: Regex pattern');
    const regexResult = validatePhoneWithRegex(fullPhone);
    
    if (!regexResult.isValid) {
      logger.debug('Regex validation failed', { phone: fullPhone, country: regexResult.country?.name });
      updateRateLimit(clientIP.split(',')[0], fullPhone, false);
      return NextResponse.json({
        ...regexResult,
        message: `Phone number format is invalid for ${regexResult.country?.name || 'this country'}. Please check your input.`,
        suggestion: 'Please verify your phone number format and country code.'
      });
    }
    logger.debug('Regex validation passed', { phone: fullPhone });

    // 🔥 STEP 3: Abstract API validation
    logger.debug('Phone validation step 3: Checking API rate limits');
    const rateLimit = checkRateLimit(clientIP.split(',')[0], fullPhone);
    
    if (!rateLimit.allowed) {
      logger.debug('Rate limit reached', { reason: rateLimit.reason, phone: fullPhone });
      
      if (rateLimit.isFailedNumber) {
        return NextResponse.json({
          ...regexResult,
          warning: 'This phone number was previously validated. Using cached result.',
          message: '⚠️ Phone number format appears valid (using pattern matching)'
        });
      }
      
      return NextResponse.json({
        ...regexResult,
        warning: 'API limit reached. Using pattern matching validation.',
        message: '⚠️ Phone number format appears valid (using pattern matching)'
      });
    }

    // Try Abstract API
    try {
      if (process.env.ABSTRACT_PHONE_API_KEY) {
        logger.debug('Calling Abstract API for phone validation', { phone: fullPhone });
        const apiResult = await validatePhoneWithAbstractAPI(fullPhone);
        updateRateLimit(clientIP.split(',')[0], fullPhone, true);
        
        logger.info('API validation completed', { phone: fullPhone, isValid: apiResult.isValid });
        
        if (!apiResult.isValid) {
          updateRateLimit(clientIP.split(',')[0], fullPhone, false);
        }
        
        return NextResponse.json({
          ...apiResult,
          message: apiResult.isValid 
            ? `✅ Phone number verified for ${apiResult.country?.name || 'your country'}${apiResult.carrier ? ` (${apiResult.carrier})` : ''}`
            : `❌ Phone number verification failed: ${apiResult.error || 'Invalid number'}`,
          attemptsLeft: rateLimit.attemptsLeft - 1
        });
      } else {
        throw new Error('No API key configured');
      }
    } catch (error) {
      logger.warn('Abstract API failed, using regex result', { phone: fullPhone, error });
      
      return NextResponse.json({
        ...regexResult,
        warning: 'Phone verification service temporarily unavailable. Using pattern matching.',
        message: '⚠️ Phone number format appears valid (verification service unavailable)'
      });
    }

  } catch (error) {
    logger.error('Phone validation error', error);
    
    try {
      const { countryCode, phoneNumber } = await request.json();
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const fullPhone = `${countryCode}${cleanPhone}`;
      const basicResult = basicPhoneValidation(fullPhone);
      
      return NextResponse.json({
        ...basicResult,
        warning: 'Validation service temporarily unavailable. Using basic format check.',
        message: basicResult.isValid 
          ? '⚠️ Phone format appears valid (service unavailable)'
          : '❌ Invalid phone number format',
        error: 'Service temporarily unavailable'
      });
    } catch {
      return NextResponse.json({
        isValid: false,
        error: 'Service temporarily unavailable',
        fallbackUsed: 'failed',
        validationLevel: 'low'
      }, { status: 500 });
    }
  }
}

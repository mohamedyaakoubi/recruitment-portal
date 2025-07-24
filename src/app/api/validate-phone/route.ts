import { NextRequest, NextResponse } from 'next/server';
import {
  basicPhoneValidation,
  validatePhoneWithRegex,
  validatePhoneWithAbstractAPI,
  checkRateLimit,
  updateRateLimit,
} from '@/lib/phoneValidationService';

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

    console.log(`📞 [PRODUCTION] Starting validation for: ${fullPhone}`);

    // 🔥 STEP 1: Basic format validation
    console.log('📞 [STEP 1] Basic format validation...');
    const basicResult = basicPhoneValidation(fullPhone);
    
    if (!basicResult.isValid) {
      console.log('❌ [STEP 1] Basic validation failed');
      return NextResponse.json({
        ...basicResult,
        message: 'Phone number format is invalid. Please check your input.'
      });
    }
    console.log('✅ [STEP 1] Basic validation passed');

    // 🔥 STEP 2: Regex pattern validation
    console.log('📞 [STEP 2] Regex pattern validation...');
    const regexResult = validatePhoneWithRegex(fullPhone);
    
    if (!regexResult.isValid) {
      console.log('❌ [STEP 2] Regex validation failed');
      updateRateLimit(clientIP.split(',')[0], fullPhone, false);
      return NextResponse.json({
        ...regexResult,
        message: `Phone number format is invalid for ${regexResult.country?.name || 'this country'}. Please check your input.`,
        suggestion: 'Please verify your phone number format and country code.'
      });
    }
    console.log('✅ [STEP 2] Regex validation passed');

    // 🔥 STEP 3: Abstract API validation
    console.log('📞 [STEP 3] Checking API rate limits...');
    const rateLimit = checkRateLimit(clientIP.split(',')[0], fullPhone);
    
    if (!rateLimit.allowed) {
      console.log(`🚫 [STEP 3] ${rateLimit.reason}`);
      
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
        console.log('📞 [STEP 3] Calling Abstract API...');
        const apiResult = await validatePhoneWithAbstractAPI(fullPhone);
        updateRateLimit(clientIP.split(',')[0], fullPhone, true);
        
        console.log(`✅ [STEP 3] API validation completed: ${apiResult.isValid ? 'VALID' : 'INVALID'}`);
        
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
      console.warn('📞 [STEP 3] Abstract API failed, using regex result:', error);
      
      return NextResponse.json({
        ...regexResult,
        warning: 'Phone verification service temporarily unavailable. Using pattern matching.',
        message: '⚠️ Phone number format appears valid (verification service unavailable)'
      });
    }

  } catch (error) {
    console.error('Phone validation error:', error);
    
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

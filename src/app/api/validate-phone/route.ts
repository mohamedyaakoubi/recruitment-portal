import { NextRequest, NextResponse } from 'next/server';

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

// Rate limiting storage (in production, use Redis or database)
const validationAttempts = new Map<string, { count: number; lastAttempt: number; failedNumbers: Set<string> }>();
const API_DAILY_LIMIT = 80; // Leave some buffer from the 100 limit
const MAX_ATTEMPTS_PER_IP = 3; // Max attempts per IP per day

// Basic validation (most lenient) - STEP 1
function basicPhoneValidation(fullPhone: string): PhoneValidationResponse {
  // Very basic validation: starts with +, has 7-15 digits total
  const basicPattern = /^\+[1-9]\d{6,14}$/;
  const isValid = basicPattern.test(fullPhone);

  return {
    isValid,
    phone: fullPhone,
    fallbackUsed: 'basic',
    validationLevel: 'low',
    error: isValid ? undefined : 'Phone number must start with + and contain 7-15 digits'
  };
}

// Advanced regex validation with country-specific patterns - STEP 2
function validatePhoneWithRegex(fullPhone: string): PhoneValidationResponse {
  // Find matching country code
  const countryCode = Object.keys(phonePatterns).find(code => 
    fullPhone.startsWith(code)
  );

  if (!countryCode) {
    return {
      isValid: false,
      error: 'Unsupported country code',
      fallbackUsed: 'regex',
      validationLevel: 'medium'
    };
  }

  const pattern = phonePatterns[countryCode];
  const isValid = pattern.test(fullPhone);

  return {
    isValid,
    phone: fullPhone,
    format: {
      international: fullPhone,
      local: fullPhone.replace(countryCode, '').trim()
    },
    country: {
      code: countryCode.replace('+', ''),
      name: getCountryName(countryCode), // We'll add this function
      prefix: countryCode
    },
    fallbackUsed: 'regex',
    validationLevel: 'medium',
    error: isValid ? undefined : 'Invalid phone number format for this country'
  };
}

// Country name mapping for better UX
function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    '+1': 'United States/Canada',
    '+44': 'United Kingdom',
    '+33': 'France',
    '+49': 'Germany',
    '+358': 'Finland',
    '+216': 'Tunisia',
    '+91': 'India',
    '+86': 'China',
    '+81': 'Japan',
    '+82': 'South Korea',
    '+34': 'Spain',
    '+39': 'Italy',
    '+31': 'Netherlands',
    '+46': 'Sweden',
    '+47': 'Norway',
    '+45': 'Denmark',
    '+41': 'Switzerland',
    '+43': 'Austria',
    '+32': 'Belgium',
    '+351': 'Portugal',
    '+30': 'Greece',
    '+7': 'Russia/Kazakhstan',
    '+380': 'Ukraine',
    '+48': 'Poland',
    '+420': 'Czech Republic',
    '+421': 'Slovakia',
    '+36': 'Hungary',
    '+40': 'Romania',
    '+359': 'Bulgaria',
    '+385': 'Croatia',
    '+386': 'Slovenia',
    '+381': 'Serbia',
    '+382': 'Montenegro',
    '+387': 'Bosnia and Herzegovina',
    '+389': 'North Macedonia',
    '+90': 'Turkey',
    '+20': 'Egypt',
    '+27': 'South Africa',
    '+234': 'Nigeria',
    '+254': 'Kenya',
    '+233': 'Ghana',
    '+212': 'Morocco',
    '+213': 'Algeria',
    '+218': 'Libya'
  };
  
  return countryMap[countryCode] || 'Unknown Country';
}

// TypeScript version of the async HTTP function
async function httpGetAsync(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InternationalSkills-PhoneValidator/1.0'
      },
      signal: controller.signal
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

// Abstract API validation - STEP 3 (Only if regex passes)
async function validatePhoneWithAbstractAPI(fullPhone: string): Promise<PhoneValidationResponse> {
  try {
    const apiKey = process.env.ABSTRACT_PHONE_API_KEY;
    if (!apiKey) {
      throw new Error('Abstract Phone API key not configured');
    }

    // Remove the + sign for the API call
    const phoneForAPI = fullPhone.startsWith('+') ? fullPhone.substring(1) : fullPhone;
    const url = `https://phonevalidation.abstractapi.com/v1/?api_key=${apiKey}&phone=${encodeURIComponent(phoneForAPI)}`;
    
    console.log(`📞 [PRODUCTION] Validating phone via Abstract API: ${phoneForAPI}`);
    
    const responseText = await httpGetAsync(url);
    const data = JSON.parse(responseText);
    
    // Handle Abstract API response structure
    return {
      isValid: data.valid === true,
      phone: data.phone,
      format: data.format ? {
        international: data.format.international,
        local: data.format.local
      } : undefined,
      country: data.country ? {
        code: data.country.code,
        name: data.country.name,
        prefix: data.country.prefix
      } : undefined,
      location: data.location,
      type: data.type,
      carrier: data.carrier,
      fallbackUsed: 'api',
      validationLevel: 'high'
    };
  } catch (error) {
    console.error('Abstract Phone API validation failed:', error);
    throw error;
  }
}

// Rate limiting check with failed number tracking
function checkRateLimit(ip: string, phoneNumber: string): { 
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
    failedNumbers: new Set<string>() 
  };
  
  // Check if this number has already failed validation (psychological protection)
  if (current.failedNumbers.has(phoneNumber)) {
    return { 
      allowed: false, 
      attemptsLeft: MAX_ATTEMPTS_PER_IP - current.count,
      isFailedNumber: true,
      reason: 'This phone number has already failed validation today'
    };
  }
  
  if (current.count >= MAX_ATTEMPTS_PER_IP) {
    return { 
      allowed: false, 
      attemptsLeft: 0,
      isFailedNumber: false,
      reason: 'Daily API limit reached for your IP address'
    };
  }
  
  return { 
    allowed: true, 
    attemptsLeft: MAX_ATTEMPTS_PER_IP - current.count,
    isFailedNumber: false
  };
}

// Update rate limit and track failed numbers
function updateRateLimit(ip: string, phoneNumber?: string, success: boolean = true) {
  const today = new Date().toDateString();
  const key = `${ip}-${today}`;
  
  const current = validationAttempts.get(key) || { 
    count: 0, 
    lastAttempt: 0, 
    failedNumbers: new Set<string>() 
  };
  
  // Only increment count for successful API calls
  const updated = {
    count: success ? current.count + 1 : current.count,
    lastAttempt: Date.now(),
    failedNumbers: current.failedNumbers
  };
  
  // Track failed numbers for psychological protection
  if (!success && phoneNumber) {
    updated.failedNumbers.add(phoneNumber);
  }
  
  validationAttempts.set(key, updated);
}

// Basic phone number validation patterns by country code (same as before)
const phonePatterns: Record<string, RegExp> = {
  '+1': /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US/Canada
  '+44': /^\+44[1-9]\d{8,9}$/, // UK
  '+33': /^\+33[1-9]\d{8}$/, // France
  '+49': /^\+49[1-9]\d{6,11}$/, // Germany
  '+358': /^\+358[1-9]\d{6,8}$/, // Finland
  '+216': /^\+216[2-9]\d{7}$/, // Tunisia
  '+91': /^\+91[6-9]\d{9}$/, // India
  '+86': /^\+86[1]\d{10}$/, // China
  '+81': /^\+81[1-9]\d{8,9}$/, // Japan
  '+82': /^\+82[1-9]\d{7,8}$/, // South Korea
  '+34': /^\+34[6-9]\d{8}$/, // Spain
  '+39': /^\+39[3]\d{8,9}$/, // Italy
  '+31': /^\+31[6]\d{8}$/, // Netherlands
  '+46': /^\+46[7]\d{8}$/, // Sweden
  '+47': /^\+47[4-9]\d{7}$/, // Norway
  '+45': /^\+45[2-9]\d{7}$/, // Denmark
  '+41': /^\+41[7]\d{8}$/, // Switzerland
  '+43': /^\+43[6-9]\d{7,10}$/, // Austria
  '+32': /^\+32[4-9]\d{7,8}$/, // Belgium
  '+351': /^\+351[9]\d{8}$/, // Portugal
  '+30': /^\+30[6]\d{9}$/, // Greece
  '+7': /^\+7[9]\d{9}$/, // Russia/Kazakhstan
  '+380': /^\+380[6-9]\d{8}$/, // Ukraine
  '+48': /^\+48[5-9]\d{8}$/, // Poland
  '+420': /^\+420[6-7]\d{8}$/, // Czech Republic
  '+421': /^\+421[9]\d{8}$/, // Slovakia
  '+36': /^\+36[2-7]\d{7,8}$/, // Hungary
  '+40': /^\+40[7]\d{8}$/, // Romania
  '+359': /^\+359[8-9]\d{7,8}$/, // Bulgaria
  '+385': /^\+385[9]\d{7,8}$/, // Croatia
  '+386': /^\+386[5-6]\d{7}$/, // Slovenia
  '+381': /^\+381[6]\d{7,8}$/, // Serbia
  '+382': /^\+382[6]\d{7}$/, // Montenegro
  '+387': /^\+387[6]\d{7}$/, // Bosnia
  '+389': /^\+389[7]\d{7}$/, // North Macedonia
  '+90': /^\+90[5]\d{9}$/, // Turkey
  '+20': /^\+20[1]\d{8,9}$/, // Egypt
  '+27': /^\+27[6-8]\d{8}$/, // South Africa
  '+234': /^\+234[7-9]\d{7,10}$/, // Nigeria
  '+254': /^\+254[7]\d{8}$/, // Kenya
  '+233': /^\+233[2-5]\d{7,8}$/, // Ghana
  '+212': /^\+212[6-7]\d{8}$/, // Morocco
  '+213': /^\+213[5-7]\d{8}$/, // Algeria
  '+218': /^\+218[9]\d{8}$/, // Libya
};

export async function POST(request: NextRequest) {
  try {
    const { countryCode, phoneNumber } = await request.json();

    if (!countryCode || !phoneNumber) {
      return NextResponse.json(
        { error: 'Country code and phone number are required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Construct full phone number
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    const fullPhone = `${countryCode}${cleanPhone}`;

    console.log(`📞 [PRODUCTION] Starting validation for: ${fullPhone}`);

    // 🔥 STEP 1: Basic format validation (always run first)
    console.log('📞 [STEP 1] Basic format validation...');
    const basicResult = basicPhoneValidation(fullPhone);
    
    if (!basicResult.isValid) {
      console.log('❌ [STEP 1] Basic validation failed, stopping here');
      return NextResponse.json({
        ...basicResult,
        message: 'Phone number format is invalid. Please check your input.'
      });
    }

    console.log('✅ [STEP 1] Basic validation passed');

    // 🔥 STEP 2: Regex pattern validation (only if basic passes)
    console.log('📞 [STEP 2] Regex pattern validation...');
    const regexResult = validatePhoneWithRegex(fullPhone);
    
    if (!regexResult.isValid) {
      console.log('❌ [STEP 2] Regex validation failed, stopping here');
      // Don't call API for invalid patterns
      updateRateLimit(clientIP.split(',')[0], fullPhone, false);
      return NextResponse.json({
        ...regexResult,
        message: `Phone number format is invalid for ${regexResult.country?.name || 'this country'}. Please check your input.`,
        suggestion: 'Please verify your phone number format and country code.'
      });
    }

    console.log('✅ [STEP 2] Regex validation passed');

    // 🔥 STEP 3: Abstract API validation (only if regex passes)
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
        
        // If API says invalid, don't allow future calls for this number today
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
      
      // Return regex result as fallback
      return NextResponse.json({
        ...regexResult,
        warning: 'Phone verification service temporarily unavailable. Using pattern matching.',
        message: '⚠️ Phone number format appears valid (verification service unavailable)'
      });
    }

  } catch (error) {
    console.error('Phone validation error:', error);
    
    // Emergency fallback - always return basic validation
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
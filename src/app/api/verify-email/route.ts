import { NextRequest, NextResponse } from 'next/server';

// For production email verification, you'll need one of these services:
// 1. Abstract API (recommended for production)
// 2. Hunter.io
// 3. ZeroBounce
// 4. EmailValidation.io

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
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Abstract API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle Abstract API response structure
    return {
      isValid: data.deliverability === 'DELIVERABLE' && !data.is_disposable_email?.value,
      deliverable: data.deliverability === 'DELIVERABLE',
      disposable: data.is_disposable_email?.value || false,
      role_account: data.is_role_email?.value || false,
    };
  } catch (error) {
    console.error('Abstract API verification failed:', error);
    throw error;
  }
}

async function verifyEmailWithHunter(email: string): Promise<EmailVerificationResponse> {
  try {
    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey) {
      throw new Error('Hunter API key not configured');
    }

    const response = await fetch(
      `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
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
    console.error('Hunter verification failed:', error);
    throw error;
  }
}

// TypeScript version of the async HTTP function
async function httpGetAsync(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
}

// Basic email format validation as fallback
function basicEmailValidation(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic format validation first
    if (!basicEmailValidation(email)) {
      return NextResponse.json(
        { isValid: false, error: 'Invalid email format' },
        { status: 200 }
      );
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
        console.warn('No email verification API configured. Using basic validation only.');
        verificationResult = {
          isValid: true, // Allow through for basic validation
        };
      }
    } catch (error) {
      console.error('Email verification service failed:', error);
      
      // In production, you might want to be more restrictive
      // For now, we'll allow the email through if the service fails
      verificationResult = {
        isValid: true,
        error: 'Verification service temporarily unavailable'
      };
    }

    return NextResponse.json(verificationResult);

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during email verification' },
      { status: 500 }
    );
  }
}
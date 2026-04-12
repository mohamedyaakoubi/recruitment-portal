import * as React from 'react';

interface AdminOtpEmailProps {
  otp: string;
  companyName: string;
  expiryMinutes: number;
}

export function AdminOtpEmail({ otp, companyName, expiryMinutes }: AdminOtpEmailProps) {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        lineHeight: '1.6',
        color: '#333',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #003A70 0%, #004080 100%)',
            color: 'white',
            padding: '25px 30px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0',
              fontSize: '20px',
              fontWeight: '700',
            }}
          >
            {companyName}
          </h1>
          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '14px',
              opacity: '0.85',
            }}
          >
            Admin Portal — One-Time Password
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '35px 30px' }}>
          <p style={{ margin: '0 0 16px 0' }}>
            A sign-in request was made for the admin dashboard. Use the code below to complete your
            authentication.
          </p>

          {/* OTP Code Box */}
          <div
            style={{
              backgroundColor: '#f0f7ff',
              border: '2px solid #003A70',
              borderRadius: '10px',
              padding: '24px',
              textAlign: 'center',
              margin: '24px 0',
            }}
          >
            <p
              style={{
                margin: '0 0 6px 0',
                fontSize: '13px',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: '600',
              }}
            >
              Your verification code
            </p>
            <p
              style={{
                margin: '0',
                fontSize: '42px',
                fontWeight: '800',
                letterSpacing: '0.25em',
                color: '#003A70',
                fontFamily: 'monospace',
              }}
            >
              {otp}
            </p>
            <p
              style={{
                margin: '10px 0 0 0',
                fontSize: '13px',
                color: '#dc2626',
                fontWeight: '600',
              }}
            >
              Expires in {expiryMinutes} minutes
            </p>
          </div>

          {/* Security Notice */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '14px 16px',
              marginTop: '16px',
            }}
          >
            <p style={{ margin: '0', fontSize: '13px', color: '#92400e' }}>
              <strong>Security Notice:</strong> Never share this code with anyone. The {companyName}{' '}
              team will never ask for your OTP. If you did not request this, please disregard this
              email — your account remains secure.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 30px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0' }}>
            This is an automated security message from {companyName}. Do not reply.
          </p>
        </div>
      </div>
    </div>
  );
}

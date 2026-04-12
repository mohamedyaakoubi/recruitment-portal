import React from 'react';

interface Props {
  magicLinkUrl: string;
  companyName: string;
  expiryMinutes: number;
}

export function MagicLinkEmail({ magicLinkUrl, companyName, expiryMinutes }: Props) {
  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#003A70',
          padding: '28px 24px',
          textAlign: 'center' as const,
        }}
      >
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: 700 }}>
          {companyName}
        </h1>
      </div>

      {/* Body */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '40px 32px',
          borderLeft: '1px solid #e2e8f0',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        <h2 style={{ color: '#003A70', marginTop: 0, fontSize: '22px' }}>Your sign-in link</h2>
        <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
          Click the button below to sign in to your account. This link expires in{' '}
          <strong>{expiryMinutes} minutes</strong> and can only be used once.
        </p>

        {/* CTA Button */}
        <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <a
            href={magicLinkUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#003A70',
              color: '#ffffff',
              padding: '14px 36px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '15px',
              letterSpacing: '0.5px',
            }}
          >
            Sign in to Career Portal
          </a>
        </div>

        {/* Security warning */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            padding: '12px 16px',
            marginTop: '24px',
          }}
        >
          <p style={{ color: '#92400e', fontSize: '13px', margin: 0 }}>
            ⚠️ If you did not request this link, you can safely ignore this email. Do not share this
            link with anyone.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: '#f1f5f9',
          padding: '20px 32px',
          borderLeft: '1px solid #e2e8f0',
          borderRight: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px' }}>
          If the button does not work, paste this URL into your browser:
        </p>
        <a
          href={magicLinkUrl}
          style={{ color: '#003A70', fontSize: '12px', wordBreak: 'break-all' as const }}
        >
          {magicLinkUrl}
        </a>
      </div>
    </div>
  );
}

import * as React from 'react';

interface CancellationEmailProps {
  candidateName: string;
  jobTitleText: string;
  reason: string;
  companyName: string;
  supportEmail: string;
  contactPhone?: string;
}

export function CancellationEmail({
  candidateName,
  jobTitleText,
  reason,
  companyName,
  supportEmail,
  contactPhone,
}: CancellationEmailProps) {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        color: '#333',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <h1 style={{ margin: '0', fontSize: '22px' }}>⚠️ Interview Cancelled</h1>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '30px',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <p>Dear {candidateName},</p>

        <div
          style={{
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #dc2626',
            padding: '15px',
            margin: '20px 0',
          }}
        >
          <p style={{ margin: '0', fontWeight: '600' }}>
            We regret to inform you that your scheduled interview for {jobTitleText} at{' '}
            {companyName} has been cancelled.
          </p>
        </div>

        <p>
          <strong>Reason:</strong> {reason}
        </p>

        <p>
          We apologize for any inconvenience this may cause. Our hiring process is dynamic, and
          sometimes we need to make adjustments to our interview schedule.
        </p>

        <h3 style={{ color: '#1e293b' }}>What happens next:</h3>
        <ul>
          <li>Your application remains active in our system</li>
          <li>We may reschedule the interview at a later date</li>
          <li>You may apply for other suitable positions</li>
          <li>We will contact you if there are new opportunities that match your profile</li>
        </ul>

        {/* Contact */}
        <div
          style={{
            backgroundColor: '#e8f5e9',
            padding: '15px',
            borderRadius: '5px',
            marginTop: '20px',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Contact Us</p>
          <p style={{ margin: '0' }}>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${supportEmail}`} style={{ color: '#16a34a' }}>
              {supportEmail}
            </a>
          </p>
          {contactPhone && (
            <p style={{ margin: '4px 0 0 0' }}>
              <strong>Phone:</strong> {contactPhone}
            </p>
          )}
          <p style={{ margin: '4px 0 0 0' }}>
            <strong>Company:</strong> {companyName}
          </p>
        </div>

        <p>
          Thank you for your understanding, and we appreciate your continued interest in{' '}
          {companyName}.
        </p>

        {/* Footer */}
        <div
          style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #ddd',
            fontSize: '14px',
            color: '#666',
          }}
        >
          <p style={{ margin: '0' }}>
            Best regards,
            <br />
            <strong>{companyName}</strong>
            <br />
            Human Resources Department
          </p>
        </div>
      </div>
    </div>
  );
}

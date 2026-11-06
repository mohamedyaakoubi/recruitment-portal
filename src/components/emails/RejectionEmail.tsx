import * as React from 'react';

interface RejectionEmailProps {
  candidateName: string;
  jobTitleText: string;
  companyName: string;
  supportEmail: string;
  contactPhone?: string;
}

export function RejectionEmail({
  candidateName,
  jobTitleText,
  companyName,
  supportEmail,
  contactPhone,
}: RejectionEmailProps) {
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
          backgroundColor: '#1e3a8a',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <h1 style={{ margin: '0', fontSize: '22px' }}>Application Status Update</h1>
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
        <p>
          Thank you for your interest in {jobTitleText} at {companyName} and for taking the time to
          submit your application.
        </p>
        <p>
          After careful consideration of your qualifications and experience, we have decided to move
          forward with other candidates whose background more closely aligns with our current
          requirements.
        </p>
        <p>
          We appreciate the time and effort you invested in the application process. Your skills and
          experience are valuable, and we encourage you to apply for future positions that match
          your qualifications.
        </p>
        <p>
          We will keep your resume on file and may contact you if a suitable opportunity arises in
          the future.
        </p>
        <p>
          Thank you again for your interest in {companyName}. We wish you the best of luck in your
          job search.
        </p>

        {/* Contact Info */}
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '5px',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Contact Information</h3>
          <p style={{ margin: '0' }}>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${supportEmail}`} style={{ color: '#1e3a8a' }}>
              {supportEmail}
            </a>
          </p>
          {contactPhone && (
            <p style={{ margin: '4px 0 0 0' }}>
              <strong>Phone:</strong> {contactPhone}
            </p>
          )}
        </div>

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
          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  );
}

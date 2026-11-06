import * as React from 'react';

interface InterviewScheduledEmailProps {
  candidateName: string;
  companyName: string;
  formattedDate: string;
  formattedTime: string;
  supportEmail: string;
  meetLink?: string;
}

export function InterviewScheduledEmail({
  candidateName,
  companyName,
  formattedDate,
  formattedTime,
  supportEmail,
  meetLink,
}: InterviewScheduledEmailProps) {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        lineHeight: '1.6',
        color: '#333',
        maxWidth: '600px',
        margin: '20px auto',
        padding: '0',
      }}
    >
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #003A70 0%, #004080 100%)',
            color: 'white',
            padding: '25px 30px',
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '1.2em',
              fontWeight: 'bold',
            }}
          >
            Interview Invitation from {companyName}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '30px', backgroundColor: '#ffffff' }}>
          <p>Dear {candidateName},</p>
          <p>
            Following up on your application, we were very impressed with your background and would
            like to invite you for an interview to discuss your qualifications further.
          </p>

          {/* Details Box */}
          <div
            style={{
              backgroundColor: '#f9f9f9',
              border: '1px solid #eee',
              padding: '20px',
              margin: '20px 0',
              borderRadius: '5px',
            }}
          >
            <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>
              We have scheduled your interview for:
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Date:</strong> {formattedDate}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Time:</strong> {formattedTime}
            </p>
          </div>

          {meetLink && (
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <a
                href={meetLink}
                style={{
                  backgroundColor: '#003A70',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-block',
                  fontSize: '15px',
                }}
              >
                Join Google Meet
              </a>
              <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#666' }}>
                Or copy the link:{' '}
                <a href={meetLink} style={{ color: '#003A70', wordBreak: 'break-all' }}>
                  {meetLink}
                </a>
              </p>
            </div>
          )}

          <p>
            If this time is not suitable, please reply directly to{' '}
            <a href={`mailto:${supportEmail}`} style={{ color: '#003A70' }}>
              {supportEmail}
            </a>{' '}
            so we can coordinate an alternative.
          </p>
          <p>We look forward to speaking with you.</p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 30px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0',
            fontSize: '0.9em',
            color: '#666',
          }}
        >
          <p style={{ margin: '0' }}>
            Sincerely,
            <br />
            The {companyName} Hiring Team
          </p>
          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    </div>
  );
}

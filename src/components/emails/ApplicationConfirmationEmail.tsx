import * as React from 'react';

interface ApplicationConfirmationEmailProps {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  formattedDate: string;
  companyName: string;
  supportEmail: string;
  jobCategory?: string;
  specialty?: string;
  contactPhone?: string;
}

export function ApplicationConfirmationEmail({
  candidateName,
  jobTitle,
  applicationId,
  formattedDate,
  companyName,
  supportEmail,
  jobCategory,
  specialty,
  contactPhone,
}: ApplicationConfirmationEmailProps) {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: '1.6',
        color: '#333',
        maxWidth: '650px',
        margin: '0 auto',
        padding: '0',
        backgroundColor: '#f5f7fa',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          margin: '20px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #003A70 0%, #004080 100%)',
            color: 'white',
            padding: '30px 20px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0',
              fontSize: '28px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            {companyName}
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '16px',
              opacity: '0.9',
              fontWeight: '300',
            }}
          >
            Application Confirmed
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '35px 30px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              fontWeight: '600',
              marginBottom: '25px',
            }}
          >
            ✅ Application Successfully Received
          </div>

          <p>Dear {candidateName},</p>
          <p>
            We have successfully received your application for the <strong>{jobTitle}</strong>{' '}
            position at {companyName}. Thank you for your interest in joining our team!
          </p>

          {/* Application Details */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '10px',
              padding: '25px',
              margin: '25px 0',
              borderLeft: '5px solid #003A70',
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', color: '#003A70' }}>Your Application Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      fontWeight: '600',
                      color: '#475569',
                      fontSize: '14px',
                      padding: '8px 0',
                      borderBottom: '1px solid #e2e8f0',
                      width: '40%',
                    }}
                  >
                    Position
                  </td>
                  <td
                    style={{
                      color: '#1e293b',
                      fontSize: '14px',
                      padding: '8px 0',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {jobTitle}
                  </td>
                </tr>
                {jobCategory && (
                  <tr>
                    <td
                      style={{
                        fontWeight: '600',
                        color: '#475569',
                        fontSize: '14px',
                        padding: '8px 0',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      Job Category
                    </td>
                    <td
                      style={{
                        color: '#1e293b',
                        fontSize: '14px',
                        padding: '8px 0',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      {jobCategory}
                    </td>
                  </tr>
                )}
                {specialty && (
                  <tr>
                    <td
                      style={{
                        fontWeight: '600',
                        color: '#475569',
                        fontSize: '14px',
                        padding: '8px 0',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      Specialty
                    </td>
                    <td
                      style={{
                        color: '#1e293b',
                        fontSize: '14px',
                        padding: '8px 0',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      {specialty}
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    style={{
                      fontWeight: '600',
                      color: '#475569',
                      fontSize: '14px',
                      padding: '8px 0',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    Application ID
                  </td>
                  <td
                    style={{
                      color: '#1e293b',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      padding: '8px 0',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {applicationId}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: '600',
                      color: '#475569',
                      fontSize: '14px',
                      padding: '8px 0',
                    }}
                  >
                    Submitted On
                  </td>
                  <td style={{ color: '#1e293b', fontSize: '14px', padding: '8px 0' }}>
                    {formattedDate}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            We will review your application and contact you with updates regarding the next steps.
          </p>
          <p>
            We appreciate your interest in {companyName} and look forward to potentially welcoming
            you to our team!
          </p>

          {/* Contact */}
          <div
            style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#f0f7ff',
              borderRadius: '8px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#003A70' }}>
              Questions? Contact Us
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#475569' }}>
              Email:{' '}
              <a href={`mailto:${supportEmail}`} style={{ color: '#003A70' }}>
                {supportEmail}
              </a>
            </p>
            {contactPhone && (
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569' }}>
                Phone: {contactPhone}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '14px',
              color: '#64748b',
            }}
          >
            <p>
              Best regards,
              <br />
              <strong>{companyName}</strong>
              <br />
              Human Resources Department
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

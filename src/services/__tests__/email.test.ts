import { vi } from 'vitest';

const { mockEmailSend } = vi.hoisted(() => ({
  mockEmailSend: vi.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null }),
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockEmailSend },
  })),
}));

describe('Email Service', () => {
  let sendNotificationEmail: any, sendRejectionEmail: any, sendCancellationEmail: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.RESEND_API_KEY = 'test-resend-api-key';
    process.env.RESEND_FROM_EMAIL = 'noreply@example.com';
    process.env.COMPANY_NAME = 'Test Company';
    process.env.SUPPORT_EMAIL = 'support@example.com';

    const emailService = await import('../email');
    sendNotificationEmail = emailService.sendNotificationEmail;
    sendRejectionEmail = emailService.sendRejectionEmail;
    sendCancellationEmail = emailService.sendCancellationEmail;
  });

  describe('sendNotificationEmail', () => {
    it('should send an interview scheduled email', async () => {
      const to = 'test@example.com';
      const candidateName = 'Test User';
      const interviewDate = new Date();

      await sendNotificationEmail(to, 'interview_scheduled', candidateName, interviewDate);

      expect(mockEmailSend).toHaveBeenCalledOnce();
      const callArg = mockEmailSend.mock.calls[0][0];
      expect(callArg.to).toBe(to);
      expect(callArg.subject).toContain('Interview Invitation');
      expect(callArg.react).toBeDefined();
    });

    it('should send a rejection notification email', async () => {
      const to = 'test@example.com';
      const candidateName = 'Test User';

      await sendNotificationEmail(to, 'rejected', candidateName);

      expect(mockEmailSend).toHaveBeenCalledOnce();
      const callArg = mockEmailSend.mock.calls[0][0];
      expect(callArg.to).toBe(to);
      expect(callArg.subject).toContain('Application Status Update');
      expect(callArg.react).toBeDefined();
    });

    it('should skip sending if no matching status', async () => {
      await sendNotificationEmail('test@example.com', 'unknown_status', 'Test User');
      expect(mockEmailSend).not.toHaveBeenCalled();
    });
  });

  describe('sendRejectionEmail', () => {
    it('should send a detailed rejection email', async () => {
      const to = 'test@example.com';
      const candidateName = 'Test User';
      const jobTitle = 'Developer';

      await sendRejectionEmail(to, candidateName, jobTitle);

      expect(mockEmailSend).toHaveBeenCalledOnce();
      const callArg = mockEmailSend.mock.calls[0][0];
      expect(callArg.to).toBe(to);
      expect(callArg.subject).toContain('Application Status Update');
      expect(callArg.react).toBeDefined();
    });

    it('should throw if required fields are missing', async () => {
      await expect(sendRejectionEmail('', '', 'Developer')).rejects.toThrow(
        'Missing required fields'
      );
    });
  });

  describe('sendCancellationEmail', () => {
    it('should send an interview cancellation email', async () => {
      const to = 'test@example.com';
      const candidateName = 'Test User';
      const jobTitle = 'Developer';
      const reason = 'Unforeseen circumstances';

      await sendCancellationEmail({ candidateEmail: to, candidateName, jobTitle, reason });

      expect(mockEmailSend).toHaveBeenCalledOnce();
      const callArg = mockEmailSend.mock.calls[0][0];
      expect(callArg.to).toBe(to);
      expect(callArg.subject).toContain('Interview Cancelled');
      expect(callArg.react).toBeDefined();
    });
  });
});

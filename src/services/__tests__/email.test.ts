/**
 * @jest-environment node
 */

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mock-message-id' });
const mockVerify = jest.fn((callback) => callback(null, true));

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: mockSendMail,
        verify: mockVerify,
    }),
}));

describe('Email Service', () => {
    let sendNotificationEmail: any, sendRejectionEmail: any, sendCancellationEmail: any;

    beforeEach(() => {
        jest.clearAllMocks();
        // Set up SMTP env vars for tests
        process.env.SMTP_HOST = 'smtp.example.com';
        process.env.SMTP_USER = 'user';
        process.env.SMTP_PASS = 'pass';
        process.env.SMTP_FROM_EMAIL = 'from@example.com';

        // Since the transporter is created at the module level, we need to re-require the module
        // to get the new mock implementation.
        const emailService = require('../email');
        sendNotificationEmail = emailService.sendNotificationEmail;
        sendRejectionEmail = emailService.sendRejectionEmail;
        sendCancellationEmail = emailService.sendCancellationEmail;
    });

    describe('sendNotificationEmail', () => {
        it('should send an interview scheduled email', async () => {
            const to = 'test@example.com';
            const candidateName = 'Test User';
            const interviewDate = new Date();
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            await sendNotificationEmail(to, 'interview_scheduled', candidateName, interviewDate);

            expect(mockSendMail).toHaveBeenCalled();
            const mailOptions = mockSendMail.mock.calls[0][0];
            expect(mailOptions.to).toBe(to);
            expect(mailOptions.subject).toContain('Interview Invitation');
            expect(mailOptions.html).toContain(candidateName);
            consoleLogSpy.mockRestore();
        });

        it('should send a rejection email', async () => {
            const to = 'test@example.com';
            const candidateName = 'Test User';
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            await sendNotificationEmail(to, 'rejected', candidateName);

            expect(mockSendMail).toHaveBeenCalled();
            const mailOptions = mockSendMail.mock.calls[0][0];
            expect(mailOptions.to).toBe(to);
            expect(mailOptions.subject).toContain('Application Status Update');
            expect(mailOptions.html).toContain('decided not to move forward');
            consoleLogSpy.mockRestore();
        });
    });

    describe('sendRejectionEmail', () => {
        it('should send a detailed rejection email', async () => {
            const to = 'test@example.com';
            const candidateName = 'Test User';
            const jobTitle = 'Developer';
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            await sendRejectionEmail(to, candidateName, jobTitle);

            expect(mockSendMail).toHaveBeenCalled();
            const mailOptions = mockSendMail.mock.calls[0][0];
            expect(mailOptions.to).toBe(to);
            expect(mailOptions.subject).toContain('Application Status Update');
            expect(mailOptions.html).toContain(jobTitle);
            consoleLogSpy.mockRestore();
        });
    });

    describe('sendCancellationEmail', () => {
        it('should send an interview cancellation email', async () => {
            const to = 'test@example.com';
            const candidateName = 'Test User';
            const jobTitle = 'Developer';
            const reason = 'Unforeseen circumstances';
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            await sendCancellationEmail({ candidateEmail: to, candidateName, jobTitle, reason });

            expect(mockSendMail).toHaveBeenCalled();
            const mailOptions = mockSendMail.mock.calls[0][0];
            expect(mailOptions.to).toBe(to);
            expect(mailOptions.subject).toContain('Interview Cancelled');
            expect(mailOptions.html).toContain(reason);
            consoleLogSpy.mockRestore();
        });
    });
});

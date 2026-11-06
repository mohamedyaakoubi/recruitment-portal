import { beforeEach, describe, expect, it, vi } from 'vitest';
import { scheduleInterview, cancelInterview } from '../interview';
import { google } from 'googleapis';
import { getAuthenticatedClient } from '@/lib/googleOAuth';
import * as candidateService from '../candidate';
import * as emailService from '../email';

vi.mock('googleapis', () => ({
  google: {
    calendar: vi.fn(),
  },
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
}));
vi.mock('@/lib/googleOAuth');
vi.mock('../email');
vi.mock('../candidate', () => ({
  updateCandidateStatus: vi.fn(),
}));
const mockDoc = {
  exists: true,
  data: () => ({
    calendarEventId: 'existing-event-id',
    email: 'test@example.com',
    fullName: 'John Doe',
    jobTitleText: 'Developer',
  }),
};

const mockCollection = {
  doc: vi.fn().mockReturnValue({
    get: vi.fn().mockResolvedValue(mockDoc),
    update: vi.fn(),
  }),
};

const mockFirestore = {
  collection: vi.fn().mockReturnValue(mockCollection),
};

const { mockAdminGet, mockAdminUpdate } = vi.hoisted(() => {
  return {
    mockAdminGet: vi.fn(),
    mockAdminUpdate: vi.fn(),
  };
});

vi.mock('@/lib/firebase-admin', () => ({
  getFirestoreAdmin: vi.fn().mockReturnValue({
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: mockAdminGet,
        update: mockAdminUpdate,
      }),
    }),
  }),
}));

const mockEventsInsert = vi.fn();
const mockEventsDelete = vi.fn();
const mockCalendar = {
  events: {
    insert: mockEventsInsert,
    update: mockEventsInsert, // Added update mock
    delete: mockEventsDelete,
  },
};
(google.calendar as vi.Mock).mockReturnValue(mockCalendar);
(getAuthenticatedClient as vi.Mock).mockResolvedValue({});

describe('Interview Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(candidateService.updateCandidateStatus).mockResolvedValue({
      status: 'interview_scheduled',
      emailSent: true,
    });
    mockAdminGet.mockResolvedValue({
      exists: true,
      data: () => ({
        calendarEventId: 'existing-event-id',
        email: 'test@example.com',
        fullName: 'John Doe',
        jobTitleText: 'Developer',
      }),
    });
  });

  describe('scheduleInterview', () => {
    it('should schedule an interview and return event details', async () => {
      mockEventsInsert.mockResolvedValue({
        data: {
          id: 'test-event-id',
          hangoutLink: 'https://meet.google.com/test-link',
        },
      });

      const result = await scheduleInterview(
        'c1',
        'c@test.com',
        'C Name',
        '2025-12-25',
        '10:00',
        30,
        'Dev',
        'a@test.com',
        'notes'
      );

      expect(mockEventsInsert).toHaveBeenCalled();
      expect(candidateService.updateCandidateStatus).toHaveBeenCalledWith(
        'c1',
        'interview_scheduled',
        expect.any(String),
        'test-event-id',
        'https://meet.google.com/test-link',
        30
      );
      expect(emailService.sendInterviewerNotificationEmail).toHaveBeenCalledWith({
        adminEmail: 'a@test.com',
        candidateName: 'C Name',
        candidateEmail: 'c@test.com',
        jobTitle: 'Dev',
        interviewDate: expect.any(Date),
        duration: 30,
        meetLink: 'https://meet.google.com/test-link',
        notes: 'notes',
      });
      expect(result.calendarEventId).toBe('test-event-id');
      expect(result.meetLink).toBe('https://meet.google.com/test-link');
    });

    it('should fail when candidate status update fails', async () => {
      mockEventsInsert.mockResolvedValue({
        data: {
          id: 'test-event-id',
          hangoutLink: 'https://meet.google.com/test-link',
        },
      });
      vi.mocked(candidateService.updateCandidateStatus).mockRejectedValue(
        new Error('Failed to update status')
      );

      await expect(
        scheduleInterview(
          'c1',
          'c@test.com',
          'C Name',
          '2025-12-25',
          '10:00',
          30,
          'Dev',
          'a@test.com',
          'notes'
        )
      ).rejects.toThrow('Failed to update status');

      expect(emailService.sendInterviewerNotificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('cancelInterview', () => {
    it('should cancel an interview and send an email', async () => {
      const sendCancellationEmailSpy = vi.spyOn(emailService, 'sendCancellationEmail');
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await cancelInterview('c1', 'reason');

      expect(mockEventsDelete).toHaveBeenCalledWith({
        calendarId: 'primary',
        eventId: 'existing-event-id',
        sendUpdates: 'all',
      });
      expect(mockAdminUpdate).toHaveBeenCalled();
      expect(sendCancellationEmailSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });
  });
});

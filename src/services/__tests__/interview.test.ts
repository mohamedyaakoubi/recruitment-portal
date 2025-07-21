/**
 * @jest-environment node
 */

import { scheduleInterview, cancelInterview } from '../interview';
import { google } from 'googleapis';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getGoogleAuth } from '../google';
import * as emailService from '../email';

jest.mock('googleapis', () => ({
  google: {
    calendar: jest.fn(),
  },
}));
jest.mock('firebase/firestore');
jest.mock('../google');
jest.mock('../email');

const mockEventsInsert = jest.fn();
const mockEventsDelete = jest.fn();
const mockCalendar = {
  events: {
    insert: mockEventsInsert,
    delete: mockEventsDelete,
  },
};
(google.calendar as jest.Mock).mockReturnValue(mockCalendar);
(getGoogleAuth as jest.Mock).mockReturnValue({});

global.fetch = jest.fn();

describe('Interview Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleInterview', () => {
    it('should schedule an interview and return event details', async () => {
      mockEventsInsert.mockResolvedValue({
        data: {
          id: 'test-event-id',
          hangoutLink: 'https://meet.google.com/test-link',
        },
      });
      (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      const result = await scheduleInterview(
        'c1', 'c@test.com', 'C Name', '2025-12-25', '10:00', 30, 'Dev', 'a@test.com', 'notes', 'http://localhost'
      );

      expect(mockEventsInsert).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('http://localhost/api/update-status', expect.any(Object));
      expect(result.calendarEventId).toBe('test-event-id');
      expect(result.meetLink).toBe('https://meet.google.com/test-link');
    });
  });

  describe('cancelInterview', () => {
    it('should cancel an interview and send an email', async () => {
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({ calendarEventId: 'test-event-id', email: 'c@test.com', fullName: 'C Name' }),
          });
        
        const sendCancellationEmailSpy = jest.spyOn(emailService, 'sendCancellationEmail');
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await cancelInterview('c1', 'reason');

        expect(mockEventsDelete).toHaveBeenCalledWith({ calendarId: 'primary', eventId: 'test-event-id', sendUpdates: 'all' });
        expect(updateDoc).toHaveBeenCalled();
        expect(sendCancellationEmailSpy).toHaveBeenCalled();
        consoleLogSpy.mockRestore();
    });
  });
});

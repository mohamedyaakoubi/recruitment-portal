import { vi } from 'vitest';

/**
 * @jest-environment node
 */

import { updateCandidateStatus, exportCandidates } from '../candidate';
import { calculateAge } from '@/lib/dateUtils';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import * as emailService from '../email';

vi.mock('@/lib/firebase-admin');
vi.mock('../email');

const mockDb = {
  collection: vi.fn(),
};
const mockCollection = {
  doc: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  get: vi.fn(),
};
const mockDoc = {
  get: vi.fn(),
  update: vi.fn(),
};

(getFirestoreAdmin as vi.Mock).mockReturnValue(mockDb);
(mockDb.collection as vi.Mock).mockReturnValue(mockCollection);
(mockCollection.doc as vi.Mock).mockReturnValue(mockDoc);
(mockCollection.where as vi.Mock).mockReturnThis();
(mockCollection.orderBy as vi.Mock).mockReturnThis();

describe('Candidate Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateAge', () => {
    it('should return the correct age', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      expect(calculateAge(birthDate.toISOString().split('T')[0])).toBe(30);
    });

    it('should return null for invalid date', () => {
      expect(calculateAge('invalid-date')).toBeNull();
    });

    it('should return null for empty date', () => {
      expect(calculateAge('')).toBeNull();
    });
  });

  describe('updateCandidateStatus', () => {
    it('should update status and send rejection email', async () => {
      const candidateData = {
        email: 'test@example.com',
        fullName: 'Test User',
        jobTitleText: 'Developer',
      };
      mockDoc.get.mockResolvedValue({ exists: true, data: () => candidateData });
      const sendRejectionEmailSpy = vi.spyOn(emailService, 'sendRejectionEmail');
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateCandidateStatus('1', 'rejected');

      expect(mockDoc.update).toHaveBeenCalledWith({ status: 'rejected' });
      expect(sendRejectionEmailSpy).toHaveBeenCalledWith(
        candidateData.email,
        candidateData.fullName,
        candidateData.jobTitleText
      );
      consoleLogSpy.mockRestore();
    });

    it('should update status and send interview email', async () => {
      const candidateData = { email: 'test@example.com', fullName: 'Test User' };
      mockDoc.get.mockResolvedValue({ exists: true, data: () => candidateData });
      const sendNotificationEmailSpy = vi.spyOn(emailService, 'sendNotificationEmail');
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const interviewDate = new Date();

      await updateCandidateStatus('1', 'interview_scheduled', interviewDate.toISOString());

      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'interview_scheduled' })
      );
      expect(sendNotificationEmailSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should throw error for invalid status', async () => {
      await expect(updateCandidateStatus('1', 'invalid_status')).rejects.toThrow(
        'Invalid status provided'
      );
    });
  });

  describe('exportCandidates', () => {
    it('should return filtered candidates', async () => {
      const mockCandidates = [
        {
          id: '1',
          data: () => ({ fullName: 'John Doe', status: 'approved', nationality: 'American' }),
        },
        {
          id: '2',
          data: () => ({ fullName: 'Jane Doe', status: 'rejected', nationality: 'Canadian' }),
        },
      ];
      mockCollection.get.mockResolvedValue({ docs: mockCandidates });

      const result = await exportCandidates('all', 'Doe', 'American');
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('John Doe');
    });
  });
});

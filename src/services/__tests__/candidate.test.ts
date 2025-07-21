
/**
 * @jest-environment node
 */

import { calculateAge, updateCandidateStatus, exportCandidates } from '../candidate';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import * as emailService from '../email';

jest.mock('@/lib/firebase-admin');
jest.mock('../email');

const mockDb = {
  collection: jest.fn(),
};
const mockCollection = {
  doc: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  get: jest.fn(),
};
const mockDoc = {
  get: jest.fn(),
  update: jest.fn(),
};

(getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
(mockDb.collection as jest.Mock).mockReturnValue(mockCollection);
(mockCollection.doc as jest.Mock).mockReturnValue(mockDoc);
(mockCollection.where as jest.Mock).mockReturnThis();
(mockCollection.orderBy as jest.Mock).mockReturnThis();


describe('Candidate Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      const candidateData = { email: 'test@example.com', fullName: 'Test User', jobTitleText: 'Developer' };
      mockDoc.get.mockResolvedValue({ exists: true, data: () => candidateData });
      const sendRejectionEmailSpy = jest.spyOn(emailService, 'sendRejectionEmail');

      await updateCandidateStatus('1', 'rejected');

      expect(mockDoc.update).toHaveBeenCalledWith({ status: 'rejected' });
      expect(sendRejectionEmailSpy).toHaveBeenCalledWith(candidateData.email, candidateData.fullName, candidateData.jobTitleText);
    });

    it('should update status and send interview email', async () => {
        const candidateData = { email: 'test@example.com', fullName: 'Test User' };
        mockDoc.get.mockResolvedValue({ exists: true, data: () => candidateData });
        const sendNotificationEmailSpy = jest.spyOn(emailService, 'sendNotificationEmail');
        const interviewDate = new Date();
    
        await updateCandidateStatus('1', 'interview_scheduled', interviewDate.toISOString());
    
        expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'interview_scheduled' }));
        expect(sendNotificationEmailSpy).toHaveBeenCalled();
      });

    it('should throw error for invalid status', async () => {
      await expect(updateCandidateStatus('1', 'invalid_status')).rejects.toThrow('Invalid status provided');
    });
  });

  describe('exportCandidates', () => {
    it('should return filtered candidates', async () => {
        const mockCandidates = [
            { id: '1', data: () => ({ fullName: 'John Doe', status: 'approved', nationality: 'American' }) },
            { id: '2', data: () => ({ fullName: 'Jane Doe', status: 'rejected', nationality: 'Canadian' }) },
        ];
        mockCollection.get.mockResolvedValue({ docs: mockCandidates });

        const result = await exportCandidates('all', 'Doe', 'American');
        expect(result).toHaveLength(1);
        expect(result[0].fullName).toBe('John Doe');
    });
  });
});


import { getStatusChartData, getScoreDistributionData } from '../chartData';
import { Candidate } from '@/types';

const mockCandidates: Candidate[] = [
  { id: '1', fullName: 'John Doe', status: 'submitted', score: null, email: 'a@a.com', cvUrl: '' },
  { id: '2', fullName: 'Jane Doe', status: 'interview_scheduled', score: 75, email: 'a@a.com', cvUrl: '' },
  { id: '3', fullName: 'Peter Pan', status: 'rejected', score: 30, email: 'a@a.com', cvUrl: '' },
  { id: '4', fullName: 'Wendy Darling', status: 'approved', score: 90, email: 'a@a.com', cvUrl: '' },
  { id: '5', fullName: 'Captain Hook', status: 'submitted', score: null, email: 'a@a.com', cvUrl: '' },
  { id: '6', fullName: 'Tinker Bell', status: 'approved', score: 95, email: 'a@a.com', cvUrl: '' },
];

describe('Chart Data Utils', () => {
  describe('getStatusChartData', () => {
    it('should return correct status distribution', () => {
      const result = getStatusChartData(mockCandidates);
      expect(result).toEqual([
        { name: 'Submitted', value: 2 },
        { name: 'Interview Scheduled', value: 1 },
        { name: 'Rejected', value: 1 },
        { name: 'Approved', value: 2 },
      ]);
    });
  });

  describe('getScoreDistributionData', () => {
    it('should return correct score distribution', () => {
      const result = getScoreDistributionData(mockCandidates);
      expect(result).toEqual([
        { name: '0-20', count: 0 },
        { name: '21-40', count: 1 },
        { name: '41-60', count: 0 },
        { name: '61-80', count: 1 },
        { name: '81-100', count: 2 },
      ]);
    });
  });
});

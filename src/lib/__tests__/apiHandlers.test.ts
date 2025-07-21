
import { createApiHandlers } from '../apiHandlers';
import { Candidate } from '@/types';

const mockShowToast = jest.fn();
const mockCloseScoringModal = jest.fn();
const mockCloseProfileModal = jest.fn();
const mockSetIsInterviewSchedulingOpen = jest.fn();
const mockSetConfirmationModal = jest.fn();
const mockSetStatusUpdateLoading = jest.fn();
const mockSetIsScoring = jest.fn();
const mockSetScoringError = jest.fn();
const mockSetIsScheduling = jest.fn();

const selectedCandidate: Candidate = { id: '1', fullName: 'John Doe', status: 'submitted', score: null, email: 'a@a.com', cvUrl: '' };
const candidates: Candidate[] = [selectedCandidate];

global.fetch = jest.fn();

describe('API Handlers', () => {
  let handlers: any;

  beforeEach(() => {
    jest.clearAllMocks();
    handlers = createApiHandlers(
      mockShowToast,
      mockCloseScoringModal,
      mockCloseProfileModal,
      mockSetIsInterviewSchedulingOpen,
      mockSetConfirmationModal,
      mockSetStatusUpdateLoading,
      mockSetIsScoring,
      mockSetScoringError,
      mockSetIsScheduling,
      selectedCandidate,
      candidates
    );
  });

  describe('handleScoreSubmit', () => {
    it('should score a candidate successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await handlers.handleScoreSubmit('job1', 'Job Title', 'Job Desc');
      expect(mockSetIsScoring).toHaveBeenCalledWith(true);
      expect(fetch).toHaveBeenCalledWith('/api/score-candidate', expect.any(Object));
      expect(mockShowToast).toHaveBeenCalledWith('Candidate scored successfully!', 'success');
      expect(mockCloseScoringModal).toHaveBeenCalled();
      expect(mockSetIsScoring).toHaveBeenCalledWith(false);
      consoleLogSpy.mockRestore();
    });

    it('should handle scoring failure', async () => {
        (fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Failed' }) });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await handlers.handleScoreSubmit('job1', 'Job Title', 'Job Desc');
        expect(mockSetScoringError).toHaveBeenCalledWith('Failed');
        expect(mockSetIsScoring).toHaveBeenCalledWith(false);
        consoleErrorSpy.mockRestore();
      });
  });

  describe('handleStatusChange', () => {
    it('should change status directly for non-rejected status', async () => {
        (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        await handlers.handleStatusChange('1', 'approved');
        expect(fetch).toHaveBeenCalledWith('/api/update-status', expect.any(Object));
        expect(mockShowToast).toHaveBeenCalledWith('Candidate status updated to approved successfully!', 'success');
        consoleLogSpy.mockRestore();
    });

    it('should open confirmation modal for rejected status', async () => {
        await handlers.handleStatusChange('1', 'rejected');
        expect(mockSetConfirmationModal).toHaveBeenCalled();
    });
  });

  describe('handleScheduleInterview', () => {
    it('should schedule an interview successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      await handlers.handleScheduleInterview('1', '2025-12-25', '10:00', 30, 'admin@example.com');
      expect(mockSetIsScheduling).toHaveBeenCalledWith(true);
      expect(fetch).toHaveBeenCalledWith('/api/schedule-interview-meet', expect.any(Object));
      expect(mockShowToast).toHaveBeenCalledWith('Interview scheduled successfully with Google Meet!', 'success');
      expect(mockSetIsInterviewSchedulingOpen).toHaveBeenCalledWith(false);
      expect(mockSetIsScheduling).toHaveBeenCalledWith(false);
    });
  });

  describe('handleCancelInterview', () => {
    it('should open confirmation modal for cancelling interview', async () => {
      await handlers.handleCancelInterview('1', 'reason');
      expect(mockSetConfirmationModal).toHaveBeenCalled();
    });
  });

  describe('handleEditCandidate', () => {
    it('should edit a candidate successfully', async () => {
        (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        await handlers.handleEditCandidate('1', { fullName: 'New Name' });
        expect(fetch).toHaveBeenCalledWith('/api/update-candidate', expect.any(Object));
        expect(mockShowToast).toHaveBeenCalledWith('Candidate information updated successfully!', 'success');
        consoleLogSpy.mockRestore();
    });
  });
});

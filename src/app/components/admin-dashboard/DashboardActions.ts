// src/app/components/admin-dashboard/DashboardActions.ts
import { Candidate } from '@/types';

export const handleScoreSubmit = async (
  selectedCandidate: Candidate,
  jobId: string,
  jobTitle: string,
  jobDescription: string,
  setIsScoring: (isScoring: boolean) => void,
  setScoringError: (error: string | null) => void,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void,
  closeScoringModal: () => void
) => {
  if (!selectedCandidate) return;
  setIsScoring(true);
  setScoringError(null);
  try {
    const response = await fetch('/api/score-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        candidateId: selectedCandidate.id, 
        jobId, 
        jobTitle, 
        jobDescription 
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to score candidate');
    }
    showToast('Candidate scored successfully!', 'success');
    closeScoringModal();
  } catch (error) {
    setScoringError(error instanceof Error ? error.message : 'An unknown error occurred');
  } finally {
    setIsScoring(false);
  }
};

export const performStatusChange = async (
  candidateId: string,
  newStatus: string,
  candidates: Candidate[],
  selectedCandidate: Candidate | null,
  setStatusUpdateLoading: (loading: Record<string, boolean>) => void,
  setStatusUpdateError: (error: string | null) => void,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void,
  closeProfileModal: () => void,
  interviewTimestampISO?: string
) => {
  setStatusUpdateLoading({ [candidateId]: true });
  setStatusUpdateError(null);
  try {
    const response = await fetch('/api/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, newStatus, interviewTimestampISO }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update status');
    }
    
    if (newStatus === 'rejected') {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate && candidate.email) {
        try {
          const emailResponse = await fetch('/api/send-rejection-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateEmail: candidate.email,
              candidateName: candidate.fullName,
              jobTitle: candidate.jobTitleText || ''
            }),
          });
          
          if (emailResponse.ok) {
            showToast('Candidate rejected and email notification sent successfully!', 'success');
          } else {
            showToast('Candidate rejected, but email notification failed to send.', 'warning');
          }
        } catch (emailError) {
          showToast('Candidate rejected, but email notification failed to send.', 'warning');
        }
      } else {
        showToast(`Candidate status updated to ${newStatus.replace('_', ' ')} successfully!`, 'success');
      }
    } else {
      showToast(`Candidate status updated to ${newStatus.replace('_', ' ')} successfully!`, 'success');
    }
    
    if (selectedCandidate?.id === candidateId) {
      closeProfileModal();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    setStatusUpdateError(errorMessage);
    showToast(`Failed to update status: ${errorMessage}`, 'error');
  } finally {
    setStatusUpdateLoading({ [candidateId]: false });
  }
};

export const handleScheduleInterview = async (
  candidate: Candidate,
  date: string,
  time: string,
  duration: number,
  adminEmail: string,
  notes: string | undefined,
  setIsScheduling: (isScheduling: boolean) => void,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void,
  setIsInterviewSchedulingOpen: (isOpen: boolean) => void
) => {
  if (!candidate) return;

  setIsScheduling(true);
  
  try {
    const response = await fetch('/api/schedule-interview-meet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: candidate.id,
        candidateEmail: candidate.email,
        candidateName: candidate.fullName,
        interviewDate: date,
        interviewTime: time,
        duration,
        jobTitle: candidate.jobTitleText,
        adminEmail,
        notes
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to schedule interview');
    }

    showToast('Interview scheduled successfully with Google Meet!', 'success');
    setIsInterviewSchedulingOpen(false);
    
  } catch (error) {
    showToast(`Failed to schedule interview: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  } finally {
    setIsScheduling(false);
  }
};

export const handleCancelInterview = async (
  candidate: Candidate,
  reason: string | undefined,
  setConfirmationModal: (modal: any) => void,
  setStatusUpdateLoading: (loading: Record<string, boolean>) => void,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void,
  closeProfileModal: () => void
) => {
  setConfirmationModal({
    isOpen: true,
    title: 'Cancel Scheduled Interview',
    message: `Are you sure you want to cancel the interview for ${candidate?.fullName || 'this candidate'}? This will delete the calendar event and notify the candidate.`,
    onConfirm: async () => {
      setConfirmationModal((prev: any) => ({ ...prev, isOpen: false }));
      setStatusUpdateLoading({ [candidate.id]: true });
      
      try {
        const response = await fetch('/api/cancel-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            candidateId: candidate.id, 
            reason: reason || 'Cancelled by admin'
          }),
        });
        
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to cancel interview');
        }
        
        showToast('Interview cancelled successfully and candidate has been notified.', 'success');
        closeProfileModal();
      } catch (error) {
        showToast(`Failed to cancel interview: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      } finally {
        setStatusUpdateLoading({ [candidate.id]: false });
      }
    }
  });
};

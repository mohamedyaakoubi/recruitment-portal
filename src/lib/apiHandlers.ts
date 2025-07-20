import type { Candidate } from '@/types';

export const createApiHandlers = (
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void,
    closeScoringModal: () => void,
    closeProfileModal: () => void,
    setIsInterviewSchedulingOpen: (isOpen: boolean) => void,
    setConfirmationModal: (modal: any) => void,
    setStatusUpdateLoading: (loading: any) => void,
    setIsScoring: (isScoring: boolean) => void,
    setScoringError: (error: string | null) => void,
    setIsScheduling: (isScheduling: boolean) => void,
    selectedCandidate: Candidate | null,
    candidates: Candidate[]
) => {
    const handleScoreSubmit = async (jobId: string, jobTitle: string, jobDescription: string) => {
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
            console.log('Scoring successful:', result);
            showToast('Candidate scored successfully!', 'success');
            closeScoringModal();
        } catch (error) {
            console.error('Scoring failed:', error);
            setScoringError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsScoring(false);
        }
    };

    const performStatusChange = async (candidateId: string, newStatus: string, interviewTimestampISO?: string) => {
        setStatusUpdateLoading((prev: any) => ({ ...prev, [candidateId]: true }));
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
            console.log('Status update successful:', result);

            if (newStatus === 'rejected') {
                if (result.emailSent) {
                    showToast('Candidate rejected and email notification sent successfully!', 'success');
                } else {
                    showToast('Candidate rejected. Email notification may have failed - check server logs.', 'warning');
                }
            } else {
                showToast(`Candidate status updated to ${newStatus.replace('_', ' ')} successfully!`, 'success');
            }

            if (selectedCandidate?.id === candidateId) {
                closeProfileModal();
            }
        } catch (error) {
            console.error('Status update failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            showToast(`Failed to update status: ${errorMessage}`, 'error');
        } finally {
            setStatusUpdateLoading((prev: any) => ({ ...prev, [candidateId]: false }));
        }
    };

    const handleStatusChange = async (candidateId: string, newStatus: string, interviewTimestampISO?: string) => {
        if (newStatus === 'rejected') {
            const candidate = candidates.find(c => c.id === candidateId);
            setConfirmationModal({
                isOpen: true,
                title: 'Confirm Candidate Rejection',
                message: `Are you sure you want to reject ${candidate?.fullName || 'this candidate'}? This action cannot be undone.`,
                onConfirm: async () => {
                    setConfirmationModal((prev: any) => ({ ...prev, isOpen: false }));
                    await performStatusChange(candidateId, newStatus, interviewTimestampISO);
                }
            });
            return;
        }

        await performStatusChange(candidateId, newStatus, interviewTimestampISO);
    };

    const handleScheduleInterview = async (
        candidateId: string,
        date: string,
        time: string,
        duration: number,
        adminEmail: string,
        notes?: string
    ) => {
        const candidate = candidates.find(c => c.id === candidateId);
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
            console.error('Failed to schedule interview:', error);
            showToast(`Failed to schedule interview: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsScheduling(false);
        }
    };

    const handleCancelInterview = async (candidateId: string, reason?: string) => {
        const candidate = candidates.find(c => c.id === candidateId);
        setConfirmationModal({
            isOpen: true,
            title: 'Cancel Scheduled Interview',
            message: `Are you sure you want to cancel the interview for ${candidate?.fullName || 'this candidate'}? This will delete the calendar event and notify the candidate.`,
            onConfirm: async () => {
                setConfirmationModal((prev: any) => ({ ...prev, isOpen: false }));
                setStatusUpdateLoading((prev: any) => ({ ...prev, [candidateId]: true }));

                try {
                    const response = await fetch('/api/cancel-interview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            candidateId,
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
                    console.error('Cancel interview failed:', error);
                    showToast(`Failed to cancel interview: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                } finally {
                    setStatusUpdateLoading((prev: any) => ({ ...prev, [candidateId]: false }));
                }
            }
        });
    };

    const handleEditCandidate = async (candidateId: string, updatedData: Partial<Candidate>) => {
        try {
            const response = await fetch('/api/update-candidate', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId, updatedData }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update candidate');
            }

            console.log('✅ Candidate updated successfully:', result);
            showToast('Candidate information updated successfully!', 'success');

        } catch (error) {
            console.error('❌ Failed to update candidate:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            showToast(`Failed to update candidate: ${errorMessage}`, 'error');
            throw error;
        }
    };

    return {
        handleScoreSubmit,
        handleStatusChange,
        handleScheduleInterview,
        handleCancelInterview,
        handleEditCandidate,
    };
};

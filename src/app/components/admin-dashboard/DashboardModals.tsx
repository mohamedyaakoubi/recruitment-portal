'use client';

import React from 'react';
import JobManagement from '../JobManagement';
import ScoringModal from '../ScoringModal';
import CandidateProfileModal from '../CandidateProfileModal';
import InterviewSchedulingModal from '../InterviewSchedulingModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import Toast from '../ui/Toast';
import type { Candidate } from '@/types';

interface DashboardModalsProps {
  isJobManagementOpen: boolean;
  closeJobManagement: () => void;
  isScoringModalOpen: boolean;
  closeScoringModal: () => void;
  selectedCandidate: Candidate | null;
  handleScoreSubmit: (jobId: string, jobTitle: string, jobDescription: string) => Promise<void>;
  isScoring: boolean;
  scoringError: string | null;
  isProfileModalOpen: boolean;
  closeProfileModal: () => void;
  handleStatusChange: (
    candidateId: string,
    newStatus: string,
    interviewTimestampISO?: string
  ) => Promise<void>;
  handleCancelInterview: (candidateId: string, reason?: string) => Promise<void>;
  statusUpdateLoading: boolean;
  setIsInterviewSchedulingOpen: (isOpen: boolean) => void;
  handleEditCandidate: (candidateId: string, updatedData: Partial<Candidate>) => Promise<void>;
  isInterviewSchedulingOpen: boolean;
  handleScheduleInterview: (
    candidateId: string,
    date: string,
    time: string,
    duration: number,
    adminEmail: string,
    notes?: string
  ) => Promise<void>;
  isScheduling: boolean;
  confirmationModal: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  setConfirmationModal: (
    modal: {
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel: () => void;
    } | null
  ) => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  };
  setToast: (toast: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }) => void;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({
  isJobManagementOpen,
  closeJobManagement,
  isScoringModalOpen,
  closeScoringModal,
  selectedCandidate,
  handleScoreSubmit,
  isScoring,
  scoringError,
  isProfileModalOpen,
  closeProfileModal,
  handleStatusChange,
  handleCancelInterview,
  statusUpdateLoading,
  setIsInterviewSchedulingOpen,
  handleEditCandidate,
  isInterviewSchedulingOpen,
  handleScheduleInterview,
  isScheduling,
  confirmationModal,
  setConfirmationModal,
  toast,
  setToast,
}) => {
  return (
    <>
      <JobManagement isOpen={isJobManagementOpen} onClose={closeJobManagement} />

      <ScoringModal
        isOpen={isScoringModalOpen}
        onClose={closeScoringModal}
        candidate={selectedCandidate}
        onSubmit={handleScoreSubmit}
        isLoading={isScoring}
        error={scoringError}
      />

      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        candidate={selectedCandidate}
        onStatusChange={handleStatusChange}
        onCancelInterview={handleCancelInterview}
        statusUpdateLoading={selectedCandidate ? statusUpdateLoading : false}
        onScheduleInterview={() => setIsInterviewSchedulingOpen(true)}
        onEditCandidate={handleEditCandidate}
      />

      <InterviewSchedulingModal
        isOpen={isInterviewSchedulingOpen}
        onClose={() => setIsInterviewSchedulingOpen(false)}
        candidate={selectedCandidate}
        onSchedule={handleScheduleInterview}
        isLoading={isScheduling}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(null)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
};

export default DashboardModals;

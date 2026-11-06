/**
 * Dashboard Modals Hook
 * Manages all modal states and handlers
 */

import { useState } from 'react';
import type { Candidate } from '@/types';

export const useDashboardModals = () => {
  // Modal states
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isJobManagementOpen, setIsJobManagementOpen] = useState(false);
  const [isInterviewSchedulingOpen, setIsInterviewSchedulingOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Loading and error states for modals
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<Record<string, boolean>>({});
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  // Modal handlers
  const openScoringModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsScoringModalOpen(true);
  };

  const closeScoringModal = () => {
    setIsScoringModalOpen(false);
    setSelectedCandidate(null);
    setScoringError(null);
  };

  const openProfileModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedCandidate(null);
  };

  const openJobManagement = () => {
    setIsJobManagementOpen(true);
  };

  const closeJobManagement = () => {
    setIsJobManagementOpen(false);
  };

  return {
    // Modal states
    isScoringModalOpen,
    setIsScoringModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isJobManagementOpen,
    setIsJobManagementOpen,
    isInterviewSchedulingOpen,
    setIsInterviewSchedulingOpen,
    selectedCandidate,
    setSelectedCandidate,

    // Loading and error states
    statusUpdateLoading,
    setStatusUpdateLoading,
    statusUpdateError,
    setStatusUpdateError,
    isScoring,
    setIsScoring,
    isScheduling,
    setIsScheduling,
    scoringError,
    setScoringError,

    // Confirmation modal
    confirmationModal,
    setConfirmationModal,

    // Modal handlers
    openScoringModal,
    closeScoringModal,
    openProfileModal,
    closeProfileModal,
    openJobManagement,
    closeJobManagement,
  };
};

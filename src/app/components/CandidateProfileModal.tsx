'use client';

import React from 'react';
import { useProfileModal } from '@/hooks/useProfileModal';
import type { CandidateProfileModalProps } from '@/types';
import EditCandidateModal from './EditCandidateModal';
import ProfileHeader from './profile-modal/ProfileHeader';
import ProfileModalContent from './profile-modal/ProfileModalContent';

const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onStatusChange,
  onCancelInterview,
  statusUpdateLoading,
  onScheduleInterview,
  onEditCandidate,
}) => {
  const { isEditModalOpen, setIsEditModalOpen, isUpdating, handleEditCandidate, calculateAge } =
    useProfileModal(candidate, onEditCandidate);

  if (!isOpen || !candidate) return null;

  const age = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div className="flex max-h-[95vh] w-full max-w-5xl flex-col rounded-xl bg-gray-50 shadow-2xl dark:bg-gray-900">
          <ProfileHeader
            candidate={candidate}
            onClose={onClose}
            onEdit={() => setIsEditModalOpen(true)}
            isUpdating={isUpdating}
            statusUpdateLoading={statusUpdateLoading}
          />
          <ProfileModalContent
            candidate={candidate}
            age={age}
            onStatusChange={onStatusChange}
            onCancelInterview={onCancelInterview}
            statusUpdateLoading={statusUpdateLoading}
            onScheduleInterview={onScheduleInterview}
          />
        </div>
      </div>
      <EditCandidateModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        candidate={candidate}
        onSave={handleEditCandidate}
        isLoading={isUpdating}
      />
    </>
  );
};

export default CandidateProfileModal;

"use client";

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
    const {
        isEditModalOpen,
        setIsEditModalOpen,
        isUpdating,
        handleEditCandidate,
        calculateAge,
    } = useProfileModal(candidate, onEditCandidate);

    if (!isOpen || !candidate) return null;

    const age = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
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

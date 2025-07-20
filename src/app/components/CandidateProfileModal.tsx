"use client";

import React from 'react';
import { useProfileModal } from '@/hooks/useProfileModal';
import type { CandidateProfileModalProps } from '@/types';
import EditCandidateModal from './EditCandidateModal';
import ProfileHeader from './profile-modal/ProfileHeader';
import PersonalInfoCard from './profile-modal/PersonalInfoCard';
import ApplicationDetailsCard from './profile-modal/ApplicationDetailsCard';
import DocumentsAndLinksCard from './profile-modal/DocumentsAndLinksCard';
import SystemDetailsCard from './profile-modal/SystemDetailsCard';
import ScoringCard from './profile-modal/ScoringCard';
import InterviewCard from './profile-modal/InterviewCard';
import ActionsCard from './profile-modal/ActionsCard';

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
                <div className="bg-gray-50 rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
                    <ProfileHeader
                        candidate={candidate}
                        onClose={onClose}
                        onEdit={() => setIsEditModalOpen(true)}
                        isUpdating={isUpdating}
                        statusUpdateLoading={statusUpdateLoading}
                    />

                    <div className="p-5 overflow-y-auto flex-grow">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <PersonalInfoCard candidate={candidate} age={age} />
                                <ApplicationDetailsCard candidate={candidate} />
                                <DocumentsAndLinksCard candidate={candidate} />
                                <SystemDetailsCard candidate={candidate} />
                            </div>

                            <div className="space-y-6">
                                <ScoringCard candidate={candidate} />
                                <InterviewCard
                                    candidate={candidate}
                                    onScheduleInterview={onScheduleInterview}
                                    onCancelInterview={onCancelInterview}
                                    statusUpdateLoading={statusUpdateLoading}
                                />
                                <ActionsCard
                                    candidate={candidate}
                                    onStatusChange={onStatusChange}
                                    onScheduleInterview={onScheduleInterview}
                                    statusUpdateLoading={statusUpdateLoading}
                                />
                            </div>
                        </div>
                    </div>
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

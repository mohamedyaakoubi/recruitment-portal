"use client";

import React from 'react';
import Tabs from '../ui/Tabs';
import CandidateTable from '../CandidateTable';
import type { Candidate } from '@/types';

interface CandidateManagementProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    filteredCandidates: Candidate[];
    statusUpdateLoading: Record<string, boolean>;
    openProfileModal: (candidate: Candidate) => void;
    openScoringModal: (candidate: Candidate) => void;
    handleStatusChange: (candidateId: string, newStatus: string) => void;
    filters: {
        status: string;
        name: string;
        city: string;
        country: string;
        nationality: string;
        jobTitle: string;
        category: string;
        specialty: string;
        ageMin: string;
        ageMax: string;
    };
}

const CandidateManagement: React.FC<CandidateManagementProps> = ({
    activeTab,
    setActiveTab,
    filteredCandidates,
    statusUpdateLoading,
    openProfileModal,
    openScoringModal,
    handleStatusChange,
    filters,
}) => {
    return (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Candidate List</h2>
            <Tabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={[
                    { label: 'Main', value: 'main' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                ]}
            >
                <CandidateTable
                    candidates={filteredCandidates}
                    statusUpdateLoading={statusUpdateLoading}
                    onViewCandidate={openProfileModal}
                    onScoreCandidate={openScoringModal}
                    onStatusChange={handleStatusChange}
                    filters={filters}
                />
            </Tabs>
        </div>
    );
};

export default CandidateManagement;

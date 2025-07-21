"use client";

import React from 'react';
import Tabs from '../ui/Tabs';
import CandidateTable from '../CandidateTable';
import type { Candidate } from '@/types';
import ExportButtons from '../candidate-table/ExportButtons';
import { useCandidateTable } from '@/hooks/useCandidateTable';


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
    const { isExporting, handleExport } = useCandidateTable(filteredCandidates, filters);

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Candidate List</h2>
                <ExportButtons isExporting={isExporting} handleExport={handleExport} />
            </div>
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

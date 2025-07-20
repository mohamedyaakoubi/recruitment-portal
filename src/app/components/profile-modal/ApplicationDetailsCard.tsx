"use client";

import React from 'react';
import { FiBriefcase, FiTarget } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { InfoCard, InfoRow } from './InfoCard';
import StatusBadge from '../ui/StatusBadge';

interface ApplicationDetailsCardProps {
    candidate: Candidate;
}

const ApplicationDetailsCard: React.FC<ApplicationDetailsCardProps> = ({ candidate }) => {
    return (
        <InfoCard title="Application Details" icon={<FiBriefcase size={20} />}>
            <div className="flex items-center">
                <span className="font-medium text-gray-900 w-32">Status:</span>
                <StatusBadge status={candidate.status} />
            </div>
            <InfoRow label="Category" value={candidate.jobCategory} />
            <InfoRow label="Specialty" value={candidate.specialty} icon={<FiTarget size={14} />} />
            <InfoRow label="Job ID" value={candidate.jobTitle} />
            <InfoRow label="Submitted" value={candidate.submittedAt?.toDate().toLocaleString()} />
            <InfoRow label="Application ID" value={candidate.id} />
        </InfoCard>
    );
};

export default ApplicationDetailsCard;

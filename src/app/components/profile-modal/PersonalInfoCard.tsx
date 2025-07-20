"use client";

import React from 'react';
import { FiUser, FiUsers, FiMail, FiPhone, FiMapPin, FiGlobe, FiCalendar } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { InfoCard, InfoRow } from './InfoCard';

interface PersonalInfoCardProps {
    candidate: Candidate;
    age: number | null;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ candidate, age }) => {
    return (
        <InfoCard title="Personal Information" icon={<FiUser size={20} />}>
            <InfoRow label="First Name" value={candidate.firstName} />
            <InfoRow label="Last Name" value={candidate.lastName} />
            <InfoRow label="Gender" value={candidate.gender} icon={<FiUsers size={14} />} />
            <InfoRow label="Email" value={candidate.email} icon={<FiMail size={14} />} />
            <InfoRow label="Phone" value={candidate.phoneNumber ? `${candidate.countryCode || ''} ${candidate.phoneNumber}` : null} icon={<FiPhone size={14} />} />
            <InfoRow label="Location" value={candidate.city && candidate.country ? `${candidate.city}, ${candidate.country}` : null} icon={<FiMapPin size={14} />} />
            <InfoRow label="Nationality" value={candidate.nationality} icon={<FiGlobe size={14} />} />
            {candidate.doubleNationality && <InfoRow label="2nd Nationality" value={candidate.doubleNationality} icon={<FiGlobe size={14} />} />}
            <InfoRow label="Date of Birth" value={candidate.dateOfBirth ? `${candidate.dateOfBirth} (${age} years)` : null} icon={<FiCalendar size={14} />} />
        </InfoCard>
    );
};

export default PersonalInfoCard;

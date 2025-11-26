'use client';

import React from 'react';
import { FiCode, FiKey } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { InfoCard, InfoRow } from './InfoCard';

interface SystemDetailsCardProps {
  candidate: Candidate;
}

const SystemDetailsCard: React.FC<SystemDetailsCardProps> = ({ candidate }) => {
  return (
    <InfoCard title="System Details" icon={<FiCode size={20} />}>
      <InfoRow
        label="Calendar Event ID"
        value={candidate.calendarEventId}
        icon={<FiKey size={14} />}
      />
      <InfoRow label="Meet Space ID" value={candidate.meetSpaceId} icon={<FiKey size={14} />} />
    </InfoCard>
  );
};

export default SystemDetailsCard;

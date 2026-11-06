'use client';

import React from 'react';
import type { Candidate } from '@/types';
import PersonalInfoCard from './PersonalInfoCard';
import ApplicationDetailsCard from './ApplicationDetailsCard';
import DocumentsAndLinksCard from './DocumentsAndLinksCard';
import SystemDetailsCard from './SystemDetailsCard';
import ScoringCard from './ScoringCard';
import InterviewCard from './InterviewCard';
import ActionsCard from './ActionsCard';

interface ProfileModalContentProps {
  candidate: Candidate;
  age: number | null;
  onStatusChange: (
    candidateId: string,
    newStatus: string,
    interviewTimestampISO?: string
  ) => Promise<void>;
  onCancelInterview: (candidateId: string, reason?: string) => Promise<void>;
  statusUpdateLoading: boolean;
  onScheduleInterview: () => void;
}

const ProfileModalContent: React.FC<ProfileModalContentProps> = ({
  candidate,
  age,
  onStatusChange,
  onCancelInterview,
  statusUpdateLoading,
  onScheduleInterview,
}) => {
  return (
    <div className="flex-grow overflow-y-auto p-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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
  );
};

export default ProfileModalContent;

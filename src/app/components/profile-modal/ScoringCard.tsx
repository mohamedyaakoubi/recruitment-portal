"use client";

import React from 'react';
import { FiAward } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { InfoCard } from './InfoCard';

interface ScoringCardProps {
    candidate: Candidate;
}

const ScoringCard: React.FC<ScoringCardProps> = ({ candidate }) => {
    if (candidate.score === null || candidate.score === undefined) {
        return null;
    }

    return (
        <InfoCard title="AI Scoring Analysis" icon={<FiAward size={20} />}>
            <div className="flex items-center space-x-3">
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-gray-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-green-500" strokeWidth="3" fill="none" strokeDasharray={`${candidate.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{candidate.score}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.scoreAnalysis || 'No analysis provided.'}</p>
                    {candidate.lastScoredAt && <p className="text-xs text-gray-400 mt-2">Scored on: {candidate.lastScoredAt.toDate().toLocaleDateString()}</p>}
                </div>
            </div>
        </InfoCard>
    );
};

export default ScoringCard;

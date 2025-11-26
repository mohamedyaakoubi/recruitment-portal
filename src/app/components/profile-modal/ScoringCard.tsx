'use client';

import React from 'react';
import { FiAward, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { InfoCard } from './InfoCard';

interface ScoringCardProps {
  candidate: Candidate;
}

const ScoringCard: React.FC<ScoringCardProps> = ({ candidate }) => {
  if (candidate.score === null || candidate.score === undefined) {
    return null;
  }

  // Get recommendation color and icon
  const getRecommendationDisplay = (recommendation?: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return {
          color: 'text-green-600 bg-green-100',
          icon: <FiCheckCircle className="h-4 w-4" />,
          text: 'Highly Recommended',
        };
      case 'recommended':
        return {
          color: 'text-blue-600 bg-blue-100',
          icon: <FiTrendingUp className="h-4 w-4" />,
          text: 'Recommended',
        };
      case 'conditional':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          icon: <FiAlertTriangle className="h-4 w-4" />,
          text: 'Conditional',
        };
      case 'not_recommended':
        return {
          color: 'text-red-600 bg-red-100',
          icon: <FiXCircle className="h-4 w-4" />,
          text: 'Not Recommended',
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          icon: <FiAward className="h-4 w-4" />,
          text: 'Evaluated',
        };
    }
  };

  const recommendationDisplay = getRecommendationDisplay(candidate.aiRecommendation);

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scoreColor = getScoreColor(candidate.score);

  return (
    <InfoCard title="🤖 AI Analysis (Gemini 2.5 Pro)" icon={<FiAward size={20} />}>
      <div className="space-y-4">
        {/* Score and Recommendation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-16 w-16">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={scoreColor}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${candidate.score}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${scoreColor}`}>{candidate.score}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">AI Score</p>
              {candidate.aiRecommendation && (
                <div
                  className={`inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium ${recommendationDisplay.color} dark:bg-opacity-20`}
                >
                  {recommendationDisplay.icon}
                  <span>{recommendationDisplay.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis */}
        {candidate.scoreAnalysis && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              📋 Analysis
            </h4>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {candidate.scoreAnalysis}
            </p>
          </div>
        )}

        {/* Key Strengths */}
        {candidate.keyStrengths && candidate.keyStrengths.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
              <span className="mr-1 text-green-600">✅</span> Key Strengths
            </h4>
            <ul className="space-y-1">
              {candidate.keyStrengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="mr-2 mt-1 text-green-500">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {candidate.areasForImprovement && candidate.areasForImprovement.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
              <span className="mr-1 text-yellow-600">⚠️</span> Development Areas
            </h4>
            <ul className="space-y-1">
              {candidate.areasForImprovement.map((area, index) => (
                <li
                  key={index}
                  className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="mr-2 mt-1 text-yellow-500">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {candidate.lastScoredAt &&
                `Analyzed: ${candidate.lastScoredAt.toDate().toLocaleDateString()}`}
            </span>
            {candidate.scoringVersion && (
              <span className="rounded bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                {candidate.scoringVersion}
              </span>
            )}
          </div>
        </div>
      </div>
    </InfoCard>
  );
};

export default ScoringCard;

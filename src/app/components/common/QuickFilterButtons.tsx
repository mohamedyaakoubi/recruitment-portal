'use client';

import React from 'react';
import type { Candidate } from '@/types';

interface QuickFilterButtonsProps {
  label: string;
  options: string[];
  filterValue: string;
  onFilterChange: (value: string) => void;
  candidates: Candidate[];
  filterKey: keyof Candidate;
  colorClass: string;
  sliceLimit?: number;
}

const QuickFilterButtons: React.FC<QuickFilterButtonsProps> = ({
  label,
  options,
  filterValue,
  onFilterChange,
  candidates,
  filterKey,
  colorClass,
  sliceLimit,
}) => {
  const displayOptions = sliceLimit ? options.slice(0, sliceLimit) : options;

  // 🔥 FIXED: Define static color combinations to ensure Tailwind includes them
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        selected: 'bg-blue-600 text-white border-blue-600',
        unselected:
          'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      },
      green: {
        selected: 'bg-green-600 text-white border-green-600',
        unselected:
          'bg-white dark:bg-gray-700 text-green-600 dark:text-green-300 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
      },
      purple: {
        selected: 'bg-purple-600 text-white border-purple-600',
        unselected:
          'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
      },
      orange: {
        selected: 'bg-orange-600 text-white border-orange-600',
        unselected:
          'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-300 border-orange-300 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20',
      },
      red: {
        selected: 'bg-red-600 text-white border-red-600',
        unselected:
          'bg-white dark:bg-gray-700 text-red-600 dark:text-red-300 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
      },
      indigo: {
        selected: 'bg-indigo-600 text-white border-indigo-600',
        unselected:
          'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
      },
      pink: {
        selected: 'bg-pink-600 text-white border-pink-600',
        unselected:
          'bg-white dark:bg-gray-700 text-pink-600 dark:text-pink-300 border-pink-300 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20',
      },
      teal: {
        selected: 'bg-teal-600 text-white border-teal-600',
        unselected:
          'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-300 border-teal-300 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20',
      },
      cyan: {
        selected: 'bg-cyan-600 text-white border-cyan-600',
        unselected:
          'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-300 border-cyan-300 dark:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
      },
      slate: {
        selected: 'bg-slate-600 text-white border-slate-600',
        unselected:
          'bg-white dark:bg-gray-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/20',
      },
    };

    // Fallback to blue if color not found
    const colorConfig = colorMap[color as keyof typeof colorMap] || colorMap.blue;
    return isSelected ? colorConfig.selected : colorConfig.unselected;
  };

  return (
    <div className="mb-4">
      <span className="mr-3 text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</span>
      <div className="mt-1 inline-flex flex-wrap gap-2">
        {displayOptions.map((option) => {
          const count = candidates.filter((c) => c[filterKey] === option).length;
          const isSelected = filterValue === option;

          return (
            <button
              key={option}
              onClick={() => {
                if (isSelected) {
                  onFilterChange(''); // Deselect if already selected
                } else {
                  onFilterChange(option);
                }
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${getColorClasses(colorClass, isSelected)}`}
              title={`Filter by ${option} (${count} ${count === 1 ? 'candidate' : 'candidates'})`}
            >
              {option} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickFilterButtons;

"use client";

import React from 'react';
import type { Candidate } from '@/types';

interface QuickFilterButtonsProps {
  label: string;
  options: string[];
  filterValue: string;
  onFilterChange: (value: string) => void;
  candidates: Candidate[];
  filterKey: keyof Candidate; // Key to filter candidates by (e.g., 'status', 'specialty')
  colorClass: string; // Tailwind CSS color class (e.g., 'blue', 'green')
  sliceLimit?: number; // Optional limit for the number of options to display
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

  return (
    <div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-3">{label}:</span>
      <div className="inline-flex flex-wrap gap-2">
        {displayOptions.map(option => (
          <button
            key={option}
            onClick={() => {
              if (filterValue === option) {
                onFilterChange(''); // Deselect if already selected
              } else {
                onFilterChange(option);
              }
            }}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filterValue === option 
                ? `bg-${colorClass}-600 text-white border-${colorClass}-600` 
                : `bg-white dark:bg-gray-700 text-${colorClass}-600 dark:text-${colorClass}-300 border-${colorClass}-300 dark:border-${colorClass}-600 hover:bg-${colorClass}-50 dark:hover:bg-${colorClass}-900/50`
            }`}
          >
            {option} ({candidates.filter(c => c[filterKey] === option).length})
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickFilterButtons;

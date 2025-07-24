"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Candidate } from '@/types';

interface SearchableFilterDropdownProps {
  label: string;
  placeholder: string;
  filterValue: string; // The currently applied filter value from parent state
  onFilterChange: (value: string) => void; // Handler to update parent filter state
  searchValue: string; // Local search input value
  onSearchChange: (value: string) => void; // Handler to update local search state
  options: string[]; // All unique options available
  candidates: Candidate[]; // All candidates for counting
  filterKey: keyof Candidate; // Key to filter candidates by (e.g., 'city', 'country')
  disabled?: boolean;
}

const SearchableFilterDropdown: React.FC<SearchableFilterDropdownProps> = ({
  label,
  placeholder,
  filterValue,
  onFilterChange,
  searchValue,
  onSearchChange,
  options,
  candidates,
  filterKey,
  disabled = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showList, setShowList] = useState(false);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => {
          onSearchChange(e.target.value);
          onFilterChange(''); // Clear parent filter when typing in search
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        autoComplete="off"
        disabled={disabled}
      />
      {showList && filteredOptions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onFilterChange(option);
                onSearchChange(option); // Update local search to match selected option
                setShowList(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none flex justify-between items-center text-gray-900 dark:text-gray-200"
            >
              <span>{option}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({candidates.filter(c => c[filterKey] === option).length})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableFilterDropdown;

"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Job } from '@/types';

interface SpecialtyDropdownProps {
  specialty: string;
  setSpecialty: (specialty: string) => void;
  specialtySearch: string;
  setSpecialtySearch: (search: string) => void;
  availableSpecialties: string[];
  isLoading: boolean;
  selectedJob: Job | null;
}

const SpecialtyDropdown: React.FC<SpecialtyDropdownProps> = ({
  specialty,
  setSpecialty,
  specialtySearch,
  setSpecialtySearch,
  availableSpecialties,
  isLoading,
  selectedJob,
}) => {
  const specialtyRef = useRef<HTMLDivElement>(null);
  const [showSpecialtyList, setShowSpecialtyList] = useState(false);

  const filteredSpecialties = availableSpecialties.filter(spec => 
    spec.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (specialtyRef.current && !specialtyRef.current.contains(event.target as Node)) {
        setShowSpecialtyList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="sm:col-span-2 relative" ref={specialtyRef}>
      <label htmlFor="specialtySearch" className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
        Specialty <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="specialtySearch"
        id="specialtySearch"
        required
        value={specialtySearch}
        onChange={(e) => {
          const value = e.target.value;
          setSpecialtySearch(value);
          if (availableSpecialties.includes(value)) {
            setSpecialty(value);
          } else {
            setSpecialty('');
          }
          setShowSpecialtyList(true);
        }}
        onFocus={() => setShowSpecialtyList(true)}
        className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] dark:bg-gray-700 dark:text-white"
        placeholder={selectedJob ? "Search and select your specialty" : "Please select a job position first"}
        disabled={isLoading || !selectedJob}
        autoComplete="off"
      />
      {showSpecialtyList && filteredSpecialties.length > 0 && selectedJob && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSpecialties.map((spec, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSpecialty(spec);
                setSpecialtySearch(spec);
                setShowSpecialtyList(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-gray-600 focus:bg-slate-100 dark:focus:bg-gray-600 focus:outline-none"
            >
              {spec}
            </button>
          ))}
        </div>
      )}
      {selectedJob && availableSpecialties.length > 0 && (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">Available Specialties:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {availableSpecialties.map((spec, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}
      {selectedJob && availableSpecialties.length === 0 && (
        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">No specialties defined for this job position. Please contact admin.</p>
        </div>
      )}
    </div>
  );
};

export default SpecialtyDropdown;

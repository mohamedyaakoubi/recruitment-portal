// src/app/components/candidate-form/JobApplicationSection.tsx
import React from 'react';
import { JOB_CATEGORIES } from '@/lib/job-categories';
import { JobApplicationSectionProps } from '@/types';
import SpecialtyDropdown from './SpecialtyDropdown';

const JobApplicationSection: React.FC<JobApplicationSectionProps> = ({
  selectedCategory,
  handleCategorySelection,
  jobTitle,
  handleJobSelection,
  filteredJobs,
  selectedJob,
  specialty,
  setSpecialty,
  specialtySearch,
  setSpecialtySearch,
  availableSpecialties,
  isLoading,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-gray-800/50 p-5 sm:p-6 rounded-lg">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-gray-700 pb-3">Job Application</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Job Category */}
        <div className="sm:col-span-2">
          <label htmlFor="jobCategory" className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Job Category <span className="text-red-500">*</span>
          </label>
          <select
            name="jobCategory"
            id="jobCategory"
            required
            value={selectedCategory}
            onChange={handleCategorySelection}
            className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          >
            <option value="">Select a category first</option>
            {JOB_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Job Title */}
        <div className="sm:col-span-2">
          <label htmlFor="jobTitle" className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Job Position <span className="text-red-500">*</span>
          </label>
          <select
            name="jobTitle"
            id="jobTitle"
            required
            value={jobTitle}
            onChange={handleJobSelection}
            className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] dark:bg-gray-700 dark:text-white"
            disabled={isLoading || !selectedCategory}
          >
            <option value="">
              {selectedCategory ? 'Select a job position' : 'Please select a category first'}
            </option>
            {filteredJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          {selectedJob && (
            <div className="mt-3 p-3 bg-slate-100 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-semibold text-[#003A70] dark:text-blue-400 mb-1">Job Description:</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">{selectedJob.description}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Category: {selectedJob.category}</p>
            </div>
          )}
        </div>

        {/* Specialty */}
        <SpecialtyDropdown
          specialty={specialty}
          setSpecialty={setSpecialty}
          specialtySearch={specialtySearch}
          setSpecialtySearch={setSpecialtySearch}
          availableSpecialties={availableSpecialties}
          isLoading={isLoading}
          selectedJob={selectedJob}
        />
      </div>
    </div>
  );
};

export default JobApplicationSection;

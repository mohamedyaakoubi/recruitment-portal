'use client';

import React from 'react';
import { FiBriefcase } from 'react-icons/fi';

interface JobInfoFormProps {
  formData: any;
  jobCategories: string[];
  filteredJobs: any[];
  availableSpecialties: string[];
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleJobChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isLoading: boolean;
  loadingJobs: boolean;
}

const JobInfoForm: React.FC<JobInfoFormProps> = ({
  formData,
  jobCategories,
  filteredJobs,
  availableSpecialties,
  handleCategoryChange,
  handleJobChange,
  handleInputChange,
  isLoading,
  loadingJobs,
}) => {
  return (
    <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
        <FiBriefcase className="mr-2" /> Job Information
      </h3>
      {loadingJobs && (
        <div className="py-4 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading jobs...</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="jobCategory"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Job Category
          </label>
          <select
            id="jobCategory"
            name="jobCategory"
            value={formData.jobCategory}
            onChange={handleCategoryChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            disabled={isLoading || loadingJobs}
          >
            <option value="">Select Category</option>
            {jobCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="jobTitle"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Job Position
          </label>
          <select
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleJobChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            disabled={isLoading || loadingJobs || !formData.jobCategory}
          >
            <option value="">
              {!formData.jobCategory ? 'Select category first' : 'Select job position'}
            </option>
            {filteredJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          {formData.jobCategory && filteredJobs.length === 0 && !loadingJobs && (
            <p className="mt-1 text-xs text-orange-600">
              No active jobs available in this category
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="specialty"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Specialty
          </label>
          <select
            id="specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            disabled={isLoading || !formData.jobTitle}
          >
            <option value="">
              {!formData.jobTitle ? 'Select job position first' : 'Select specialty'}
            </option>
            {availableSpecialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
          {formData.jobTitle && availableSpecialties.length === 0 && (
            <p className="mt-1 text-xs text-orange-600">No specialties available for this job</p>
          )}
        </div>
        {formData.jobTitleText && (
          <div className="md:col-span-2">
            <label
              htmlFor="jobTitleText"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Current Job Title
            </label>
            <input
              id="jobTitleText"
              name="jobTitleText"
              type="text"
              value={formData.jobTitleText}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              disabled
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This will be updated automatically when you select a job position
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobInfoForm;

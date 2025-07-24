"use client";

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
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <FiBriefcase className="mr-2" /> Job Information
            </h3>
            {loadingJobs && (
                <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600 dark:text-gray-400">Loading jobs...</span>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="jobCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Job Category
                    </label>
                    <select
                        id="jobCategory"
                        name="jobCategory"
                        value={formData.jobCategory}
                        onChange={handleCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
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
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Job Position
                    </label>
                    <select
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleJobChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        disabled={isLoading || loadingJobs || !formData.jobCategory}
                    >
                        <option value="">
                            {!formData.jobCategory
                                ? 'Select category first'
                                : 'Select job position'
                            }
                        </option>
                        {filteredJobs.map((job) => (
                            <option key={job.id} value={job.id}>
                                {job.title}
                            </option>
                        ))}
                    </select>
                    {formData.jobCategory && filteredJobs.length === 0 && !loadingJobs && (
                        <p className="text-xs text-orange-600 mt-1">
                            No active jobs available in this category
                        </p>
                    )}
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Specialty
                    </label>
                    <select
                        id="specialty"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        disabled={isLoading || !formData.jobTitle}
                    >
                        <option value="">
                            {!formData.jobTitle
                                ? 'Select job position first'
                                : 'Select specialty'
                            }
                        </option>
                        {availableSpecialties.map((specialty) => (
                            <option key={specialty} value={specialty}>
                                {specialty}
                            </option>
                        ))}
                    </select>
                    {formData.jobTitle && availableSpecialties.length === 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                            No specialties available for this job
                        </p>
                    )}
                </div>
                {formData.jobTitleText && (
                    <div className="md:col-span-2">
                        <label htmlFor="jobTitleText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Current Job Title
                        </label>
                        <input
                            id="jobTitleText"
                            name="jobTitleText"
                            type="text"
                            value={formData.jobTitleText}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            disabled
                            readOnly
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This will be updated automatically when you select a job position
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobInfoForm;

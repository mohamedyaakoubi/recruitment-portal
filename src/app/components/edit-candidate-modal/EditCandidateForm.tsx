'use client';

import React from 'react';
import type { Candidate } from '@/types';
import PersonalInfoForm from './PersonalInfoForm';
import LocationInfoForm from './LocationInfoForm';
import JobInfoForm from './JobInfoForm';

interface EditCandidateFormProps {
  formData: Partial<Candidate>;
  errors: Record<string, string>;
  jobCategories: any[];
  loadingJobs: boolean;
  availableSpecialties: string[];
  filteredJobs: any[];
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleJobChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const EditCandidateForm: React.FC<EditCandidateFormProps> = ({
  formData,
  errors,
  jobCategories,
  loadingJobs,
  availableSpecialties,
  filteredJobs,
  handleInputChange,
  handleCategoryChange,
  handleJobChange,
  handleSubmit,
  isLoading,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoForm
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
      />
      <LocationInfoForm
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
      />
      <JobInfoForm
        formData={formData}
        jobCategories={jobCategories}
        filteredJobs={filteredJobs}
        availableSpecialties={availableSpecialties}
        handleCategoryChange={handleCategoryChange}
        handleJobChange={handleJobChange}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        loadingJobs={loadingJobs}
      />
    </form>
  );
};

export default EditCandidateForm;

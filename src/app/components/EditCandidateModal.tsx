"use client";

import React from 'react';
import { useEditCandidateForm } from '@/hooks/useEditCandidateForm';
import type { Candidate } from '@/types';
import EditModalHeader from './edit-candidate-modal/EditModalHeader';
import EditModalFooter from './edit-candidate-modal/EditModalFooter';
import PersonalInfoForm from './edit-candidate-modal/PersonalInfoForm';
import LocationInfoForm from './edit-candidate-modal/LocationInfoForm';
import JobInfoForm from './edit-candidate-modal/JobInfoForm';

interface EditCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onSave: (candidateId: string, updatedData: Partial<Candidate>) => Promise<void>;
  isLoading: boolean;
}

const EditCandidateModal: React.FC<EditCandidateModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSave,
  isLoading
}) => {
  const {
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
  } = useEditCandidateForm(candidate, isOpen, onSave, onClose);

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        <EditModalHeader onClose={onClose} isLoading={isLoading} />
        <div className="p-6 overflow-y-auto flex-grow">
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
        </div>
        <EditModalFooter
          onClose={onClose}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          loadingJobs={loadingJobs}
        />
      </div>
    </div>
  );
};

export default EditCandidateModal;
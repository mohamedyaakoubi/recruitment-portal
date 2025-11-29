'use client';

import React from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useEditCandidateForm } from '@/hooks/useEditCandidateForm';
import type { Candidate } from '@/types';
import EditModalHeader from './edit-candidate-modal/EditModalHeader';
import EditModalFooter from './edit-candidate-modal/EditModalFooter';
import EditCandidateForm from './edit-candidate-modal/EditCandidateForm';

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
  isLoading,
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
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen || !candidate) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div
        ref={modalRef}
        className="flex max-h-[95vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800"
      >
        <EditModalHeader onClose={onClose} isLoading={isLoading} />
        <div className="flex-grow overflow-y-auto p-6">
          <EditCandidateForm
            formData={formData}
            errors={errors}
            jobCategories={jobCategories}
            loadingJobs={loadingJobs}
            availableSpecialties={availableSpecialties}
            filteredJobs={filteredJobs}
            handleInputChange={handleInputChange}
            handleCategoryChange={handleCategoryChange}
            handleJobChange={handleJobChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
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

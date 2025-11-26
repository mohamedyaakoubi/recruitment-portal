// src/app/components/candidate-form/FileUploadSection.tsx
import React from 'react';
import { FileUploadSectionProps } from '@/types';
import FileInput from '../ui/FileInput';

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  handleFileChange,
  isLoading,
  isExistingCandidate,
}) => (
  <div className="rounded-lg bg-slate-50 p-5 dark:bg-gray-800/50 sm:p-6">
    <h2 className="mb-6 border-b border-slate-200 pb-3 text-xl font-bold text-slate-800 dark:border-gray-700 dark:text-slate-200">
      Required Documents
      {isExistingCandidate && (
        <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
          (Please upload fresh copies of your documents)
        </span>
      )}
    </h2>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <FileInput
        name="cv"
        label="CV/Resume"
        required
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        disabled={isLoading}
        helpText="Accepted formats: PDF, DOC, DOCX"
      />
      <FileInput
        name="passport"
        label="Passport/ID"
        required
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        disabled={isLoading}
        helpText="Accepted formats: PDF, JPG, PNG"
      />
      <div className="sm:col-span-2">
        <FileInput
          name="photo"
          label="Professional Photo"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={isLoading}
          helpText="Accepted formats: JPG, PNG (Optional)"
        />
      </div>
    </div>
  </div>
);

export default FileUploadSection;

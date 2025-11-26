'use client';

import React from 'react';
import { FiSave } from 'react-icons/fi';

interface EditModalFooterProps {
  onClose: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  loadingJobs: boolean;
}

const EditModalFooter: React.FC<EditModalFooterProps> = ({
  onClose,
  handleSubmit,
  isLoading,
  loadingJobs,
}) => {
  return (
    <div className="flex flex-shrink-0 justify-end space-x-3 border-t border-gray-200 p-6 dark:border-gray-700">
      <button
        type="button"
        onClick={onClose}
        className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        disabled={isLoading}
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={isLoading || loadingJobs}
        className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Saving...
          </>
        ) : (
          <>
            <FiSave className="mr-2" />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
};

export default EditModalFooter;

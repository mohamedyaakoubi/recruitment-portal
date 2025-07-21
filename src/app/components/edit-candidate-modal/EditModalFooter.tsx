"use client";

import React from 'react';
import { FiSave } from 'react-icons/fi';

interface EditModalFooterProps {
    onClose: () => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
    loadingJobs: boolean;
}

const EditModalFooter: React.FC<EditModalFooterProps> = ({ onClose, handleSubmit, isLoading, loadingJobs }) => {
    return (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isLoading || loadingJobs}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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

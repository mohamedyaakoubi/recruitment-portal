"use client";

import React from 'react';
import { FiX, FiUser } from 'react-icons/fi';

interface EditModalHeaderProps {
    onClose: () => void;
    isLoading: boolean;
}

const EditModalHeader: React.FC<EditModalHeaderProps> = ({ onClose, isLoading }) => {
    return (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center">
                <FiUser className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Edit Candidate Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update candidate details</p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full p-2"
                disabled={isLoading}
            >
                <FiX size={24} />
            </button>
        </div>
    );
};

export default EditModalHeader;

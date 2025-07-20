"use client";

import React from 'react';
import { FiX, FiUser, FiEdit } from 'react-icons/fi';
import type { Candidate } from '@/types';

interface ProfileHeaderProps {
    candidate: Candidate;
    onClose: () => void;
    onEdit: () => void;
    isUpdating: boolean;
    statusUpdateLoading: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ candidate, onClose, onEdit, isUpdating, statusUpdateLoading }) => {
    return (
        <div className="p-5 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center">
                {candidate.photoUrl ? (
                    <img src={candidate.photoUrl} alt={candidate.fullName} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4"><FiUser size={24} className="text-gray-500" /></div>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h2>
                    <p className="text-sm text-gray-500">{candidate.jobTitleText}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onEdit}
                    className="flex items-center px-3 py-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                    disabled={statusUpdateLoading || isUpdating}
                >
                    <FiEdit className="mr-2" size={16} />
                    Edit
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2">
                    <FiX size={24} />
                </button>
            </div>
        </div>
    );
};

export default ProfileHeader;

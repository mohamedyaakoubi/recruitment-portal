'use client';

import React from 'react';
import Image from 'next/image';
import { FiX, FiUser, FiEdit } from 'react-icons/fi';
import type { Candidate } from '@/types';

interface ProfileHeaderProps {
  candidate: Candidate;
  onClose: () => void;
  onEdit: () => void;
  isUpdating: boolean;
  statusUpdateLoading: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  candidate,
  onClose,
  onEdit,
  isUpdating,
  statusUpdateLoading,
}) => {
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
      <div className="flex items-center">
        {candidate.photoUrl ? (
          <Image
            src={candidate.photoUrl}
            alt={candidate.fullName}
            className="mr-4 h-12 w-12 rounded-full border-2 border-white object-cover shadow dark:border-gray-700"
            width={48}
            height={48}
          />
        ) : (
          <div
            className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
            data-testid="icon"
          >
            <FiUser size={24} className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
            {candidate.fullName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.jobTitleText}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onEdit}
          className="flex items-center rounded-md bg-blue-100 px-3 py-2 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80"
          disabled={statusUpdateLoading || isUpdating}
        >
          <FiEdit className="mr-2" size={16} />
          Edit
        </button>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;

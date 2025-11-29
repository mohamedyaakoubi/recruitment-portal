// src/app/components/ui/StatusBadge.tsx
/* eslint-disable react/prop-types */
import React from 'react';
import { StatusBadgeProps } from '@/types';

const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-500/30';
      case 'interview_scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-500/30';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-500/30';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-500/30';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Application Submitted';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusStyle(status)}`}
    >
      {getStatusText(status)}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;

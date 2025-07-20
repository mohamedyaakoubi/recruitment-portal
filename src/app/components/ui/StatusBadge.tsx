// src/app/components/ui/StatusBadge.tsx
import React from 'react';
import { StatusBadgeProps } from '@/types';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview_scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;

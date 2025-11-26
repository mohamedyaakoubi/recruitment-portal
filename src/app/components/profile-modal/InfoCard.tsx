'use client';

import React from 'react';

export const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center border-b border-gray-200 p-4 dark:border-gray-700">
      <div className="mr-3 text-gray-500 dark:text-gray-400">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    </div>
    <div className="space-y-3 p-4 text-sm text-gray-600 dark:text-gray-300">{children}</div>
  </div>
);

export const InfoRow: React.FC<{
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => {
  if (!value && value !== null) return null;
  return (
    <div className="flex items-start">
      {icon && <div className="mr-2 mt-0.5 text-gray-400 dark:text-gray-500">{icon}</div>}
      <span className="w-32 flex-shrink-0 font-medium text-gray-900 dark:text-gray-200">
        {label}:
      </span>
      <span className="flex-1 break-words">{value ?? 'N/A'}</span>
    </div>
  );
};

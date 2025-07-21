"use client";

import React from 'react';

export const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <div className="text-gray-500 dark:text-gray-400 mr-3">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        </div>
        <div className="p-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">{children}</div>
    </div>
);

export const InfoRow: React.FC<{ label: string; value?: string | null; icon?: React.ReactNode }> = ({ label, value, icon }) => {
    if (!value && value !== null) return null;
    return (
        <div className="flex items-start">
            {icon && <div className="text-gray-400 dark:text-gray-500 mt-0.5 mr-2">{icon}</div>}
            <span className="font-medium text-gray-900 dark:text-gray-200 w-32 flex-shrink-0">{label}:</span>
            <span className="flex-1 break-words">{value ?? 'N/A'}</span>
        </div>
    );
};

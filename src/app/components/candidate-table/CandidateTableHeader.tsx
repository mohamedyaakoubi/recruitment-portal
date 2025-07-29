"use client";

import React from 'react';
import type { SortDirection, SortField } from '@/types';

interface CandidateTableHeaderProps {
    sortField: SortField;
    sortDirection: SortDirection;
    handleSort: (field: SortField) => void;
}

const SortableHeader: React.FC<{
    field: SortField;
    label: string;
    sortField: SortField;
    sortDirection: SortDirection;
    handleSort: (field: SortField) => void;
}> = ({ field, label, sortField, sortDirection, handleSort }) => {
    const isSorted = sortField === field;
    
    const getSortIcon = () => {
        if (!isSorted) {
            return (
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-gray-400 dark:group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
            );
        }
        return sortDirection === 'asc' ? (
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            <button
                onClick={() => handleSort(field)}
                className="group flex items-center space-x-2"
            >
                <span>{label}</span>
                {getSortIcon()}
            </button>
        </th>
    );
};

const CandidateTableHeader: React.FC<CandidateTableHeaderProps> = ({
    sortField,
    sortDirection,
    handleSort,
}) => {
    const headers: { field: SortField; label: string }[] = [
        { field: 'firstName', label: 'Name' },
        { field: 'email', label: 'Email' },
        { field: 'age', label: 'Age' },
        { field: 'city', label: 'City' },
        { field: 'country', label: 'Country' },
        { field: 'submittedAt', label: 'Submitted' },
        { field: 'status', label: 'Status' },
        { field: 'score', label: 'AI Score' },
    ];

    return (
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
                {headers.map((header) => (
                    <SortableHeader
                        key={header.field}
                        field={header.field}
                        label={header.label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                    />
                ))}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Interview Link
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                </th>
            </tr>
        </thead>
    );
};

export default CandidateTableHeader;

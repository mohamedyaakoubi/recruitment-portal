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
    const getSortIcon = () => {
        if (sortField !== field) {
            return (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            );
        }
        return sortDirection === 'asc' ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
        ) : (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        );
    };

    return (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button
                onClick={() => handleSort(field)}
                className="flex items-center space-x-1 hover:text-gray-700"
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
        { field: 'firstName', label: 'First Name' },
        { field: 'lastName', label: 'Last Name' },
        { field: 'email', label: 'Email' },
        { field: 'age', label: 'Age' },
        { field: 'city', label: 'City' },
        { field: 'country', label: 'Country' },
        { field: 'submittedAt', label: 'Submitted' },
        { field: 'status', label: 'Status' },
        { field: 'score', label: 'AI Score' },
    ];

    return (
        <thead className="bg-gray-50">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                </th>
            </tr>
        </thead>
    );
};

export default CandidateTableHeader;

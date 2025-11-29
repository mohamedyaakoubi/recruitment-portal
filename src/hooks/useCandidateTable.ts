'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { calculateAge } from '@/lib/utils';
import type { Candidate, SortDirection, SortField } from '@/types';
import logger from '@/lib/logger';

interface Filters {
  [key: string]: string;
}

export const useCandidateTable = (candidates: Candidate[], filters: Filters) => {
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isExporting, setIsExporting] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'json') => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        format,
        ...filters,
      });

      const response = await fetch(`/api/export-candidates?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to export candidates');
      }

      if (format === 'xlsx') {
        const { data, filename, count } = await response.json();

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');

        const metadataSheet = XLSX.utils.json_to_sheet([
          {
            'Export Date': new Date().toLocaleString(),
            'Total Records': count,
            'Applied Filters':
              Object.entries(filters)
                .filter(([_, value]) => value && value !== 'all' && value !== '')
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ') || 'None',
          },
        ]);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Export Info');

        XLSX.writeFile(workbook, filename);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const contentDisposition = response.headers.get('content-disposition');
        let filename = `candidates_${format}_${new Date().toISOString().split('T')[0]}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      logger.error('Export failed', error, { format, filters });
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      let aValue: string | number | null;
      let bValue: string | number | null;

      switch (sortField) {
        case 'firstName':
          aValue = splitName(a.fullName).firstName.toLowerCase();
          bValue = splitName(b.fullName).firstName.toLowerCase();
          break;
        case 'lastName':
          aValue = splitName(a.fullName).lastName.toLowerCase();
          bValue = splitName(b.fullName).lastName.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'age':
          aValue = a.dateOfBirth ? (calculateAge(a.dateOfBirth) ?? 0) : 0;
          bValue = b.dateOfBirth ? (calculateAge(b.dateOfBirth) ?? 0) : 0;
          break;
        case 'city':
          aValue = (a.city || '').toLowerCase();
          bValue = (b.city || '').toLowerCase();
          break;
        case 'country':
          aValue = (a.country || '').toLowerCase();
          bValue = (b.country || '').toLowerCase();
          break;
        case 'submittedAt':
          aValue = a.submittedAt?.toMillis() || 0;
          bValue = b.submittedAt?.toMillis() || 0;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        default:
          return 0;
      }

      const aVal = aValue ?? 0;
      const bVal = bValue ?? 0;

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [candidates, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    isExporting,
    handleSort,
    handleExport,
    sortedCandidates,
    splitName,
    calculateAge,
  };
};

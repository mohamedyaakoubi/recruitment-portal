/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCandidateTable } from '../useCandidateTable';
import { Candidate } from '@/types';
import React from 'react';
import { vi } from 'vitest';
import { secureHeaders } from '@/lib/getCsrfToken';

vi.mock('@/lib/getCsrfToken', () => ({
  secureHeaders: vi.fn(async () => ({
    'Content-Type': 'application/json',
    'X-CSRF-Token': 'test-csrf-token',
    Authorization: 'Bearer test-token',
  })),
}));

// Mock browser APIs
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockAlert = vi.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock DOM methods for download functionality
const mockClick = vi.fn();
const mockRemove = vi.fn();

const mockCandidates: Candidate[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    dateOfBirth: '1990-01-01',
    city: 'New York',
    country: 'USA',
    submittedAt: { toMillis: () => 1000 },
    status: 'submitted',
    score: 85,
    scoreAnalysis: '',
    interviewDate: undefined,
    calendarEventId: '',
    meetLink: '',
    duration: 0,
    phone: '',
    availability: [],
    linkedin: '',
    github: '',
    resume: '',
    coverLetter: '',
    jobTitle: '',
    jobCategory: '',
    yearsOfExperience: 0,
    skills: [],
    referral: '',
    source: '',
    startDate: '',
    comments: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    dateOfBirth: '1992-05-15',
    city: 'London',
    country: 'UK',
    submittedAt: { toMillis: () => 2000 },
    status: 'interview_scheduled',
    score: 90,
    scoreAnalysis: '',
    interviewDate: undefined,
    calendarEventId: '',
    meetLink: '',
    duration: 0,
    phone: '',
    availability: [],
    linkedin: '',
    github: '',
    resume: '',
    coverLetter: '',
    jobTitle: '',
    jobCategory: '',
    yearsOfExperience: 0,
    skills: [],
    referral: '',
    source: '',
    startDate: '',
    comments: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    fullName: 'Bob Johnson',
    email: 'bob@example.com',
    dateOfBirth: '1985-10-10',
    city: 'Paris',
    country: 'France',
    submittedAt: { toMillis: () => 500 },
    status: 'rejected',
    score: 70,
    scoreAnalysis: '',
    interviewDate: undefined,
    calendarEventId: '',
    meetLink: '',
    duration: 0,
    phone: '',
    availability: [],
    linkedin: '',
    github: '',
    resume: '',
    coverLetter: '',
    jobTitle: '',
    jobCategory: '',
    yearsOfExperience: 0,
    skills: [],
    referral: '',
    source: '',
    startDate: '',
    comments: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('useCandidateTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('mock-blob-url');
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      headers: { get: vi.fn(() => 'application/json') },
      json: () => Promise.resolve({ data: [], filename: 'test.xlsx', count: 0 }),
      blob: () => Promise.resolve(new Blob()),
    });

    // Fix for spyOn recursion:
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockClick,
          remove: mockRemove,
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName, options);
    });

    // Spy on document.body.appendChild
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      return node;
    });

    // Spy on document.body.removeChild
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
      return node;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default sort values', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    expect(result.current.sortField).toBe('submittedAt');
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.isExporting).toBe(false);
  });

  it('should handle sorting correctly', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    act(() => {
      result.current.handleSort('fullName');
    });

    expect(result.current.sortField).toBe('fullName');
    expect(result.current.sortDirection).toBe('asc');

    // Sort same field again to reverse direction
    act(() => {
      result.current.handleSort('fullName');
    });

    expect(result.current.sortDirection).toBe('desc');
  });

  it('should sort candidates by firstName', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    act(() => {
      result.current.handleSort('firstName');
    });

    const sorted = result.current.sortedCandidates;
    // With ascending sort, Bob should come first alphabetically
    expect(sorted[0].fullName).toBe('Bob Johnson');
    expect(sorted[1].fullName).toBe('Jane Smith');
    expect(sorted[2].fullName).toBe('John Doe');
  });

  it('should sort candidates by submittedAt', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    // Default sort is by submittedAt desc
    const sorted = result.current.sortedCandidates;
    expect(sorted[0].id).toBe('2'); // highest timestamp (2000)
    expect(sorted[1].id).toBe('1'); // middle timestamp (1000)
    expect(sorted[2].id).toBe('3'); // lowest timestamp (500)
  });

  it('should sort candidates by status', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    act(() => {
      result.current.handleSort('status');
    });

    const sorted = result.current.sortedCandidates;
    // Alphabetical order: interview_scheduled, rejected, submitted
    expect(sorted[0].status).toBe('interview_scheduled');
    expect(sorted[1].status).toBe('rejected');
    expect(sorted[2].status).toBe('submitted');
  });

  it('should sort candidates by score', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    act(() => {
      result.current.handleSort('score');
    });

    const sorted = result.current.sortedCandidates;
    // Ascending order: 70, 85, 90
    expect(sorted[0].score).toBe(70);
    expect(sorted[1].score).toBe(85);
    expect(sorted[2].score).toBe(90);
  });

  it('should handle export functionality', async () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, { status: 'all' }));

    await act(async () => {
      await result.current.handleExport('xlsx');
    });

    expect(secureHeaders).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/export-candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'test-csrf-token',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ format: 'xlsx', status: 'all' }),
    });
  });

  it('should handle export with filters', async () => {
    const filters = { status: 'submitted', name: 'John' };
    const { result } = renderHook(() => useCandidateTable(mockCandidates, filters));

    await act(async () => {
      await result.current.handleExport('csv');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/export-candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'test-csrf-token',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ format: 'csv', status: 'submitted', name: 'John' }),
    });
  });

  it('should split names correctly', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    expect(result.current.splitName('John Doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result.current.splitName('Mary Jane Smith')).toEqual({
      firstName: 'Mary',
      lastName: 'Jane Smith',
    });

    expect(result.current.splitName('Madonna')).toEqual({
      firstName: 'Madonna',
      lastName: '',
    });
  });

  it('should calculate age correctly', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    // Use vi.setSystemTime for proper date mocking
    vi.setSystemTime(new Date('2024-01-01'));

    expect(result.current.calculateAge('1990-01-01')).toBe(34);
    expect(result.current.calculateAge('2000-06-15')).toBe(23);
    expect(result.current.calculateAge('')).toBeNull();
    expect(result.current.calculateAge('invalid-date')).toBeNull();

    // Restore real time
    vi.useRealTimers();
  });

  it('should handle export errors', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Method Not Allowed',
      headers: { get: vi.fn(() => '') },
      json: () => Promise.resolve({ details: 'Export failed' }),
    });

    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    await act(async () => {
      await result.current.handleExport('xlsx');
    });

    expect(result.current.isExporting).toBe(false);
    expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Method Not Allowed'));
  });

  it('should set isExporting state during export', async () => {
    let resolvePromise: (value: any) => void;
    const exportPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as vi.Mock).mockReturnValueOnce(exportPromise);

    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    // Start the export but don't await it yet
    act(() => {
      result.current.handleExport('xlsx');
    });

    // Should be exporting now
    expect(result.current.isExporting).toBe(true);

    // Resolve the fetch
    await act(async () => {
      resolvePromise!({
        ok: true,
        headers: { get: vi.fn(() => 'application/json') },
        json: () => Promise.resolve({ data: [], filename: 'test.xlsx', count: 0 }),
        blob: () => Promise.resolve(new Blob()),
      });
      await exportPromise;
    });

    // Should not be exporting anymore
    expect(result.current.isExporting).toBe(false);
  });

  it('should handle export with csv format', async () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: vi.fn((header: string) =>
          header.toLowerCase() === 'content-disposition'
            ? 'attachment; filename="candidates.csv"'
            : ''
        ),
      },
      blob: () => Promise.resolve(new Blob(['csv-data'], { type: 'text/csv' })),
      json: () => Promise.resolve({}),
    });

    await act(async () => {
      await result.current.handleExport('csv');
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });
});

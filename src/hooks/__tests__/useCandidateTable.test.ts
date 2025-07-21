import { renderHook, act } from '@testing-library/react';
import { useCandidateTable } from '../useCandidateTable';
import type { Candidate } from '@/types';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node,
}));

// Mock browser APIs
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockAlert = jest.fn();

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
global.fetch = jest.fn();

// Mock createElement and appendChild for download functionality
const mockClick = jest.fn();
const mockRemove = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
    remove: mockRemove,
  })),
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
});

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
    updatedAt: new Date() 
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
    updatedAt: new Date() 
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
    updatedAt: new Date() 
  },
];

describe('useCandidateTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('mock-blob-url');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], filename: 'test.xlsx', count: 0 }),
      blob: () => Promise.resolve(new Blob()),
    });
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

  it('should sort candidates by fullName', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));
    
    act(() => {
      result.current.handleSort('fullName');
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
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/export-candidates?format=xlsx&status=all')
    );
  });

  it('should handle export with filters', async () => {
    const filters = { status: 'submitted', name: 'John' };
    const { result } = renderHook(() => useCandidateTable(mockCandidates, filters));
    
    await act(async () => {
      await result.current.handleExport('csv');
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('format=csv&status=submitted&name=John')
    );
  });

  it('should split names correctly', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));
    
    expect(result.current.splitName('John Doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe'
    });
    
    expect(result.current.splitName('Mary Jane Smith')).toEqual({
      firstName: 'Mary',
      lastName: 'Jane Smith'
    });
    
    expect(result.current.splitName('Madonna')).toEqual({
      firstName: 'Madonna',
      lastName: ''
    });
  });

  it('should calculate age correctly', () => {
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));
    
    // Test with a fixed date
    const originalDate = Date;
    const mockDate = new Date('2024-01-01');
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.now = originalDate.now;
    global.Date.UTC = originalDate.UTC;
    global.Date.prototype = originalDate.prototype;
    
    expect(result.current.calculateAge('1990-01-01')).toBe(34);
    expect(result.current.calculateAge('2000-06-15')).toBe(23);
    expect(result.current.calculateAge('')).toBeNull();
    expect(result.current.calculateAge('invalid-date')).toBeNull();
    
    // Restore Date
    global.Date = originalDate;
  });

  it('should handle export errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ details: 'Export failed' }),
    });
    
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));
    
    await act(async () => {
      await result.current.handleExport('xlsx');
    });
    
    expect(result.current.isExporting).toBe(false);
    expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Export failed'));
  });

  it('should set isExporting state during export', async () => {
    let resolvePromise: (value: any) => void;
    const exportPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    (global.fetch as jest.Mock).mockReturnValueOnce(exportPromise);
    
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
        json: () => Promise.resolve({ data: [], filename: 'test.xlsx', count: 0 }),
        blob: () => Promise.resolve(new Blob()),
      });
      await exportPromise;
    });
    
    // Should not be exporting anymore
    expect(result.current.isExporting).toBe(false);
  });

  it('should handle createObjectURL errors', async () => {
    mockCreateObjectURL.mockImplementationOnce(() => {
      throw new Error('createObjectURL failed');
    });
    
    const { result } = renderHook(() => useCandidateTable(mockCandidates, {}));
    
    await act(async () => {
      await result.current.handleExport('xlsx');
    });
    
    expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('createObjectURL failed'));
  });
});
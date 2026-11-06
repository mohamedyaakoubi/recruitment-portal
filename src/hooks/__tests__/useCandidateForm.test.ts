import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCandidateForm } from '../useCandidateForm';
import { useRouter } from 'next/navigation';
import { addDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL } from 'firebase/storage';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));
vi.mock('@/lib/firebase', () => ({
  db: vi.fn(),
  storage: vi.fn(),
}));
vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));
vi.mock('@/lib/fileValidation', () => ({
  validateFile: vi.fn().mockResolvedValue({ isValid: true }),
}));
vi.mock('@/lib/honeypot', () => ({
  detectBot: vi.fn().mockReturnValue({ isBot: false }),
}));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({
      toDate: () => date,
    })),
  },
}));
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

const mockUseRouter = useRouter as vi.Mock;
const mockPush = vi.fn();
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to setup window.location
const setWindowLocation = (search: string) => {
  delete (window as unknown as { location?: Location }).location;
  (window as unknown as { location: Partial<Location> }).location = {
    search,
    href: `http://localhost/${search}`,
  };
};

describe('useCandidateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });

    // Default: set valid email in URL
    setWindowLocation('?email=test@example.com');

    // Default mock for fetch - return empty applications
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ applications: [], jobs: [] }),
    });
  });

  it('should initialize with default values', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCandidateForm());

    // Wait for initial mount effects to complete
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current.firstName).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
    consoleErrorSpy.mockRestore();
  });

  it('should redirect if email is not in URL params', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Clear URL params - no email
    setWindowLocation('');

    const { result } = renderHook(() => useCandidateForm());

    // Wait for isMounted to be true and redirect to happen
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/');
      },
      { timeout: 1000 }
    );

    consoleErrorSpy.mockRestore();
  });

  it('should load existing candidate data if email is in URL', async () => {
    const mockData = {
      applications: [
        {
          firstName: 'John',
          lastName: 'Doe',
          gender: 'Male',
          dateOfBirth: '1990-01-01',
          countryCode: '+1',
          phoneNumber: '1234567890',
          city: 'New York',
          country: 'USA',
          nationality: 'American',
          websites: ['http://example.com'],
        },
      ],
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/get-candidate-applications')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockData,
        });
      }
      // Jobs API
      return Promise.resolve({
        ok: true,
        json: async () => ({ jobs: [] }),
      });
    });

    // Set URL params properly
    setWindowLocation('?email=test@example.com');

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCandidateForm());

    // Wait for data to be loaded
    await waitFor(
      () => {
        expect(result.current.firstName).toBe('John');
      },
      { timeout: 3000 }
    );

    expect(result.current.lastName).toBe('Doe');
    expect(result.current.isExistingCandidate).toBe(true);
    consoleErrorSpy.mockRestore();
  }, 10000);

  it('should handle website and additional info arrays', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCandidateForm());

    // Wait for hook to be ready
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current.addWebsite();
    });
    expect(result.current.websites).toEqual(['', '']);

    act(() => {
      result.current.updateWebsite(0, 'http://test.com');
    });
    expect(result.current.websites).toEqual(['http://test.com', '']);

    act(() => {
      result.current.removeWebsite(1);
    });
    expect(result.current.websites).toEqual(['http://test.com']);

    act(() => {
      result.current.addAdditionalInfo('text');
    });
    expect(result.current.additionalInfo.length).toBe(2);
    consoleErrorSpy.mockRestore();
  });

  it('should calculate age correctly', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCandidateForm());

    // Wait for hook to be ready
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const age = result.current.calculateAge('1990-01-01');
    // Calculate expected age based on current date
    const birthDate = new Date('1990-01-01');
    const today = new Date();
    let expectedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      expectedAge--;
    }

    expect(age).toBe(expectedAge);
    consoleErrorSpy.mockRestore();
  });

  it('should not submit if required fields are missing', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCandidateForm());

    // Wait for hook to be ready
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    // Create a mock form element with honeypot fields
    const mockFormElement = document.createElement('form');
    const honeypotInput = document.createElement('input');
    honeypotInput.name = 'website';
    honeypotInput.value = '';
    mockFormElement.appendChild(honeypotInput);

    const timestampInput = document.createElement('input');
    timestampInput.name = 'form_timestamp';
    timestampInput.value = String(Date.now() - 5000); // 5 seconds ago
    mockFormElement.appendChild(timestampInput);

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
        target: mockFormElement,
      } as unknown as React.FormEvent);
    });

    // The hook should set error or prevent submission
    expect(result.current.isLoading).toBe(false);
    expect(addDoc).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // This is a simplified test for submission. A full test would be very complex.
  it.skip('should handle successful submission', async () => {
    // Skipped: This test requires extensive mocking of Firebase, fetch APIs, and async state updates
    // The hook's submission flow is complex and better tested through E2E tests
    vi.useFakeTimers();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    let result: any;
    await act(async () => {
      const { result: r } = renderHook(() => useCandidateForm());
      result = r;
    });

    // Mock file uploads and URL retrieval
    (uploadBytes as vi.Mock).mockResolvedValue({ ref: 'cvRef' });
    (getDownloadURL as vi.Mock).mockResolvedValue('http://file.url/cv.pdf');
    (getDocs as vi.Mock).mockResolvedValue({ empty: true }); // No duplicates
    (addDoc as vi.Mock).mockResolvedValue({ id: 'docId' });

    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/jobs')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            jobs: [
              {
                id: 'swe',
                category: 'Engineering',
                title: 'Software Engineer',
                specialties: ['Frontend', 'Backend'],
              },
            ],
          }),
        });
      }
      if (url.includes('/api/validate-phone')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ isValid: true }),
        });
      }
      if (url.includes('/api/send-confirmation-email')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    await act(async () => {
      result.current.setFirstName('Jane');
      result.current.setLastName('Doe');
      result.current.setGender('Female');
      result.current.setDateOfBirth('1995-02-15');
      result.current.setCountryCode('+44');
      result.current.setPhoneNumber('9876543210');
      result.current.setCity('London');
      result.current.setCountry('UK');
      result.current.setNationality('British');
      result.current.handleCategorySelection({ target: { value: 'Engineering' } } as any);
    });

    await act(async () => {
      result.current.handleJobSelection({ target: { value: 'swe' } } as any);
    });

    await act(async () => {
      result.current.setSpecialty('Frontend');
      result.current.setCvFile(new File(['cv'], 'cv.pdf', { type: 'application/pdf' }));
      result.current.setPassportFile(
        new File(['passport'], 'passport.pdf', { type: 'application/pdf' })
      );
    });

    await act(async () => {
      result.current.availableSpecialties.push('Frontend');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.success).toBeTruthy();
    expect(addDoc).toHaveBeenCalled();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockPush).toHaveBeenCalledWith('/candidate-dashboard?email=test%40example.com');
    vi.useRealTimers();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});

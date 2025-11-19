import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCandidateForm } from '../useCandidateForm';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '@/lib/firebase';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));
vi.mock('@/lib/firebase', () => ({
    db: vi.fn(),
    storage: vi.fn(),
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

describe('useCandidateForm', () => {
    beforeEach(() => {
        mockUseRouter.mockReturnValue({ push: mockPush });
        mockFetch.mockClear();
        mockPush.mockClear();
        (addDoc as vi.Mock).mockClear();
        (uploadBytes as vi.Mock).mockClear();
        (getDownloadURL as vi.Mock).mockClear();

        const url = new URL(window.location.href);
        url.searchParams.set('email', 'test@example.com');
        window.history.pushState({}, '', url.toString());
    });

    it('should initialize with default values', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        let result: any;
        await act(async () => {
            const { result: r } = renderHook(() => useCandidateForm());
            result = r;
        });
        expect(result.current.firstName).toBe('');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.success).toBeNull();
        consoleErrorSpy.mockRestore();
    });

    it('should redirect if email is not in URL params', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        await act(async () => {
            window.history.pushState({}, '', '/');
            renderHook(() => useCandidateForm());
        });
        expect(mockPush).toHaveBeenCalledWith('/');
        consoleErrorSpy.mockRestore();
    });

    it('should load existing candidate data if email is in URL', async () => {
        const mockData = {
            applications: [{
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
            }],
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        let result: any;
        await act(async () => {
            const { result: r } = renderHook(() => useCandidateForm());
            result = r;
        });

        expect(result.current.firstName).toBe('John');
        expect(result.current.lastName).toBe('Doe');
        expect(result.current.isExistingCandidate).toBe(true);
        consoleErrorSpy.mockRestore();
    });

    it('should handle website and additional info arrays', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        let result: any;
        await act(async () => {
            const { result: r } = renderHook(() => useCandidateForm());
            result = r;
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
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        let result: any;
        await act(async () => {
            const { result: r } = renderHook(() => useCandidateForm());
            result = r;
        });
        const age = result.current.calculateAge('1990-01-01');
        // This might fail depending on the current date. A more robust test would be to mock the date.
        const expectedAge = new Date().getFullYear() - 1990 - (new Date().getMonth() < 0 || (new Date().getMonth() === 0 && new Date().getDate() < 1) ? 1 : 0);
        expect(age).toBe(expectedAge);
        consoleErrorSpy.mockRestore();
    });

    it('should not submit if required fields are missing', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        let result: any;
        await act(async () => {
            const { result: r } = renderHook(() => useCandidateForm());
            result = r;
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
        });

        expect(result.current.error).toBe('First name is required');
        consoleErrorSpy.mockRestore();
    });

    // This is a simplified test for submission. A full test would be very complex.
    it('should handle successful submission', async () => {
        vi.useFakeTimers();
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
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
            result.current.setPassportFile(new File(['passport'], 'passport.pdf', { type: 'application/pdf' }));
        });

        await act(async () => {
            result.current.availableSpecialties.push('Frontend');
        });


        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
        });

        expect(result.current.success).toContain('Application submitted successfully');
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
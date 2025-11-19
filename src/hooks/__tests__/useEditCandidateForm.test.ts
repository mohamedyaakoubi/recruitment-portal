import { vi } from 'vitest';

import { renderHook, act } from '@testing-library/react';
import { useEditCandidateForm } from '../useEditCandidateForm';
import { Candidate, Job } from '@/types';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = fetch as vi.Mock;

const mockJobs: Job[] = [
    { id: 'job1', title: 'Frontend Dev', category: 'Engineering', specialties: ['React', 'Vue'], isActive: true, description: '', requirements: [], responsibilities: [], department: '', location: '' },
    { id: 'job2', title: 'Backend Dev', category: 'Engineering', specialties: ['Node', 'Python'], isActive: true, description: '', requirements: [], responsibilities: [], department: '', location: '' },
];

const mockCandidate: Candidate = {
    id: 'cand1',
    fullName: 'Test Candidate',
    email: 'test@test.com',
    // Add other required fields
    status: 'submitted',
    score: 0,
    scoreAnalysis: '',
    interviewDate: undefined,
    calendarEventId: '',
    meetLink: '',
    duration: 0,
    phone: '',
    availability: [],
    city: '',
    country: '',
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
};

describe('useEditCandidateForm', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    beforeEach(() => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ jobs: mockJobs, categories: ['Engineering', 'Design'] }),
        });
        onSave.mockClear();
        onClose.mockClear();
    });

    it('should not fetch jobs if not open', () => {
        renderHook(() => useEditCandidateForm(null, false, onSave, onClose));
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch jobs when it opens', async () => {
        const { rerender } = renderHook(({ isOpen }) => useEditCandidateForm(null, isOpen, onSave, onClose), {
            initialProps: { isOpen: false },
        });
        expect(mockFetch).not.toHaveBeenCalled();

        rerender({ isOpen: true });

        await act(async () => { }); // Wait for fetch
        expect(mockFetch).toHaveBeenCalledWith('/api/jobs?activeOnly=true');
    });

    it('should populate form with candidate data', async () => {
        const { result } = renderHook(() => useEditCandidateForm(mockCandidate, true, onSave, onClose));
        await act(async () => { });
        expect(result.current.formData.email).toBe(mockCandidate.email);
        expect(result.current.formData.firstName).toBe('Test');
    });

    it('should update form data on input change', async () => {
        const { result } = renderHook(() => useEditCandidateForm(mockCandidate, true, onSave, onClose));
        await act(async () => { });
        act(() => {
            result.current.handleInputChange({ target: { name: 'firstName', value: 'Updated' } } as any);
        });
        expect(result.current.formData.firstName).toBe('Updated');
    });

    it('should filter jobs on category change', async () => {
        const { result } = renderHook(() => useEditCandidateForm(mockCandidate, true, onSave, onClose));
        await act(async () => { }); // initial fetch

        act(() => {
            result.current.handleCategoryChange({ target: { value: 'Engineering' } } as any);
        });

        expect(result.current.filteredJobs.length).toBe(2);
    });

    it('should update specialties on job change', async () => {
        const { result } = renderHook(() => useEditCandidateForm(mockCandidate, true, onSave, onClose));
        await act(async () => { });

        act(() => {
            result.current.handleCategoryChange({ target: { value: 'Engineering' } } as any);
        });
        act(() => {
            result.current.handleJobChange({ target: { value: 'job1' } } as any);
        });

        expect(result.current.availableSpecialties).toEqual(['React', 'Vue']);
    });

    it('should validate the form and show errors', async () => {
        const emptyCandidate = { ...mockCandidate, fullName: '', email: '' };
        const { result } = renderHook(() => useEditCandidateForm(emptyCandidate, true, onSave, onClose));
        await act(async () => { });

        let isValid = false;
        await act(async () => {
            const form = await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
        });

        // This hook doesn't return validation status from handleSubmit directly
        // We check the errors state instead.
        expect(result.current.errors.firstName).toBe('First name is required');
        expect(result.current.errors.email).toBe('Please enter a valid email address');
        expect(onSave).not.toHaveBeenCalled();
    });

    it('should call onSave with updated data on successful submission', async () => {
        const { result } = renderHook(() => useEditCandidateForm(mockCandidate, true, onSave, onClose));
        await act(async () => { });

        act(() => {
            result.current.handleInputChange({ target: { name: 'firstName', value: 'Valid' } } as any);
            result.current.handleInputChange({ target: { name: 'lastName', value: 'User' } } as any);
            result.current.handleInputChange({ target: { name: 'email', value: 'valid@email.com' } } as any);
            result.current.handleInputChange({ target: { name: 'gender', value: 'Female' } } as any);
            result.current.handleInputChange({ target: { name: 'phoneNumber', value: '12345' } } as any);
            result.current.handleInputChange({ target: { name: 'dateOfBirth', value: '1990-01-01' } } as any);
            result.current.handleInputChange({ target: { name: 'city', value: 'Test City' } } as any);
            result.current.handleInputChange({ target: { name: 'country', value: 'Test Country' } } as any);
            result.current.handleInputChange({ target: { name: 'nationality', value: 'Testizen' } } as any);
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
        });

        expect(onSave).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});

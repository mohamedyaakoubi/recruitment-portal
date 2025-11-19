import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateFormUI from '../candidate-form/containers/CandidateFormUI';

// Mock child components to avoid rendering complex sub-trees
vi.mock('../../ui/ThemeSwitcher', () => ({ ThemeSwitcher: () => <div>ThemeSwitcher</div> }));
vi.mock('../../common/TopBar', () => ({ default: () => <div>TopBar</div> }));
vi.mock('../../common/Footer', () => ({ default: () => <div>Footer</div> }));
vi.mock('../PersonalInfoSection', () => ({ default: () => <div>PersonalInfoSection</div> }));
vi.mock('../JobApplicationSection', () => ({ default: () => <div>JobApplicationSection</div> }));
vi.mock('../FileUploadSection', () => ({ default: () => <div>FileUploadSection</div> }));
vi.mock('../AdditionalInfoSection', () => ({ default: () => <div>AdditionalInfoSection</div> }));
vi.mock('../DebugInfo', () => ({ default: () => <div>DebugInfo</div> }));

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ alt }: any) => <img alt={alt} />,
}));

// Mock next-themes
vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light' }),
}));

describe('CandidateFormUI', () => {
    const defaultProps = {
        firstName: '', setFirstName: vi.fn(),
        lastName: '', setLastName: vi.fn(),
        email: 'test@example.com',
        gender: '', setGender: vi.fn(),
        phoneValidation: { isValid: true, isValidating: false, message: '', warning: '' },
        countryCode: '', setCountryCode: vi.fn(),
        phoneNumber: '', setPhoneNumber: vi.fn(),
        dateOfBirth: '', setDateOfBirth: vi.fn(),
        city: '', setCity: vi.fn(),
        country: '', setCountry: vi.fn(),
        nationality: '', setNationality: vi.fn(),
        doubleNationality: '', setDoubleNationality: vi.fn(),
        jobTitle: '',
        specialty: '', setSpecialty: vi.fn(),
        specialtySearch: '', setSpecialtySearch: vi.fn(),
        websites: [], setWebsites: vi.fn(),
        additionalInfo: [], setAdditionalInfo: vi.fn(),
        cvFile: null,
        passportFile: null,
        photoFile: null,
        isLoading: false,
        error: null,
        success: null,
        showSuccessToast: false, setShowSuccessToast: vi.fn(),
        isExistingCandidate: false,
        addAdditionalInfo: vi.fn(),
        removeAdditionalInfo: vi.fn(),
        updateAdditionalInfo: vi.fn(),
        handleCategorySelection: vi.fn(),
        handleJobSelection: vi.fn(),
        handleFileChange: vi.fn(),
        handleSubmit: vi.fn((e) => e.preventDefault()),
        selectedCategory: '',
        filteredJobs: [],
        selectedJob: null,
        availableSpecialties: [],
        calculateAge: vi.fn(),
    };

    it('should render the form title correctly for new candidate', () => {
        render(<CandidateFormUI {...defaultProps} isExistingCandidate={false} />);
        expect(screen.getByRole('heading', { name: /Candidate Application/i })).toBeDefined();
        expect(screen.getByText('Apply for your dream job opportunity')).toBeDefined();
    });

    it('should render the form title correctly for existing candidate', () => {
        render(<CandidateFormUI {...defaultProps} isExistingCandidate={true} />);
        expect(screen.getByRole('heading', { name: /Submit New Application/i })).toBeDefined();
        expect(screen.getByText('Submit a new job application')).toBeDefined();
        expect(screen.getByText(/Welcome back/)).toBeDefined();
    });

    it('should display error message when error prop is present', () => {
        render(<CandidateFormUI {...defaultProps} error="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeDefined();
    });

    it('should show loading state on submit button', () => {
        render(<CandidateFormUI {...defaultProps} isLoading={true} />);
        expect(screen.getByText('Submitting...')).toBeDefined();
    });

    it('should call handleSubmit when form is submitted', () => {
        const handleSubmit = vi.fn((e) => e.preventDefault());
        render(<CandidateFormUI {...defaultProps} handleSubmit={handleSubmit} />);

        // Assuming the form element has a role of 'form' or we can find it by test id if added.
        // If not, we might need to find the button and click it, but we need to make sure it triggers submit.
        // Since previous attempt failed with button click, let's try finding the form directly.
        // Note: <form> element does not have an implicit aria-role of 'form' unless it has a name.
        // So we might need to add aria-label to the form in the component or use container.querySelector('form').

        // Let's try clicking the button again but ensure we wait or check if something else is blocking.
        // Actually, let's use fireEvent.submit on the form element found by querySelector.
        const { container } = render(<CandidateFormUI {...defaultProps} handleSubmit={handleSubmit} />);
        const form = container.querySelector('form');
        if (form) {
            fireEvent.submit(form);
        }

        expect(handleSubmit).toHaveBeenCalled();
    });
});

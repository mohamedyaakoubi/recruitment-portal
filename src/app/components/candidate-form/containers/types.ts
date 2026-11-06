import { Job } from '@/types';

export interface CandidateFormUIProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  gender: string;
  setGender: (gender: string) => void;
  phoneValidation: {
    isValid: boolean | null;
    isValidating: boolean;
    message: string;
    warning?: string;
  };
  countryCode: string;
  setCountryCode: (code: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (date: string) => void;
  city: string;
  setCity: (city: string) => void;
  country: string;
  setCountry: (country: string) => void;
  nationality: string;
  setNationality: (nationality: string) => void;
  doubleNationality: string;
  setDoubleNationality: (nationality: string) => void;
  jobTitle: string;
  specialty: string;
  setSpecialty: (specialty: string) => void;
  specialtySearch: string;
  setSpecialtySearch: (search: string) => void;
  websites: string[];
  setWebsites: (websites: string[]) => void;
  additionalInfo: { type: 'link' | 'file' | 'text'; content: string; file?: File }[];
  setAdditionalInfo: (
    info: { type: 'link' | 'file' | 'text'; content: string; file?: File }[]
  ) => void;
  cvFile: File | null;
  passportFile: File | null;
  photoFile: File | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  showSuccessToast: boolean;
  setShowSuccessToast: (show: boolean) => void;
  isExistingCandidate: boolean;
  addAdditionalInfo: (type: 'link' | 'file' | 'text') => void;
  removeAdditionalInfo: (index: number) => void;
  updateAdditionalInfo: (index: number, content: string, file?: File) => void;
  handleCategorySelection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleJobSelection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  selectedCategory: string;
  filteredJobs: Job[];
  selectedJob: Job | null;
  availableSpecialties: string[];
  calculateAge: (dob: string) => number | null;
}

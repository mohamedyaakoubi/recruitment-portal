// src/hooks/useCandidateForm.ts
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import logger from '@/lib/logger';
import { validateFile } from '@/lib/fileValidation';
import { detectBot } from '@/lib/honeypot';
import { calculateAge } from '@/lib/utils';
import type { Job } from '@/types';

export const useCandidateForm = (emailParam?: string) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const [candidateEmail, setCandidateEmail] = useState('');
  const [isExistingCandidate, setIsExistingCandidate] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [countryCode, setCountryCode] = useState('+358');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [nationality, setNationality] = useState('');
  const [doubleNationality, setDoubleNationality] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [websites, setWebsites] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState<
    { type: 'link' | 'file' | 'text'; content: string; file?: File }[]
  >([{ type: 'link', content: '' }]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const filteredJobs = jobs.filter((job) => job.category === selectedCategory);
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean | null;
    isValidating: boolean;
    message: string;
    warning?: string;
  }>({
    isValid: null,
    isValidating: false,
    message: '',
  });

  const validatePhoneNumber = useCallback(
    async (countryCode: string, phoneNumber: string): Promise<boolean> => {
      // 🔥 CRITICAL: Skip validation entirely for existing candidates
      if (isExistingCandidate) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Skipping phone validation for existing candidate');
        }
        setPhoneValidation({
          isValid: true, // Assume valid since it was previously accepted
          isValidating: false,
          message: '✅ Phone number from previous application (validated)',
          warning: 'Using phone number from your previous application',
        });
        return true;
      }

      if (!phoneNumber.trim()) {
        setPhoneValidation({
          isValid: false,
          isValidating: false,
          message: 'Phone number is required',
        });
        return false;
      }

      setPhoneValidation({
        isValid: null,
        isValidating: true,
        message: 'Validating phone number...',
      });

      try {
        const response = await fetch('/api/validate-phone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            countryCode,
            phoneNumber: phoneNumber.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Validation failed');
        }

        // Handle wrapped API response: { success: true, data: {...} }
        const validationData = result.data || result;

        const validationMessage =
          validationData.message ||
          (validationData.isValid
            ? '✅ Phone number is valid'
            : `❌ ${validationData.error || 'Invalid phone number format'}`);

        setPhoneValidation({
          isValid: validationData.isValid,
          isValidating: false,
          message: validationMessage,
          warning: validationData.warning || validationData.suggestion,
        });

        // Log validation details for debugging
        if (validationData.isValid && validationData.country) {
          logger.info('Phone validated successfully', {
            country: validationData.country.name,
            type: validationData.type || 'unknown',
            carrier: validationData.carrier,
          });
        }

        return validationData.isValid;
      } catch (error) {
        logger.error('Phone validation error', error, { countryCode, phoneNumber });

        // Fallback validation - just check basic format
        const basicValidation = /^\d{6,15}$/.test(phoneNumber.replace(/\D/g, ''));

        setPhoneValidation({
          isValid: basicValidation,
          isValidating: false,
          message: basicValidation
            ? '⚠️ Phone format appears valid (validation service unavailable)'
            : '❌ Phone number format appears invalid',
          warning: 'Validation service temporarily unavailable',
        });

        return basicValidation;
      }
    },
    [isExistingCandidate]
  );

  // 🔥 FIXED: Single useEffect with proper debouncing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Phone validation useEffect triggered', {
        phone: phoneNumber,
        country: countryCode,
        existing: isExistingCandidate,
      });
    }

    // Skip validation entirely for existing candidates
    if (isExistingCandidate) {
      if (phoneNumber.trim()) {
        setPhoneValidation({
          isValid: true,
          isValidating: false,
          message: '✅ Phone number from previous application (validated)',
          warning: 'Using phone number from your previous application',
        });
      } else {
        setPhoneValidation({
          isValid: null,
          isValidating: false,
          message: '',
        });
      }
      return;
    }

    // Clear validation state if phone is empty
    if (!phoneNumber.trim()) {
      setPhoneValidation({
        isValid: null,
        isValidating: false,
        message: '',
      });
      return;
    }

    // Only validate for new candidates with valid input
    if (phoneNumber.trim() && countryCode && phoneNumber.trim().length >= 6) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Setting up debounced validation', {
          fullPhone: `${countryCode}${phoneNumber}`,
        });
      }

      const timeoutId = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Executing debounced validation', {
            fullPhone: `${countryCode}${phoneNumber}`,
          });
        }
        validatePhoneNumber(countryCode, phoneNumber);
      }, 2000); // 🔥 INCREASED: 2 seconds debounce to prevent excessive calls

      return () => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Clearing validation timeout', {
            fullPhone: `${countryCode}${phoneNumber}`,
          });
        }
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber, countryCode, isExistingCandidate]); // validatePhoneNumber is stable

  const sendConfirmationEmail = async (candidateData: {
    email: string;
    fullName: string;
    jobTitle: string;
    jobCategory?: string;
    specialty?: string;
    applicationId: string;
  }) => {
    try {
      logger.info('Attempting to send confirmation email', {
        email: candidateData.email,
        name: candidateData.fullName,
        applicationId: candidateData.applicationId,
      });

      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: candidateData.email,
          candidateName: candidateData.fullName,
          jobTitle: candidateData.jobTitle,
          jobCategory: candidateData.jobCategory,
          specialty: candidateData.specialty,
          applicationId: candidateData.applicationId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        logger.error('Failed to send confirmation email', new Error(result.error), {
          email: candidateData.email,
        });
        // Don't throw error - we don't want to fail the entire submission if email fails
      } else {
        logger.info('Confirmation email sent successfully', { email: candidateData.email });
      }
    } catch (error) {
      logger.error('Error sending confirmation email', error, { email: candidateData.email });
      // Don't throw error - we don't want to fail the entire submission if email fails
    }
  };

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // If email is passed as prop, use it directly (from Server Component)
    if (emailParam) {
      setCandidateEmail(emailParam);
      loadExistingCandidateData(emailParam);
      return;
    }

    // Fallback: Only run on client after mount
    if (!isMounted || typeof window === 'undefined') return;

    // Use window.location.search but only after component is mounted
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (email) {
      setCandidateEmail(email);
      loadExistingCandidateData(email);
    } else {
      // Don't redirect immediately in WebKit, give it a moment
      setTimeout(() => router.push('/'), 100);
    }
  }, [emailParam, isMounted, router]);

  const loadExistingCandidateData = async (email: string) => {
    try {
      const response = await fetch('/api/get-candidate-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      // Handle wrapped API response: { success: true, data: { applications, count } }
      const applicationsData = result.data || result;

      if (
        response.ok &&
        applicationsData.applications &&
        applicationsData.applications.length > 0
      ) {
        const latestApplication = applicationsData.applications[0];

        setIsExistingCandidate(true);

        if (latestApplication.firstName && latestApplication.lastName) {
          setFirstName(latestApplication.firstName);
          setLastName(latestApplication.lastName);
        } else if (latestApplication.fullName) {
          const nameParts = latestApplication.fullName.trim().split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
        }

        setGender(latestApplication.gender || '');
        setDateOfBirth(latestApplication.dateOfBirth || '');

        if (latestApplication.countryCode) {
          setCountryCode(latestApplication.countryCode);
        }

        if (latestApplication.phoneNumber) {
          let cleanPhone = latestApplication.phoneNumber;
          if (latestApplication.countryCode && cleanPhone.includes(latestApplication.countryCode)) {
            cleanPhone = cleanPhone.replace(latestApplication.countryCode, '').trim();
          }
          cleanPhone = cleanPhone.replace(/^[\s\-+]+/, '');
          setPhoneNumber(cleanPhone);
        }

        setCity(latestApplication.city || '');
        setCountry(latestApplication.country || '');
        setNationality(latestApplication.nationality || '');
        setDoubleNationality(latestApplication.doubleNationality || '');

        if (
          latestApplication.websites &&
          Array.isArray(latestApplication.websites) &&
          latestApplication.websites.length > 0
        ) {
          const validWebsites = latestApplication.websites.filter(
            (w: string) => w && w.trim() !== ''
          );
          setWebsites(validWebsites.length > 0 ? [...validWebsites, ''] : ['']);
        } else {
          setWebsites(['']);
        }
      }
    } catch (error) {
      logger.error('Error loading existing candidate data', error, { email });
    }
  };

  const addAdditionalInfo = useCallback(
    (type: 'link' | 'file' | 'text') => {
      setAdditionalInfo([...additionalInfo, { type, content: '' }]);
    },
    [additionalInfo]
  );

  const removeAdditionalInfo = useCallback(
    (index: number) => {
      if (additionalInfo.length > 1) {
        setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
      }
    },
    [additionalInfo]
  );

  const updateAdditionalInfo = useCallback(
    (index: number, content: string, file?: File) => {
      const newInfo = [...additionalInfo];
      const currentItem = newInfo[index];
      if (currentItem) {
        newInfo[index] = { ...currentItem, content, file };
        setAdditionalInfo(newInfo);
      }
    },
    [additionalInfo]
  );

  const addWebsite = useCallback(() => {
    setWebsites([...websites, '']);
  }, [websites]);

  const removeWebsite = useCallback(
    (index: number) => {
      if (websites.length > 1) {
        setWebsites(websites.filter((_, i) => i !== index));
      }
    },
    [websites]
  );

  const updateWebsite = useCallback(
    (index: number, value: string) => {
      const newWebsites = [...websites];
      newWebsites[index] = value;
      setWebsites(newWebsites);
    },
    [websites]
  );

  useEffect(() => {
    if (selectedCategory) {
      const _filtered = jobs.filter((job) => job.category === selectedCategory);
      setSpecialty('');
      setAvailableSpecialties([]);
    }
    setJobTitle('');
    setSelectedJob(null);
  }, [selectedCategory, jobs]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/jobs?activeOnly=true');
        const result = await response.json();
        if (response.ok) {
          // Handle wrapped API response: { success: true, data: { jobs, categories } }
          const jobsData = result.data || result;
          const jobsList = jobsData?.jobs || [];
          setJobs(Array.isArray(jobsList) ? jobsList : []);
        }
      } catch (error) {
        logger.error('Error loading jobs', error);
        setJobs([]); // Ensure jobs is always an array on error
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJob && selectedJob.specialties && Array.isArray(selectedJob.specialties)) {
      setAvailableSpecialties(selectedJob.specialties);
      // 🔥 FIXED: Don't automatically clear specialty if it's already valid
      if (!selectedJob.specialties.includes(specialty)) {
        setSpecialty('');
        setSpecialtySearch('');
      }
    } else {
      setAvailableSpecialties([]);
      setSpecialty('');
      setSpecialtySearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob]); // specialty is derived from selectedJob

  const handleCategorySelection = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  }, []);

  const handleJobSelection = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedJobId = e.target.value;
      setJobTitle(selectedJobId);
      const job = filteredJobs.find((j) => j.id === selectedJobId);
      setSelectedJob(job || null);
    },
    [filteredJobs]
  );

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        // Determine file type for validation
        const fileType = name === 'photo' ? 'image' : name === 'passport' ? 'passport' : 'document';

        // Get size limit based on file type
        const sizeLimits: Record<string, number> = {
          cv: 5 * 1024 * 1024, // 5 MB
          passport: 5 * 1024 * 1024, // 5 MB
          photo: 2 * 1024 * 1024, // 2 MB
        };
        const maxSize = sizeLimits[name] || 5 * 1024 * 1024;

        // Check file size immediately
        if (file.size > maxSize) {
          const maxSizeMB = maxSize / (1024 * 1024);
          setError(
            `${name === 'cv' ? 'CV/Resume' : name === 'passport' ? 'Passport/ID' : 'Photo'} file size exceeds ${maxSizeMB} MB limit. Please choose a smaller file.`
          );
          e.target.value = ''; // Clear the input
          return;
        }

        // Validate file type and content
        const validation = await validateFile(file, fileType);
        if (!validation.isValid) {
          setError(
            `${name === 'cv' ? 'CV/Resume' : name === 'passport' ? 'Passport/ID' : 'Photo'}: ${validation.error}`
          );
          e.target.value = ''; // Clear the input
          return;
        }

        // Clear error if validation passes
        setError(null);

        if (name === 'cv') {
          setCvFile(file);
        } else if (name === 'passport') {
          setPassportFile(file);
        } else if (name === 'photo') {
          setPhotoFile(file);
        }
      }
    }
  }, []);

  const checkDuplicateApplication = async (email: string, jobId: string, jobCategory: string) => {
    try {
      const candidatesRef = collection(db, 'candidates');

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const duplicateQuery = query(
        candidatesRef,
        where('email', '==', email.toLowerCase().trim()),
        where('jobTitle', '==', jobId),
        where('submittedAt', '>=', Timestamp.fromDate(sixMonthsAgo))
      );

      const duplicateSnapshot = await getDocs(duplicateQuery);

      if (!duplicateSnapshot.empty) {
        const firstDoc = duplicateSnapshot.docs[0];
        if (firstDoc) {
          const lastApplication = firstDoc.data();
          const lastSubmissionDate = lastApplication.submittedAt?.toDate();
          const formattedDate = lastSubmissionDate?.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return {
            isDuplicate: true,
            message: `You have already applied for this position on ${formattedDate}. You can apply again after 6 months.`,
          };
        }
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const categoryQuery = query(
        candidatesRef,
        where('email', '==', email.toLowerCase().trim()),
        where('jobCategory', '==', jobCategory),
        where('submittedAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      );

      const categorySnapshot = await getDocs(categoryQuery);

      if (categorySnapshot.size >= 3) {
        return {
          isDuplicate: true,
          message: `You have reached the maximum of 3 applications for the "${jobCategory}" category this month.`,
        };
      }

      return { isDuplicate: false, message: '' };
    } catch (error) {
      logger.error('Error checking duplicate applications', error, { email: candidateEmail });
      return { isDuplicate: false, message: '' };
    }
  };

  const validateAge = (
    dateOfBirth: string
  ): { isValid: boolean; age: number; message?: string } => {
    if (!dateOfBirth) {
      return { isValid: false, age: 0, message: 'Date of birth is required' };
    }
    const age = calculateAge(dateOfBirth);
    if (age === null || age < 18) {
      return {
        isValid: false,
        age: age ?? 0,
        message:
          age === null ? 'Invalid date of birth' : `You must be at least 18. Your age is ${age}.`,
      };
    }
    return { isValid: true, age, message: '' };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Bot detection using honeypot and timing validation
    const formData = new FormData(e.target as HTMLFormElement);
    const honeypotValue = formData.get('website') as string | null;
    const timestampValue = formData.get('form_timestamp') as string | null;

    const botDetection = detectBot({
      honeypot: honeypotValue || undefined,
      timestamp: timestampValue ? Number(timestampValue) : undefined,
    });

    if (botDetection.isBot) {
      logger.warn('Bot detected in form submission', {
        reason: botDetection.reason,
        honeypot: !!honeypotValue,
        timestamp: timestampValue,
      });
      // Silently reject bot submissions without showing error
      setIsLoading(false);
      return;
    }

    // 🔥 NEW: Name validation before other checks
    const validateName = (name: string, fieldName: string): string => {
      if (!name.trim()) {
        return `${fieldName} is required`;
      }

      if (/\d/.test(name)) {
        return `${fieldName} cannot contain numbers`;
      }

      if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/.test(name)) {
        return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
      }

      if (/\./.test(name)) {
        return `${fieldName} cannot contain dots`;
      }

      if (name.trim().length < 2) {
        return `${fieldName} must be at least 2 characters long`;
      }

      if (name.trim().length > 50) {
        return `${fieldName} cannot exceed 50 characters`;
      }

      if (/\s{2,}/.test(name)) {
        return `${fieldName} cannot contain multiple consecutive spaces`;
      }

      if (/^[\s'-]|[\s'-]$/.test(name)) {
        return `${fieldName} cannot start or end with spaces, hyphens, or apostrophes`;
      }

      return '';
    };

    // 🔥 NEW: Validate names first
    const firstNameError = validateName(firstName, 'First name');
    if (firstNameError) {
      setError(firstNameError);
      return;
    }

    const lastNameError = validateName(lastName, 'Last name');
    if (lastNameError) {
      setError(lastNameError);
      return;
    }

    // Age validation
    const ageValidation = validateAge(dateOfBirth);
    if (!ageValidation.isValid) {
      setError(ageValidation.message || 'Age validation failed.');
      return;
    }

    // Phone validation only for new candidates
    if (!isExistingCandidate) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting phone validation before submission for new candidate');
      }
      const isPhoneValid = await validatePhoneNumber(countryCode, phoneNumber);

      if (!isPhoneValid) {
        setError(`Phone number validation failed: ${phoneValidation.message}`);
        return;
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Skipping phone validation for existing candidate');
      }
    }

    // Enhanced validation with specific missing field messages
    const missingFields = [];

    if (!firstName) missingFields.push('First Name');
    if (!lastName) missingFields.push('Last Name');
    if (!candidateEmail) missingFields.push('Email');
    if (!gender) missingFields.push('Gender');
    if (!countryCode) missingFields.push('Country Code');
    if (!phoneNumber) missingFields.push('Phone Number');
    if (!dateOfBirth) missingFields.push('Date of Birth');
    if (!city) missingFields.push('City');
    if (!country) missingFields.push('Country');
    if (!nationality) missingFields.push('Nationality');
    if (!selectedCategory) missingFields.push('Job Category');
    if (!jobTitle) missingFields.push('Job Position');
    if (!specialty) missingFields.push('Specialty');
    if (!cvFile) missingFields.push('CV/Resume');
    if (!passportFile) missingFields.push('Passport/ID');

    // Debug log
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Form validation debug', {
        firstName,
        lastName,
        firstNameValid: !firstNameError,
        lastNameValid: !lastNameError,
        candidateEmail,
        gender,
        countryCode,
        phoneNumber,
        phoneValidation,
        dateOfBirth,
        city,
        country,
        nationality,
        selectedCategory,
        jobTitle,
        specialty,
        cvFile: cvFile ? cvFile.name : 'Missing',
        passportFile: passportFile ? passportFile.name : 'Missing',
        availableSpecialties,
        specialtyValid: availableSpecialties.includes(specialty),
        isExistingCandidate,
      });
    }

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Specialty validation
    if (!availableSpecialties.includes(specialty)) {
      setError(
        `Please select a valid specialty from the available options. Selected: "${specialty}". Available: ${availableSpecialties.join(', ')}`
      );
      return;
    }

    // File validation
    if (!cvFile || !passportFile) {
      setError('CV/Resume and Passport/ID files are required.');
      return;
    }

    // Validate CV file (PDF/DOC/DOCX)
    const cvValidation = await validateFile(cvFile, 'document');
    if (!cvValidation.isValid) {
      setError(`CV/Resume validation failed: ${cvValidation.error}`);
      return;
    }

    // Validate passport file (PDF/JPG/PNG)
    const passportValidation = await validateFile(passportFile, 'passport');
    if (!passportValidation.isValid) {
      setError(`Passport/ID validation failed: ${passportValidation.error}`);
      return;
    }

    // Validate photo file if provided (JPG/PNG/WEBP)
    if (photoFile) {
      const photoValidation = await validateFile(photoFile, 'image');
      if (!photoValidation.isValid) {
        setError(`Photo validation failed: ${photoValidation.error}`);
        return;
      }
    }

    setIsLoading(true);

    // Check for mock mode (for E2E tests)
    if (typeof window !== 'undefined' && window.localStorage.getItem('USE_MOCK_DATA') === 'true') {
      setTimeout(() => {
        setSuccess(
          'Application submitted successfully! Your information has been validated and a confirmation email has been sent to your email address.'
        );
        setShowSuccessToast(true);
        setIsLoading(false);
        setTimeout(() => {
          router.push(`/candidate-dashboard?email=${encodeURIComponent(candidateEmail)}`);
        }, 3000);
      }, 1000);
      return;
    }

    try {
      // 🔥 NEW: Clean and trim names before saving
      const cleanFirstName = firstName.trim().replace(/\s+/g, ' ');
      const cleanLastName = lastName.trim().replace(/\s+/g, ' ');

      // Check for duplicate applications
      const duplicateCheck = await checkDuplicateApplication(
        candidateEmail,
        jobTitle,
        selectedCategory
      );
      if (duplicateCheck.isDuplicate) {
        setError(duplicateCheck.message);
        setIsLoading(false);
        return;
      }

      // File uploads - sanitize filenames to prevent path traversal
      const sanitizeFileName = (name: string): string => {
        return name
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/\.{2,}/g, '.')
          .substring(0, 100);
      };

      const cvFileName = `cv_${Date.now()}_${sanitizeFileName(cvFile.name)}`;
      const passportFileName = `passport_${Date.now()}_${sanitizeFileName(passportFile.name)}`;

      const cvStorageRef = ref(storage, `candidate_files/${cvFileName}`);
      const passportStorageRef = ref(storage, `candidate_files/${passportFileName}`);

      const [cvUploadTask, passportUploadTask] = await Promise.all([
        uploadBytes(cvStorageRef, cvFile),
        uploadBytes(passportStorageRef, passportFile),
      ]);

      const [cvUrl, passportUrl] = await Promise.all([
        getDownloadURL(cvUploadTask.ref),
        getDownloadURL(passportUploadTask.ref),
      ]);

      let photoUrl = null;
      if (photoFile) {
        const photoFileName = `photo_${Date.now()}_${sanitizeFileName(photoFile.name)}`;
        const photoStorageRef = ref(storage, `candidate_files/${photoFileName}`);
        const photoUploadTask = await uploadBytes(photoStorageRef, photoFile);
        photoUrl = await getDownloadURL(photoUploadTask.ref);
      }

      const normalizedEmail = candidateEmail.toLowerCase().trim();

      // Save application to database with cleaned names
      const docRef = await addDoc(collection(db, 'candidates'), {
        firstName: cleanFirstName, // 🔥 NEW: Use cleaned name
        lastName: cleanLastName, // 🔥 NEW: Use cleaned name
        fullName: `${cleanFirstName} ${cleanLastName}`, // 🔥 NEW: Use cleaned names
        email: normalizedEmail,
        gender,
        countryCode,
        phoneNumber: `${countryCode} ${phoneNumber}`,
        dateOfBirth,
        age: ageValidation.age,
        city,
        country,
        nationality,
        doubleNationality: doubleNationality || null,
        jobCategory: selectedCategory,
        specialty,
        jobTitle,
        jobTitleText: selectedJob?.title || '',
        websites: websites.filter((w) => w.trim() !== ''),
        cvUrl,
        passportUrl,
        photoUrl,
        submittedAt: serverTimestamp(),
        status: 'submitted',
        score: null,
        applicationSource: 'web_form',
        lastUpdated: serverTimestamp(),
        phoneValidationStatus: {
          isValid: phoneValidation.isValid,
          validatedAt: new Date(),
          fallbackUsed: phoneValidation.warning?.includes('pattern')
            ? 'regex'
            : phoneValidation.warning?.includes('basic')
              ? 'basic'
              : 'api',
        },
      });

      // Send confirmation email after successful submission
      if (docRef && docRef.id) {
        logger.info('Application saved successfully, sending confirmation email', {
          applicationId: docRef.id,
        });

        await sendConfirmationEmail({
          email: normalizedEmail,
          fullName: `${cleanFirstName} ${cleanLastName}`, // 🔥 NEW: Use cleaned names
          jobTitle: selectedJob?.title || '',
          jobCategory: selectedCategory,
          specialty: specialty,
          applicationId: docRef.id,
        });
      }

      setSuccess(
        'Application submitted successfully! Your information has been validated and a confirmation email has been sent to your email address.'
      );
      setShowSuccessToast(true);

      setTimeout(() => {
        router.push(`/candidate-dashboard?email=${encodeURIComponent(normalizedEmail)}`);
      }, 3000);
    } catch (err) {
      logger.error('Submission error', err);
      setError(
        err instanceof Error ? `Submission failed: ${err.message}` : 'An unknown error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };
  // 🔥 NEW: Return phone validation state
  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email: candidateEmail,
    gender,
    setGender,
    countryCode,
    setCountryCode,
    phoneNumber,
    setPhoneNumber,
    phoneValidation, // 🔥 NEW
    dateOfBirth,
    setDateOfBirth,
    city,
    setCity,
    country,
    setCountry,
    nationality,
    setNationality,
    doubleNationality,
    setDoubleNationality,
    jobTitle,
    setJobTitle,
    specialty,
    setSpecialty,
    specialtySearch,
    setSpecialtySearch,
    websites,
    setWebsites,
    additionalInfo,
    setAdditionalInfo,
    cvFile,
    setCvFile,
    passportFile,
    setPassportFile,
    photoFile,
    setPhotoFile,
    jobs,
    selectedCategory,
    filteredJobs,
    selectedJob,
    availableSpecialties,
    isLoading,
    error,
    success,
    showSuccessToast,
    setShowSuccessToast,
    isExistingCandidate,
    addAdditionalInfo,
    removeAdditionalInfo,
    updateAdditionalInfo,
    addWebsite,
    removeWebsite,
    updateWebsite,
    handleCategorySelection,
    handleJobSelection,
    handleFileChange,
    handleSubmit,
    calculateAge,
    validatePhoneNumber, // 🔥 NEW
  };
};

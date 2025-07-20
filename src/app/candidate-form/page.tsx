"use client";

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import Image from 'next/image';
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '@/lib/firebase';
import { JOB_CATEGORIES } from '@/lib/job-categories';
import { countryCodes, countries } from '@/lib/formData';
import { useRouter } from 'next/navigation';

import SuccessToast from '../components/ui/SuccessToast';

// Helper component for social media icons in the footer
const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
    {children}
  </a>
);

export default function CandidateForm() {
  const router = useRouter();
  
  // Get email from URL params
  const [candidateEmail, setCandidateEmail] = useState('');
  const [isExistingCandidate, setIsExistingCandidate] = useState(false);
  const [existingCandidateData, setExistingCandidateData] = useState<any>(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      setCandidateEmail(email);
      // Check if this is an existing candidate and load their data
      loadExistingCandidateData(email);
    } else {
      // Redirect back to landing if no email provided
      router.push('/');
    }
  }, [router]);

  // 🔥 NEW: Function to load existing candidate data
const loadExistingCandidateData = async (email: string) => {
  try {
    console.log('🔍 Loading existing candidate data for:', email);
    const response = await fetch('/api/get-candidate-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    
    if (response.ok && result.applications && result.applications.length > 0) {
      // Get the most recent application
      const latestApplication = result.applications[0];
      console.log('📋 Latest application data:', latestApplication);
      
      setIsExistingCandidate(true);
      setExistingCandidateData(latestApplication);
      
      // 🔥 AUTO-FILL FORM FIELDS with proper fallbacks
      
      // Personal Information - LOCKED FIELDS
      // Parse fullName if firstName/lastName are not available
      if (latestApplication.firstName && latestApplication.lastName) {
        setFirstName(latestApplication.firstName);
        setLastName(latestApplication.lastName);
      } else if (latestApplication.fullName) {
        // Split fullName into firstName and lastName
        const nameParts = latestApplication.fullName.trim().split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      } else {
        console.warn('⚠️ No name data found in existing application');
        setFirstName('');
        setLastName('');
      }
      
      setGender(latestApplication.gender || '');
      setDateOfBirth(latestApplication.dateOfBirth || '');
      
      // Contact Information - EDITABLE FIELDS
      if (latestApplication.countryCode) {
        setCountryCode(latestApplication.countryCode);
      }
      
      // Parse phone number
      if (latestApplication.phoneNumber) {
        let cleanPhone = latestApplication.phoneNumber;
        // If phone number includes country code, try to separate it
        if (latestApplication.countryCode && cleanPhone.includes(latestApplication.countryCode)) {
          cleanPhone = cleanPhone.replace(latestApplication.countryCode, '').trim();
        }
        // Remove any leading spaces or special characters
        cleanPhone = cleanPhone.replace(/^[\s\-\+]+/, '');
        setPhoneNumber(cleanPhone);
      }
      
      // Location Information
      setCity(latestApplication.city || '');
      setCountry(latestApplication.country || '');
      setCountrySearch(latestApplication.country || '');
      
      // Nationality Information
      setNationality(latestApplication.nationality || '');
      setNationalitySearch(latestApplication.nationality || '');
      setDoubleNationality(latestApplication.doubleNationality || '');
      setDoubleNationalitySearch(latestApplication.doubleNationality || '');
      
      // Website Information
      if (latestApplication.websites && Array.isArray(latestApplication.websites) && latestApplication.websites.length > 0) {
        const validWebsites = latestApplication.websites.filter((w: string) => w && w.trim() !== '');
        setWebsites(validWebsites.length > 0 ? [...validWebsites, ''] : ['']);
      } else {
        setWebsites(['']);
      }
      
      console.log('✅ Successfully loaded and populated existing candidate data');
      console.log('🔍 Populated fields:', {
        firstName: latestApplication.firstName || 'parsed from fullName',
        lastName: latestApplication.lastName || 'parsed from fullName',
        fullName: latestApplication.fullName,
        gender: latestApplication.gender,
        dateOfBirth: latestApplication.dateOfBirth,
        city: latestApplication.city,
        country: latestApplication.country,
        nationality: latestApplication.nationality
      });
      
    } else {
      setIsExistingCandidate(false);
      console.log('ℹ️ New candidate - no existing data found');
    }
  } catch (error) {
    console.error('❌ Error loading existing candidate data:', error);
    setIsExistingCandidate(false);
  }
};

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [countryCode, setCountryCode] = useState('+358');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [nationality, setNationality] = useState('');
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [doubleNationality, setDoubleNationality] = useState('');
  const [doubleNationalitySearch, setDoubleNationalitySearch] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [websites, setWebsites] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState<{type: 'link' | 'file' | 'text', content: string, file?: File}[]>([{type: 'link', content: ''}]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [showNationalityList, setShowNationalityList] = useState(false);
  const [showDoubleNationalityList, setShowDoubleNationalityList] = useState(false);
  const [showSpecialtyList, setShowSpecialtyList] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const nationalityRef = useRef<HTMLDivElement>(null);
  const doubleNationalityRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);
  const [showCountryCodeList, setShowCountryCodeList] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');
  const countryCodeRef = useRef<HTMLDivElement>(null);

  // ✅ Filter specialties based on search
  const filteredSpecialties = availableSpecialties.filter(spec => 
    spec.toLowerCase().includes(specialtySearch.toLowerCase())
  );
  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ✅ Filtered lists for nationality fields
  const filteredNationalities = countries.filter(c => 
    c.toLowerCase().includes(nationalitySearch.toLowerCase())
  );

  const filteredDoubleNationalities = countries.filter(c => 
    c.toLowerCase().includes(doubleNationalitySearch.toLowerCase())
  );

  const addAdditionalInfo = (type: 'link' | 'file' | 'text') => {
    setAdditionalInfo([...additionalInfo, {type, content: ''}]);
  };

  const removeAdditionalInfo = (index: number) => {
    if (additionalInfo.length > 1) {
      setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
    }
  };

  const updateAdditionalInfo = (index: number, content: string, file?: File) => {
    const newInfo = [...additionalInfo];
    newInfo[index] = {...newInfo[index], content, file};
    setAdditionalInfo(newInfo);
  };

  const addWebsite = () => {
    setWebsites([...websites, '']);
  };

  const removeWebsite = (index: number) => {
    if (websites.length > 1) {
      setWebsites(websites.filter((_, i) => i !== index));
    }
  };

  const updateWebsite = (index: number, value: string) => {
    const newWebsites = [...websites];
    newWebsites[index] = value;
    setWebsites(newWebsites);
  };

  // ✅ Reset specialty when category changes
useEffect(() => {
  if (selectedCategory) {
    const filtered = jobs.filter(job => job.category === selectedCategory);
    setFilteredJobs(filtered);
    // Reset specialty when category changes
    setSpecialty('');
    setSpecialtySearch('');
    setAvailableSpecialties([]);
  } else {
    setFilteredJobs([]);
  }
  setJobTitle('');
  setSelectedJob(null);
}, [selectedCategory, jobs]);

useEffect(() => {
  const loadJobs = async () => {
    try {
      // ✅ Add activeOnly=true parameter to only fetch active jobs for candidates
      const response = await fetch('/api/jobs?activeOnly=true');
      const data = await response.json();
      if (response.ok) {
        setJobs(data.jobs || []);
        setCategories(data.categories || []);
        // ✅ Add this debug log to check if jobs are loaded
        console.log('Loaded jobs:', data.jobs);
      } else {
        console.error('Failed to load jobs:', data.error);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };
  loadJobs();
}, []);

  // ✅ Update available specialties when job is selected
  useEffect(() => {
    if (selectedJob && selectedJob.specialties) {
      setAvailableSpecialties(selectedJob.specialties);
      // Reset specialty selection
      setSpecialty('');
      setSpecialtySearch('');
    } else {
      setAvailableSpecialties([]);
    }
  }, [selectedJob]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryList(false);
      }
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setShowNationalityList(false);
      }
      if (doubleNationalityRef.current && !doubleNationalityRef.current.contains(event.target as Node)) {
        setShowDoubleNationalityList(false);
      }
      if (specialtyRef.current && !specialtyRef.current.contains(event.target as Node)) {
        setShowSpecialtyList(false);
      }
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
        setShowCountryCodeList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryList(false);
      }
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setShowNationalityList(false);
      }
      if (doubleNationalityRef.current && !doubleNationalityRef.current.contains(event.target as Node)) {
        setShowDoubleNationalityList(false);
      }
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
        setShowCountryCodeList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategorySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const filteredCountryCodes = countryCodes.filter(item => 
    item.country.toLowerCase().includes(countryCodeSearch.toLowerCase()) ||
    item.code.includes(countryCodeSearch) ||
    item.flag.includes(countryCodeSearch)
  );

  const handleJobSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedJobId = e.target.value;
    setJobTitle(selectedJobId);
    const job = filteredJobs.find(j => j.id === selectedJobId);
    setSelectedJob(job || null);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'cv') {
        setCvFile(files[0]);
      } else if (name === 'passport') {
        setPassportFile(files[0]);
      } else if (name === 'photo') { // ✅ New field
        setPhotoFile(files[0]);
      }
    }
  };


    // 🔥 NEW: Function to check for duplicate applications
  const checkDuplicateApplication = async (email: string, jobId: string, jobCategory: string) => {
    try {
      console.log('Checking for duplicate applications...', { email, jobId, jobCategory });
      
      const candidatesRef = collection(db, "candidates");
      
      // Check for applications to the same specific job in the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const duplicateQuery = query(
        candidatesRef,
        where("email", "==", email.toLowerCase().trim()),
        where("jobTitle", "==", jobId),
        where("submittedAt", ">=", Timestamp.fromDate(sixMonthsAgo))
      );
      
      const duplicateSnapshot = await getDocs(duplicateQuery);
      
      if (!duplicateSnapshot.empty) {
        const lastApplication = duplicateSnapshot.docs[0].data();
        const lastSubmissionDate = lastApplication.submittedAt?.toDate();
        const formattedDate = lastSubmissionDate?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        return {
          isDuplicate: true,
          message: `You have already applied for this position on ${formattedDate}. You can apply again after 6 months from your last application.`,
          lastApplicationDate: lastSubmissionDate
        };
      }
      
      // Also check for applications to the same job category in the last 30 days (to prevent spamming)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const categoryQuery = query(
        candidatesRef,
        where("email", "==", email.toLowerCase().trim()),
        where("jobCategory", "==", jobCategory),
        where("submittedAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
      );
      
      const categorySnapshot = await getDocs(categoryQuery);
      
      if (categorySnapshot.size >= 3) { // Max 3 applications per category per month
        return {
          isDuplicate: true,
          message: `You have reached the maximum number of applications (3) for the "${jobCategory}" category this month. Please wait before applying again.`,
          lastApplicationDate: null
        };
      }
      
      return { isDuplicate: false, message: '', lastApplicationDate: null };
      
    } catch (error) {
      console.error('Error checking duplicate applications:', error);
      // Don't block the application if check fails
      return { isDuplicate: false, message: '', lastApplicationDate: null };
    }
  };

const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Handle invalid dates
  if (isNaN(birthDate.getTime())) return 0;
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // If birth month hasn't occurred this year, or it's the birth month but the day hasn't occurred
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// 🔥 NEW: Function to validate minimum age
const validateAge = (dateOfBirth: string): { isValid: boolean; age: number; message?: string } => {
  if (!dateOfBirth) {
    return { isValid: false, age: 0, message: 'Date of birth is required' };
  }
  
  const age = calculateAge(dateOfBirth);
  
  if (age < 18) {
    return { 
      isValid: false, 
      age, 
      message: `You must be at least 18 years old to apply. Current age: ${age} years old.` 
    };
  }
  
  return { isValid: true, age };
};

 const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  const finalCountry = country || countrySearch;
  const finalNationality = nationality || nationalitySearch;
  const finalSpecialty = specialty || specialtySearch;

  // 🔥 NEW: Age validation first
  if (dateOfBirth) {
    const ageValidation = validateAge(dateOfBirth);
    if (!ageValidation.isValid) {
      setError(ageValidation.message || 'You must be at least 18 years old to apply.');
      // Scroll to the date of birth field
      const dobField = document.getElementById('dateOfBirth');
      if (dobField) {
        dobField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        dobField.focus();
      }
      return;
    }
  }

  // Continue with existing validation
  if (!firstName || !lastName || !candidateEmail || !gender || !countryCode || !phoneNumber || !dateOfBirth || !city || !finalCountry || !finalNationality || !selectedCategory || !jobTitle || !finalSpecialty || !cvFile || !passportFile) {
    setError("Please fill in all required fields including specialty and upload all required files (CV and Passport/ID).");
    return;
  }

  if (!availableSpecialties.includes(finalSpecialty)) {
    setError("Please select a valid specialty from the available options for the selected job.");
    return;
  }

  setIsLoading(true);

  try {
    // 🔥 NEW: Check for duplicate applications before proceeding
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

    // 🔥 NEW: Double-check age before final submission
    const finalAgeValidation = validateAge(dateOfBirth);
    if (!finalAgeValidation.isValid) {
      setError(finalAgeValidation.message || 'Age verification failed. You must be at least 18 years old.');
      setIsLoading(false);
      return;
    }

    // Continue with file uploads...
    const cvFileName = `cv_${Date.now()}_${cvFile.name}`;
    const passportFileName = `passport_${Date.now()}_${passportFile.name}`;
    
    const cvStorageRef = ref(storage, `candidate_files/${cvFileName}`);
    const passportStorageRef = ref(storage, `candidate_files/${passportFileName}`);

    const cvUploadTask = await uploadBytes(cvStorageRef, cvFile);
    const passportUploadTask = await uploadBytes(passportStorageRef, passportFile);

    const cvUrl = await getDownloadURL(cvUploadTask.ref);
    const passportUrl = await getDownloadURL(passportUploadTask.ref);
    
    let photoUrl = null;
    if (photoFile) {
      const photoFileName = `photo_${Date.now()}_${photoFile.name}`;
      const photoStorageRef = ref(storage, `candidate_files/${photoFileName}`);
      const photoUploadTask = await uploadBytes(photoStorageRef, photoFile);
      photoUrl = await getDownloadURL(photoUploadTask.ref);
    }

    const finalDoubleNationality = doubleNationality || doubleNationalitySearch || null;

    // ✅ Ensure email is properly formatted before saving
    const normalizedEmail = candidateEmail.toLowerCase().trim();
    console.log('Saving candidate with email:', normalizedEmail);

    const candidatesCollectionRef = collection(db, "candidates");
    const newApplicationRef = await addDoc(candidatesCollectionRef, {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: normalizedEmail,
      gender,
      countryCode,
      phoneNumber: `${countryCode} ${phoneNumber}`,
      dateOfBirth,
      age: finalAgeValidation.age, // 🔥 NEW: Store calculated age
      city,
      country: finalCountry,
      nationality: finalNationality,
      doubleNationality: finalDoubleNationality,
      jobCategory: selectedCategory,
      specialty: finalSpecialty,
      jobTitle,
      jobTitleText: selectedJob?.title || '',
      websites: websites.filter(w => w.trim() !== ''),
      cvUrl,
      passportUrl,
      photoUrl,
      submittedAt: serverTimestamp(),
      status: 'submitted',
      score: null,
      // 🔥 NEW: Add metadata for tracking
      applicationSource: 'web_form',
      lastUpdated: serverTimestamp()
    });

    console.log('Candidate saved successfully with ID:', newApplicationRef.id);

    // Reset form fields (existing code...)
    setFirstName('');
    setLastName('');
    setGender('');
    setCountryCode('+358');
    setPhoneNumber('');
    setDateOfBirth('');
    setCity('');
    setCountry('');
    setCountrySearch('');
    setNationality('');
    setNationalitySearch('');
    setDoubleNationality('');
    setDoubleNationalitySearch('');
    setSelectedCategory('');
    setSpecialty('');
    setSpecialtySearch('');
    setJobTitle('');
    setSelectedJob(null);
    setAvailableSpecialties([]);
    setWebsites(['']);
    setCvFile(null);
    setPassportFile(null);
    setPhotoFile(null);
    
    const cvInput = document.getElementById('cv') as HTMLInputElement;
    const passportInput = document.getElementById('passport') as HTMLInputElement;
    const photoInput = document.getElementById('photo') as HTMLInputElement;
    if (cvInput) cvInput.value = '';
    if (passportInput) passportInput.value = '';
    if (photoInput) photoInput.value = '';

    setSuccess("Application submitted successfully!");
    setShowSuccessToast(true);

    // 🔥 NEW: Redirect to dashboard after successful submission
    setTimeout(() => {
      router.push(`/candidate-dashboard?email=${encodeURIComponent(normalizedEmail)}`);
    }, 2000); // Wait 2 seconds to show success message

  } catch (err) {
    console.error("Error submitting application:", err);
    if (err instanceof Error) {
        setError(`Submission failed: ${err.message || 'Unknown error'}`);
    } else {
        setError('Submission failed: An unknown error occurred');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header remains the same */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="bg-[#003A70] text-white text-xs py-1.5">
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex justify-center md:justify-between items-center">
                  <div className="flex items-center">
                      <span className="text-yellow-400 mr-2 text-base">⚠️</span>
                      <span>Découvrez les dernières opportunités!</span>
                  </div>
                  <div className="hidden md:flex items-center space-x-6">
                      <a href="tel:+358452644966" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          <span>+358 452644966</span>
                      </a>
                      <a href="mailto:wassim@internationalskills.fi" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span>wassim@internationalskills.fi</span>
                      </a>
                  </div>
              </div>
          </div>
          <nav className="max-w-screen-xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between py-4">
                  <Image
                      src="/logo-skills.png"
                      alt="International Skills Labor Company"
                      width={180}
                      height={45}
                      priority
                  />
              </div>
          </nav>
      </header>
      
      {/* Main Content */}
      <main id="form-start" className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-4xl p-6 sm:p-10 space-y-8 bg-white rounded-xl shadow-2xl shadow-slate-200">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003A70] mb-2">
              {isExistingCandidate ? 'Submit New Application' : 'Candidate Application'}
            </h1>
            <p className="text-slate-500">
              {isExistingCandidate ? 'Submit a new job application' : 'Apply for your dream job opportunity'}
            </p>
            <p className="text-sm text-[#003A70] mt-2">Application for: <strong>{candidateEmail}</strong></p>
            
{/* 🔥 UPDATED: Show existing candidate notice with detailed info */}
{isExistingCandidate && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
    <div className="flex items-start space-x-3">
      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm text-blue-700 mb-2">
          <strong>Welcome back!</strong> We've pre-filled your information from your previous application.
        </p>
        <div className="text-xs text-blue-600 space-y-1">
          <p><strong>🔒 Locked fields:</strong> Name, gender, and date of birth cannot be modified</p>
          <p><strong>✏️ Editable fields:</strong> All other information can be updated</p>
          <p><strong>📁 Files:</strong> Please upload fresh copies of your documents</p>
        </div>
        {existingCandidateData && (
          <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
            <p><strong>Name:</strong> {existingCandidateData.fullName || 'N/A'}</p>
            <p><strong>Last application:</strong> {existingCandidateData.submittedAt ? new Date(existingCandidateData.submittedAt).toLocaleDateString() : 'N/A'}</p>
            {existingCandidateData.jobTitleText && (
              <p><strong>Previous position:</strong> {existingCandidateData.jobTitleText}</p>
            )}
            <p><strong>Applications count:</strong> {existingCandidateData ? '1+' : '0'}</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-slate-50 p-5 sm:p-6 rounded-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                
                {/* First Name - 🔥 DISABLED for existing candidates */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-slate-600 mb-2">
                    First Name <span className="text-red-500">*</span>
                    {isExistingCandidate && (
                      <span className="text-xs text-gray-500 ml-2">(Cannot be modified)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] ${
                      isExistingCandidate ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter your first name"
                    disabled={isLoading || isExistingCandidate}
                  />
                </div>

                {/* Last Name - 🔥 DISABLED for existing candidates */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-slate-600 mb-2">
                    Last Name <span className="text-red-500">*</span>
                    {isExistingCandidate && (
                      <span className="text-xs text-gray-500 ml-2">(Cannot be modified)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] ${
                      isExistingCandidate ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter your last name"
                    disabled={isLoading || isExistingCandidate}
                  />
                </div>

                {/* Email - Always disabled since it comes from URL */}
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-600 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={candidateEmail}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">This email was verified in the previous step</p>
                </div>

                {/* All other fields remain the same but are pre-filled for existing candidates */}
{/* Gender - 🔥 DISABLED for existing candidates */}
<div>
  <label htmlFor="gender" className="block text-sm font-semibold text-slate-600 mb-2">
    Gender <span className="text-red-500">*</span>
    {isExistingCandidate && (
      <span className="text-xs text-gray-500 ml-2">(Cannot be modified)</span>
    )}
  </label>
  <select
    name="gender"
    id="gender"
    required
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className={`w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] ${
      isExistingCandidate ? 'bg-gray-100 cursor-not-allowed' : ''
    }`}
    disabled={isLoading || isExistingCandidate}
  >
    <option value="">Select Gender</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
  </select>
  {isExistingCandidate && gender && (
    <p className="text-xs text-gray-500 mt-1">
      Previously selected: {gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender}
    </p>
  )}
</div>

{/* Date of Birth - 🔥 DISABLED for existing candidates with age validation */}
<div>
  <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-600 mb-2">
    Date of Birth <span className="text-red-500">*</span>
    {isExistingCandidate && (
      <span className="text-xs text-gray-500 ml-2">(Cannot be modified)</span>
    )}
  </label>
  <input
    type="date"
    name="dateOfBirth"
    id="dateOfBirth"
    required
    value={dateOfBirth}
    onChange={(e) => {
      setDateOfBirth(e.target.value);
      // Clear any previous age-related errors when date changes
      if (error && error.includes('18 years old')) {
        setError(null);
      }
    }}
    className={`w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] ${
      isExistingCandidate ? 'bg-gray-100 cursor-not-allowed' : ''
    }`}
    disabled={isLoading || isExistingCandidate}
    // Set max date to 18 years ago
    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
  />
  {/* 🔥 ENHANCED: Show calculated age with validation */}
  {dateOfBirth && (
    <div className="mt-1">
      {(() => {
        const age = calculateAge(dateOfBirth);
        const isValidAge = age >= 18;
        
        return (
          <p className={`text-xs mt-1 ${isValidAge ? 'text-gray-600' : 'text-red-600 font-medium'}`}>
            {isValidAge ? (
              <>Age: {age} years old</>
            ) : (
              <>⚠️ Age: {age} years old - You must be at least 18 years old to apply</>
            )}
          </p>
        );
      })()}
    </div>
  )}
  {isExistingCandidate && dateOfBirth && (
    <p className="text-xs text-gray-500 mt-1">
      Age: {calculateAge(dateOfBirth)} years old
    </p>
  )}
</div>

  {/* Phone Number with Country Code */}
<div className="sm:col-span-2">
  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-600 mb-2">
    Phone Number <span className="text-red-500">*</span>
  </label>
  <div className="flex space-x-2">
    {/* Country Code Selector */}
    <div className="relative w-32" ref={countryCodeRef}>
      <input
        type="text"
        value={`${countryCode} ${countryCodeSearch}`}
        onChange={(e) => {
          const value = e.target.value;
          if (value.startsWith('+')) {
            const parts = value.split(' ');
            if (parts.length > 1) {
              setCountryCode(parts[0]);
              setCountryCodeSearch(parts.slice(1).join(' '));
            } else {
              setCountryCodeSearch('');
            }
          } else {
            setCountryCodeSearch(value);
          }
        }}
        onFocus={() => setShowCountryCodeList(true)}
        className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
        placeholder="+358"
        disabled={isLoading}
        autoComplete="off"
      />
      
{/* Country Code Dropdown */}
{showCountryCodeList && (
  <div className="absolute z-10 w-80 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
    {filteredCountryCodes.map((item) => (
      <div
        key={item.iso} // 🔥 FIX: Use ISO code as unique key instead of country code
        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
        onClick={() => {
          setCountryCode(item.code);
          setCountryCodeSearch('');
          setShowCountryCodeList(false);
        }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{item.flag}</span>
          <span className="font-medium">{item.code}</span>
          <span className="text-sm text-slate-600">{item.country}</span>
        </div>
      </div>
    ))}
  </div>
)}
    </div>

    {/* Phone Number Input */}
    <div className="flex-1">
      <input
        type="tel"
        name="phoneNumber"
        id="phoneNumber"
        required
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
        placeholder="452644966"
        disabled={isLoading}
      />
    </div>
  </div>
  
  {/* Show complete phone number preview */}
  {phoneNumber && countryCode && (
    <p className="text-xs text-gray-500 mt-1">
      Complete number: <strong>{countryCode} {phoneNumber}</strong>
    </p>
  )}
</div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-slate-600 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="Enter your city"
                    disabled={isLoading}
                  />
                </div>

{/* Country */}
<div className="relative" ref={countryRef}>
  <label htmlFor="country" className="block text-sm font-semibold text-slate-600 mb-2">
    Country <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="countrySearch"
    id="countrySearch"
    value={countrySearch}
    onChange={(e) => {
      const value = e.target.value;
      setCountrySearch(value);
      // ✅ Auto-set country if exact match exists
      if (countries.includes(value)) {
        setCountry(value);
      } else {
        setCountry("");
      }
      setShowCountryList(true);
    }}
    onFocus={() => setShowCountryList(true)}
    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
    placeholder="Search and select your country"
    disabled={isLoading}
    autoComplete="off"
  />
  {showCountryList && filteredCountries.length > 0 && (
    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {filteredCountries.map((countryOption, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            setCountry(countryOption);
            setCountrySearch(countryOption);
            setShowCountryList(false);
          }}
          className="w-full px-4 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
        >
          {countryOption}
        </button>
      ))}
    </div>
  )}
</div>

              {/* ✅ Nationality */}
<div className="relative" ref={nationalityRef}>
  <label htmlFor="nationality" className="block text-sm font-semibold text-slate-600 mb-2">
    Nationality <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="nationalitySearch"
    id="nationalitySearch"
    required
    value={nationalitySearch}
    onChange={(e) => {
      const value = e.target.value;
      setNationalitySearch(value);
      // ✅ Auto-set nationality if exact match exists
      if (countries.includes(value)) {
        setNationality(value);
      } else {
        setNationality("");
      }
      setShowNationalityList(true);
    }}
    onFocus={() => setShowNationalityList(true)}
    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
    placeholder="Search and select your nationality"
    disabled={isLoading}
    autoComplete="off"
  />
  {showNationalityList && filteredNationalities.length > 0 && (
    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {filteredNationalities.map((nationalityOption, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            setNationality(nationalityOption);
            setNationalitySearch(nationalityOption);
            setShowNationalityList(false);
          }}
          className="w-full px-4 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
        >
          {nationalityOption}
        </button>
      ))}
    </div>
  )}
</div>

                {/* ✅ Double Nationality (Optional) */}
                <div className="relative" ref={doubleNationalityRef}>
                  <label htmlFor="doubleNationality" className="block text-sm font-semibold text-slate-600 mb-2">
                    Second Nationality <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="doubleNationalitySearch"
                    id="doubleNationalitySearch"
                    value={doubleNationalitySearch}
                    onChange={(e) => {
                      setDoubleNationalitySearch(e.target.value);
                      setDoubleNationality(""); // Clear selection when typing
                      setShowDoubleNationalityList(true);
                    }}
                    onFocus={() => setShowDoubleNationalityList(true)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder="Search and select second nationality (if any)"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  {showDoubleNationalityList && filteredDoubleNationalities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredDoubleNationalities.map((doubleNationalityOption, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setDoubleNationality(doubleNationalityOption);
                            setDoubleNationalitySearch(doubleNationalityOption);
                            setShowDoubleNationalityList(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                        >
                          {doubleNationalityOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

{/* Job Category */}
<div className="sm:col-span-2">
  <label htmlFor="jobCategory" className="block text-sm font-semibold text-slate-600 mb-2">
    Job Category <span className="text-red-500">*</span>
  </label>
  <select
    name="jobCategory"
    id="jobCategory"
    required
    value={selectedCategory}
    onChange={handleCategorySelection}
    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
    disabled={isLoading}
  >
    <option value="">Select a category first</option>
    {JOB_CATEGORIES.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>
</div>

{/* Job Title */}
<div className="sm:col-span-2">
  <label htmlFor="jobTitle" className="block text-sm font-semibold text-slate-600 mb-2">
    Job Position <span className="text-red-500">*</span>
  </label>
  <select
    name="jobTitle"
    id="jobTitle"
    required
    value={jobTitle}
    onChange={handleJobSelection}
    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
    disabled={isLoading || !selectedCategory}
  >
    <option value="">
      {selectedCategory ? 'Select a job position' : 'Please select a category first'}
    </option>
    {filteredJobs.map((job) => (
      <option key={job.id} value={job.id}>
        {job.title}
      </option>
    ))}
  </select>
  {/* ✅ Add debug info */}
  {selectedCategory && (
    <div className="mt-2 text-xs text-gray-500">
      Debug: Found {filteredJobs.length} jobs for category "{selectedCategory}"
      {filteredJobs.length > 0 && (
        <div className="mt-1">
          Jobs: {filteredJobs.map(job => job.title).join(', ')}
        </div>
      )}
    </div>
  )}
  {selectedJob && (
    <div className="mt-3 p-3 bg-slate-100 border border-slate-200 rounded-lg">
      <h4 className="font-semibold text-[#003A70] mb-1">Job Description:</h4>
      <p className="text-sm text-slate-700">{selectedJob.description}</p>
      <p className="text-xs text-slate-500 mt-1">Category: {selectedJob.category}</p>
    </div>
  )}
</div>

                {/* ✅ Updated Specialty Field - Now loads from selected job */}
                <div className="sm:col-span-2 relative" ref={specialtyRef}>
                  <label htmlFor="specialty" className="block text-sm font-semibold text-slate-600 mb-2">
                    Specialty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialtySearch"
                    id="specialtySearch"
                    required
                    value={specialtySearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSpecialtySearch(value);
                      if (availableSpecialties.includes(value)) {
                        setSpecialty(value);
                      } else {
                        setSpecialty('');
                      }
                      setShowSpecialtyList(true);
                    }}
                    onFocus={() => setShowSpecialtyList(true)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    placeholder={selectedJob ? "Search and select your specialty" : "Please select a job position first"}
                    disabled={isLoading || !selectedJob}
                    autoComplete="off"
                  />
                  {showSpecialtyList && filteredSpecialties.length > 0 && selectedJob && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSpecialties.map((spec, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSpecialty(spec);
                            setSpecialtySearch(spec);
                            setShowSpecialtyList(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedJob && availableSpecialties.length > 0 && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Available Specialties:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {availableSpecialties.map((spec, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedJob && availableSpecialties.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">No specialties defined for this job position. Please contact admin.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section - keep existing */}
            <div className="bg-slate-50 p-5 sm:p-6 rounded-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">Additional Information</h2>
              <div className="space-y-4">
                {additionalInfo.map((info, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={info.type}
                      onChange={(e) => {
                        const newInfo = [...additionalInfo];
                        newInfo[index] = {...newInfo[index], type: e.target.value as 'link' | 'file' | 'text', content: '', file: undefined};
                        setAdditionalInfo(newInfo);
                      }}
                      className="px-3 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] bg-white min-w-[100px]"
                      disabled={isLoading}
                    >
                      <option value="link">Link</option>
                      <option value="file">File</option>
                      <option value="text">Text</option>
                    </select>
                    
                    <div className="flex-1 w-full">
                      {info.type === 'link' && (
                        <input type="url" value={info.content} onChange={(e) => updateAdditionalInfo(index, e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                          placeholder="https://linkedin.com/in/yourprofile" disabled={isLoading} />
                      )}
                      {info.type === 'file' && (
                        <input type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) { updateAdditionalInfo(index, file.name, file); } }}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-[#003A70] hover:file:bg-slate-200"
                          disabled={isLoading} />
                      )}
                      {info.type === 'text' && (
                        <textarea value={info.content} onChange={(e) => updateAdditionalInfo(index, e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                          placeholder="Enter additional notes..." rows={2} disabled={isLoading} />
                      )}
                    </div>
                    
                    {additionalInfo.length > 1 && (
                      <button type="button" onClick={() => removeAdditionalInfo(index)}
                        className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 self-center sm:self-auto"
                        disabled={isLoading}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="button" onClick={() => addAdditionalInfo('link')} disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-sky-100 text-sky-800 rounded-lg hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span>Add Link</span>
                  </button>
                  <button type="button" onClick={() => addAdditionalInfo('file')} disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    <span>Add File</span>
                  </button>
                  <button type="button" onClick={() => addAdditionalInfo('text')} disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-violet-100 text-violet-800 rounded-lg hover:bg-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    <span>Add Text</span>
                  </button>
                </div>
              </div>
            </div>
            
      
            {/* File Upload Section - 🔥 Always require new files */}
            <div className="bg-slate-50 p-5 sm:p-6 rounded-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">
                Required Documents
                {isExistingCandidate && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Please upload fresh copies of your documents)
                  </span>
                )}
              </h2>
              
            {/* 🔥 UPDATED: Show existing candidate notice */}
            {isExistingCandidate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700">
                    <strong>Welcome back!</strong> We've pre-filled your information from your previous application. 
                    You can modify any details except your <strong>name, gender, and date of birth</strong>. Files need to be uploaded again.
                  </p>
                </div>
              </div>
            )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* CV Upload */}
                <div>
                  <label htmlFor="cv" className="block text-sm font-semibold text-slate-600 mb-2">
                    CV/Resume <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="cv"
                    id="cv"
                    required
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
                </div>

                {/* Passport Upload */}
                <div>
                  <label htmlFor="passport" className="block text-sm font-semibold text-slate-600 mb-2">
                    Passport/ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="passport"
                    id="passport"
                    required
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG</p>
                </div>

                {/* Photo Upload */}
                <div className="sm:col-span-2">
                  <label htmlFor="photo" className="block text-sm font-semibold text-slate-600 mb-2">
                    Professional Photo <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    name="photo"
                    id="photo"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG (Optional)</p>
                </div>
              </div>
            </div>

       {/* Submit Button */}
            <div className="text-center">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-12 py-4 bg-[#003A70] text-white font-bold text-lg tracking-wide rounded-xl shadow-lg hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003A70] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Application...</span>
                  </div>
                ) : (
                  `${isExistingCandidate ? 'Submit New Application' : 'Submit Application'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <SuccessToast
        message={success ? `${success} Redirecting to your dashboard...` : ''}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        duration={3000}
      />

{/* 🔥 DEBUG: Show loaded data in development */}
{process.env.NODE_ENV === 'development' && isExistingCandidate && existingCandidateData && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
    <details>
      <summary className="text-sm font-medium text-yellow-800 cursor-pointer">
        🐛 Debug: Loaded Data (Development Only)
      </summary>
      <div className="text-xs text-yellow-700 mt-2 space-y-2">
        <div>
          <strong>Raw Data from Database:</strong>
          <pre className="overflow-auto bg-yellow-100 p-2 rounded text-xs">
            {JSON.stringify(existingCandidateData, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Current Form State:</strong>
          <pre className="overflow-auto bg-yellow-100 p-2 rounded text-xs">
            {JSON.stringify({
              firstName,
              lastName,
              gender,
              dateOfBirth,
              countryCode,
              phoneNumber,
              city,
              country,
              nationality,
              doubleNationality,
              websites: websites.filter(w => w.trim() !== '')
            }, null, 2)}
          </pre>
        </div>
      </div>
    </details>
  </div>
)}
      {/* Footer remains the same */}
      <footer className="bg-[#003A70] text-white">
          <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div>
                      <Image src="/logo-skills-white.png" alt="International Skills" width={180} height={45} className="mb-4" />
                      <p className="text-sm text-slate-300">
                          Connecting talented professionals with international opportunities.
                      </p>
                  </div>
                  
                  <div>
                      <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">Contact</h3>
                      <div className="mt-4 space-y-3 text-sm text-slate-300">
                          <p className="flex items-center"><span className="mr-2 opacity-80">📧</span> wassim@internationalskills.fi</p>
                          <p className="flex items-center"><span className="mr-2 opacity-80">📞</span> +358 452644966</p>
                          <p className="flex items-center"><span className="mr-2 opacity-80">📞</span> +216 29 581 180</p>
                      </div>
                  </div>

                  <div>
                      <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">Suivez-nous</h3>
                      <div className="mt-4 flex space-x-5">
                          <SocialIcon href="https://www.linkedin.com/company/international-skills-labor-company/">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/></svg>
                          </SocialIcon>
                          <SocialIcon href="https://www.facebook.com/profile.php?id=61571369068485">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                          </SocialIcon>
                          <SocialIcon href="https://www.instagram.com/internationalskillscompany?igsh=MTI4enh4ODNzOGN5Mw%3D%3D">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" clipRule="evenodd" /><path d="M16.95 6.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z" /></svg>
                          </SocialIcon>
                      </div>
                  </div>
              </div>
              <div className="mt-12 border-t border-slate-700 pt-8 text-center">
                  <p className="text-sm text-slate-400">© 2025 Wassim Abbessi. All Rights Reserved.</p>
              </div>
          </div>
      </footer>
    </div>
  );
}
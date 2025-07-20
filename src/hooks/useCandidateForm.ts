// src/hooks/useCandidateForm.ts
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '@/lib/firebase';

export const useCandidateForm = () => {
  const router = useRouter();
  
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
  const [additionalInfo, setAdditionalInfo] = useState<{type: 'link' | 'file' | 'text', content: string, file?: File}[]>([{type: 'link', content: ''}]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const filteredJobs = jobs.filter(job => job.category === selectedCategory);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      setCandidateEmail(email);
      loadExistingCandidateData(email);
    } else {
      router.push('/');
    }
  }, [router]);

  const loadExistingCandidateData = async (email: string) => {
    try {
      const response = await fetch('/api/get-candidate-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
    
      if (response.ok && result.applications && result.applications.length > 0) {
        const latestApplication = result.applications[0];
        
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
        
        if (latestApplication.websites && Array.isArray(latestApplication.websites) && latestApplication.websites.length > 0) {
          const validWebsites = latestApplication.websites.filter((w: string) => w && w.trim() !== '');
          setWebsites(validWebsites.length > 0 ? [...validWebsites, ''] : ['']);
        } else {
          setWebsites(['']);
        }
      }
    } catch (error) {
      console.error('Error loading existing candidate data:', error);
    }
  };

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

  useEffect(() => {
    if (selectedCategory) {
      const filtered = jobs.filter(job => job.category === selectedCategory);
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
        const data = await response.json();
        if (response.ok) {
          setJobs(data.jobs || []);
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJob && selectedJob.specialties) {
      setAvailableSpecialties(selectedJob.specialties);
      setSpecialty('');
    } else {
      setAvailableSpecialties([]);
    }
  }, [selectedJob]);

  const handleCategorySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

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
      } else if (name === 'photo') {
        setPhotoFile(files[0]);
      }
    }
  };

  const checkDuplicateApplication = async (email: string, jobId: string, jobCategory: string) => {
    try {
      const candidatesRef = collection(db, "candidates");
      
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
          message: `You have already applied for this position on ${formattedDate}. You can apply again after 6 months.`,
        };
      }
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const categoryQuery = query(
        candidatesRef,
        where("email", "==", email.toLowerCase().trim()),
        where("jobCategory", "==", jobCategory),
        where("submittedAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
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
      console.error('Error checking duplicate applications:', error);
      return { isDuplicate: false, message: '' };
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateAge = (dateOfBirth: string): { isValid: boolean; age: number; message?: string } => {
    if (!dateOfBirth) {
      return { isValid: false, age: 0, message: 'Date of birth is required' };
    }
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      return { 
        isValid: false, 
        age, 
        message: `You must be at least 18. Your age is ${age}.` 
      };
    }
    return { isValid: true, age, message: '' };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const ageValidation = validateAge(dateOfBirth);
    if (!ageValidation.isValid) {
      setError(ageValidation.message || 'Age validation failed.');
      return;
    }

    if (!firstName || !lastName || !candidateEmail || !gender || !countryCode || !phoneNumber || !dateOfBirth || !city || !country || !nationality || !selectedCategory || !jobTitle || !specialty || !cvFile || !passportFile) {
      setError("Please fill all required fields.");
      return;
    }

    if (!availableSpecialties.includes(specialty)) {
      setError("Please select a valid specialty.");
      return;
    }

    setIsLoading(true);

    try {
      const duplicateCheck = await checkDuplicateApplication(candidateEmail, jobTitle, selectedCategory);
      if (duplicateCheck.isDuplicate) {
        setError(duplicateCheck.message);
        setIsLoading(false);
        return;
      }

      const cvFileName = `cv_${Date.now()}_${cvFile.name}`;
      const passportFileName = `passport_${Date.now()}_${passportFile.name}`;
      
      const cvStorageRef = ref(storage, `candidate_files/${cvFileName}`);
      const passportStorageRef = ref(storage, `candidate_files/${passportFileName}`);

      const [cvUploadTask, passportUploadTask] = await Promise.all([
        uploadBytes(cvStorageRef, cvFile),
        uploadBytes(passportStorageRef, passportFile)
      ]);

      const [cvUrl, passportUrl] = await Promise.all([
        getDownloadURL(cvUploadTask.ref),
        getDownloadURL(passportUploadTask.ref)
      ]);
      
      let photoUrl = null;
      if (photoFile) {
        const photoFileName = `photo_${Date.now()}_${photoFile.name}`;
        const photoStorageRef = ref(storage, `candidate_files/${photoFileName}`);
        const photoUploadTask = await uploadBytes(photoStorageRef, photoFile);
        photoUrl = await getDownloadURL(photoUploadTask.ref);
      }

      const normalizedEmail = candidateEmail.toLowerCase().trim();

      await addDoc(collection(db, "candidates"), {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
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
        websites: websites.filter(w => w.trim() !== ''),
        cvUrl,
        passportUrl,
        photoUrl,
        submittedAt: serverTimestamp(),
        status: 'submitted',
        score: null,
        applicationSource: 'web_form',
        lastUpdated: serverTimestamp()
      });

      setSuccess("Application submitted successfully!");
      setShowSuccessToast(true);

      setTimeout(() => {
        router.push(`/candidate-dashboard?email=${encodeURIComponent(normalizedEmail)}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? `Submission failed: ${err.message}` : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    firstName, setFirstName,
    lastName, setLastName,
    email: candidateEmail,
    gender, setGender,
    countryCode, setCountryCode,
    phoneNumber, setPhoneNumber,
    dateOfBirth, setDateOfBirth,
    city, setCity,
    country, setCountry,
    nationality, setNationality,
    doubleNationality, setDoubleNationality,
    jobTitle, setJobTitle,
    specialty, setSpecialty,
    specialtySearch, setSpecialtySearch,
    websites, setWebsites,
    additionalInfo, setAdditionalInfo,
    cvFile, setCvFile,
    passportFile, setPassportFile,
    photoFile, setPhotoFile,
    jobs,
    selectedCategory,
    filteredJobs,
    selectedJob,
    availableSpecialties,
    isLoading,
    error,
    success,
    showSuccessToast, setShowSuccessToast,
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
  };
};

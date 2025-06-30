"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from 'next/image';

import SuccessToast from './components/SuccessToast';

export default function CandidateForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [countryCode, setCountryCode] = useState('+358');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [websites, setWebsites] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState<{type: 'link' | 'file' | 'text', content: string, file?: File}[]>([{type: 'link', content: ''}]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Country codes list
  const countryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' }
  ];

  // Countries list for country field
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada',
    'China', 'Czech Republic', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'India',
    'Italy', 'Japan', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Poland', 'Portugal', 'Russia',
    'Saudi Arabia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Tunisia', 'Turkey', 'UAE',
    'United Kingdom', 'United States'
  ];

  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Additional information management functions
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

  // Website management functions (keeping for backward compatibility)
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

  // Load jobs on component mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        if (response.ok) {
          setJobs(data.jobs || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    };
    loadJobs();
  }, []);

  // Filter jobs when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = jobs.filter(job => job.category === selectedCategory);
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs([]);
    }
    // Reset job selection when category changes
    setJobTitle('');
    setSelectedJob(null);
  }, [selectedCategory, jobs]);

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
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Updated validation to include job category and title
    if (!firstName || !lastName || !email || !gender || !countryCode || !phoneNumber || !dateOfBirth || !city || !country || !selectedCategory || !jobTitle || !cvFile || !passportFile) {
      setError("Please fill in all required fields and upload both files.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload files to Firebase Storage
      const cvFileName = `cv_${Date.now()}_${cvFile.name}`;
      const passportFileName = `passport_${Date.now()}_${passportFile.name}`;

      const cvStorageRef = ref(storage, `candidate_files/${cvFileName}`);
      const passportStorageRef = ref(storage, `candidate_files/${passportFileName}`);

      const cvUploadTask = await uploadBytes(cvStorageRef, cvFile);
      const passportUploadTask = await uploadBytes(passportStorageRef, passportFile);

      const cvUrl = await getDownloadURL(cvUploadTask.ref);
      const passportUrl = await getDownloadURL(passportUploadTask.ref);

      // 2. Add candidate data to Firestore (updated fields)
      const candidatesCollectionRef = collection(db, "candidates");
      await addDoc(candidatesCollectionRef, {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`, // Keep for backward compatibility
        email,
        gender,
        countryCode,
        phoneNumber: `${countryCode} ${phoneNumber}`,
        dateOfBirth,
        city,
        country,
        jobCategory: selectedCategory,
        jobTitle,
        jobTitleText: selectedJob?.title || '',
        websites: websites.filter(w => w.trim() !== ''),
        cvUrl,
        passportUrl,
        submittedAt: serverTimestamp(),
        status: 'submitted',
        score: null
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setGender('');
      setCountryCode('+358');
      setPhoneNumber('');
      setDateOfBirth('');
      setCity('');
      setCountry('');
      setCountrySearch('');
      setSelectedCategory('');
      setJobTitle('');
      setSelectedJob(null);
      setWebsites(['']);
      setCvFile(null);
      setPassportFile(null);
      
      // Reset file input fields visually
      const cvInput = document.getElementById('cv') as HTMLInputElement;
      const passportInput = document.getElementById('passport') as HTMLInputElement;
      if (cvInput) cvInput.value = '';
      if (passportInput) passportInput.value = '';

      setSuccess("Application submitted successfully!");
      setShowSuccessToast(true);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Image 
              src="/logo-skills.png" 
              alt="International Skills" 
              width={200} 
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span>📞</span>
              <span>+358 452644966</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✉️</span>
              <span>wassim@internationalskills.fi</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl p-4 sm:p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Candidate Application</h1>
            <p className="text-gray-600">Apply for your dream job opportunity</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your first name"
                    disabled={isLoading}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your last name"
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-3 border border-gray-300 rounded-t-lg sm:rounded-l-lg sm:rounded-t-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 w-full sm:w-auto"
                      disabled={isLoading}
                    >
                      {countryCodes.map((item, index) => (
                        <option key={index} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-4 py-3 border-t-0 sm:border-l-0 sm:border-t border-gray-300 rounded-b-lg sm:rounded-r-lg sm:rounded-b-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 456 789"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your city"
                    disabled={isLoading}
                  />
                </div>

                {/* Country */}
                <div className="relative sm:col-span-2">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="countrySearch"
                    id="countrySearch"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    onFocus={() => setCountrySearch('')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search and select your country"
                    disabled={isLoading}
                  />
                  {countrySearch !== '' && filteredCountries.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCountries.map((countryOption, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setCountry(countryOption);
                            setCountrySearch(countryOption);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                        >
                          {countryOption}
                        </button>
                      ))}
                    </div>
                  )}
                  {country && (
                    <div className="mt-1 text-sm text-green-600">
                      Selected: {country}
                    </div>
                  )}
                </div>

                {/* Job Category */}
                <div className="sm:col-span-2">
                  <label htmlFor="jobCategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobCategory"
                    id="jobCategory"
                    required
                    value={selectedCategory}
                    onChange={handleCategorySelection}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Select a category first</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Title */}
                <div className="sm:col-span-2">
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobTitle"
                    id="jobTitle"
                    required
                    value={jobTitle}
                    onChange={handleJobSelection}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  {selectedJob && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">Job Description:</h4>
                      <p className="text-sm text-blue-800">{selectedJob.description}</p>
                      <p className="text-xs text-blue-600 mt-1">Category: {selectedJob.category}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
              
              {/* Dynamic Additional Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Links, Files & Additional Information (Optional)
                </label>
                <div className="space-y-3">
                  {additionalInfo.map((info, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <select
                        value={info.type}
                        onChange={(e) => {
                          const newInfo = [...additionalInfo];
                          newInfo[index] = {...newInfo[index], type: e.target.value as 'link' | 'file' | 'text', content: '', file: undefined};
                          setAdditionalInfo(newInfo);
                        }}
                        className="px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 min-w-[100px]"
                        disabled={isLoading}
                      >
                        <option value="link">Link</option>
                        <option value="file">File</option>
                        <option value="text">Text</option>
                      </select>
                      
                      {info.type === 'link' && (
                        <input
                          type="url"
                          value={info.content}
                          onChange={(e) => updateAdditionalInfo(index, e.target.value)}
                          className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://linkedin.com/in/yourprofile or https://github.com/yourusername"
                          disabled={isLoading}
                        />
                      )}
                      
                      {info.type === 'file' && (
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateAdditionalInfo(index, file.name, file);
                            }
                          }}
                          className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          disabled={isLoading}
                        />
                      )}
                      
                      {info.type === 'text' && (
                        <textarea
                          value={info.content}
                          onChange={(e) => updateAdditionalInfo(index, e.target.value)}
                          className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter additional information, notes, or comments..."
                          rows={2}
                          disabled={isLoading}
                        />
                      )}
                      
                      {additionalInfo.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAdditionalInfo(index)}
                          className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 self-center sm:self-auto"
                          disabled={isLoading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Add buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => addAdditionalInfo('link')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Add Link</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => addAdditionalInfo('file')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span>Add File</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => addAdditionalInfo('text')}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      <span>Add Text</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Required Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* CV Upload */}
                <div>
                  <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="cv"
                    id="cv"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX only.</p>
                </div>

                {/* Passport Upload */}
                <div>
                  <label htmlFor="passport" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Passport/ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="passport"
                    id="passport"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG only.</p>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <SuccessToast
        message={success || ''}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm">
                <p>📧 wassim@internationalskills.fi</p>
                <p>📞 +358 452644966</p>
                <p>📞 +216 29 581 180</p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="space-y-2 text-sm">
                <a href="https://www.facebook.com/profile.php?id=61571369068485" target="_blank" rel="noopener noreferrer" className="block hover:text-blue-300 transition-colors">
                  📘 Facebook
                </a>
                <a href="https://www.instagram.com/internationalskillscompany?igsh=MTI4enh4ODNzOGN5Mw%3D%3D" target="_blank" rel="noopener noreferrer" className="block hover:text-blue-300 transition-colors">
                  📷 Instagram
                </a>
                <a href="https://www.linkedin.com/company/international-skills-labor-company/" target="_blank" rel="noopener noreferrer" className="block hover:text-blue-300 transition-colors">
                  💼 LinkedIn
                </a>
              </div>
            </div>

            {/* Company Info */}
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">International Skills</h3>
              <p className="text-sm text-gray-300">
                Connecting talented professionals with international opportunities.
              </p>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-4 text-center text-sm text-gray-300">
            <p>&copy; 2024 International Skills. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


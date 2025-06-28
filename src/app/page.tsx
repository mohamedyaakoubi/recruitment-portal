"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from 'next/image';

export default function CandidateForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [websites, setWebsites] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load jobs on component mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
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

  const handleJobSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedJobId = e.target.value;
    setJobTitle(selectedJobId);
    const job = jobs.find(j => j.id === selectedJobId);
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

    // Updated validation to include job title
    if (!fullName || !email || !gender || !phoneNumber || !dateOfBirth || !city || !country || !jobTitle || !cvFile || !passportFile) {
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
        fullName,
        email,
        gender,
        phoneNumber,
        dateOfBirth,
        city,
        country,
        jobTitle,
        jobTitleText: selectedJob?.title || '',
        websites: websites.split(',').map(w => w.trim()).filter(w => w),
        cvUrl,
        passportUrl,
        submittedAt: serverTimestamp(),
        status: 'submitted',
        score: null
      });

      // Reset form
      setFullName('');
      setEmail('');
      setGender('');
      setPhoneNumber('');
      setDateOfBirth('');
      setCity('');
      setCountry('');
      setJobTitle('');
      setSelectedJob(null);
      setWebsites('');
      setCvFile(null);
      setPassportFile(null);
      
      // Reset file input fields visually
      const cvInput = document.getElementById('cv') as HTMLInputElement;
      const passportInput = document.getElementById('passport') as HTMLInputElement;
      if (cvInput) cvInput.value = '';
      if (passportInput) passportInput.value = '';

      setSuccess("Application submitted successfully!");

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
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Application</h1>
            <p className="text-gray-600">Apply for your dream job opportunity</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div>
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
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+358 123 456 789"
                    disabled={isLoading}
                  />
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
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your country"
                    disabled={isLoading}
                  />
                </div>

                {/* Job Title */}
                <div className="md:col-span-2">
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
                    disabled={isLoading}
                  >
                    <option value="">Select a job position</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                  {selectedJob && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">Job Description:</h4>
                      <p className="text-sm text-blue-800">{selectedJob.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
              
              {/* Websites */}
              <div className="mb-6">
                <label htmlFor="websites" className="block text-sm font-medium text-gray-700 mb-2">
                  Websites (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  name="websites"
                  id="websites"
                  value={websites}
                  onChange={(e) => setWebsites(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., LinkedIn, GitHub, Portfolio"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <div>
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


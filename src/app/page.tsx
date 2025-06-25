'use client';

import React, { useState, FormEvent } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CandidateForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(''); // Added email state
  const [coverLetter, setCoverLetter] = useState('');
  const [websites, setWebsites] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setIsLoading(true);

    try {
      // Generate filenames
      const cvFileName = `cv_${Date.now()}_${cvFile!.name}`;
      const passportFileName = `passport_${Date.now()}_${passportFile!.name}`;

      // Create storage references
      const cvStorageRef = ref(storage, `candidate_files/${cvFileName}`);
      const passportStorageRef = ref(
        storage,
        `candidate_files/${passportFileName}`
      );

      // Upload files and get URLs in parallel
      const [cvUpload, passportUpload] = await Promise.all([
        uploadBytes(cvStorageRef, cvFile!),
        uploadBytes(passportStorageRef, passportFile!),
      ]);

      const [cvUrl, passportUrl] = await Promise.all([
        getDownloadURL(cvUpload.ref),
        getDownloadURL(passportUpload.ref),
      ]);

      // Add to Firestore
      const candidatesCollectionRef = collection(db, 'candidates');
      await addDoc(candidatesCollectionRef, {
        fullName,
        email,
        coverLetter,
        websites: websites
          .split(',')
          .map((w) => w.trim())
          .filter((w) => w),
        cvUrl,
        passportUrl,
        submittedAt: serverTimestamp(),
        status: 'submitted',
        score: null,
      });
      // Reset form and show success message
      setFullName('');
      setEmail(''); // Reset email
      setCoverLetter('');
      setWebsites('');
      setCvFile(null);
      setPassportFile(null);
      // Reset file input fields visually
      const cvInput = document.getElementById('cv') as HTMLInputElement;
      const passportInput = document.getElementById(
        'passport'
      ) as HTMLInputElement;
      if (cvInput) cvInput.value = '';
      if (passportInput) passportInput.value = '';

      setSuccess('Application submitted successfully!');
    } catch (err) {
      console.error('Error submitting application:', err);
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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Candidate Application
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

          {/* Email - Added */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="your.email@example.com"
              disabled={isLoading}
            />
          </div>

          {/* Cover Letter */}
          <div>
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium text-gray-700"
            >
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              name="coverLetter"
              id="coverLetter"
              rows={4}
              required
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Paste your cover letter here"
              disabled={isLoading}
            ></textarea>
          </div>

          {/* Websites */}
          <div>
            <label
              htmlFor="websites"
              className="block text-sm font-medium text-gray-700"
            >
              Websites (Optional, comma-separated)
            </label>
            <input
              type="text"
              name="websites"
              id="websites"
              value={websites}
              onChange={(e) => setWebsites(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., LinkedIn, GitHub, Portfolio"
              disabled={isLoading}
            />
          </div>

          {/* CV Upload */}
          <div>
            <label
              htmlFor="cv"
              className="block text-sm font-medium text-gray-700"
            >
              Upload CV <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="cv"
              id="cv"
              required
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX only.</p>
          </div>

          {/* Passport Upload */}
          <div>
            <label
              htmlFor="passport"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Passport/ID <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="passport"
              id="passport"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG only.</p>
          </div>

          {/* Status Messages */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

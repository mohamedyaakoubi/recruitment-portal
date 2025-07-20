"use client";

import React from 'react';
import { useCandidateForm } from '@/hooks/useCandidateForm';
import Header from '../components/candidate-form/Header';
import Footer from '../components/candidate-form/Footer';
import PersonalInfoSection from '../components/candidate-form/PersonalInfoSection';
import JobApplicationSection from '../components/candidate-form/JobApplicationSection';
import FileUploadSection from '../components/candidate-form/FileUploadSection';
import AdditionalInfoSection from '../components/candidate-form/AdditionalInfoSection';
import SuccessToast from '../components/ui/SuccessToast';

export default function CandidateForm() {
  const {
    firstName, setFirstName,
    lastName, setLastName,
    email,
    gender, setGender,
    countryCode, setCountryCode,
    phoneNumber, setPhoneNumber,
    dateOfBirth, setDateOfBirth,
    city, setCity,
    country, setCountry,
    nationality, setNationality,
    doubleNationality, setDoubleNationality,
    jobTitle,
    specialty, setSpecialty,
    specialtySearch, setSpecialtySearch,
    websites, setWebsites,
    additionalInfo, setAdditionalInfo,
    // 🔥 ADD: Missing destructured properties
    cvFile,
    passportFile,
    photoFile,
    isLoading,
    error,
    success,
    showSuccessToast, setShowSuccessToast,
    isExistingCandidate,
    addAdditionalInfo,
    removeAdditionalInfo,
    updateAdditionalInfo,
    handleCategorySelection,
    handleJobSelection,
    handleFileChange,
    handleSubmit,
    selectedCategory,
    filteredJobs,
    selectedJob,
    availableSpecialties,
    // 🔥 ADD: Calculate age function
    calculateAge,
  } = useCandidateForm();

   return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main id="form-start" className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-4xl p-6 sm:p-10 space-y-8 bg-white rounded-xl shadow-2xl shadow-slate-200">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003A70] mb-2">
              {isExistingCandidate ? 'Submit New Application' : 'Candidate Application'}
            </h1>
            <p className="text-slate-500">
              {isExistingCandidate ? 'Submit a new job application' : 'Apply for your dream job opportunity'}
            </p>
            <p className="text-sm text-[#003A70] mt-2">Application for: <strong>{email}</strong></p>
            
            {isExistingCandidate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-blue-700 mb-2">
                      <strong>Welcome back!</strong> We've pre-filled your information.
                    </p>
                    <div className="text-xs text-blue-600 space-y-1">
                      <p><strong>🔒 Locked fields:</strong> Name, gender, and date of birth cannot be modified</p>
                      <p><strong>✏️ Editable fields:</strong> All other information can be updated</p>
                      <p><strong>📁 Files:</strong> Please upload fresh copies of your documents</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <PersonalInfoSection
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              email={email}
              gender={gender} setGender={setGender}
              dateOfBirth={dateOfBirth} setDateOfBirth={setDateOfBirth}
              countryCode={countryCode} setCountryCode={setCountryCode}
              phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
              city={city} setCity={setCity}
              country={country} setCountry={setCountry}
              nationality={nationality} setNationality={setNationality}
              doubleNationality={doubleNationality} setDoubleNationality={setDoubleNationality}
              isLoading={isLoading}
              isExistingCandidate={isExistingCandidate}
            />

            <JobApplicationSection
              selectedCategory={selectedCategory}
              handleCategorySelection={handleCategorySelection}
              jobTitle={jobTitle}
              handleJobSelection={handleJobSelection}
              filteredJobs={filteredJobs}
              selectedJob={selectedJob}
              specialty={specialty}
              setSpecialty={setSpecialty}
              specialtySearch={specialtySearch}
              setSpecialtySearch={setSpecialtySearch}
              availableSpecialties={availableSpecialties}
              isLoading={isLoading}
            />

            <AdditionalInfoSection
              additionalInfo={additionalInfo}
              addAdditionalInfo={addAdditionalInfo}
              removeAdditionalInfo={removeAdditionalInfo}
              updateAdditionalInfo={updateAdditionalInfo}
              isLoading={isLoading}
            />
            
            <FileUploadSection
              handleFileChange={handleFileChange}
              isLoading={isLoading}
              isExistingCandidate={isExistingCandidate}
            />

            <div className="text-center">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
{/* 🔥 FIXED: Debug section with proper null checks */}
{process.env.NODE_ENV === 'development' && (
  <div className="bg-gray-100 p-4 rounded-lg mb-6">
    <h3 className="font-bold text-gray-800 mb-2">Debug Information:</h3>
    <div className="text-xs text-gray-600 space-y-1">
      <p>First Name: "{firstName}" {firstName ? '✅' : '❌'}</p>
      <p>Last Name: "{lastName}" {lastName ? '✅' : '❌'}</p>
      <p>Email: "{email}" {email ? '✅' : '❌'}</p>
      <p>Gender: "{gender}" {gender ? '✅' : '❌'}</p>
      <p>Country Code: "{countryCode}" {countryCode ? '✅' : '❌'}</p>
      <p>Phone: "{phoneNumber}" {phoneNumber ? '✅' : '❌'}</p>
      <p>Date of Birth: "{dateOfBirth}" {dateOfBirth ? '✅' : '❌'}</p>
      <p>City: "{city}" {city ? '✅' : '❌'}</p>
      <p>Country: "{country}" {country ? '✅' : '❌'}</p>
      <p>Nationality: "{nationality}" {nationality ? '✅' : '❌'}</p>
      <p>Category: "{selectedCategory}" {selectedCategory ? '✅' : '❌'}</p>
      <p>Job Title: "{jobTitle}" {jobTitle ? '✅' : '❌'}</p>
      <p>Specialty: "{specialty}" {specialty ? '✅' : '❌'}</p>
      <p>Available Specialties: [{availableSpecialties.join(', ')}]</p>
      <p>Specialty Valid: {availableSpecialties.includes(specialty) ? '✅' : '❌'}</p>
      <p>CV File: {cvFile ? `${cvFile.name} ✅` : 'Missing ❌'}</p>
      <p>Passport File: {passportFile ? `${passportFile.name} ✅` : 'Missing ❌'}</p>
      <p>Photo File: {photoFile ? `${photoFile.name} ✅` : 'Not provided'}</p>
      <p>Age Valid: {dateOfBirth && calculateAge(dateOfBirth) >= 18 ? '✅' : '❌'}</p>
      {dateOfBirth && (
        <p>Calculated Age: {calculateAge(dateOfBirth)} years</p>
      )}
    </div>
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
                    <span>Submitting...</span>
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
        message={success || ''}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      
      <Footer />
    </div>
  );
}
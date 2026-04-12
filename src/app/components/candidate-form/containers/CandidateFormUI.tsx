'use client';

import React from 'react';
import { ThemeSwitcher } from '../../ui/ThemeSwitcher';
import TopBar from '../../common/TopBar';
import Footer from '../../common/Footer';
import PersonalInfoSection from '../PersonalInfoSection';
import JobApplicationSection from '../JobApplicationSection';
import FileUploadSection from '../FileUploadSection';
import AdditionalInfoSection from '../AdditionalInfoSection';
import SuccessToast from '../../ui/SuccessToast';
import DebugInfo from '../DebugInfo';
import { CandidateFormUIProps } from './types';

const CandidateFormUI: React.FC<CandidateFormUIProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  gender,
  setGender,
  phoneValidation,
  countryCode,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
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
  specialty,
  setSpecialty,
  specialtySearch,
  setSpecialtySearch,
  websites: _websites,
  setWebsites: _setWebsites,
  additionalInfo,
  setAdditionalInfo: _setAdditionalInfo,
  cvFile,
  passportFile,
  photoFile,
  isLoading,
  error,
  success,
  showSuccessToast,
  setShowSuccessToast,
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
  calculateAge,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-gray-900">
      <header className="sticky top-0 z-20 bg-white shadow-sm dark:bg-gray-800">
        <TopBar />
        <nav className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <span className="text-xl font-bold text-[#003A70] dark:text-white">
              {process.env.NEXT_PUBLIC_COMPANY_NAME || 'Career Portal'}
            </span>
            <ThemeSwitcher />
          </div>
        </nav>
      </header>

      <main
        id="form-start"
        className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6"
      >
        <div className="w-full max-w-4xl space-y-8 rounded-xl bg-white p-6 shadow-2xl shadow-slate-200 dark:bg-gray-800 dark:shadow-none sm:p-10">
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-extrabold text-[#003A70] dark:text-blue-400 sm:text-4xl">
              {isExistingCandidate ? 'Submit New Application' : 'Candidate Application'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isExistingCandidate
                ? 'Submit a new job application'
                : 'Apply for your dream job opportunity'}
            </p>
            <p className="mt-2 text-sm text-[#003A70] dark:text-blue-400">
              Application for: <strong>{email}</strong>
            </p>

            {isExistingCandidate && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-900/20">
                <div className="flex items-start space-x-3">
                  <svg
                    className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="mb-2 text-sm text-blue-700 dark:text-blue-300">
                      <strong>Welcome back!</strong> We've pre-filled your information.
                    </p>
                    <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                      <p>
                        <strong>🔒 Locked fields:</strong> Name, gender, and date of birth cannot be
                        modified
                      </p>
                      <p>
                        <strong>✏️ Editable fields:</strong> Phone number and other contact
                        information can be updated
                      </p>
                      <p>
                        <strong>📞 Phone validation:</strong> Skipped for existing candidates (your
                        number is already verified)
                      </p>
                      <p>
                        <strong>📁 Files:</strong> Please upload fresh copies of your documents
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" aria-label="Job application form">
            {/* Honeypot field - hidden from users, bots will fill it */}
            <input
              type="text"
              name="website"
              id="website"
              tabIndex={-1}
              autoComplete="off"
              style={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                opacity: 0,
              }}
              aria-hidden="true"
            />

            {/* Hidden timestamp field for timing validation */}
            <input type="hidden" name="form_timestamp" id="form_timestamp" value={Date.now()} />

            <PersonalInfoSection
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              gender={gender}
              setGender={setGender}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              city={city}
              setCity={setCity}
              country={country}
              setCountry={setCountry}
              nationality={nationality}
              setNationality={setNationality}
              doubleNationality={doubleNationality}
              setDoubleNationality={setDoubleNationality}
              isLoading={isLoading}
              isExistingCandidate={isExistingCandidate}
              calculateAge={calculateAge}
              phoneValidation={phoneValidation}
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
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-900/20">
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
              )}
              <DebugInfo
                firstName={firstName}
                lastName={lastName}
                email={email}
                gender={gender}
                countryCode={countryCode}
                phoneNumber={phoneNumber}
                dateOfBirth={dateOfBirth}
                city={city}
                country={country}
                nationality={nationality}
                selectedCategory={selectedCategory}
                jobTitle={jobTitle}
                specialty={specialty}
                availableSpecialties={availableSpecialties}
                cvFile={cvFile}
                passportFile={passportFile}
                photoFile={photoFile}
                calculateAge={calculateAge}
              />

              <button
                type="submit"
                className="w-full transform rounded-xl bg-[#003A70] px-12 py-4 text-lg font-bold tracking-wide text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-[#003A70] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
};

export default CandidateFormUI;

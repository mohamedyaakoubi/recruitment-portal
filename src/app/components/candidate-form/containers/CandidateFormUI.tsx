"use client";

import React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
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
    firstName, setFirstName,
    lastName, setLastName,
    email,
    gender, setGender,
    phoneValidation,
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
    calculateAge,
}) => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
                <TopBar />
                <nav className="max-w-screen-xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between py-4">
                        <Image
                            src={theme === 'dark' ? "/logo-skills-white.png" : "/logo-skills.png"}
                            alt="International Skills Labor Company"
                            width={180}
                            height={45}
                            priority
                        />
                        <ThemeSwitcher />
                    </div>
                </nav>
            </header>

            <main id="form-start" className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6">
                <div className="w-full max-w-4xl p-6 sm:p-10 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-slate-200 dark:shadow-none">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003A70] dark:text-blue-400 mb-2">
                            {isExistingCandidate ? 'Submit New Application' : 'Candidate Application'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {isExistingCandidate ? 'Submit a new job application' : 'Apply for your dream job opportunity'}
                        </p>
                        <p className="text-sm text-[#003A70] dark:text-blue-400 mt-2">Application for: <strong>{email}</strong></p>


                        {isExistingCandidate && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4 mt-4">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                            <strong>Welcome back!</strong> We've pre-filled your information.
                                        </p>
                                        <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                                            <p><strong>🔒 Locked fields:</strong> Name, gender, and date of birth cannot be modified</p>
                                            <p><strong>✏️ Editable fields:</strong> Phone number and other contact information can be updated</p>
                                            <p><strong>📞 Phone validation:</strong> Skipped for existing candidates (your number is already verified)</p>
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
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-4 mb-6">
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
};

export default CandidateFormUI;

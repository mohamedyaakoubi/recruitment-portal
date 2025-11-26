import React, { useState, useEffect, useRef } from 'react';
import { countryCodes, countries } from '@/lib/formData';
import { PersonalInfoSectionProps } from '@/types';
import SearchableDropdown from '../ui/SearchableDropdown';

interface PersonalInfoSectionPropsExtended extends PersonalInfoSectionProps {
  phoneValidation?: {
    isValid: boolean | null;
    isValidating: boolean;
    message: string;
    warning?: string;
  };
}

const PersonalInfoSection: React.FC<PersonalInfoSectionPropsExtended> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  countryCode,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  city,
  setCity,
  country,
  setCountry,
  nationality,
  setNationality,
  doubleNationality,
  setDoubleNationality,
  isLoading,
  isExistingCandidate,
  calculateAge,
  phoneValidation,
}) => {
  const countryCodeRef = useRef<HTMLDivElement>(null);
  const [showCountryCodeList, setShowCountryCodeList] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');

  // 🔥 NEW: Name validation states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');

  // 🔥 NEW: Name validation function
  const validateName = (name: string, fieldName: string): string => {
    if (!name.trim()) {
      return `${fieldName} is required`;
    }

    // Check for numbers
    if (/\d/.test(name)) {
      return `${fieldName} cannot contain numbers`;
    }

    // Check for special characters (allow only letters, spaces, hyphens, and apostrophes)
    if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/.test(name)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }

    // Check for dots
    if (/\./.test(name)) {
      return `${fieldName} cannot contain dots`;
    }

    // Check minimum length
    if (name.trim().length < 2) {
      return `${fieldName} must be at least 2 characters long`;
    }

    // Check maximum length
    if (name.trim().length > 50) {
      return `${fieldName} cannot exceed 50 characters`;
    }

    // Check for excessive spaces
    if (/\s{2,}/.test(name)) {
      return `${fieldName} cannot contain multiple consecutive spaces`;
    }

    // Check if starts or ends with space/hyphen/apostrophe
    if (/^[\s'-]|[\s'-]$/.test(name)) {
      return `${fieldName} cannot start or end with spaces, hyphens, or apostrophes`;
    }

    return '';
  };

  // 🔥 NEW: Handle first name change with validation
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow typing but validate after
    setFirstName(value);

    // Real-time validation
    const error = validateName(value, 'First name');
    setFirstNameError(error);
  };

  // 🔥 NEW: Handle last name change with validation
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow typing but validate after
    setLastName(value);

    // Real-time validation
    const error = validateName(value, 'Last name');
    setLastNameError(error);
  };

  // 🔥 NEW: Handle input key press (prevent certain characters)
  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;

    // Prevent numbers and common special characters from being typed
    if (/[0-9!@#$%^&*()_+=[\]{};:"\\|,.<>?/~`]/.test(char)) {
      e.preventDefault();
      return;
    }
  };

  // 🔥 NEW: Handle paste event to prevent pasting invalid content
  const handleNamePaste = (e: React.ClipboardEvent<HTMLInputElement>, fieldName: string) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData('text');
    const cleanedText = pastedText.replace(/[^a-zA-ZÀ-ÿĀ-žА-я\s'-]/g, '');

    if (fieldName === 'firstName') {
      setFirstName(cleanedText);
      const error = validateName(cleanedText, 'First name');
      setFirstNameError(error);
    } else {
      setLastName(cleanedText);
      const error = validateName(cleanedText, 'Last name');
      setLastNameError(error);
    }
  };

  const filteredCountryCodes = countryCodes.filter(
    (item) =>
      item.country.toLowerCase().includes(countryCodeSearch.toLowerCase()) ||
      item.code.includes(countryCodeSearch) ||
      item.flag.includes(countryCodeSearch)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
        setShowCountryCodeList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="rounded-lg bg-slate-50 p-5 dark:bg-gray-800/50 sm:p-6">
      <h2 className="mb-6 border-b border-slate-200 pb-3 text-xl font-bold text-slate-800 dark:border-gray-700 dark:text-slate-200">
        Personal Information
      </h2>

      {/* Age requirement notice */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-900/20">
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
          <div>
            <h3 className="mb-1 font-semibold text-blue-800 dark:text-blue-300">Age Requirement</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300/80">
              You must be at least <strong>18 years old</strong> to submit an application. Please
              ensure your date of birth is accurate as it will be verified.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* 🔥 UPDATED: First Name with validation */}
        <div>
          <label
            htmlFor="firstName"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            First Name <span className="text-red-500">*</span>
            {isExistingCandidate && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Cannot be modified)
              </span>
            )}
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            value={firstName}
            onChange={handleFirstNameChange}
            onKeyPress={handleNameKeyPress}
            onPaste={(e) => handleNamePaste(e, 'firstName')}
            className={`w-full rounded-lg border px-4 py-3 shadow-sm transition-all duration-300 focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:bg-gray-700 dark:text-white ${
              isExistingCandidate
                ? 'cursor-not-allowed border-slate-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                : firstNameError
                  ? 'border-red-400 bg-red-50 ring-1 ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:ring-red-500/30'
                  : firstName && !firstNameError
                    ? 'border-green-400 bg-green-50 ring-1 ring-green-200 dark:border-green-500 dark:bg-green-900/20 dark:ring-green-500/30'
                    : 'border-slate-300 dark:border-gray-600'
            }`}
            placeholder="Enter your first name"
            disabled={isLoading || isExistingCandidate}
            autoComplete="given-name"
            maxLength={50}
          />

          {/* 🔥 NEW: First name validation feedback */}
          {!isExistingCandidate && firstNameError && (
            <div className="mt-2 flex items-start space-x-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400">{firstNameError}</p>
            </div>
          )}

          {!isExistingCandidate && firstName && !firstNameError && (
            <div className="mt-2 flex items-start space-x-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-green-600 dark:text-green-400">Valid first name</p>
            </div>
          )}

          {!isExistingCandidate && !firstName && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only letters, spaces, hyphens, and apostrophes allowed
            </p>
          )}
        </div>

        {/* 🔥 UPDATED: Last Name with validation */}
        <div>
          <label
            htmlFor="lastName"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Last Name <span className="text-red-500">*</span>
            {isExistingCandidate && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Cannot be modified)
              </span>
            )}
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            value={lastName}
            onChange={handleLastNameChange}
            onKeyPress={handleNameKeyPress}
            onPaste={(e) => handleNamePaste(e, 'lastName')}
            className={`w-full rounded-lg border px-4 py-3 shadow-sm transition-all duration-300 focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:bg-gray-700 dark:text-white ${
              isExistingCandidate
                ? 'cursor-not-allowed border-slate-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                : lastNameError
                  ? 'border-red-400 bg-red-50 ring-1 ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:ring-red-500/30'
                  : lastName && !lastNameError
                    ? 'border-green-400 bg-green-50 ring-1 ring-green-200 dark:border-green-500 dark:bg-green-900/20 dark:ring-green-500/30'
                    : 'border-slate-300 dark:border-gray-600'
            }`}
            placeholder="Enter your last name"
            disabled={isLoading || isExistingCandidate}
            autoComplete="family-name"
            maxLength={50}
          />

          {/* 🔥 NEW: Last name validation feedback */}
          {!isExistingCandidate && lastNameError && (
            <div className="mt-2 flex items-start space-x-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400">{lastNameError}</p>
            </div>
          )}

          {!isExistingCandidate && lastName && !lastNameError && (
            <div className="mt-2 flex items-start space-x-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-green-600 dark:text-green-400">Valid last name</p>
            </div>
          )}

          {!isExistingCandidate && !lastName && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only letters, spaces, hyphens, and apostrophes allowed
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={email}
            className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-gray-100 px-4 py-3 shadow-sm dark:border-gray-600 dark:bg-gray-800"
            disabled={true}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This email was verified in the previous step
          </p>
        </div>

        <div>
          <label
            htmlFor="gender"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Gender <span className="text-red-500">*</span>
            {isExistingCandidate && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Cannot be modified)
              </span>
            )}
          </label>
          <select
            name="gender"
            id="gender"
            required
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={`w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
              isExistingCandidate ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''
            }`}
            disabled={isLoading || isExistingCandidate}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dateOfBirth"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Date of Birth <span className="text-red-500">*</span>
            {isExistingCandidate && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Cannot be modified)
              </span>
            )}
          </label>
          <input
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={`w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
              isExistingCandidate ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''
            }`}
            disabled={isLoading || isExistingCandidate}
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split('T')[0]
            }
          />
          {/* Show calculated age with validation */}
          {dateOfBirth && (
            <div className="mt-1">
              {(() => {
                const age = calculateAge ? calculateAge(dateOfBirth) : 0;
                const isValidAge = age !== null && age >= 18;

                return (
                  <p
                    className={`mt-1 text-xs ${isValidAge ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-red-600'}`}
                  >
                    {age !== null && age > 0 ? (
                      isValidAge ? (
                        <>Age: {age} years old</>
                      ) : (
                        <>⚠️ Age: {age} years old - You must be at least 18 years old to apply</>
                      )
                    ) : (
                      <span className="text-red-600">Invalid date format</span>
                    )}
                  </p>
                );
              })()}
            </div>
          )}
          {isExistingCandidate && dateOfBirth && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Age: {calculateAge ? calculateAge(dateOfBirth) : 0} years old
            </p>
          )}
        </div>

        {/* 🔥 FIXED: Phone Number Section - Completely different for existing vs new candidates */}
        <div className="sm:col-span-2">
          <label
            htmlFor="phoneNumber"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>

          {/* 🔥 CONDITIONAL: Only show validation info for NEW candidates */}
          {!isExistingCandidate && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-900/20">
              <div className="flex items-start space-x-2">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400"
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
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  <p className="mb-1 font-medium">📞 Phone Verification System</p>
                  <p>
                    Your phone number will be validated using our secure 3-tier verification system
                    to ensure accuracy and deliverability.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            {/* Country Code Dropdown */}
            <div className="relative" ref={countryCodeRef}>
              <button
                type="button"
                onClick={() => {
                  if (!isLoading && !isExistingCandidate) {
                    setShowCountryCodeList(!showCountryCodeList);
                    setCountryCodeSearch('');
                  }
                }}
                className={`flex w-32 items-center justify-between rounded-l-lg border border-slate-300 px-3 py-3 text-sm shadow-sm focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 ${
                  isLoading || isExistingCandidate
                    ? 'cursor-not-allowed bg-gray-100 opacity-75 dark:bg-gray-800'
                    : 'cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
                disabled={isLoading || isExistingCandidate}
              >
                <span className="dark:text-white">
                  {countryCodes.find((item) => item.code === countryCode)?.flag} {countryCode}
                </span>
                {!isExistingCandidate && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>

              {showCountryCodeList && !isLoading && !isExistingCandidate && (
                <div className="absolute z-20 mt-1 w-80 rounded-lg border border-slate-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                  <div className="border-b border-slate-200 p-2 dark:border-gray-600">
                    <input
                      type="text"
                      value={countryCodeSearch}
                      onChange={(e) => setCountryCodeSearch(e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                      placeholder="Search country..."
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCountryCodes.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setCountryCode(item.code);
                          setShowCountryCodeList(false);
                          setCountryCodeSearch('');
                        }}
                        className="flex w-full items-center space-x-3 px-3 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100 focus:outline-none dark:hover:bg-gray-600 dark:focus:bg-gray-600"
                      >
                        <span className="text-lg">{item.flag}</span>
                        <span className="font-medium dark:text-white">{item.code}</span>
                        <span className="truncate text-slate-600 dark:text-slate-300">
                          {item.country}
                        </span>
                      </button>
                    ))}
                    {filteredCountryCodes.length === 0 && (
                      <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                        No countries found
                      </div>
                    )}
                  </div>
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
                className={`w-full rounded-r-lg border px-4 py-3 shadow-sm transition-all duration-300 focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:bg-gray-700 dark:text-white ${
                  isExistingCandidate
                    ? 'cursor-not-allowed border-slate-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                    : phoneValidation?.isValid === true
                      ? 'border-green-400 bg-green-50 ring-1 ring-green-200 dark:border-green-500 dark:bg-green-900/20 dark:ring-green-500/30'
                      : phoneValidation?.isValid === false
                        ? 'border-red-400 bg-red-50 ring-1 ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:ring-red-500/30'
                        : phoneValidation?.isValidating
                          ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200 dark:border-blue-500 dark:bg-blue-900/20 dark:ring-blue-500/30'
                          : 'border-slate-300 dark:border-gray-600'
                }`}
                placeholder="Enter your phone number"
                disabled={isLoading || isExistingCandidate}
              />
            </div>
          </div>

          {/* 🔥 CONDITIONAL: Phone Validation Feedback - ONLY for new candidates */}
          {!isExistingCandidate && (phoneValidation?.isValidating || phoneValidation?.message) && (
            <div
              className="mt-3 rounded-lg border p-3 transition-all duration-300"
              style={{
                backgroundColor:
                  phoneValidation.isValid === true
                    ? 'rgb(240 253 244)'
                    : phoneValidation.isValid === false
                      ? 'rgb(254 242 242)'
                      : 'rgb(239 246 255)',
                borderColor:
                  phoneValidation.isValid === true
                    ? 'rgb(34 197 94)'
                    : phoneValidation.isValid === false
                      ? 'rgb(239 68 68)'
                      : 'rgb(59 130 246)',
              }}
            >
              <div className="flex items-start space-x-3">
                {phoneValidation.isValidating && (
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                )}

                {!phoneValidation.isValidating && (
                  <div className="mt-0.5 flex-shrink-0">
                    {phoneValidation.isValid === true ? (
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : phoneValidation.isValid === false ? (
                      <svg
                        className="h-5 w-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-blue-600"
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
                    )}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      phoneValidation.isValid === true
                        ? 'text-green-700'
                        : phoneValidation.isValid === false
                          ? 'text-red-700'
                          : 'text-blue-700'
                    }`}
                  >
                    {phoneValidation.message}
                  </p>

                  {phoneValidation.isValidating && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 text-xs text-blue-600">
                        <span>Verifying through secure validation system...</span>
                      </div>
                      <div className="mt-1 h-1 w-full rounded-full bg-blue-200">
                        <div
                          className="h-1 animate-pulse rounded-full bg-blue-600"
                          style={{ width: '60%' }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {phoneValidation.warning && (
                    <div className="mt-2 flex items-start space-x-2">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <p className="text-xs font-medium text-amber-700">
                        {phoneValidation.warning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🔥 CONDITIONAL: Help text based on user type */}
          {!isExistingCandidate && !phoneValidation?.message && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter your phone number without the country code (e.g., for +358 123 456 789, enter
              "123 456 789")
            </p>
          )}

          {isExistingCandidate && (
            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-500/30 dark:bg-blue-900/20">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                🔒 Phone number from your previous application (already validated).
              </p>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            id="city"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your city"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="country"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Country <span className="text-red-500">*</span>
          </label>
          <SearchableDropdown
            options={countries}
            value={country}
            onChange={setCountry}
            placeholder="Search and select your country"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="nationality"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Nationality <span className="text-red-500">*</span>
          </label>
          <SearchableDropdown
            options={countries}
            value={nationality}
            onChange={setNationality}
            placeholder="Search and select your nationality"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="doubleNationality"
            className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Second Nationality <span className="text-slate-400">(Optional)</span>
          </label>
          <SearchableDropdown
            options={countries}
            value={doubleNationality}
            onChange={setDoubleNationality}
            placeholder="Search and select second nationality"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;

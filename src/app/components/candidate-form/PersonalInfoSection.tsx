// src/app/components/candidate-form/PersonalInfoSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { countryCodes, countries } from '@/lib/formData';
import { PersonalInfoSectionProps } from '@/types';
import SearchableDropdown from '../ui/SearchableDropdown';

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
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
}) => {
  const countryCodeRef = useRef<HTMLDivElement>(null);
  const [showCountryCodeList, setShowCountryCodeList] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');

  const filteredCountryCodes = countryCodes.filter(item => 
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-slate-50 p-5 sm:p-6 rounded-lg">
      <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">Personal Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-600 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={email}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
            disabled={true}
          />
          <p className="text-xs text-gray-500 mt-1">This email was verified in the previous step</p>
        </div>

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
        </div>

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
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={`w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] ${
              isExistingCandidate ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={isLoading || isExistingCandidate}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-600 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <div className="relative" ref={countryCodeRef}>
              <button
                type="button"
                onClick={() => {
                  setShowCountryCodeList(!showCountryCodeList);
                  setCountryCodeSearch('');
                }}
                className="w-32 px-3 py-3 border border-slate-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] bg-slate-100 text-sm flex items-center justify-between"
                disabled={isLoading}
              >
                <span>
                  {countryCodes.find(item => item.code === countryCode)?.flag} {countryCode}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCountryCodeList && (
                <div className="absolute z-20 w-80 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-slate-200">
                    <input
                      type="text"
                      value={countryCodeSearch}
                      onChange={(e) => setCountryCodeSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
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
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100 focus:outline-none flex items-center space-x-3"
                      >
                        <span className="text-lg">{item.flag}</span>
                        <span className="font-medium">{item.code}</span>
                        <span className="text-slate-600 truncate">{item.country}</span>
                      </button>
                    ))}
                    {filteredCountryCodes.length === 0 && (
                      <div className="px-3 py-2 text-sm text-slate-500">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 px-4 py-3 border-l-0 border border-slate-300 rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70]"
              placeholder="123 456 789"
              disabled={isLoading}
            />
          </div>
        </div>

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

        <div>
          <label htmlFor="country" className="block text-sm font-semibold text-slate-600 mb-2">
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
          <label htmlFor="nationality" className="block text-sm font-semibold text-slate-600 mb-2">
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
          <label htmlFor="doubleNationality" className="block text-sm font-semibold text-slate-600 mb-2">
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
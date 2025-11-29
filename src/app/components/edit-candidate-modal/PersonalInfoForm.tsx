'use client';

import React from 'react';
import { FiUser } from 'react-icons/fi';
import { countryCodes } from '@/lib/formData';
import { Candidate } from '@/types';

interface PersonalInfoFormProps {
  formData: Partial<Candidate>;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isLoading: boolean;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  errors,
  handleInputChange,
  isLoading,
}) => {
  return (
    <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
        <FiUser className="mr-2" /> Personal Information
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200`}
            disabled={isLoading}
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200`}
            disabled={isLoading}
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200`}
            disabled={isLoading}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label
            htmlFor="gender"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200`}
            disabled={isLoading}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
        </div>
        <div>
          <label
            htmlFor="dateOfBirth"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200`}
            disabled={isLoading}
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split('T')[0]
            }
          />
          {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>}
        </div>
        <div>
          <label
            htmlFor="phoneNumber"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <select
              aria-label="Country Code"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              className="w-20 rounded-l-md border border-r-0 border-gray-300 bg-white px-2 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
            >
              {countryCodes.map((item) => (
                <option key={item.iso} value={item.code}>
                  {item.flag} {item.code}
                </option>
              ))}
            </select>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`flex-1 rounded-r-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200`}
              placeholder="123 456 789"
              disabled={isLoading}
            />
          </div>
          {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;

'use client';

import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import SearchableDropdown from '../ui/SearchableDropdown';
import { countries } from '@/lib/formData';
import { Candidate } from '@/types';

interface LocationInfoFormProps {
  formData: Partial<Candidate>;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isLoading: boolean;
}

const LocationInfoForm: React.FC<LocationInfoFormProps> = ({
  formData,
  errors,
  handleInputChange,
  isLoading,
}) => {
  return (
    <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
        <FiMapPin className="mr-2" /> Location Information
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="city"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200`}
            disabled={isLoading}
          />
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
        </div>
        <div>
          <label
            htmlFor="country"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Country <span className="text-red-500">*</span>
          </label>
          <SearchableDropdown
            id="country"
            options={countries}
            value={formData.country}
            onChange={(value) =>
              handleInputChange({
                target: { name: 'country', value },
              } as React.ChangeEvent<HTMLSelectElement>)
            }
            placeholder="Search and select country"
            disabled={isLoading}
          />
          {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
        </div>
        <div>
          <label
            htmlFor="nationality"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nationality <span className="text-red-500">*</span>
          </label>
          <SearchableDropdown
            id="nationality"
            options={countries}
            value={formData.nationality}
            onChange={(value) =>
              handleInputChange({
                target: { name: 'nationality', value },
              } as React.ChangeEvent<HTMLSelectElement>)
            }
            placeholder="Search and select nationality"
            disabled={isLoading}
          />
          {errors.nationality && <p className="mt-1 text-xs text-red-500">{errors.nationality}</p>}
        </div>
        <div>
          <label
            htmlFor="doubleNationality"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Second Nationality <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
          </label>
          <SearchableDropdown
            id="doubleNationality"
            options={countries}
            value={formData.doubleNationality}
            onChange={(value) =>
              handleInputChange({
                target: { name: 'doubleNationality', value },
              } as React.ChangeEvent<HTMLSelectElement>)
            }
            placeholder="Search and select second nationality"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationInfoForm;

"use client";

import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import SearchableDropdown from '../ui/SearchableDropdown';
import { countries } from '@/lib/formData';

interface LocationInfoFormProps {
    formData: any;
    errors: any;
    handleInputChange: (field: string, value: string) => void;
    isLoading: boolean;
}

const LocationInfoForm: React.FC<LocationInfoFormProps> = ({ formData, errors, handleInputChange, isLoading }) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiMapPin className="mr-2" /> Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        disabled={isLoading}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                        options={countries}
                        value={formData.country}
                        onChange={(value) => handleInputChange('country', value)}
                        placeholder="Search and select country"
                        disabled={isLoading}
                    />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                        options={countries}
                        value={formData.nationality}
                        onChange={(value) => handleInputChange('nationality', value)}
                        placeholder="Search and select nationality"
                        disabled={isLoading}
                    />
                    {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Second Nationality <span className="text-gray-500">(Optional)</span>
                    </label>
                    <SearchableDropdown
                        options={countries}
                        value={formData.doubleNationality}
                        onChange={(value) => handleInputChange('doubleNationality', value)}
                        placeholder="Search and select second nationality"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default LocationInfoForm;

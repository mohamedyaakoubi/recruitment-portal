import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { Candidate } from '@/types';
import SearchableDropdown from './ui/SearchableDropdown';
import { countries, countryCodes } from '@/lib/formData';

interface EditCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onSave: (candidateId: string, updatedData: Partial<Candidate>) => Promise<void>;
  isLoading: boolean;
}

const EditCandidateModal: React.FC<EditCandidateModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSave,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    countryCode: '',
    phoneNumber: '',
    dateOfBirth: '',
    city: '',
    country: '',
    nationality: '',
    doubleNationality: '',
    jobCategory: '',
    specialty: '',
    jobTitleText: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (candidate) {
      // Split full name if firstName and lastName aren't available
      const nameParts = candidate.fullName ? candidate.fullName.trim().split(' ') : [];
      const firstName = candidate.firstName || nameParts[0] || '';
      const lastName = candidate.lastName || nameParts.slice(1).join(' ') || '';

      // Extract phone number without country code
      let cleanPhone = candidate.phoneNumber || '';
      if (candidate.countryCode && cleanPhone.includes(candidate.countryCode)) {
        cleanPhone = cleanPhone.replace(candidate.countryCode, '').trim();
        cleanPhone = cleanPhone.replace(/^[\s\-+]+/, '');
      }

      setFormData({
        firstName,
        lastName,
        email: candidate.email || '',
        gender: candidate.gender || '',
        countryCode: candidate.countryCode || '+358',
        phoneNumber: cleanPhone,
        dateOfBirth: candidate.dateOfBirth || '',
        city: candidate.city || '',
        country: candidate.country || '',
        nationality: candidate.nationality || '',
        doubleNationality: candidate.doubleNationality || '',
        jobCategory: candidate.jobCategory || '',
        specialty: candidate.specialty || '',
        jobTitleText: candidate.jobTitleText || ''
      });
      setErrors({});
    }
  }, [candidate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';

    // Age validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() -
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      
      if (age < 18) {
        newErrors.dateOfBirth = 'Candidate must be at least 18 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidate || !validateForm()) return;

    try {
      const updatedData: Partial<Candidate> = { // 🔥 FIXED: Use Partial<Candidate> type
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.toLowerCase().trim(),
        gender: formData.gender,
        countryCode: formData.countryCode,
        phoneNumber: `${formData.countryCode} ${formData.phoneNumber.trim()}`,
        dateOfBirth: formData.dateOfBirth,
        city: formData.city.trim(),
        country: formData.country.trim(),
        nationality: formData.nationality.trim(),
        doubleNationality: formData.doubleNationality.trim() || undefined, // 🔥 FIXED: Use undefined instead of null
        jobCategory: formData.jobCategory.trim(),
        specialty: formData.specialty.trim(),
        jobTitleText: formData.jobTitleText.trim()
      };

      await onSave(candidate.id, updatedData);
      onClose();
    } catch (error) {
      console.error('Failed to update candidate:', error);
    }
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center">
            <FiUser className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Candidate Information</h2>
              <p className="text-sm text-gray-500">Update candidate details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2"
            disabled={isLoading}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiUser className="mr-2" /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => handleInputChange('countryCode', e.target.value)}
                      className="w-20 px-2 py-2 border border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                      disabled={isLoading}
                    >
                      {countryCodes.map((item, index) => (
                        <option key={index} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 456 789"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>
            </div>

            {/* Location Information */}
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
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

            {/* Job Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiBriefcase className="mr-2" /> Job Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Category
                  </label>
                  <input
                    type="text"
                    value={formData.jobCategory}
                    onChange={(e) => handleInputChange('jobCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitleText}
                    onChange={(e) => handleInputChange('jobTitleText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCandidateModal;
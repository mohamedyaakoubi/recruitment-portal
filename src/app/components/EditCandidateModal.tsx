import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { Candidate, Job } from '@/types';
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
    jobTitle: '',
    specialty: '',
    jobTitleText: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 🔥 NEW: Job-related state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  // 🔥 NEW: Fetch jobs from database
  useEffect(() => {
    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await fetch('/api/jobs?activeOnly=true');
      const data = await response.json();
      
      if (response.ok) {
        setJobs(data.jobs || []);
        setJobCategories(data.categories || []);
      } else {
        console.error('Failed to fetch jobs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // 🔥 NEW: Filter jobs by selected category
  useEffect(() => {
    if (formData.jobCategory) {
      const filtered = jobs.filter(job => 
        job.category === formData.jobCategory && job.isActive
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs([]);
    }
  }, [formData.jobCategory, jobs]);

  // 🔥 NEW: Update specialties when job is selected
  useEffect(() => {
    if (selectedJob && selectedJob.specialties) {
      setAvailableSpecialties(selectedJob.specialties);
      // If current specialty is not in the new job's specialties, clear it
      if (!selectedJob.specialties.includes(formData.specialty)) {
        setFormData(prev => ({ ...prev, specialty: '' }));
      }
    } else {
      setAvailableSpecialties([]);
    }
  }, [selectedJob]);

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
        jobTitle: candidate.jobTitle || '',
        specialty: candidate.specialty || '',
        jobTitleText: candidate.jobTitleText || ''
      });

      // 🔥 NEW: Find and set the selected job based on candidate's job data
      if (candidate.jobTitle && jobs.length > 0) {
        const foundJob = jobs.find(job => job.id === candidate.jobTitle);
        if (foundJob) {
          setSelectedJob(foundJob);
        }
      }

      setErrors({});
    }
  }, [candidate, jobs]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🔥 NEW: Handle category selection
  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ 
      ...prev, 
      jobCategory: category,
      jobTitle: '', // Clear job selection when category changes
      specialty: '' // Clear specialty when category changes
    }));
    setSelectedJob(null);
    setAvailableSpecialties([]);
  };

  // 🔥 NEW: Handle job selection
  const handleJobChange = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setFormData(prev => ({ 
        ...prev, 
        jobTitle: job.id,
        jobTitleText: job.title,
        specialty: '' // Clear specialty when job changes
      }));
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
      const updatedData: Partial<Candidate> = {
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
        doubleNationality: formData.doubleNationality.trim() || undefined,
        jobCategory: formData.jobCategory.trim(),
        jobTitle: formData.jobTitle.trim(), // Job ID
        jobTitleText: formData.jobTitleText.trim(), // Job display name
        specialty: formData.specialty.trim()
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

            {/* 🔥 UPDATED: Job Information with Database Integration */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiBriefcase className="mr-2" /> Job Information
              </h3>
              
              {loadingJobs && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading jobs...</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Category
                  </label>
                  <select
                    value={formData.jobCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading || loadingJobs}
                  >
                    <option value="">Select Category</option>
                    {jobCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Position
                  </label>
                  <select
                    value={formData.jobTitle}
                    onChange={(e) => handleJobChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading || loadingJobs || !formData.jobCategory}
                  >
                    <option value="">
                      {!formData.jobCategory 
                        ? 'Select category first' 
                        : 'Select job position'
                      }
                    </option>
                    {filteredJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                  {formData.jobCategory && filteredJobs.length === 0 && !loadingJobs && (
                    <p className="text-xs text-orange-600 mt-1">
                      No active jobs available in this category
                    </p>
                  )}
                </div>

                {/* Specialty Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading || !selectedJob}
                  >
                    <option value="">
                      {!selectedJob 
                        ? 'Select job position first' 
                        : 'Select specialty'
                      }
                    </option>
                    {availableSpecialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                  {selectedJob && availableSpecialties.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      No specialties available for this job
                    </p>
                  )}
                </div>

                {/* Display current job title for reference */}
                {formData.jobTitleText && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitleText}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be updated automatically when you select a job position
                    </p>
                  </div>
                )}
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
            disabled={isLoading || loadingJobs}
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
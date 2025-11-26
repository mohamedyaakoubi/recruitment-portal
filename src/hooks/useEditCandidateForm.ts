'use client';

import { useState, useEffect } from 'react';
import { Candidate, Job } from '@/types';
import logger from '@/lib/logger';

export const useEditCandidateForm = (
  candidate: Candidate | null,
  isOpen: boolean,
  onSave: (candidateId: string, updatedData: Partial<Candidate>) => Promise<void>,
  onClose: () => void
) => {
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
    jobTitleText: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

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
        logger.error('Failed to fetch jobs', new Error(data.error), { response: data });
      }
    } catch (error) {
      logger.error('Error fetching jobs', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (formData.jobCategory) {
      const filtered = jobs.filter((job) => job.category === formData.jobCategory && job.isActive);
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs([]);
    }
  }, [formData.jobCategory, jobs]);

  useEffect(() => {
    if (selectedJob && selectedJob.specialties) {
      setAvailableSpecialties(selectedJob.specialties);
      if (!selectedJob.specialties.includes(formData.specialty)) {
        setFormData((prev) => ({ ...prev, specialty: '' }));
      }
    } else {
      setAvailableSpecialties([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob]); // formData.specialty is managed separately

  useEffect(() => {
    if (candidate) {
      const nameParts = candidate.fullName ? candidate.fullName.trim().split(' ') : [];
      const firstName = candidate.firstName || nameParts[0] || '';
      const lastName = candidate.lastName || nameParts.slice(1).join(' ') || '';
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
        jobTitleText: candidate.jobTitleText || '',
      });
      if (candidate.jobTitle && jobs.length > 0) {
        const foundJob = jobs.find((job) => job.id === candidate.jobTitle);
        if (foundJob) {
          setSelectedJob(foundJob);
        }
      }
      setErrors({});
    }
  }, [candidate, jobs]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData((prev) => ({
      ...prev,
      jobCategory: category,
      jobTitle: '',
      specialty: '',
    }));
    setSelectedJob(null);
    setAvailableSpecialties([]);
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value;
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setFormData((prev) => ({
        ...prev,
        jobTitle: job.id,
        jobTitleText: job.title,
        specialty: '',
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
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age =
        today.getFullYear() -
        birthDate.getFullYear() -
        (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
          ? 1
          : 0);
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
        jobTitle: formData.jobTitle.trim(),
        jobTitleText: formData.jobTitleText.trim(),
        specialty: formData.specialty.trim(),
      };
      await onSave(candidate.id, updatedData);
      onClose();
    } catch (error) {
      logger.error('Failed to update candidate', error, { candidateId: candidate?.id });
    }
  };

  return {
    formData,
    errors,
    jobs,
    jobCategories,
    loadingJobs,
    selectedJob,
    availableSpecialties,
    filteredJobs,
    handleInputChange,
    handleCategoryChange,
    handleJobChange,
    handleSubmit,
  };
};

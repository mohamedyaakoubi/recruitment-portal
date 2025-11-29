/**
 * Dashboard Filters Hook
 * Manages all filter states and filtered candidates logic
 */

import { useState, useMemo } from 'react';
import type { Candidate } from '@/types';

export const useDashboardFilters = (candidates: Candidate[], activeTab: string) => {
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterName, setFilterName] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterNationality, setFilterNationality] = useState<string>('');
  const [filterJobTitle, setFilterJobTitle] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterAgeMin, setFilterAgeMin] = useState<string>('');
  const [filterAgeMax, setFilterAgeMax] = useState<string>('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const statusMatch = filterStatus === 'all' || candidate.status === filterStatus;
      const nameMatch =
        filterName === '' || candidate.fullName.toLowerCase().includes(filterName.toLowerCase());
      const cityMatch =
        filterCity === '' ||
        (candidate.city && candidate.city.toLowerCase().includes(filterCity.toLowerCase()));
      const countryMatch =
        filterCountry === '' ||
        (candidate.country &&
          candidate.country.toLowerCase().includes(filterCountry.toLowerCase()));
      const nationalityMatch =
        filterNationality === '' ||
        (candidate.nationality &&
          candidate.nationality.toLowerCase().includes(filterNationality.toLowerCase()));
      const jobTitleMatch =
        filterJobTitle === '' ||
        (candidate.jobTitleText &&
          candidate.jobTitleText.toLowerCase().includes(filterJobTitle.toLowerCase()));
      const categoryMatch =
        filterCategory === '' ||
        (candidate.jobCategory &&
          candidate.jobCategory.toLowerCase().includes(filterCategory.toLowerCase()));
      const specialtyMatch =
        filterSpecialty === '' ||
        (candidate.specialty &&
          candidate.specialty.toLowerCase().includes(filterSpecialty.toLowerCase()));

      let ageMatch = true;
      if (candidate.dateOfBirth && (filterAgeMin || filterAgeMax)) {
        const birthDate = new Date(candidate.dateOfBirth);
        const today = new Date();
        if (!isNaN(birthDate.getTime())) {
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (filterAgeMin && age < parseInt(filterAgeMin)) ageMatch = false;
          if (filterAgeMax && age > parseInt(filterAgeMax)) ageMatch = false;
        }
      }

      let tabMatch = true;
      if (activeTab === 'main') {
        tabMatch = candidate.status === 'submitted' || candidate.status === 'interview_scheduled';
      } else if (activeTab === 'approved') {
        tabMatch = candidate.status === 'approved';
      } else if (activeTab === 'rejected') {
        tabMatch = candidate.status === 'rejected';
      }

      return (
        statusMatch &&
        nameMatch &&
        cityMatch &&
        countryMatch &&
        nationalityMatch &&
        jobTitleMatch &&
        categoryMatch &&
        specialtyMatch &&
        ageMatch &&
        tabMatch
      );
    });
  }, [
    candidates,
    filterStatus,
    filterName,
    filterCity,
    filterCountry,
    filterNationality,
    filterJobTitle,
    filterCategory,
    filterSpecialty,
    filterAgeMin,
    filterAgeMax,
    activeTab,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setFilterStatus('all');
    setFilterName('');
    setFilterCity('');
    setFilterCountry('');
    setFilterNationality('');
    setFilterJobTitle('');
    setFilterCategory('');
    setFilterSpecialty('');
    setFilterAgeMin('');
    setFilterAgeMax('');
  };

  return {
    filterStatus,
    setFilterStatus,
    filterName,
    setFilterName,
    filterCity,
    setFilterCity,
    filterCountry,
    setFilterCountry,
    filterNationality,
    setFilterNationality,
    filterJobTitle,
    setFilterJobTitle,
    filterCategory,
    setFilterCategory,
    filterAgeMin,
    setFilterAgeMin,
    filterAgeMax,
    setFilterAgeMax,
    filterSpecialty,
    setFilterSpecialty,
    filteredCandidates,
    clearAllFilters,
  };
};

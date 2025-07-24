import React, { useState, useRef, useEffect } from 'react';
import type { Candidate, CandidateFiltersProps } from '@/types';
import SearchableFilterDropdown from './common/SearchableFilterDropdown';

const CandidateFilters: React.FC<CandidateFiltersProps> = ({
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
  onFilterStatusChange,
  onFilterNameChange,
  onFilterCityChange,
  onFilterCountryChange,
  onFilterNationalityChange,
  onFilterJobTitleChange,
  onFilterCategoryChange,
  onFilterSpecialtyChange,
  onFilterAgeMinChange,
  onFilterAgeMaxChange,
  onClearAllFilters
}) => {

  // Search states for interactive dropdowns
  const [citySearch, setCitySearch] = useState(filterCity);
  const [countrySearch, setCountrySearch] = useState(filterCountry);
  const [jobTitleSearch, setJobTitleSearch] = useState(filterJobTitle);
  const [categorySearch, setCategorySearch] = useState(filterCategory);
  const [nationalitySearch, setNationalitySearch] = useState(filterNationality);
  const [specialtySearch, setSpecialtySearch] = useState(filterSpecialty);

  // Update search states when filters change externally
  useEffect(() => {
    setCitySearch(filterCity);
  }, [filterCity]);

  useEffect(() => {
    setCountrySearch(filterCountry);
  }, [filterCountry]);

  useEffect(() => {
    setJobTitleSearch(filterJobTitle);
  }, [filterJobTitle]);

  useEffect(() => {
    setCategorySearch(filterCategory);
  }, [filterCategory]);
 
  useEffect(() => {
    setNationalitySearch(filterNationality);
  }, [filterNationality]);

  useEffect(() => {
    setSpecialtySearch(filterSpecialty);
  }, [filterSpecialty]);

  // Extract unique values from candidates
  const uniqueCities = Array.from(new Set(candidates.map(c => c.city).filter((c): c is string => !!c))).sort();
  const uniqueCountries = Array.from(new Set(candidates.map(c => c.country).filter((c): c is string => !!c))).sort();
  const uniqueJobTitles = Array.from(new Set(candidates.map(c => c.jobTitleText).filter((c): c is string => !!c))).sort();
  const uniqueCategories = Array.from(new Set(candidates.map(c => c.jobCategory).filter((c): c is string => !!c))).sort();
  const uniqueNationalities = Array.from(new Set(candidates.map(c => c.nationality).filter((n): n is string => !!n))).sort();
  const uniqueSpecialties = Array.from(new Set(candidates.map(c => c.specialty).filter((s): s is string => !!s))).sort();

  const handleClearAllFilters = () => {
    setCitySearch('');
    setCountrySearch('');
    setJobTitleSearch('');
    setCategorySearch('');
    setNationalitySearch('');
    setSpecialtySearch('');
    onClearAllFilters();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filters:</h3>
      
      {/* Main Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {/* Name Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Name</label>
          <input
            type="text"
            placeholder="Filter by name..."
            value={filterName}
            onChange={(e) => onFilterNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        
        {/* City Filter with Dropdown */}
        <SearchableFilterDropdown
          label="Filter by City"
          placeholder="Search and select city..."
          filterValue={filterCity}
          onFilterChange={onFilterCityChange}
          searchValue={citySearch}
          onSearchChange={setCitySearch}
          options={uniqueCities}
          candidates={candidates}
          filterKey="city"
        />
        
        {/* Country Filter with Dropdown */}
        <SearchableFilterDropdown
          label="Filter by Country"
          placeholder="Search and select country..."
          filterValue={filterCountry}
          onFilterChange={onFilterCountryChange}
          searchValue={countrySearch}
          onSearchChange={setCountrySearch}
          options={uniqueCountries}
          candidates={candidates}
          filterKey="country"
        />
        
        {/* Nationality Filter with Dropdown */}
        <SearchableFilterDropdown
          label="Filter by Nationality"
          placeholder="Search and select nationality..."
          filterValue={filterNationality}
          onFilterChange={onFilterNationalityChange}
          searchValue={nationalitySearch}
          onSearchChange={setNationalitySearch}
          options={uniqueNationalities}
          candidates={candidates}
          filterKey="nationality"
        />
        
        {/* Category Filter with Dropdown */}
        <SearchableFilterDropdown
          label="Filter by Category"
          placeholder="Search and select category..."
          filterValue={filterCategory}
          onFilterChange={onFilterCategoryChange}
          searchValue={categorySearch}
          onSearchChange={setCategorySearch}
          options={uniqueCategories}
          candidates={candidates}
          filterKey="jobCategory"
        />

        {/* Specialty Filter with Dropdown */}
        <SearchableFilterDropdown
          label="Filter by Specialty"
          placeholder="Search and select specialty..."
          filterValue={filterSpecialty}
          onFilterChange={onFilterSpecialtyChange}
          searchValue={specialtySearch}
          onSearchChange={setSpecialtySearch}
          options={uniqueSpecialties}
          candidates={candidates}
          filterKey="specialty"
        />

        {/* Job Title Filter with Dropdown */}
        <SearchableFilterDropdown
          label="Filter by Job Title"
          placeholder="Search and select job title..."
          filterValue={filterJobTitle}
          onFilterChange={onFilterJobTitleChange}
          searchValue={jobTitleSearch}
          onSearchChange={setJobTitleSearch}
          options={uniqueJobTitles}
          candidates={candidates}
          filterKey="jobTitleText"
        />
      </div>

      {/* Age and Status Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Age</label>
          <input
            type="number"
            placeholder="Min age..."
            value={filterAgeMin}
            onChange={(e) => onFilterAgeMinChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Age</label>
          <input
            type="number"
            placeholder="Max age..."
            value={filterAgeMax}
            onChange={(e) => onFilterAgeMaxChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Status</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="rejected">Rejected</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Clear All Filters Button */}
      <div className="mb-6">
        <button
          onClick={handleClearAllFilters}
          className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      {/* Quick Filters */}
      <div className="space-y-4">
        <QuickFilterButtons
          label="Status"
          options={['all', 'submitted', 'interview_scheduled', 'rejected', 'approved']}
          filterValue={filterStatus}
          onFilterChange={onFilterStatusChange}
          candidates={candidates}
          filterKey="status"
          colorClass="gray"
        />

        {candidates.length > 0 && uniqueSpecialties.length > 0 && (
          <QuickFilterButtons
            label="Popular Specialties"
            options={uniqueSpecialties}
            filterValue={filterSpecialty}
            onFilterChange={onFilterSpecialtyChange}
            candidates={candidates}
            filterKey="specialty"
            colorClass="emerald"
            sliceLimit={8}
          />
        )}
        
        {candidates.length > 0 && uniqueNationalities.length > 0 && (
          <QuickFilterButtons
            label="Nationalities"
            options={uniqueNationalities}
            filterValue={filterNationality}
            onFilterChange={onFilterNationalityChange}
            candidates={candidates}
            filterKey="nationality"
            colorClass="pink"
            sliceLimit={5}
          />
        )}

        {candidates.length > 0 && (
          <QuickFilterButtons
            label="Popular Cities"
            options={uniqueCities}
            filterValue={filterCity}
            onFilterChange={onFilterCityChange}
            candidates={candidates}
            filterKey="city"
            colorClass="indigo"
            sliceLimit={5}
          />
        )}

        {candidates.length > 0 && (
          <QuickFilterButtons
            label="Popular Countries"
            options={uniqueCountries}
            filterValue={filterCountry}
            onFilterChange={onFilterCountryChange}
            candidates={candidates}
            filterKey="country"
            colorClass="purple"
            sliceLimit={5}
          />
        )}

        {candidates.length > 0 && (
          <QuickFilterButtons
            label="Job Categories"
            options={uniqueCategories}
            filterValue={filterCategory}
            onFilterChange={onFilterCategoryChange}
            candidates={candidates}
            filterKey="jobCategory"
            colorClass="orange"
            sliceLimit={5}
          />
        )}

        {candidates.length > 0 && (
          <QuickFilterButtons
            label="Job Positions"
            options={uniqueJobTitles}
            filterValue={filterJobTitle}
            onFilterChange={onFilterJobTitleChange}
            candidates={candidates}
            filterKey="jobTitleText"
            colorClass="teal"
            sliceLimit={5}
          />
        )}
      </div>

export default CandidateFilters;
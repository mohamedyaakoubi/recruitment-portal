import React, { useState, useRef, useEffect } from 'react';

import type { Candidate } from '@/types';

interface CandidateFiltersProps {
  candidates: Candidate[];
  filterStatus: string;
  filterName: string;
  filterCity: string;
  filterCountry: string;
  filterJobTitle: string;
  filterCategory: string;
  filterAgeMin: string;
  filterAgeMax: string;
  onFilterStatusChange: (status: string) => void;
  onFilterNameChange: (name: string) => void;
  onFilterCityChange: (city: string) => void;
  onFilterCountryChange: (country: string) => void;
  onFilterJobTitleChange: (jobTitle: string) => void;
  onFilterCategoryChange: (category: string) => void;
  onFilterAgeMinChange: (ageMin: string) => void;
  onFilterAgeMaxChange: (ageMax: string) => void;
  onClearAllFilters: () => void;
}

const CandidateFilters: React.FC<CandidateFiltersProps> = ({
  candidates,
  filterStatus,
  filterName,
  filterCity,
  filterCountry,
  filterJobTitle,
  filterCategory,
  filterAgeMin,
  filterAgeMax,
  onFilterStatusChange,
  onFilterNameChange,
  onFilterCityChange,
  onFilterCountryChange,
  onFilterJobTitleChange,
  onFilterCategoryChange,
  onFilterAgeMinChange,
  onFilterAgeMaxChange,
  onClearAllFilters
}) => {
  // Search states for interactive dropdowns
  const [citySearch, setCitySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [jobTitleSearch, setJobTitleSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Dropdown visibility states
  const [showCityList, setShowCityList] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [showJobTitleList, setShowJobTitleList] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);

  // Refs for click outside detection
  const cityRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const jobTitleRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Extract unique values from candidates
  const uniqueCities = Array.from(new Set(candidates.map(c => c.city).filter((c): c is string => !!c))).sort();
  const uniqueCountries = Array.from(new Set(candidates.map(c => c.country).filter((c): c is string => !!c))).sort();
  const uniqueJobTitles = Array.from(new Set(candidates.map(c => c.jobTitleText).filter((c): c is string => !!c))).sort();
  const uniqueCategories = Array.from(new Set(candidates.map(c => c.jobCategory).filter((c): c is string => !!c))).sort();

  // Filtered options based on search
  const filteredCities = uniqueCities.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  );
  const filteredCountries = uniqueCountries.filter(country => 
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );
  const filteredJobTitles = uniqueJobTitles.filter(jobTitle => 
    jobTitle.toLowerCase().includes(jobTitleSearch.toLowerCase())
  );
  const filteredCategories = uniqueCategories.filter(category => 
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCityList(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryList(false);
      }
      if (jobTitleRef.current && !jobTitleRef.current.contains(event.target as Node)) {
        setShowJobTitleList(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleClearAllFilters = () => {
    setCitySearch('');
    setCountrySearch('');
    setJobTitleSearch('');
    setCategorySearch('');
    onClearAllFilters();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters:</h3>
      
      {/* Main Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Name Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Name</label>
          <input
            type="text"
            placeholder="Filter by name..."
            value={filterName}
            onChange={(e) => onFilterNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* City Filter with Dropdown */}
        <div className="relative" ref={cityRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by City</label>
          <input
            type="text"
            placeholder="Search and select city..."
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value);
              onFilterCityChange(''); // Clear selection when typing
              setShowCityList(true);
            }}
            onFocus={() => setShowCityList(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {showCityList && filteredCities.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCities.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onFilterCityChange(city);
                    setCitySearch(city);
                    setShowCityList(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex justify-between items-center"
                >
                  <span>{city}</span>
                  <span className="text-xs text-gray-500">
                    ({candidates.filter(c => c.city === city).length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Country Filter with Dropdown */}
        <div className="relative" ref={countryRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Country</label>
          <input
            type="text"
            placeholder="Search and select country..."
            value={countrySearch}
            onChange={(e) => {
              setCountrySearch(e.target.value);
              onFilterCountryChange(''); // Clear selection when typing
              setShowCountryList(true);
            }}
            onFocus={() => setShowCountryList(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {showCountryList && filteredCountries.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCountries.map((country, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onFilterCountryChange(country);
                    setCountrySearch(country);
                    setShowCountryList(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex justify-between items-center"
                >
                  <span>{country}</span>
                  <span className="text-xs text-gray-500">
                    ({candidates.filter(c => c.country === country).length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Category Filter with Dropdown */}
        <div className="relative" ref={categoryRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
          <input
            type="text"
            placeholder="Search and select category..."
            value={categorySearch}
            onChange={(e) => {
              setCategorySearch(e.target.value);
              onFilterCategoryChange(''); // Clear selection when typing
              setShowCategoryList(true);
            }}
            onFocus={() => setShowCategoryList(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {showCategoryList && filteredCategories.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCategories.map((category, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onFilterCategoryChange(category);
                    setCategorySearch(category);
                    setShowCategoryList(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex justify-between items-center"
                >
                  <span>{category}</span>
                  <span className="text-xs text-gray-500">
                    ({candidates.filter(c => c.jobCategory === category).length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Job Title Filter with Dropdown */}
        <div className="relative" ref={jobTitleRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Job Title</label>
          <input
            type="text"
            placeholder="Search and select job title..."
            value={jobTitleSearch}
            onChange={(e) => {
              setJobTitleSearch(e.target.value);
              onFilterJobTitleChange(''); // Clear selection when typing
              setShowJobTitleList(true);
            }}
            onFocus={() => setShowJobTitleList(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {showJobTitleList && filteredJobTitles.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredJobTitles.map((jobTitle, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onFilterJobTitleChange(jobTitle);
                    setJobTitleSearch(jobTitle);
                    setShowJobTitleList(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex justify-between items-center"
                >
                  <span>{jobTitle}</span>
                  <span className="text-xs text-gray-500">
                    ({candidates.filter(c => c.jobTitleText === jobTitle).length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Age and Status Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
          <input
            type="number"
            placeholder="Min age..."
            value={filterAgeMin}
            onChange={(e) => onFilterAgeMinChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
          <input
            type="number"
            placeholder="Max age..."
            value={filterAgeMax}
            onChange={(e) => onFilterAgeMaxChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      {/* Quick Filters */}
      <div className="space-y-4">
        {/* Status Quick Filters */}
        <div>
          <span className="text-sm font-medium text-gray-600 mr-3">Status:</span>
          <div className="inline-flex flex-wrap gap-2">
            <button
              onClick={() => onFilterStatusChange('all')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-gray-600 text-white border-gray-600' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterStatusChange('submitted')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterStatus === 'submitted' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
              }`}
            >
              Submitted ({candidates.filter(c => c.status === 'submitted').length})
            </button>
            <button
              onClick={() => onFilterStatusChange('interview_scheduled')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterStatus === 'interview_scheduled' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
              }`}
            >
              Scheduled ({candidates.filter(c => c.status === 'interview_scheduled').length})
            </button>
            <button
              onClick={() => onFilterStatusChange('rejected')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterStatus === 'rejected' 
                  ? 'bg-red-600 text-white border-red-600' 
                  : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
              }`}
            >
              Rejected ({candidates.filter(c => c.status === 'rejected').length})
            </button>
            <button
              onClick={() => onFilterStatusChange('approved')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterStatus === 'approved' 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
              }`}
            >
              Approved ({candidates.filter(c => c.status === 'approved').length})
            </button>
          </div>
        </div>

        {/* Popular Cities Quick Filters */}
        {candidates.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600 mr-3">Popular Cities:</span>
            <div className="inline-flex flex-wrap gap-2">
              {uniqueCities.slice(0, 5).map(city => (
                <button
                  key={city}
                  onClick={() => {
                    if (filterCity === city) {
                      onFilterCityChange('');
                      setCitySearch('');
                    } else {
                      onFilterCityChange(city);
                      setCitySearch(city);
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterCity === city 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {city} ({candidates.filter(c => c.city === city).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Countries Quick Filters */}
        {candidates.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600 mr-3">Popular Countries:</span>
            <div className="inline-flex flex-wrap gap-2">
              {uniqueCountries.slice(0, 5).map(country => (
                <button
                  key={country}
                  onClick={() => {
                    if (filterCountry === country) {
                      onFilterCountryChange('');
                      setCountrySearch('');
                    } else {
                      onFilterCountryChange(country);
                      setCountrySearch(country);
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterCountry === country 
                      ? 'bg-purple-600 text-white border-purple-600' 
                      : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {country} ({candidates.filter(c => c.country === country).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Job Categories Quick Filters */}
        {candidates.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600 mr-3">Job Categories:</span>
            <div className="inline-flex flex-wrap gap-2">
              {uniqueCategories.slice(0, 5).map(category => (
                <button
                  key={category}
                  onClick={() => {
                    if (filterCategory === category) {
                      onFilterCategoryChange('');
                      setCategorySearch('');
                    } else {
                      onFilterCategoryChange(category);
                      setCategorySearch(category);
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterCategory === category 
                      ? 'bg-orange-600 text-white border-orange-600' 
                      : 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {category} ({candidates.filter(c => c.jobCategory === category).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Job Titles Quick Filters */}
        {candidates.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600 mr-3">Job Positions:</span>
            <div className="inline-flex flex-wrap gap-2">
              {uniqueJobTitles.slice(0, 5).map(jobTitle => (
                <button
                  key={jobTitle}
                  onClick={() => {
                    if (filterJobTitle === jobTitle) {
                      onFilterJobTitleChange('');
                      setJobTitleSearch('');
                    } else {
                      onFilterJobTitleChange(jobTitle);
                      setJobTitleSearch(jobTitle);
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterJobTitle === jobTitle 
                      ? 'bg-teal-600 text-white border-teal-600' 
                      : 'bg-white text-teal-600 border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  {jobTitle} ({candidates.filter(c => c.jobTitleText === jobTitle).length})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateFilters;
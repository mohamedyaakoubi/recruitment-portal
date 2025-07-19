import React, { useState, useEffect } from 'react';
import { JOB_CATEGORIES, JobCategory } from '@/lib/job-categories';
import { Job, JobManagementProps } from '@/types';

const JobManagement: React.FC<JobManagementProps> = ({ isOpen, onClose }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as JobCategory | '',
    specialties: [''] // ✅ Add specialties to form data
  });

  // Filter and UI states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'category' | 'createdAt' | 'isActive'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Loading states for individual operations
  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({});

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
      
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  // Load jobs when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchJobs();
      resetForm();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  // Auto-clear success/error messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // ✅ Specialty management functions
  const addSpecialty = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, '']
    }));
  };

  const removeSpecialty = (index: number) => {
    if (formData.specialties.length > 1) {
      setFormData(prev => ({
        ...prev,
        specialties: prev.specialties.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSpecialty = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.map((spec, i) => i === index ? value : spec)
    }));
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Filter out empty specialties
    const validSpecialties = formData.specialties.filter(spec => spec.trim() !== '');
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category || validSpecialties.length === 0) {
      setError('Please fill in all fields and add at least one specialty');
      return;
    }

    const operationKey = editingJobId || 'create';
    setOperationLoading(prev => ({ ...prev, [operationKey]: true }));
    setError(null);
    setSuccess(null);

    try {
      const method = editingJobId ? 'PUT' : 'POST';
      const body = editingJobId 
        ? { jobId: editingJobId, ...formData, specialties: validSpecialties }
        : { ...formData, specialties: validSpecialties };

      const response = await fetch('/api/jobs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${editingJobId ? 'update' : 'create'} job`);
      }

      setSuccess(editingJobId ? 'Job updated successfully!' : 'Job created successfully!');
      resetForm();
      await fetchJobs();
    } catch (err) {
      console.error('Error saving job:', err);
      setError(err instanceof Error ? err.message : `Failed to ${editingJobId ? 'update' : 'create'} job`);
    } finally {
      setOperationLoading(prev => ({ ...prev, [operationKey]: false }));
    }
  };

  // Handle job deletion with confirmation
  const handleDelete = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${jobTitle}"?\n\nThis action cannot be undone and will affect any applications for this job.`)) {
      return;
    }

    setOperationLoading(prev => ({ ...prev, [`delete_${jobId}`]: true }));
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/jobs?jobId=${jobId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete job');
      }

      setSuccess(`Job "${jobTitle}" deleted successfully!`);
      await fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    } finally {
      setOperationLoading(prev => ({ ...prev, [`delete_${jobId}`]: false }));
    }
  };

  // Handle job status toggle (Activate/Deactivate)
  const handleToggleStatus = async (jobId: string, currentStatus: boolean, jobTitle: string) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const message = currentStatus 
      ? `Deactivate "${jobTitle}"?\n\nThis will hide the job from candidates but preserve existing applications.`
      : `Activate "${jobTitle}"?\n\nThis will make the job visible to candidates again.`;

    if (!confirm(message)) {
      return;
    }

    setOperationLoading(prev => ({ ...prev, [`toggle_${jobId}`]: true }));
    setError(null);
    setSuccess(null);

    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');

      const response = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId, 
          isActive: !currentStatus,
          title: job.title,
          description: job.description,
          category: job.category,
          specialties: job.specialties || [] // ✅ Include specialties
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} job`);
      }

      setSuccess(`Job "${jobTitle}" ${action}d successfully!`);
      await fetchJobs();
    } catch (err) {
      console.error(`Error ${action}ing job:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} job`);
    } finally {
      setOperationLoading(prev => ({ ...prev, [`toggle_${jobId}`]: false }));
    }
  };

  // Handle edit - populate form with job data
  const handleEdit = (job: Job) => {
    setFormData({
      title: job.title,
      description: job.description,
      category: job.category,
      specialties: job.specialties && job.specialties.length > 0 ? job.specialties : [''] // ✅ Load specialties
    });
    setEditingJobId(job.id);
    setIsAddingJob(true);
    setError(null);
    setSuccess(null);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      category: '',
      specialties: [''] // ✅ Reset specialties
    });
    setEditingJobId(null);
    setIsAddingJob(false);
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = React.useMemo(() => {
    let filtered = jobs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(search) ||
        job.description.toLowerCase().includes(search) ||
        job.category.toLowerCase().includes(search) ||
        (job.specialties && job.specialties.some(spec => spec.toLowerCase().includes(search))) // ✅ Search in specialties
      );
    }

    // Sort jobs
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'isActive':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        case 'createdAt':
        default:
          aValue = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          bValue = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, selectedCategory, searchTerm, sortBy, sortOrder]);

  // Group jobs by category for the filter dropdown
  const jobsByCategory = React.useMemo(() => {
    return JOB_CATEGORIES.reduce((acc, category) => {
      acc[category] = jobs.filter(job => job.category === category);
      return acc;
    }, {} as Record<JobCategory, Job[]>);
  }, [jobs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Job Management</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            &times;
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add New Job Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setIsAddingJob(true);
              setError(null);
              setSuccess(null);
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Job</span>
          </button>
        </div>

        {/* Add/Edit Job Form */}
        {isAddingJob && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingJobId ? 'Edit Job' : 'Add New Job'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as JobCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {JOB_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job description"
                  rows={4}
                  required
                />
              </div>

              {/* ✅ New Specialties Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialties <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => updateSpecialty(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Specialty ${index + 1}`}
                        required
                      />
                      {formData.specialties.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Another Specialty</span>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={operationLoading[editingJobId || 'create']}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {operationLoading[editingJobId || 'create'] 
                    ? 'Saving...' 
                    : (editingJobId ? 'Update Job' : 'Create Job')
                  }
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Jobs</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by title, description, category, or specialty..."
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories ({jobs.length})</option>
              {JOB_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category} ({jobsByCategory[category]?.length || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="category">Category</option>
                <option value="isActive">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {selectedCategory !== 'all' 
              ? `${selectedCategory} Jobs (${filteredAndSortedJobs.length})`
              : `All Jobs (${filteredAndSortedJobs.length})`
            }
          </h3>
          
          {loading && !isAddingJob && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-600">Loading jobs...</span>
              </div>
            </div>
          )}
          
          {!loading && filteredAndSortedJobs.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v4a2 2 0 002 2h4a2 2 0 002-2v-4" />
              </svg>
              <p className="text-gray-600 text-lg font-medium">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'No jobs match your current filters'
                  : 'No jobs found. Create your first job!'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
          
          {filteredAndSortedJobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{job.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      job.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 font-medium mb-2">{job.category}</p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">{job.description}</p>
                  
                  {/* ✅ Display Specialties */}
                  {job.specialties && job.specialties.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.specialties.map((specialty, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {job.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {job.createdAt.toDate?.().toLocaleDateString() || 'Unknown'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(job)}
                    disabled={operationLoading[`edit_${job.id}`]}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job.id, job.isActive, job.title)}
                    disabled={operationLoading[`toggle_${job.id}`]}
                    className={`px-3 py-1 text-white text-sm rounded transition-colors disabled:opacity-50 ${
                      job.isActive 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {operationLoading[`toggle_${job.id}`] 
                      ? '...' 
                      : (job.isActive ? 'Deactivate' : 'Activate')
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(job.id, job.title)}
                    disabled={operationLoading[`delete_${job.id}`]}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {operationLoading[`delete_${job.id}`] ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
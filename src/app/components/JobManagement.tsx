// src/app/components/JobManagement.tsx
import React, { useState, useEffect } from 'react';

// Job categories
const JOB_CATEGORIES = [
  'Agricole',
  'Bâtiment et travail publique',
  'Development & IT',
  'Industriel',
  'Restauration',
  'Santé',
  'Services',
  'Sociale',
  'Tourisme'
] as const;

type JobCategory = typeof JOB_CATEGORIES[number];

interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface JobManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    category: '' as JobCategory | ''
  });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingJobId ? '/api/jobs' : '/api/jobs';
      const method = editingJobId ? 'PUT' : 'POST';
      const body = editingJobId 
        ? { jobId: editingJobId, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save job');
      }

      setSuccess(editingJobId ? 'Job updated successfully!' : 'Job created successfully!');
      resetForm();
      fetchJobs(); // Refresh the list
    } catch (err) {
      console.error('Error saving job:', err);
      setError(err instanceof Error ? err.message : 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  // Handle job deletion
  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    setLoading(true);
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

      setSuccess('Job deleted successfully!');
      fetchJobs(); // Refresh the list
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    } finally {
      setLoading(false);
    }
  };

  // Handle job status toggle
  const handleToggleStatus = async (jobId: string, currentStatus: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, isActive: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update job status');
      }

      setSuccess('Job status updated successfully!');
      fetchJobs(); // Refresh the list
    } catch (err) {
      console.error('Error updating job status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update job status');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (job: Job) => {
    setFormData({
      title: job.title,
      description: job.description,
      category: job.category
    });
    setEditingJobId(job.id);
    setIsAddingJob(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ title: '', description: '', category: '' });
    setEditingJobId(null);
    setIsAddingJob(false);
    setError(null);
    setSuccess(null);
  };

  // Filter jobs by category
  const filteredJobs = selectedCategory === 'all' 
    ? jobs 
    : jobs.filter(job => job.category === selectedCategory);

  // Group jobs by category
  const jobsByCategory = JOB_CATEGORIES.reduce((acc, category) => {
    acc[category] = jobs.filter(job => job.category === category);
    return acc;
  }, {} as Record<JobCategory, Job[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
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
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Add New Job Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddingJob(true)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Add New Job
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
                  Category *
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
                  Job Title *
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
                  Job Description *
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
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingJobId ? 'Update Job' : 'Create Job')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {JOB_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category} ({jobsByCategory[category]?.length || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Existing Jobs {selectedCategory !== 'all' && `- ${selectedCategory}`}
          </h3>
          
          {loading && !isAddingJob && (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          )}
          
          {!loading && filteredJobs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'No jobs found. Create your first job!' 
                  : `No jobs found in ${selectedCategory} category.`
                }
              </p>
            </div>
          )}
          
          {filteredJobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{job.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 font-medium mb-2">{job.category}</p>
                  <p className="text-gray-700">{job.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(job)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job.id, job.isActive)}
                    className={`px-3 py-1 text-white text-sm rounded ${
                      job.isActive 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {job.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
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
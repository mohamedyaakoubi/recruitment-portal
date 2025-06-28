// src/app/components/JobManagement.tsx
import React, { useState, useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt?: any;
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadJobs();
    }
  }, [isOpen]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      if (response.ok) {
        setJobs(data.jobs || []);
      } else {
        setError('Failed to load jobs');
      }
    } catch (err) {
      setError('Error loading jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const method = editingJob ? 'PUT' : 'POST';
      const body = editingJob 
        ? { jobId: editingJob.id, ...formData }
        : formData;

      const response = await fetch('/api/jobs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(editingJob ? 'Job updated successfully' : 'Job created successfully');
        setFormData({ title: '', description: '' });
        setShowAddForm(false);
        setEditingJob(null);
        loadJobs();
      } else {
        setError(data.error || 'Failed to save job');
      }
    } catch (err) {
      setError('Error saving job');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({ title: job.title, description: job.description });
    setShowAddForm(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/jobs?jobId=${jobId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Job deleted successfully');
        loadJobs();
      } else {
        setError('Failed to delete job');
      }
    } catch (err) {
      setError('Error deleting job');
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (job: Job) => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          isActive: !job.isActive
        })
      });

      if (response.ok) {
        setSuccess(`Job ${!job.isActive ? 'activated' : 'deactivated'} successfully`);
        loadJobs();
      } else {
        setError('Failed to update job status');
      }
    } catch (err) {
      setError('Error updating job status');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setShowAddForm(false);
    setEditingJob(null);
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Job Management</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Add Job Button */}
        {!showAddForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add New Job
            </button>
          </div>
        )}

        {/* Add/Edit Job Form */}
        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingJob ? 'Edit Job' : 'Add New Job'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job description"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingJob ? 'Update Job' : 'Create Job')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Existing Jobs</h3>
          {loading && !showAddForm && (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          )}
          {jobs.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No jobs found. Create your first job!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-medium">{job.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{job.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(job)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleJobStatus(job)}
                        className={`px-3 py-1 rounded text-sm ${
                          job.isActive
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {job.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;


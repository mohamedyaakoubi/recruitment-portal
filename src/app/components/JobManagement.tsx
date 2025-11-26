import React, { useState, useEffect } from 'react';
import { JOB_CATEGORIES, JobCategory } from '@/lib/job-categories';
import { Job, JobManagementProps } from '@/types';
import logger from '@/lib/logger';

const inputFieldStyles =
  'block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';

const JobManagement: React.FC<JobManagementProps> = ({ isOpen, onClose }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isAddingJob, setIsAddingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as JobCategory | '',
    specialties: [''],
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'category' | 'createdAt' | 'isActive'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({});

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch jobs');
      setJobs(data.jobs || []);
    } catch (err) {
      logger.error('Error fetching jobs', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchJobs();
      resetForm();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const addSpecialty = () =>
    setFormData((prev) => ({ ...prev, specialties: [...prev.specialties, ''] }));
  const removeSpecialty = (index: number) => {
    if (formData.specialties.length > 1) {
      setFormData((prev) => ({
        ...prev,
        specialties: prev.specialties.filter((_, i) => i !== index),
      }));
    }
  };
  const updateSpecialty = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.map((spec, i) => (i === index ? value : spec)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSpecialties = formData.specialties.filter((spec) => spec.trim() !== '');
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      validSpecialties.length === 0
    ) {
      setError('Please fill in all fields and add at least one specialty');
      return;
    }

    const operationKey = editingJobId || 'create';
    setOperationLoading((prev) => ({ ...prev, [operationKey]: true }));
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
      if (!response.ok)
        throw new Error(data.error || `Failed to ${editingJobId ? 'update' : 'create'} job`);

      setSuccess(editingJobId ? 'Job updated successfully!' : 'Job created successfully!');
      resetForm();
      await fetchJobs();
    } catch (err) {
      logger.error('Error saving job', err);
      setError(
        err instanceof Error ? err.message : `Failed to ${editingJobId ? 'update' : 'create'} job`
      );
    } finally {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: false }));
    }
  };

  const handleDelete = async (jobId: string, jobTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${jobTitle}"? This action cannot be undone.`
      )
    )
      return;

    setOperationLoading((prev) => ({ ...prev, [`delete_${jobId}`]: true }));
    try {
      const response = await fetch(`/api/jobs?jobId=${jobId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete job');
      setSuccess(`Job "${jobTitle}" deleted successfully!`);
      await fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    } finally {
      setOperationLoading((prev) => ({ ...prev, [`delete_${jobId}`]: false }));
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: boolean, jobTitle: string) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    setOperationLoading((prev) => ({ ...prev, [`toggle_${jobId}`]: true }));
    try {
      const job = jobs.find((j) => j.id === jobId);
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
          specialties: job.specialties || [],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to ${action} job`);
      setSuccess(`Job "${jobTitle}" ${action}d successfully!`);
      await fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} job`);
    } finally {
      setOperationLoading((prev) => ({ ...prev, [`toggle_${jobId}`]: false }));
    }
  };

  const handleEdit = (job: Job) => {
    setFormData({
      title: job.title,
      description: job.description,
      category: job.category,
      specialties: job.specialties && job.specialties.length > 0 ? job.specialties : [''],
    });
    setEditingJobId(job.id);
    setIsAddingJob(true);
    setError(null);
    setSuccess(null);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: '', specialties: [''] });
    setEditingJobId(null);
    setIsAddingJob(false);
  };

  const filteredAndSortedJobs = React.useMemo(() => {
    let filtered = jobs;
    if (selectedCategory !== 'all')
      filtered = filtered.filter((job) => job.category === selectedCategory);
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(search) ||
          job.description.toLowerCase().includes(search) ||
          job.category.toLowerCase().includes(search) ||
          (job.specialties && job.specialties.some((spec) => spec.toLowerCase().includes(search)))
      );
    }
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

  const jobsByCategory = React.useMemo(() => {
    return JOB_CATEGORIES.reduce(
      (acc, category) => {
        acc[category] = jobs.filter((job) => job.category === category);
        return acc;
      },
      {} as Record<JobCategory, Job[]>
    );
  }, [jobs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-gray-50 p-6 shadow-2xl dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Job Management</h2>
          <button
            onClick={onClose}
            className="-mr-2 -mt-2 rounded-full p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="-mr-2 flex-grow overflow-y-auto pr-2">
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          {!isAddingJob && (
            <div className="mb-6">
              <button
                onClick={() => setIsAddingJob(true)}
                disabled={loading}
                className="btn btn-primary"
                data-testid="add-job-button"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Add New Job</span>
              </button>
            </div>
          )}

          {isAddingJob && (
            <div
              className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800"
              data-testid="job-form"
            >
              <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                {editingJobId ? 'Edit Job' : 'Add New Job'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField label="Category" required>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as JobCategory })
                      }
                      className={inputFieldStyles}
                      required
                    >
                      <option value="">Select a category</option>
                      {JOB_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </InputField>
                  <InputField label="Job Title" required>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={inputFieldStyles}
                      placeholder="e.g., Senior Developer"
                      required
                    />
                  </InputField>
                </div>
                <InputField label="Job Description" required>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={inputFieldStyles}
                    placeholder="Describe the role..."
                    rows={4}
                    required
                  />
                </InputField>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Specialties <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {formData.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) => updateSpecialty(index, e.target.value)}
                          className={`${inputFieldStyles} flex-1`}
                          placeholder={`Specialty ${index + 1}`}
                          required
                        />
                        {formData.specialties.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecialty(index)}
                            className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSpecialty}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Add Specialty</span>
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={operationLoading[editingJobId || 'create']}
                    className="btn btn-primary"
                    data-testid="create-job-button"
                  >
                    {operationLoading[editingJobId || 'create']
                      ? 'Saving...'
                      : editingJobId
                        ? 'Update Job'
                        : 'Create Job'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField label="Search Jobs">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={inputFieldStyles}
                  placeholder="Search..."
                />
              </InputField>
              <InputField label="Filter by Category">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={inputFieldStyles}
                >
                  <option value="all">All Categories ({jobs.length})</option>
                  {JOB_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category} ({jobsByCategory[category]?.length || 0})
                    </option>
                  ))}
                </select>
              </InputField>
              <InputField label="Sort by">
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'createdAt' | 'updatedAt' | 'title')
                    }
                    className={`${inputFieldStyles} flex-1`}
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                    <option value="isActive">Status</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </InputField>
            </div>

            <div className="space-y-3">
              {loading && !isAddingJob && <p className="dark:text-gray-300">Loading jobs...</p>}
              {!loading && filteredAndSortedJobs.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No jobs match your filters.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="mt-2 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Clear filters
                  </button>
                </div>
              )}
              {filteredAndSortedJobs.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  loading={operationLoading}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({
  label,
  children,
  required = false,
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Alert: React.FC<{ type: 'error' | 'success'; message: string }> = ({ type, message }) => {
  const colors = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-500/30',
      text: 'text-red-800 dark:text-red-300',
      icon: 'text-red-400 dark:text-red-400',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-500/30',
      text: 'text-green-800 dark:text-green-300',
      icon: 'text-green-400 dark:text-green-400',
    },
  };
  const style = colors[type];
  return (
    <div className={`${style.bg} border ${style.border} mb-4 rounded-lg p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${style.icon}`} viewBox="0 0 20 20" fill="currentColor">
            {type === 'error' ? (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </div>
        <div className="ml-3">
          <p className={style.text}>{message}</p>
        </div>
      </div>
    </div>
  );
};

interface JobListItemProps {
  job: Job;
  onEdit: (job: Job) => void;
  onToggleStatus: (jobId: string, currentStatus: boolean, jobTitle: string) => void;
  onDelete: (jobId: string, jobTitle: string) => void;
  loading: Record<string, boolean>;
}

const JobListItem: React.FC<JobListItemProps> = ({
  job,
  onEdit,
  onToggleStatus,
  onDelete,
  loading,
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">{job.title}</h4>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${job.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            {job.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {job.category}
        </p>
        <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {job.description}
        </p>
        {job.specialties && job.specialties.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {job.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
        {job.createdAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Created: {job.createdAt.toDate?.().toLocaleDateString() || 'Unknown'}
          </p>
        )}
      </div>
      <div className="ml-4 flex items-center gap-2">
        <ActionButton
          onClick={() => onEdit(job)}
          disabled={loading[`edit_${job.id}`]}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
              />
            </svg>
          }
          srText="Edit"
          color="blue"
        />
        <ActionButton
          onClick={() => onToggleStatus(job.id, job.isActive, job.title)}
          disabled={loading[`toggle_${job.id}`]}
          icon={
            job.isActive ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )
          }
          srText={job.isActive ? 'Deactivate' : 'Activate'}
          color={job.isActive ? 'yellow' : 'green'}
        />
        <ActionButton
          onClick={() => onDelete(job.id, job.title)}
          disabled={loading[`delete_${job.id}`]}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          }
          srText="Delete"
          color="red"
        />
      </div>
    </div>
  </div>
);

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactElement;
  srText: string;
  color: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, srText, color, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-full p-2 text-${color}-600 dark:text-${color}-400 hover:bg-${color}-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 focus:ring-${color}-500 transition-colors`}
  >
    <span className="sr-only">{srText}</span>
    {icon}
  </button>
);

export default JobManagement;

// src/components/ScoringModal.tsx
import React, { useState, useEffect } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Job, ScoringModalProps } from '@/types';
import logger from '@/lib/logger';

const ScoringModal: React.FC<ScoringModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSubmit,
  isLoading,
  error,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const modalRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (isOpen) {
      loadJobs();
    }
  }, [isOpen]);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      if (response.ok) {
        const activeJobs = data.jobs.filter((job: Job) => job.isActive);
        setJobs(activeJobs);
      }
    } catch (error) {
      logger.error('Error loading jobs', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleJobSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    const job = jobs.find((j) => j.id === jobId);
    setSelectedJob(job || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedJob) {
      onSubmit(selectedJob.id, selectedJob.title, selectedJob.description);
    }
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoring-modal-title"
      >
        <h2
          id="scoring-modal-title"
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-200"
        >
          Score Candidate: {candidate.fullName}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="jobSelection"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Select Job Position <span className="text-red-500">*</span>
            </label>
            {loadingJobs ? (
              <div className="text-gray-500 dark:text-gray-400">Loading jobs...</div>
            ) : (
              <select
                id="jobSelection"
                value={selectedJobId}
                onChange={handleJobSelection}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                required
              >
                <option value="">Select a job position</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedJob && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-900/20">
              <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-300">
                Job Description:
              </h4>
              <p className="whitespace-pre-wrap text-sm text-blue-800 dark:text-blue-300/80">
                {selectedJob.description}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-300">Error: {error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedJob}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Scoring...' : 'Score Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScoringModal;

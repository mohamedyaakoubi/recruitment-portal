// src/components/ScoringModal.tsx
import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Candidate, Job, ScoringModalProps } from '@/types';

const ScoringModal: React.FC<ScoringModalProps> = ({ isOpen, onClose, candidate, onSubmit, isLoading, error }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [loadingJobs, setLoadingJobs] = useState(false);

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
            console.error('Error loading jobs:', error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const handleJobSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const jobId = e.target.value;
        setSelectedJobId(jobId);
        const job = jobs.find(j => j.id === jobId);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-200">Score Candidate: {candidate.fullName}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="jobSelection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Job Position <span className="text-red-500">*</span>
                        </label>
                        {loadingJobs ? (
                            <div className="text-gray-500 dark:text-gray-400">Loading jobs...</div>
                        ) : (
                            <select
                                id="jobSelection"
                                value={selectedJobId}
                                onChange={handleJobSelection}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
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
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Job Description:</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300/80 whitespace-pre-wrap">{selectedJob.description}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                            <p className="text-red-600 dark:text-red-300 text-sm">Error: {error}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isLoading} 
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading || !selectedJob} 
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
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


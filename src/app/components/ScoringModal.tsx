// src/components/ScoringModal.tsx
import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

interface Candidate {
    id: string;
    fullName: string;
    email: string;
    websites: string[];
    cvUrl: string;
    passportUrl: string;
    submittedAt: Timestamp;
    status: 'submitted' | 'rejected' | 'interview_scheduled' | string;
    score: number | null;
    scoreAnalysis?: string;
    lastScoredAt?: Timestamp;
    interviewDate?: Timestamp;
}

interface Job {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
}

interface ScoringModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onScoreSubmit: (jobId: string, jobTitle: string, jobDescription: string) => Promise<void>;
    isScoring: boolean;
    scoringError: string | null;
}

const ScoringModal: React.FC<ScoringModalProps> = ({ isOpen, onClose, candidate, onScoreSubmit, isScoring, scoringError }) => {
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
            onScoreSubmit(selectedJob.id, selectedJob.title, selectedJob.description);
        }
    };

    if (!isOpen || !candidate) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Score Candidate: {candidate.fullName}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="jobSelection" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Job Position <span className="text-red-500">*</span>
                        </label>
                        {loadingJobs ? (
                            <div className="text-gray-500">Loading jobs...</div>
                        ) : (
                            <select
                                id="jobSelection"
                                value={selectedJobId}
                                onChange={handleJobSelection}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Job Description:</h4>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedJob.description}</p>
                        </div>
                    )}

                    {scoringError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">Error: {scoringError}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isScoring} 
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isScoring || !selectedJob} 
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isScoring ? 'Scoring...' : 'Score Candidate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScoringModal;


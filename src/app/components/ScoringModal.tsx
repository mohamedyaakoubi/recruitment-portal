// src/components/ScoringModal.tsx
// Placeholder component - Replace with actual implementation

import React from 'react';
import { Timestamp } from 'firebase/firestore';

interface Candidate {
    id: string;
    fullName: string;
    email: string;
    coverLetter: string;
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

interface ScoringModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onScoreSubmit: (jobDescription: string) => Promise<void>;
    isScoring: boolean;
    scoringError: string | null;
}

const ScoringModal: React.FC<ScoringModalProps> = ({ isOpen, onClose, candidate, onScoreSubmit, isScoring, scoringError }) => {
    if (!isOpen || !candidate) return null;

    const [jobDescription, setJobDescription] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onScoreSubmit(jobDescription);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h2 className="text-xl font-semibold mb-4">Score Candidate: {candidate.fullName}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">Job Description:</label>
                        <textarea
                            id="jobDescription"
                            rows={5}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Paste the job description here..."
                            required
                        />
                    </div>
                    {scoringError && (
                        <p className="text-red-600 text-sm mb-4">Error: {scoringError}</p>
                    )}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isScoring} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isScoring || !jobDescription} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                            {isScoring ? 'Scoring...' : 'Submit Score Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScoringModal;


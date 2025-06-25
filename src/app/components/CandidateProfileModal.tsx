// src/components/CandidateProfileModal.tsx

import React, { useState } from 'react';
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

interface CandidateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onStatusChange: (candidateId: string, newStatus: string, interviewTimestampISO?: string) => Promise<void>;
    statusUpdateLoading: boolean;
}

const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({ isOpen, onClose, candidate, onStatusChange, statusUpdateLoading }) => {
    if (!isOpen || !candidate) return null;

    const [showScheduleInput, setShowScheduleInput] = useState(false);
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');

    const handleReject = () => {
        onStatusChange(candidate.id, 'rejected');
    };

    const handleScheduleClick = () => {
        setShowScheduleInput(true);
    };

    const handleConfirmSchedule = () => {
        if (!interviewDate || !interviewTime) {
            alert('Please select both date and time for the interview.');
            return;
        }
        const dateTimeString = `${interviewDate}T${interviewTime}:00`;
        try {
            const interviewTimestamp = new Date(dateTimeString);
            if (isNaN(interviewTimestamp.getTime())) {
                throw new Error('Invalid date/time format');
            }
            onStatusChange(candidate.id, 'interview_scheduled', interviewTimestamp.toISOString());
            setShowScheduleInput(false); // Hide input after scheduling
        } catch (error) { 
            console.error("Error parsing date/time:", error);
            alert('Invalid date or time selected. Please check the format.');
        }
    };

    const handleCancelSchedule = () => {
        setShowScheduleInput(false);
        setInterviewDate('');
        setInterviewTime('');
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-semibold">Candidate Profile: {candidate.fullName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                <div className="space-y-4">
                    <p><strong>Email:</strong> {candidate.email}</p>
                    <p><strong>Submitted:</strong> {candidate.submittedAt?.toDate().toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.status === 'rejected' ? 'bg-red-100 text-red-800' : candidate.status === 'interview_scheduled' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{candidate.status}</span></p>
                    {candidate.interviewDate && (
                         <p><strong>Interview Scheduled:</strong> {candidate.interviewDate.toDate().toLocaleString()}</p>
                    )}
                    <div>
                        <strong>Websites:</strong>
                        {candidate.websites && candidate.websites.length > 0 ? (
                            <ul className="list-disc list-inside ml-4">
                                {candidate.websites.map((site, index) => (
                                    <li key={index}><a href={site.startsWith('http') ? site : `https://${site}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{site}</a></li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No websites provided.</p>
                        )}
                    </div>
                    <div>
                        <strong>Cover Letter:</strong>
                        <p className="mt-1 p-2 border rounded bg-gray-50 whitespace-pre-wrap text-sm">{candidate.coverLetter || 'N/A'}</p>
                    </div>
                    <div className="flex gap-4">
                        <a href={candidate.cvUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">View CV</a>
                        <a href={candidate.passportUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">View Passport/ID</a>
                    </div>

                    {/* AI Scoring Section */}
                    {candidate.score !== null && candidate.score !== undefined && (
                        <div className="mt-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold mb-2">AI Scoring Analysis</h3>
                            <p><strong>Score:</strong> {candidate.score}/100</p>
                            {candidate.lastScoredAt && <p className="text-xs text-gray-500 mb-2">Scored on: {candidate.lastScoredAt.toDate().toLocaleString()}</p>}
                            <p><strong>Analysis:</strong></p>
                            <p className="mt-1 p-2 border rounded bg-gray-50 whitespace-pre-wrap text-sm">{candidate.scoreAnalysis || 'No analysis provided.'}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-end gap-3">
                        {!showScheduleInput ? (
                            <>
                                <button 
                                    onClick={handleReject} 
                                    disabled={statusUpdateLoading || candidate.status === 'rejected'}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {statusUpdateLoading ? 'Rejecting...' : 'Reject Candidate'}
                                </button>
                                <button 
                                    onClick={handleScheduleClick} 
                                    disabled={statusUpdateLoading || candidate.status === 'interview_scheduled'}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {statusUpdateLoading ? '...' : 'Schedule Interview'}
                                </button>
                            </>
                        ) : (
                            <div className="w-full flex flex-col sm:flex-row items-center gap-3 border p-3 rounded bg-green-50">
                                <label htmlFor="interviewDate" className="text-sm font-medium">Date:</label>
                                <input 
                                    type="date" 
                                    id="interviewDate"
                                    value={interviewDate}
                                    onChange={(e) => setInterviewDate(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <label htmlFor="interviewTime" className="text-sm font-medium">Time:</label>
                                <input 
                                    type="time" 
                                    id="interviewTime"
                                    value={interviewTime}
                                    onChange={(e) => setInterviewTime(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <button 
                                    onClick={handleConfirmSchedule} 
                                    disabled={statusUpdateLoading || !interviewDate || !interviewTime}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                                >
                                    {statusUpdateLoading ? 'Scheduling...' : 'Confirm'}
                                </button>
                                <button 
                                    onClick={handleCancelSchedule} 
                                    disabled={statusUpdateLoading}
                                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfileModal;


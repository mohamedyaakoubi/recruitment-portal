import React, { useState } from 'react';
import { format } from 'date-fns';

import type { Candidate } from '@/types';

interface CandidateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onStatusChange: (candidateId: string, newStatus: string, interviewTimestampISO?: string) => Promise<void>;
    onCancelInterview: (candidateId: string, reason?: string) => Promise<void>;
    statusUpdateLoading: boolean;
    onScheduleInterview: () => void;
}

const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({ 
    isOpen, 
    onClose, 
    candidate, 
    onStatusChange, 
    onCancelInterview,
    statusUpdateLoading, 
    onScheduleInterview 
}) => {
    if (!isOpen || !candidate) return null;

    const handleReject = () => {
        onStatusChange(candidate.id, 'rejected');
    };

    const handleApprove = () => {
        onStatusChange(candidate.id, 'approved');
    };

    // Calculate age if date of birth is available
    const calculateAge = (dateOfBirth: string) => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear() - 
            (today.getMonth() < birthDate.getMonth() || 
             (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
        return age;
    };

    // Render interview section with cancel option
    const renderInterviewSection = () => {
        if (candidate?.status === 'interview_scheduled' && candidate?.interviewDate) {
            const interviewDate = candidate.interviewDate.toDate();
            const duration = candidate.duration || 30;
            const endDate = new Date(interviewDate.getTime() + (duration * 60 * 1000));
            
            return (
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <h4 className="text-sm font-medium text-green-800 mb-2">📅 Scheduled Interview</h4>
                    <p className="text-sm text-green-700">
                        <strong>Date:</strong> {format(interviewDate, 'PPP')}
                    </p>
                    <p className="text-sm text-green-700">
                        <strong>Time:</strong> {format(interviewDate, 'p')} - {format(endDate, 'p')} (Finland Time)
                    </p>
                    <p className="text-sm text-green-700">
                        <strong>Duration:</strong> {duration} minutes
                    </p>
                    {candidate.meetLink && (
                        <p className="text-sm text-green-700 mt-2">
                            <strong>Google Meet:</strong> 
                            <a 
                                href={candidate.meetLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline ml-1"
                            >
                                Join Meeting
                            </a>
                        </p>
                    )}
                    
                    <div className="mt-3 flex space-x-2">
                        <button
                            onClick={onScheduleInterview}
                            disabled={statusUpdateLoading}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50"
                        >
                            ✏️ Reschedule
                        </button>
                        <button
                            onClick={() => onCancelInterview(candidate.id, 'Cancelled by admin')}
                            disabled={statusUpdateLoading}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
                        >
                            ❌ Cancel Interview
                        </button>
                    </div>
                </div>
            );
        }
        
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">👤 Candidate Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none">&times;</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Photo and Basic Info */}
                    <div className="space-y-4">
                        {/* ✅ Photo Section */}
                        {candidate.photoUrl && (
                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400 text-center">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">📸 Photo</h3>
                                <div className="flex justify-center">
                                    <img 
                                        src={candidate.photoUrl} 
                                        alt={`${candidate.fullName}'s photo`}
                                        className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3">Basic Information</h3>
                            <div className="space-y-2">
                                <p className="text-sm"><strong>Full Name:</strong> {candidate.fullName}</p>
                                <p className="text-sm"><strong>Email:</strong> {candidate.email}</p>
                                {/* ✅ Display all personal information */}
                                {candidate.firstName && (
                                    <p className="text-sm"><strong>First Name:</strong> {candidate.firstName}</p>
                                )}
                                {candidate.lastName && (
                                    <p className="text-sm"><strong>Last Name:</strong> {candidate.lastName}</p>
                                )}
                                {candidate.gender && (
                                    <p className="text-sm"><strong>Gender:</strong> {candidate.gender.charAt(0).toUpperCase() + candidate.gender.slice(1)}</p>
                                )}
                                {candidate.phoneNumber && (
                                    <p className="text-sm"><strong>Phone Number:</strong> {candidate.phoneNumber}</p>
                                )}
                                {candidate.countryCode && (
                                    <p className="text-sm"><strong>Country Code:</strong> {candidate.countryCode}</p>
                                )}
                                {candidate.dateOfBirth && (
                                    <>
                                        <p className="text-sm"><strong>Date of Birth:</strong> {candidate.dateOfBirth}</p>
                                        <p className="text-sm"><strong>Age:</strong> {calculateAge(candidate.dateOfBirth)} years old</p>
                                    </>
                                )}
                                {candidate.city && (
                                    <p className="text-sm"><strong>City:</strong> {candidate.city}</p>
                                )}
                                {candidate.country && (
                                    <p className="text-sm"><strong>Country:</strong> {candidate.country}</p>
                                )}
                                {/* ✅ Nationality Information */}
                                {candidate.nationality && (
                                    <p className="text-sm"><strong>Nationality:</strong> {candidate.nationality}</p>
                                )}
                                {candidate.doubleNationality && (
                                    <p className="text-sm"><strong>Second Nationality:</strong> {candidate.doubleNationality}</p>
                                )}
                                <p className="text-sm"><strong>Submitted:</strong> {candidate.submittedAt?.toDate().toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Job Information */}
                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                            <h3 className="text-lg font-semibold text-purple-800 mb-3">Job Application</h3>
                            <div className="space-y-2">
                                {candidate.jobTitleText && (
                                    <p className="text-sm"><strong>Position Applied:</strong> {candidate.jobTitleText}</p>
                                )}
                                {candidate.jobCategory && (
                                    <p className="text-sm"><strong>Category:</strong> {candidate.jobCategory}</p>
                                )}
                                {candidate.jobTitle && (
                                    <p className="text-sm"><strong>Job ID:</strong> {candidate.jobTitle}</p>
                                )}
                                <p className="text-sm">
                                    <strong>Status:</strong> 
                                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        candidate.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                        candidate.status === 'interview_scheduled' ? 'bg-green-100 text-green-800' : 
                                        candidate.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {candidate.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Websites and Documents */}
                    <div className="space-y-4">
                        {/* Websites */}
                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">🌐 Websites & Links</h3>
                            {candidate.websites && candidate.websites.length > 0 ? (
                                <ul className="space-y-1">
                                    {candidate.websites.map((site, index) => (
                                        <li key={index} className="text-sm">
                                            <a 
                                                href={site.startsWith('http') ? site : `https://${site}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-blue-600 hover:underline break-all"
                                            >
                                                {site}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic text-sm">No websites provided.</p>
                            )}
                        </div>

                        {/* ✅ Enhanced Documents Section */}
                        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-3">📄 Documents</h3>
                            <div className="flex flex-col gap-3">
                                <a 
                                    href={candidate.cvUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm text-center transition-colors"
                                >
                                    📄 View CV/Resume
                                </a>
                                <a 
                                    href={candidate.passportUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm text-center transition-colors"
                                >
                                    🆔 View ID/Passport
                                </a>
                                {/* ✅ Photo View Button */}
                                {candidate.photoUrl && (
                                    <a 
                                        href={candidate.photoUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm text-center transition-colors"
                                    >
                                        📸 View Full Photo
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* ✅ Additional Information Section */}
                        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                            <h3 className="text-lg font-semibold text-orange-800 mb-3">📋 Additional Details</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Application ID:</strong> {candidate.id}</p>
                                {candidate.submittedAt && (
                                    <p><strong>Submission Date:</strong> {candidate.submittedAt.toDate().toLocaleDateString()}</p>
                                )}
                                {candidate.submittedAt && (
                                    <p><strong>Submission Time:</strong> {candidate.submittedAt.toDate().toLocaleTimeString()}</p>
                                )}
                                {candidate.lastScoredAt && (
                                    <p><strong>Last Scored:</strong> {candidate.lastScoredAt.toDate().toLocaleString()}</p>
                                )}
                                {candidate.calendarEventId && (
                                    <p><strong>Calendar Event ID:</strong> {candidate.calendarEventId}</p>
                                )}
                                {candidate.meetSpaceId && (
                                    <p><strong>Meet Space ID:</strong> {candidate.meetSpaceId}</p>
                                )}
                                {candidate.duration && (
                                    <p><strong>Interview Duration:</strong> {candidate.duration} minutes</p>
                                )}
                            </div>
                        </div>

                        {/* Interview Section */}
                        {renderInterviewSection()}
                    </div>

                    {/* Right Column - AI Scoring and Actions */}
                    <div className="space-y-4">
                        {/* AI Scoring Section */}
                        {candidate.score !== null && candidate.score !== undefined && (
                            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                                <h3 className="text-lg font-semibold text-indigo-800 mb-3">🤖 AI Scoring Analysis</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">Score:</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${
                                                    candidate.score >= 80 ? 'bg-green-500' :
                                                    candidate.score >= 60 ? 'bg-yellow-500' :
                                                    candidate.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${candidate.score}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold">{candidate.score}/100</span>
                                    </div>
                                    {candidate.lastScoredAt && (
                                        <p className="text-xs text-gray-500">
                                            Scored on: {candidate.lastScoredAt.toDate().toLocaleString()}
                                        </p>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium mb-2">Analysis:</p>
                                        <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                                            {candidate.scoreAnalysis || 'No analysis provided.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">⚡ Actions</h3>
                            <div className="space-y-3">
                                {/* Actions based on status */}
                                {candidate.status === 'submitted' && (
                                    <div className="space-y-2">
                                        <button 
                                            onClick={onScheduleInterview}
                                            disabled={statusUpdateLoading}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {statusUpdateLoading ? 'Processing...' : '📅 Schedule Interview'}
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={handleApprove}
                                                disabled={statusUpdateLoading}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {statusUpdateLoading ? '...' : '✅ Approve'}
                                            </button>
                                            <button 
                                                onClick={handleReject}
                                                disabled={statusUpdateLoading}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {statusUpdateLoading ? '...' : '❌ Reject'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {candidate.status === 'interview_scheduled' && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={handleApprove}
                                                disabled={statusUpdateLoading}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {statusUpdateLoading ? '...' : '✅ Approve'}
                                            </button>
                                            <button 
                                                onClick={handleReject}
                                                disabled={statusUpdateLoading}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {statusUpdateLoading ? '...' : '❌ Reject'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {(candidate.status === 'rejected' || candidate.status === 'approved') && (
                                    <div className="text-center py-4">
                                        <p className="text-gray-600 italic">
                                            This candidate has been <strong>{candidate.status}</strong>. 
                                            No further actions available.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfileModal;
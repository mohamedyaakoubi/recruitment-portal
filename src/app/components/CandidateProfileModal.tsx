import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiX, FiUser, FiFileText, FiClipboard, FiLink, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiEdit, FiTrash2, FiExternalLink, FiAward, FiBriefcase, FiMapPin, FiPhone, FiMail, FiGlobe, FiImage, FiCode, FiKey, FiUsers, FiTarget } from 'react-icons/fi';
import EditCandidateModal from './EditCandidateModal';

import type { Candidate, CandidateProfileModalProps } from '@/types';

// Helper to calculate age
const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    
    try {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        
        // Check if date is valid
        if (isNaN(birthDate.getTime())) return null;
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // If birth month hasn't occurred this year, or it's the birth month but the day hasn't occurred
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    } catch {
        return null;
    }
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusStyles: { [key: string]: string } = {
        submitted: 'bg-blue-100 text-blue-800',
        interview_scheduled: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.replace('_', ' ').toUpperCase()}
        </span>
    );
};

// Info Card Component
const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center">
            <div className="text-gray-500 mr-3">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-4 space-y-3 text-sm text-gray-600">{children}</div>
    </div>
);

// Info Row Component
const InfoRow: React.FC<{ label: string; value?: string | null; icon?: React.ReactNode }> = ({ label, value, icon }) => {
    if (!value && value !== null) return null;
    return (
        <div className="flex items-start">
            {icon && <div className="text-gray-400 mt-0.5 mr-2">{icon}</div>}
            <span className="font-medium text-gray-900 w-32 flex-shrink-0">{label}:</span>
            <span className="flex-1 break-words">{value ?? 'N/A'}</span>
        </div>
    );
};



const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
    isOpen,
    onClose,
    candidate,
    onStatusChange,
    onCancelInterview,
    statusUpdateLoading,
    onScheduleInterview,
    onEditCandidate, // 🔥 NEW: Add edit handler
}) => {
    // 🔥 NEW: Add edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isOpen || !candidate) return null;

    const handleReject = () => onStatusChange(candidate.id, 'rejected');
    const handleApprove = () => onStatusChange(candidate.id, 'approved');
    const age = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : null;

    // 🔥 NEW: Handle edit candidate
const handleEditCandidate = async (candidateId: string, updatedData: Partial<Candidate>) => {
    if (!onEditCandidate) return;
    
    setIsUpdating(true);
    try {
        await onEditCandidate(candidateId, updatedData);
        setIsEditModalOpen(false);
    } catch (error) {
        console.error('Failed to update candidate:', error);
    } finally {
        setIsUpdating(false);
    }
};

    const renderInterviewSection = () => {
        if (candidate?.status !== 'interview_scheduled' || !candidate?.interviewDate) return null;
        
        const interviewDate = candidate.interviewDate.toDate();
        const duration = candidate.duration || 30;
        const endDate = new Date(interviewDate.getTime() + duration * 60 * 1000);

        return (
            <InfoCard title="Interview Details" icon={<FiCalendar size={20} />}>
                <InfoRow label="Date" value={format(interviewDate, 'PPP')} icon={<FiClock size={14} />} />
                <InfoRow label="Time" value={`${format(interviewDate, 'p')} - ${format(endDate, 'p')}`} icon={<FiClock size={14} />} />
                <InfoRow label="Duration" value={`${duration} minutes`} icon={<FiClock size={14} />} />
                {candidate.meetLink && (
                    <div className="pt-2">
                        <a href={candidate.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full justify-center">
                            <FiExternalLink className="mr-2" /> Join Google Meet
                        </a>
                    </div>
                )}
                <div className="pt-3 flex space-x-2">
                    <button onClick={onScheduleInterview} disabled={statusUpdateLoading} className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50">
                        <FiEdit className="mr-2" /> Reschedule
                    </button>
                    <button onClick={() => onCancelInterview(candidate.id, 'Cancelled by admin')} disabled={statusUpdateLoading} className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50">
                        <FiTrash2 className="mr-2" /> Cancel
                    </button>
                </div>
            </InfoCard>
        );
    };

    const renderActionButtons = () => {
        if (candidate.status === 'approved' || candidate.status === 'rejected') {
            return (
                <div className="text-center py-4 text-gray-600 italic">
                    This candidate has been <strong>{candidate.status}</strong>.
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {candidate.status === 'submitted' && (
                     <button onClick={onScheduleInterview} disabled={statusUpdateLoading} className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        <FiCalendar className="mr-2" /> {statusUpdateLoading ? 'Processing...' : 'Schedule Interview'}
                    </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleApprove} disabled={statusUpdateLoading} className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
                        <FiCheckCircle className="mr-2" /> {statusUpdateLoading ? '...' : 'Approve'}
                    </button>
                    <button onClick={handleReject} disabled={statusUpdateLoading} className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
                        <FiXCircle className="mr-2" /> {statusUpdateLoading ? '...' : 'Reject'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-50 rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
               {/* Header */}
                    <div className="p-5 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center">
                            {candidate.photoUrl ? (
                                <img src={candidate.photoUrl} alt={candidate.fullName} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4"><FiUser size={24} className="text-gray-500" /></div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h2>
                                <p className="text-sm text-gray-500">{candidate.jobTitleText}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* 🔥 NEW: Add edit button */}
                            {onEditCandidate && (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center px-3 py-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                                    disabled={statusUpdateLoading || isUpdating}
                                >
                                    <FiEdit className="mr-2" size={16} />
                                    Edit
                                </button>
                            )}
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2">
                                <FiX size={24} />
                            </button>
                        </div>
                    </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <InfoCard title="Personal Information" icon={<FiUser size={20} />}>
                                <InfoRow label="First Name" value={candidate.firstName} />
                                <InfoRow label="Last Name" value={candidate.lastName} />
                                <InfoRow label="Gender" value={candidate.gender} icon={<FiUsers size={14} />} />
                                <InfoRow label="Email" value={candidate.email} icon={<FiMail size={14} />} />
                                <InfoRow label="Phone" value={candidate.phoneNumber ? `${candidate.countryCode || ''} ${candidate.phoneNumber}` : null} icon={<FiPhone size={14} />} />
                                <InfoRow label="Location" value={candidate.city && candidate.country ? `${candidate.city}, ${candidate.country}` : null} icon={<FiMapPin size={14} />} />
                                <InfoRow label="Nationality" value={candidate.nationality} icon={<FiGlobe size={14} />} />
                                {candidate.doubleNationality && <InfoRow label="2nd Nationality" value={candidate.doubleNationality} icon={<FiGlobe size={14} />} />}
                                <InfoRow label="Date of Birth" value={candidate.dateOfBirth ? `${candidate.dateOfBirth} (${age} years)` : null} icon={<FiCalendar size={14} />} />
                            </InfoCard>

                            <InfoCard title="Application Details" icon={<FiBriefcase size={20} />}>
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-900 w-32">Status:</span>
                                    <StatusBadge status={candidate.status} />
                                </div>
                                <InfoRow label="Category" value={candidate.jobCategory} />
                                <InfoRow label="Specialty" value={candidate.specialty} icon={<FiTarget size={14} />} />
                                <InfoRow label="Job ID" value={candidate.jobTitle} />
                                <InfoRow label="Submitted" value={candidate.submittedAt?.toDate().toLocaleString()} />
                                <InfoRow label="Application ID" value={candidate.id} />
                            </InfoCard>

                            <InfoCard title="Documents & Links" icon={<FiFileText size={20} />}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <a href={candidate.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                                        <FiFileText className="mr-2" /> View CV/Resume
                                    </a>
                                    <a href={candidate.passportUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                                        <FiClipboard className="mr-2" /> View ID/Passport
                                    </a>
                                    {candidate.photoUrl && (
                                        <a href={candidate.photoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                                            <FiImage className="mr-2" /> View Photo
                                        </a>
                                    )}
                                </div>
                                {candidate.websites && candidate.websites.length > 0 && (
                                    <div className="pt-3 space-y-2">
                                        {candidate.websites.map((site, index) => (
                                            <a key={index} href={site.startsWith('http') ? site : `https://${site}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline break-all">
                                                <FiLink size={14} className="mr-2" /> {site}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </InfoCard>
                            
                            <InfoCard title="System Details" icon={<FiCode size={20} />}>
                                <InfoRow label="Calendar Event ID" value={candidate.calendarEventId} icon={<FiKey size={14} />} />
                                <InfoRow label="Meet Space ID" value={candidate.meetSpaceId} icon={<FiKey size={14} />} />
                            </InfoCard>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {candidate.score !== null && candidate.score !== undefined && (
                                <InfoCard title="AI Scoring Analysis" icon={<FiAward size={20} />}>
                                    <div className="flex items-center space-x-3">
                                        <div className="relative w-20 h-20">
                                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                                <path className="text-gray-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="text-green-500" strokeWidth="3" fill="none" strokeDasharray={`${candidate.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-800">{candidate.score}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.scoreAnalysis || 'No analysis provided.'}</p>
                                            {candidate.lastScoredAt && <p className="text-xs text-gray-400 mt-2">Scored on: {candidate.lastScoredAt.toDate().toLocaleDateString()}</p>}
                                        </div>
                                    </div>
                                </InfoCard>
                            )}
                            
                            {renderInterviewSection()}

                            <InfoCard title="Actions" icon={<FiEdit size={20} />}>
                                {renderActionButtons()}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
                    <EditCandidateModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                candidate={candidate}
                onSave={handleEditCandidate}
                isLoading={isUpdating}
            />
               </>
    );
};

export default CandidateProfileModal;
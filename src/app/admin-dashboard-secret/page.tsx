"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'; // Use client SDK for real-time updates
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { Calendar, dateFnsLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import { addHours } from 'date-fns/addHours';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

// Import modal components (assuming they exist and are correctly implemented)
import ScoringModal from '../components/ScoringModal';
import CandidateProfileModal from '../components/CandidateProfileModal';
import JobManagement from '../components/JobManagement';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import InterviewSchedulingModal from '../components/InterviewSchedulingModal';

// --- Calendar Setup ---
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
// ---------------------

// --- Types --- 
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

interface InterviewEvent extends CalendarEvent {
    resource: Candidate;
}

// --- Chart Data Preparation --- 
const getStatusChartData = (candidates: Candidate[]) => {
    const counts = candidates.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return [
        { name: 'Submitted', value: counts.submitted || 0 },
        { name: 'Interview Scheduled', value: counts.interview_scheduled || 0 },
        { name: 'Rejected', value: counts.rejected || 0 },
    ].filter(item => item.value > 0);
};

const getScoreDistributionData = (candidates: Candidate[]) => {
    const scoredCandidates = candidates.filter(c => c.score !== null && c.score !== undefined);
    const bins = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0,
    };

    scoredCandidates.forEach(c => {
        const score = c.score!;
        if (score >= 0 && score <= 20) bins['0-20']++;
        else if (score <= 40) bins['21-40']++;
        else if (score <= 60) bins['41-60']++;
        else if (score <= 80) bins['61-80']++;
        else if (score <= 100) bins['81-100']++;
    });

    return Object.entries(bins).map(([name, value]) => ({ name, count: value }));
};

// --- Chart Colors --- 
const STATUS_COLORS = ['#3B82F6', '#10B981', '#EF4444']; // Blue, Green, Red
const SCORE_COLORS = ['#EF4444', '#F59E0B', '#FCD34D', '#A7F3D0', '#10B981']; // Red to Green gradient

// --- Main Dashboard Component ---
function DashboardContent() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterName, setFilterName] = useState<string>('');
    const [filterCity, setFilterCity] = useState<string>('');
    const [filterCountry, setFilterCountry] = useState<string>('');
    const [filterJobTitle, setFilterJobTitle] = useState<string>('');
    const [filterAgeMin, setFilterAgeMin] = useState<string>('');
    const [filterAgeMax, setFilterAgeMax] = useState<string>('');
    const [statusUpdateLoading, setStatusUpdateLoading] = useState<Record<string, boolean>>({});
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    // State for Modals
    const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isJobManagementOpen, setIsJobManagementOpen] = useState(false);
    const [isInterviewSchedulingOpen, setIsInterviewSchedulingOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isScoring, setIsScoring] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scoringError, setScoringError] = useState<string | null>(null);

    // State for Toast and Confirmation
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({ message: '', type: 'info', isVisible: false });
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    // --- Data Fetching ---
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin-dashboard-secret/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            setLoadingCandidates(true);
            const q = query(collection(db, "candidates"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const candidatesData: Candidate[] = [];
                querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
                    const data = doc.data();
                    candidatesData.push({
                        id: doc.id,
                        email: data.email || '',
                        scoreAnalysis: data.scoreAnalysis || '',
                        interviewDate: data.interviewDate || undefined,
                        ...data
                    } as Candidate);
                });
                candidatesData.sort((a, b) => (b.submittedAt?.toMillis() ?? 0) - (a.submittedAt?.toMillis() ?? 0));
                setCandidates(candidatesData);
                setLoadingCandidates(false);
            }, (error) => {
                console.error("Error fetching candidates: ", error);
                setLoadingCandidates(false);
            });
            return () => unsubscribe();
        } else {
            setCandidates([]);
            setLoadingCandidates(false);
        }
    }, [user]);

    // --- Calendar Event Preparation ---
    const interviewEvents: InterviewEvent[] = useMemo(() => {
        return candidates
            .filter(c => c.status === 'interview_scheduled' && c.interviewDate)
            .map(c => ({
                title: `Interview: ${c.fullName}`,
                start: c.interviewDate!.toDate(),
                end: addHours(c.interviewDate!.toDate(), 1),
                resource: c,
            }));
    }, [candidates]);

    // --- Filtering and Stats ---
    const stats = useMemo(() => {
        const total = candidates.length;
        const rejected = candidates.filter(c => c.status === 'rejected').length;
        const scheduled = candidates.filter(c => c.status === 'interview_scheduled').length;
        const submitted = candidates.filter(c => c.status === 'submitted').length;
        return { total, rejected, scheduled, submitted };
    }, [candidates]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate => {
            const statusMatch = filterStatus === 'all' || candidate.status === filterStatus;
            const nameMatch = filterName === '' || candidate.fullName.toLowerCase().includes(filterName.toLowerCase());
            const cityMatch = filterCity === '' || (candidate.city && candidate.city.toLowerCase().includes(filterCity.toLowerCase()));
            const countryMatch = filterCountry === '' || (candidate.country && candidate.country.toLowerCase().includes(filterCountry.toLowerCase()));
            const jobTitleMatch = filterJobTitle === '' || (candidate.jobTitleText && candidate.jobTitleText.toLowerCase().includes(filterJobTitle.toLowerCase()));
            
            // Age filtering
            let ageMatch = true;
            if (candidate.dateOfBirth && (filterAgeMin || filterAgeMax)) {
                const birthDate = new Date(candidate.dateOfBirth);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear() - 
                    (today.getMonth() < birthDate.getMonth() || 
                     (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
                
                if (filterAgeMin && age < parseInt(filterAgeMin)) ageMatch = false;
                if (filterAgeMax && age > parseInt(filterAgeMax)) ageMatch = false;
            }
            
            return statusMatch && nameMatch && cityMatch && countryMatch && jobTitleMatch && ageMatch;
        });
    }, [candidates, filterStatus, filterName, filterCity, filterCountry, filterJobTitle, filterAgeMin, filterAgeMax]);

    // --- Chart Data Calculation ---
    const statusChartData = useMemo(() => getStatusChartData(candidates), [candidates]);
    const scoreDistributionData = useMemo(() => getScoreDistributionData(candidates), [candidates]);

    // --- Modal Control Functions ---
    const openScoringModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsScoringModalOpen(true);
    };
    const closeScoringModal = () => {
        setIsScoringModalOpen(false);
        setSelectedCandidate(null);
        setScoringError(null);
    };
    const openProfileModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsProfileModalOpen(true);
    };
    const closeProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedCandidate(null);
    };

    // --- API Call Handlers ---
    const handleScoreSubmit = async (jobId: string, jobTitle: string, jobDescription: string) => {
        if (!selectedCandidate) return;
        setIsScoring(true);
        setScoringError(null);
        try {
            const response = await fetch('/api/score-candidate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    candidateId: selectedCandidate.id, 
                    jobId, 
                    jobTitle, 
                    jobDescription 
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to score candidate');
            }
            // No need to manually update state here, Firestore listener will catch it
            console.log('Scoring successful:', result);
            closeScoringModal(); // Close modal on success
        } catch (error) {
            console.error('Scoring failed:', error);
            setScoringError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsScoring(false);
        }
    };

    const handleStatusChange = async (candidateId: string, newStatus: string, interviewTimestampISO?: string) => {
        // Show confirmation modal for rejection
        if (newStatus === 'rejected') {
            const candidate = candidates.find(c => c.id === candidateId);
            setConfirmationModal({
                isOpen: true,
                title: 'Confirm Candidate Rejection',
                message: `Are you sure you want to reject ${candidate?.fullName || 'this candidate'}? This action cannot be undone.`,
                onConfirm: () => {
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                    performStatusChange(candidateId, newStatus, interviewTimestampISO);
                }
            });
            return;
        }
        
        // For non-rejection status changes, proceed directly
        performStatusChange(candidateId, newStatus, interviewTimestampISO);
    };

    const performStatusChange = async (candidateId: string, newStatus: string, interviewTimestampISO?: string) => {
        setStatusUpdateLoading(prev => ({ ...prev, [candidateId]: true }));
        setStatusUpdateError(null);
        try {
            const response = await fetch('/api/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId, newStatus, interviewTimestampISO }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to update status');
            }
            console.log('Status update successful:', result);
            
            // Send rejection email if status is rejected
            if (newStatus === 'rejected') {
                const candidate = candidates.find(c => c.id === candidateId);
                if (candidate && candidate.email) {
                    try {
                        const emailResponse = await fetch('/api/send-rejection-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                candidateEmail: candidate.email,
                                candidateName: candidate.fullName,
                                jobTitle: candidate.jobTitleText || ''
                            }),
                        });
                        
                        if (emailResponse.ok) {
                            console.log('Rejection email sent successfully');
                            showToast('Candidate rejected and email notification sent successfully!', 'success');
                        } else {
                            console.error('Failed to send rejection email');
                            showToast('Candidate rejected, but email notification failed to send.', 'warning');
                        }
                    } catch (emailError) {
                        console.error('Error sending rejection email:', emailError);
                        showToast('Candidate rejected, but email notification failed to send.', 'warning');
                    }
                } else {
                    showToast(`Candidate status updated to ${newStatus.replace('_', ' ')} successfully!`, 'success');
                }
            } else {
                // Show success toast for non-rejection status changes
                showToast(`Candidate status updated to ${newStatus.replace('_', ' ')} successfully!`, 'success');
            }
            
            // Close profile modal if open for this candidate after status change
            if (selectedCandidate?.id === candidateId) {
                closeProfileModal();
            }
        } catch (error) {
            console.error('Status update failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            setStatusUpdateError(errorMessage);
            showToast(`Failed to update status: ${errorMessage}`, 'error');
        } finally {
            setStatusUpdateLoading(prev => ({ ...prev, [candidateId]: false }));
        }
    };

    // Toast helper functions
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // --- Interview Scheduling Handler ---
    const handleScheduleInterview = async (interviewData: {
        candidateId: string;
        candidateEmail: string;
        candidateName: string;
        interviewDate: string;
        interviewTime: string;
        jobTitle?: string;
        adminEmail?: string;
    }) => {
        setIsScheduling(true);
        try {
            const response = await fetch('/api/schedule-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(interviewData),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to schedule interview');
            }

            // Update candidate status to interview_scheduled
            await handleStatusChange(interviewData.candidateId, 'interview_scheduled', result.interviewDateTime);
            
            showToast('Interview scheduled successfully! Invitation emails sent.', 'success');
            setIsInterviewSchedulingOpen(false);
            
        } catch (error) {
            console.error('Failed to schedule interview:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            showToast(`Failed to schedule interview: ${errorMessage}`, 'error');
        } finally {
            setIsScheduling(false);
        }
    };

    const openInterviewSchedulingModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsInterviewSchedulingOpen(true);
    };

    // --- Calendar Event Selection Handler ---
    const handleSelectEvent = useCallback((event: InterviewEvent) => {
        openProfileModal(event.resource); // Open profile modal for the candidate associated with the event
    }, []);

    // --- Export Handler ---
    const handleExport = async (format: 'json' | 'csv' | 'xlsx') => {
        try {
            const params = new URLSearchParams({
                format,
                status: filterStatus,
                name: filterName
            });

            const response = await fetch(`/api/export-candidates?${params}`);
            
            if (!response.ok) {
                throw new Error('Export failed');
            }

            if (format === 'xlsx') {
                // Handle XLSX export with client-side processing
                const data = await response.json();
                await downloadXLSX(data.data, data.filename);
            } else {
                // Handle direct download for JSON and CSV
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `candidates_${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    };

    // --- XLSX Download Helper ---
    const downloadXLSX = async (data: any[], filename: string) => {
        // Simple XLSX generation using JSON to CSV conversion
        // In a production app, you'd use a library like xlsx or exceljs
        const headers = [
            'Full Name', 'Email', 'Gender', 'Phone Number', 'Date of Birth',
            'City', 'Country', 'Job Title', 'Websites', 'Status', 'AI Score',
            'Score Analysis', 'Submitted At', 'Interview Date', 'CV URL', 'Passport URL'
        ];
        
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                row.fullName, row.email, row.gender, row.phoneNumber, row.dateOfBirth,
                row.city, row.country, row.jobTitle, row.websites, row.status, row.score,
                row.scoreAnalysis, row.submittedAt, row.interviewDate, row.cvUrl, row.passportUrl
            ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace('.xlsx', '.csv'); // Fallback to CSV for now
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // --- Render Logic ---
    if (authLoading || (user && loadingCandidates)) { return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>; }
    if (!user) { return null; }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsJobManagementOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm"
                    >
                        Manage Jobs
                    </button>
                    <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                    <button onClick={signOut} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm">Sign Out</button>
                </div>
            </header>

            {/* Enhanced Stats Section */}
            <section className="mb-8">
                {/* Main Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium opacity-90">Total Candidates</h3>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium opacity-90">Submitted</h3>
                                <p className="text-3xl font-bold">{stats.submitted}</p>
                                <p className="text-xs opacity-75 mt-1">
                                    {stats.total > 0 ? `${((stats.submitted / stats.total) * 100).toFixed(1)}%` : '0%'} of total
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium opacity-90">Interview Scheduled</h3>
                                <p className="text-3xl font-bold">{stats.scheduled}</p>
                                <p className="text-xs opacity-75 mt-1">
                                    {stats.total > 0 ? `${((stats.scheduled / stats.total) * 100).toFixed(1)}%` : '0%'} of total
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium opacity-90">Rejected</h3>
                                <p className="text-3xl font-bold">{stats.rejected}</p>
                                <p className="text-xs opacity-75 mt-1">
                                    {stats.total > 0 ? `${((stats.rejected / stats.total) * 100).toFixed(1)}%` : '0%'} of total
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-600">Average AI Score</h4>
                                <p className="text-2xl font-bold text-purple-600">
                                    {candidates.filter(c => c.score !== null).length > 0 
                                        ? (candidates.filter(c => c.score !== null).reduce((sum, c) => sum + (c.score || 0), 0) / candidates.filter(c => c.score !== null).length).toFixed(1)
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                            <div className="text-purple-500">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-600">High Scorers (80+)</h4>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {candidates.filter(c => (c.score || 0) >= 80).length}
                                </p>
                            </div>
                            <div className="text-yellow-500">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-teal-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-600">Conversion Rate</h4>
                                <p className="text-2xl font-bold text-teal-600">
                                    {stats.submitted > 0 
                                        ? `${((stats.scheduled / stats.submitted) * 100).toFixed(1)}%`
                                        : '0%'
                                    }
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Submitted → Scheduled</p>
                            </div>
                            <div className="text-teal-500">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enhanced Charts Section */}
            <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Candidate Status Distribution</h3>
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    {statusChartData.length > 0 ? (
                        <div className="relative">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <defs>
                                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1"/>
                                        </filter>
                                    </defs>
                                    <Pie 
                                        data={statusChartData} 
                                        cx="50%" 
                                        cy="50%" 
                                        labelLine={false} 
                                        outerRadius={120} 
                                        innerRadius={60}
                                        fill="#8884d8" 
                                        dataKey="value" 
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        filter="url(#shadow)"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#f8fafc', 
                                            border: '1px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }} 
                                    />
                                    <Legend 
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-lg font-medium">No candidate data available</p>
                            <p className="text-sm">Status distribution will appear here once candidates are added</p>
                        </div>
                    )}
                </div>

                {/* Score Distribution Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">AI Score Distribution</h3>
                        <div className="bg-green-50 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                    </div>
                    {scoreDistributionData.some(d => d.count > 0) ? (
                        <div className="relative">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart 
                                    data={scoreDistributionData} 
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.3}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                    />
                                    <YAxis 
                                        allowDecimals={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                    />
                                    <RechartsTooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#f8fafc', 
                                            border: '1px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    />
                                    <Bar 
                                        dataKey="count" 
                                        fill="url(#barGradient)"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {scoreDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <p className="text-lg font-medium">No scored candidates yet</p>
                            <p className="text-sm">Score distribution will appear here once candidates are scored</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Filters Section */}
            <section className="mb-6 bg-white p-4 rounded-lg shadow">
                 <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-gray-700">Filters:</h3>
                    
                    {/* First row of filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="filterName" className="block text-sm font-medium text-gray-700 mb-1">Filter by Name</label>
                            <input 
                                type="text" 
                                id="filterName" 
                                placeholder="Filter by name..." 
                                value={filterName} 
                                onChange={(e) => setFilterName(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="filterCity" className="block text-sm font-medium text-gray-700 mb-1">Filter by City</label>
                            <input 
                                type="text" 
                                id="filterCity" 
                                placeholder="Filter by city..." 
                                value={filterCity} 
                                onChange={(e) => setFilterCity(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="filterCountry" className="block text-sm font-medium text-gray-700 mb-1">Filter by Country</label>
                            <input 
                                type="text" 
                                id="filterCountry" 
                                placeholder="Filter by country..." 
                                value={filterCountry} 
                                onChange={(e) => setFilterCountry(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    
                    {/* Second row of filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="filterJobTitle" className="block text-sm font-medium text-gray-700 mb-1">Filter by Job Title</label>
                            <input 
                                type="text" 
                                id="filterJobTitle" 
                                placeholder="Filter by job title..." 
                                value={filterJobTitle} 
                                onChange={(e) => setFilterJobTitle(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="filterAgeMin" className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                            <input 
                                type="number" 
                                id="filterAgeMin" 
                                placeholder="Min age..." 
                                value={filterAgeMin} 
                                onChange={(e) => setFilterAgeMin(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="filterAgeMax" className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
                            <input 
                                type="number" 
                                id="filterAgeMax" 
                                placeholder="Max age..." 
                                value={filterAgeMax} 
                                onChange={(e) => setFilterAgeMax(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                            <select 
                                id="filterStatus" 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="interview_scheduled">Interview Scheduled</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Clear filters button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setFilterName('');
                                setFilterCity('');
                                setFilterCountry('');
                                setFilterJobTitle('');
                                setFilterAgeMin('');
                                setFilterAgeMax('');
                                setFilterStatus('all');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                        >
                            Clear All Filters
                        </button>
                    </div>

                    {/* Quick Filter Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters:</h4>
                        
                        {/* Status Quick Filters */}
                        <div className="mb-3">
                            <span className="text-xs font-medium text-gray-600 mr-2">Status:</span>
                            <div className="inline-flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        filterStatus === 'all' 
                                            ? 'bg-gray-600 text-white border-gray-600' 
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('submitted')}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        filterStatus === 'submitted' 
                                            ? 'bg-blue-600 text-white border-blue-600' 
                                            : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                    }`}
                                >
                                    Submitted ({candidates.filter(c => c.status === 'submitted').length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('interview_scheduled')}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        filterStatus === 'interview_scheduled' 
                                            ? 'bg-green-600 text-white border-green-600' 
                                            : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                                    }`}
                                >
                                    Scheduled ({candidates.filter(c => c.status === 'interview_scheduled').length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('rejected')}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        filterStatus === 'rejected' 
                                            ? 'bg-red-600 text-white border-red-600' 
                                            : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                                    }`}
                                >
                                    Rejected ({candidates.filter(c => c.status === 'rejected').length})
                                </button>
                            </div>
                        </div>

                        {/* Popular Cities Quick Filters */}
                        {candidates.length > 0 && (
                            <div className="mb-3">
                                <span className="text-xs font-medium text-gray-600 mr-2">Popular Cities:</span>
                                <div className="inline-flex flex-wrap gap-2">
                                    {Array.from(new Set(candidates.map(c => c.city).filter(Boolean)))
                                        .slice(0, 5)
                                        .map(city => (
                                            <button
                                                key={city}
                                                onClick={() => setFilterCity(filterCity === city ? '' : city)}
                                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                                    filterCity === city 
                                                        ? 'bg-indigo-600 text-white border-indigo-600' 
                                                        : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                                                }`}
                                            >
                                                {city} ({candidates.filter(c => c.city === city).length})
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Popular Countries Quick Filters */}
                        {candidates.length > 0 && (
                            <div className="mb-3">
                                <span className="text-xs font-medium text-gray-600 mr-2">Popular Countries:</span>
                                <div className="inline-flex flex-wrap gap-2">
                                    {Array.from(new Set(candidates.map(c => c.country).filter(Boolean)))
                                        .slice(0, 5)
                                        .map(country => (
                                            <button
                                                key={country}
                                                onClick={() => setFilterCountry(filterCountry === country ? '' : country)}
                                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                                    filterCountry === country 
                                                        ? 'bg-purple-600 text-white border-purple-600' 
                                                        : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
                                                }`}
                                            >
                                                {country} ({candidates.filter(c => c.country === country).length})
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Job Titles Quick Filters */}
                        {candidates.length > 0 && (
                            <div className="mb-3">
                                <span className="text-xs font-medium text-gray-600 mr-2">Job Positions:</span>
                                <div className="inline-flex flex-wrap gap-2">
                                    {Array.from(new Set(candidates.map(c => c.jobTitleText).filter(Boolean)))
                                        .slice(0, 5)
                                        .map(jobTitle => (
                                            <button
                                                key={jobTitle}
                                                onClick={() => setFilterJobTitle(filterJobTitle === jobTitle ? '' : jobTitle)}
                                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                                    filterJobTitle === jobTitle 
                                                        ? 'bg-teal-600 text-white border-teal-600' 
                                                        : 'bg-white text-teal-600 border-teal-300 hover:bg-teal-50'
                                                }`}
                                            >
                                                {jobTitle} ({candidates.filter(c => c.jobTitleText === jobTitle).length})
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Score Range Quick Filters */}
                        <div className="mb-3">
                            <span className="text-xs font-medium text-gray-600 mr-2">Score Ranges:</span>
                            <div className="inline-flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        setFilterAgeMin('');
                                        setFilterAgeMax('');
                                    }}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        !filterAgeMin && !filterAgeMax 
                                            ? 'bg-gray-600 text-white border-gray-600' 
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    All Ages
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterAgeMin('18');
                                        setFilterAgeMax('25');
                                    }}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        filterAgeMin === '18' && filterAgeMax === '25' 
                                            ? 'bg-yellow-600 text-white border-yellow-600' 
                                            : 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50'
                                    }`}
                                >
                                    18-25 years
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterAgeMin('26');
                                        setFilterAgeMax('35');
                                    }}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        filterAgeMin === '26' && filterAgeMax === '35' 
                                            ? 'bg-orange-600 text-white border-orange-600' 
                                            : 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50'
                                    }`}
                                >
                                    26-35 years
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterAgeMin('36');
                                        setFilterAgeMax('');
                                    }}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        filterAgeMin === '36' && !filterAgeMax 
                                            ? 'bg-red-600 text-white border-red-600' 
                                            : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                                    }`}
                                >
                                    36+ years
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Export Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row gap-2 items-center">
                        <h4 className="text-md font-medium text-gray-700 mb-2 md:mb-0">Export Data:</h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('json')}
                                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                Export JSON
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleExport('xlsx')}
                                className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                Export XLSX
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Status Update Error Message */}
            {statusUpdateError && (<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">Status Update Error: {statusUpdateError}</div>)}

            {/* Main Content Area: Table and Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Candidate List Table (Implemented) */}
                <section className="lg:col-span-2 bg-white p-4 rounded-lg shadow overflow-x-auto">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Candidate List</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCandidates.length > 0 ? (
                                filteredCandidates.map((candidate) => (
                                    <tr key={candidate.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.submittedAt?.toDate().toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.status === 'rejected' ? 'bg-red-100 text-red-800' : candidate.status === 'interview_scheduled' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {candidate.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {candidate.score !== null ? candidate.score : 'Not Scored'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => openProfileModal(candidate)} className="text-indigo-600 hover:text-indigo-900">View</button>
                                            <button onClick={() => openScoringModal(candidate)} className="text-purple-600 hover:text-purple-900">Score</button>
                                            {candidate.status === 'submitted' && (
                                                <button 
                                                    onClick={() => openInterviewSchedulingModal(candidate)} 
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Schedule
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No candidates found matching filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* Interview Calendar */}
                <section className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Schedule</h2>
                    <div style={{ height: 500 }}>
                        <Calendar
                            localizer={localizer}
                            events={interviewEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            onSelectEvent={handleSelectEvent} // This handles clicking on an event
                            views={['month', 'week', 'day']}
                        />
                    </div>
                </section>
            </div>

            {/* Modals */}
            {selectedCandidate && (
                <>
                    <ScoringModal
                        isOpen={isScoringModalOpen}
                        onClose={closeScoringModal}
                        candidate={selectedCandidate}
                        onScoreSubmit={handleScoreSubmit}
                        isScoring={isScoring}
                        scoringError={scoringError}
                    />
                    <CandidateProfileModal
                        isOpen={isProfileModalOpen}
                        onClose={closeProfileModal}
                        candidate={selectedCandidate}
                        onStatusChange={handleStatusChange}
                        statusUpdateLoading={statusUpdateLoading[selectedCandidate?.id] || false}
                    />
                    <JobManagement
                        isOpen={isJobManagementOpen}
                        onClose={() => setIsJobManagementOpen(false)}
                    />
                    
                    {/* Interview Scheduling Modal */}
                    <InterviewSchedulingModal
                        isOpen={isInterviewSchedulingOpen}
                        onClose={() => setIsInterviewSchedulingOpen(false)}
                        candidate={selectedCandidate}
                        onScheduleInterview={handleScheduleInterview}
                        isScheduling={isScheduling}
                    />
                    
                    {/* Toast Notification */}
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        isVisible={toast.isVisible}
                        onClose={hideToast}
                    />
                    
                    {/* Confirmation Modal */}
                    <ConfirmationModal
                        isOpen={confirmationModal.isOpen}
                        title={confirmationModal.title}
                        message={confirmationModal.message}
                        confirmText="Yes, Reject"
                        cancelText="Cancel"
                        onConfirm={confirmationModal.onConfirm}
                        onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                        type="danger"
                    />
                </>
            )}
        </div>
    );
}

// Need to create placeholder components if they don't exist
// Placeholder for ScoringModal
// const ScoringModal = ({ isOpen, onClose, candidate, onScoreSubmit, isScoring, scoringError }: ScoringModalProps) => {
//     if (!isOpen) return null;
//     return <div>Scoring Modal for {candidate?.fullName} [Placeholder]</div>;
// };

// // Placeholder for CandidateProfileModal
// const CandidateProfileModal = ({ isOpen, onClose, candidate, onStatusChange, statusUpdateLoading }: ProfileModalProps) => {
//     if (!isOpen) return null;
//     return <div>Profile Modal for {candidate?.fullName} [Placeholder]</div>;
// };

export default function AdminDashboardPage() {
    return <DashboardContent />;
}


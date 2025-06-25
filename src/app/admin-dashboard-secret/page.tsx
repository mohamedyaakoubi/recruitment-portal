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

// --- Calendar Setup ---
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
// ---------------------

// --- Types --- 
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
    const [statusUpdateLoading, setStatusUpdateLoading] = useState<Record<string, boolean>>({});
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    // State for Modals
    const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isScoring, setIsScoring] = useState(false);
    const [scoringError, setScoringError] = useState<string | null>(null);

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
            return statusMatch && nameMatch;
        });
    }, [candidates, filterStatus, filterName]);

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
    const handleScoreSubmit = async (jobDescription: string) => {
        if (!selectedCandidate) return;
        setIsScoring(true);
        setScoringError(null);
        try {
            const response = await fetch('/api/score-candidate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId: selectedCandidate.id, jobDescription }),
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
            // Close profile modal if open for this candidate after status change
            if (selectedCandidate?.id === candidateId) {
                closeProfileModal();
            }
        } catch (error) {
            console.error('Status update failed:', error);
            setStatusUpdateError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setStatusUpdateLoading(prev => ({ ...prev, [candidateId]: false }));
        }
    };

    // --- Calendar Event Selection Handler ---
    const handleSelectEvent = useCallback((event: InterviewEvent) => {
        openProfileModal(event.resource); // Open profile modal for the candidate associated with the event
    }, []);

    // --- Render Logic ---
    if (authLoading || (user && loadingCandidates)) { return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>; }
    if (!user) { return null; }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                    <button onClick={signOut} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm">Sign Out</button>
                </div>
            </header>

            {/* Stats Section */}
            <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow text-center"><h3 className="text-lg font-semibold text-gray-700">Total Candidates</h3><p className="text-2xl font-bold text-indigo-600">{stats.total}</p></div>
                <div className="bg-white p-4 rounded-lg shadow text-center"><h3 className="text-lg font-semibold text-gray-700">Submitted</h3><p className="text-2xl font-bold text-blue-600">{stats.submitted}</p></div>
                <div className="bg-white p-4 rounded-lg shadow text-center"><h3 className="text-lg font-semibold text-gray-700">Interview Scheduled</h3><p className="text-2xl font-bold text-green-600">{stats.scheduled}</p></div>
                <div className="bg-white p-4 rounded-lg shadow text-center"><h3 className="text-lg font-semibold text-gray-700">Rejected</h3><p className="text-2xl font-bold text-red-600">{stats.rejected}</p></div>
            </section>

            {/* Charts Section */}
            <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Distribution Pie Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Candidate Status Distribution</h3>
                    {statusChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusChartData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {statusChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (<p className="text-gray-500 text-center py-10">No candidate data for status chart.</p>)}
                </div>
                {/* Score Distribution Bar Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">AI Score Distribution</h3>
                    {scoreDistributionData.some(d => d.count > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={scoreDistributionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill="#8884d8">
                                    {scoreDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (<p className="text-gray-500 text-center py-10">No scored candidates for distribution chart.</p>)}
                </div>
            </section>

            {/* Filters Section */}
            <section className="mb-6 bg-white p-4 rounded-lg shadow">
                 <div className="flex flex-col md:flex-row gap-4 items-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2 md:mb-0">Filters:</h3>
                    <div className="flex-grow"><label htmlFor="filterName" className="sr-only">Filter by Name</label><input type="text" id="filterName" placeholder="Filter by name..." value={filterName} onChange={(e) => setFilterName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/></div>
                    <div><label htmlFor="filterStatus" className="sr-only">Filter by Status</label><select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"><option value="all">All Statuses</option><option value="submitted">Submitted</option><option value="interview_scheduled">Interview Scheduled</option><option value="rejected">Rejected</option></select></div>
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
                        statusUpdateLoading={statusUpdateLoading[selectedCandidate.id] || false}
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


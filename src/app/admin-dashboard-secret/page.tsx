"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { Calendar, dateFnsLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import { addHours } from 'date-fns/addHours';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Import components
import DashboardHeader from '../components/DashboardHeader';
import StatsCards from '../components/StatsCards';
import DashboardCharts from '../components/DashboardCharts';
import CandidateFilters from '../components/CandidateFilters';
import CandidateTable from '../components/CandidateTable';
import ScoringModal from '../components/ScoringModal';
import CandidateProfileModal from '../components/CandidateProfileModal';
import JobManagement from '../components/JobManagement';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import InterviewSchedulingModal from '../components/InterviewSchedulingModal';

// Calendar Setup
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Types
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
    city?: string;
    country?: string;
    jobTitleText?: string;
    dateOfBirth?: string;
}

interface InterviewEvent extends CalendarEvent {
    resource: Candidate;
}

// Chart Data Preparation
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

// Main Dashboard Component
function DashboardContent() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    
    // State
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(true);
    
    // Filter states
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterName, setFilterName] = useState<string>('');
    const [filterCity, setFilterCity] = useState<string>('');
    const [filterCountry, setFilterCountry] = useState<string>('');
    const [filterJobTitle, setFilterJobTitle] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterAgeMin, setFilterAgeMin] = useState<string>('');
    const [filterAgeMax, setFilterAgeMax] = useState<string>('');
    
    // Modal states
    const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isJobManagementOpen, setIsJobManagementOpen] = useState(false);
    const [isInterviewSchedulingOpen, setIsInterviewSchedulingOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    
    // Loading and error states
    const [statusUpdateLoading, setStatusUpdateLoading] = useState<Record<string, boolean>>({});
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
    const [isScoring, setIsScoring] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scoringError, setScoringError] = useState<string | null>(null);
    
    // Toast and confirmation states
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

    // Authentication check
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin-dashboard-secret/login');
        }
    }, [user, authLoading, router]);

    // Data fetching
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

    // Calendar events
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

    // Stats calculation
    const stats = useMemo(() => {
        const total = candidates.length;
        const rejected = candidates.filter(c => c.status === 'rejected').length;
        const scheduled = candidates.filter(c => c.status === 'interview_scheduled').length;
        const submitted = candidates.filter(c => c.status === 'submitted').length;
        return { total, rejected, scheduled, submitted };
    }, [candidates]);

    // Filtered candidates
    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate => {
            const statusMatch = filterStatus === 'all' || candidate.status === filterStatus;
            const nameMatch = filterName === '' || candidate.fullName.toLowerCase().includes(filterName.toLowerCase());
            const cityMatch = filterCity === '' || (candidate.city && candidate.city.toLowerCase().includes(filterCity.toLowerCase()));
            const countryMatch = filterCountry === '' || (candidate.country && candidate.country.toLowerCase().includes(filterCountry.toLowerCase()));
            const jobTitleMatch = filterJobTitle === '' || (candidate.jobTitleText && candidate.jobTitleText.toLowerCase().includes(filterJobTitle.toLowerCase()));
            const categoryMatch = filterCategory === '' || (candidate.jobCategory && candidate.jobCategory.toLowerCase().includes(filterCategory.toLowerCase()));
            
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
            
            return statusMatch && nameMatch && cityMatch && countryMatch && jobTitleMatch && categoryMatch && ageMatch;
        });
    }, [candidates, filterStatus, filterName, filterCity, filterCountry, filterJobTitle, filterCategory, filterAgeMin, filterAgeMax]);

    // Chart data
    const statusChartData = useMemo(() => getStatusChartData(candidates), [candidates]);
    const scoreDistributionData = useMemo(() => getScoreDistributionData(candidates), [candidates]);

    // Modal handlers
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

    const openJobManagement = () => {
        setIsJobManagementOpen(true);
    };

    const closeJobManagement = () => {
        setIsJobManagementOpen(false);
    };

    // Filter handlers
    const clearAllFilters = () => {
        setFilterStatus('all');
        setFilterName('');
        setFilterCity('');
        setFilterCountry('');
        setFilterJobTitle('');
        setFilterCategory('');
        setFilterAgeMin('');
        setFilterAgeMax('');
    };

    // Toast handler
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToast({ message, type, isVisible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, 5000);
    };

    // API handlers
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
            console.log('Scoring successful:', result);
            closeScoringModal();
        } catch (error) {
            console.error('Scoring failed:', error);
            setScoringError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsScoring(false);
        }
    };

    const handleStatusChange = async (candidateId: string, newStatus: string, interviewTimestampISO?: string) => {
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
                showToast(`Candidate status updated to ${newStatus.replace('_', ' ')} successfully!`, 'success');
            }
            
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

    // Loading state
    if (authLoading || (user && loadingCandidates)) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <DashboardHeader
                userEmail={user.email || ''}
                onManageJobsClick={openJobManagement}
                onSignOut={signOut}
            />

            <StatsCards stats={stats} candidates={candidates} />

            <DashboardCharts
                statusChartData={statusChartData}
                scoreDistributionData={scoreDistributionData}
            />

            <CandidateFilters
                candidates={candidates}
                filterStatus={filterStatus}
                filterName={filterName}
                filterCity={filterCity}
                filterCountry={filterCountry}
                filterJobTitle={filterJobTitle}
                filterCategory={filterCategory}
                filterAgeMin={filterAgeMin}
                filterAgeMax={filterAgeMax}
                onFilterStatusChange={setFilterStatus}
                onFilterNameChange={setFilterName}
                onFilterCityChange={setFilterCity}
                onFilterCountryChange={setFilterCountry}
                onFilterJobTitleChange={setFilterJobTitle}
                onFilterCategoryChange={setFilterCategory}
                onFilterAgeMinChange={setFilterAgeMin}
                onFilterAgeMaxChange={setFilterAgeMax}
                onClearAllFilters={clearAllFilters}
            />

            <CandidateTable
                candidates={filteredCandidates}
                statusUpdateLoading={statusUpdateLoading}
                onViewCandidate={openProfileModal}
                onScoreCandidate={openScoringModal}
                onStatusChange={handleStatusChange}
            />

            {/* Calendar Section */}
            <section className="mt-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Interview Schedule</h3>
                    <div style={{ height: '500px' }}>
                        <Calendar
                            localizer={localizer}
                            events={interviewEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={['month', 'week', 'day']}
                            defaultView="month"
                            popup
                            onSelectEvent={(event) => openProfileModal(event.resource)}
                        />
                    </div>
                </div>
            </section>

            {/* Modals */}
            <JobManagement
                isOpen={isJobManagementOpen}
                onClose={closeJobManagement}
            />

            <ScoringModal
                isOpen={isScoringModalOpen}
                onClose={closeScoringModal}
                candidate={selectedCandidate}
                onSubmit={handleScoreSubmit}
                isLoading={isScoring}
                error={scoringError}
            />

            <CandidateProfileModal
                isOpen={isProfileModalOpen}
                onClose={closeProfileModal}
                candidate={selectedCandidate}
                onStatusChange={handleStatusChange}
                statusUpdateLoading={statusUpdateLoading}
                onScheduleInterview={() => setIsInterviewSchedulingOpen(true)}
            />

            <InterviewSchedulingModal
                isOpen={isInterviewSchedulingOpen}
                onClose={() => setIsInterviewSchedulingOpen(false)}
                candidate={selectedCandidate}
                onSchedule={handleStatusChange}
                isLoading={isScheduling}
            />

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
            />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}

export default function AdminDashboard() {
    return <DashboardContent />;
}

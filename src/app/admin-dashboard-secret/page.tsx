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
import { addMinutes, isBefore } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Import components
import DashboardHeader from '../components/DashboardHeader';
import StatsCards from '../components/StatsCards';
import DashboardCharts from '../components/DashboardCharts';
import CandidateFilters from '../components/CandidateFilters';
import CandidateTable from '../components/CandidateTable';
import ScoringModal from '../components/ScoringModal';
import Tabs from '../components/Tabs';
import CandidateProfileModal from '../components/CandidateProfileModal';
import JobManagement from '../components/JobManagement';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import InterviewSchedulingModal from '../components/InterviewSchedulingModal';

// Calendar Setup
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

import type { Candidate } from '@/types';

interface InterviewEvent extends CalendarEvent {
    resource: Candidate;
    isCompleted: boolean;
    eventType: 'scheduled' | 'completed';
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
        { name: 'Approved', value: counts.approved || 0 },
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
    const [activeTab, setActiveTab] = useState<string>('main');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterName, setFilterName] = useState<string>('');
    const [filterCity, setFilterCity] = useState<string>('');
    const [filterCountry, setFilterCountry] = useState<string>('');
    const [filterJobTitle, setFilterJobTitle] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterAgeMin, setFilterAgeMin] = useState<string>('');
    const [filterAgeMax, setFilterAgeMax] = useState<string>('');
    
    // Calendar filter states
    const [calendarFilter, setCalendarFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
    
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
                        calendarEventId: data.calendarEventId || '',
                        meetLink: data.meetLink || '',
                        duration: data.duration || 30,
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

    // Calendar events with completion status
    const allInterviewEvents: InterviewEvent[] = useMemo(() => {
        const now = new Date();
        
        return candidates
            .filter(c => c.interviewDate)
            .map(c => {
                const interviewStart = c.interviewDate!.toDate();
                const duration = c.duration || 30; // Use candidate's duration or default to 30 minutes
                const interviewEnd = new Date(interviewStart.getTime() + (duration * 60 * 1000));
                const isCompleted = isBefore(interviewEnd, now);
                
                return {
                    title: isCompleted 
                        ? `✓ Completed: ${c.fullName}` 
                        : `Interview: ${c.fullName}`,
                    start: interviewStart,
                    end: interviewEnd,
                    resource: c,
                    isCompleted,
                    eventType: isCompleted ? 'completed' as const : 'scheduled' as const,
                };
            });
    }, [candidates]);


    // Filtered calendar events based on calendar filter
    const filteredInterviewEvents = useMemo(() => {
        switch (calendarFilter) {
            case 'upcoming':
                return allInterviewEvents.filter(event => !event.isCompleted);
            case 'completed':
                return allInterviewEvents.filter(event => event.isCompleted);
            default:
                return allInterviewEvents;
        }
    }, [allInterviewEvents, calendarFilter]);

    // Stats calculation
    const stats = useMemo(() => {
        const total = candidates.length;
        const rejected = candidates.filter(c => c.status === 'rejected').length;
        const scheduled = candidates.filter(c => c.status === 'interview_scheduled').length;
        const submitted = candidates.filter(c => c.status === 'submitted').length;
        const approved = candidates.filter(c => c.status === 'approved').length;
        return { total, rejected, scheduled, submitted, approved };
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

            let tabMatch = true;
            if (activeTab === 'main') {
                tabMatch = candidate.status === 'submitted' || candidate.status === 'interview_scheduled';
            } else if (activeTab === 'approved') {
                tabMatch = candidate.status === 'approved';
            } else if (activeTab === 'rejected') {
                tabMatch = candidate.status === 'rejected';
            }
            
            return statusMatch && nameMatch && cityMatch && countryMatch && jobTitleMatch && categoryMatch && ageMatch && tabMatch;
        });
    }, [candidates, filterStatus, filterName, filterCity, filterCountry, filterJobTitle, filterCategory, filterAgeMin, filterAgeMax, activeTab]);

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

    // Calendar event style function
    const eventStyleGetter = (event: InterviewEvent) => {
        const style: React.CSSProperties = {
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block',
            fontSize: '12px',
            fontWeight: 'bold',
        };

        if (event.isCompleted) {
            // Completed interviews - green with checkmark
            style.backgroundColor = '#10B981'; // Green
            style.borderLeft = '4px solid #047857'; // Darker green border
            style.opacity = 0.9;
        } else {
            // Upcoming interviews - blue
            style.backgroundColor = '#3B82F6'; // Blue
            style.borderLeft = '4px solid #1D4ED8'; // Darker blue border
        }

        return { style };
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
            showToast('Candidate scored successfully!', 'success');
            closeScoringModal();
        } catch (error) {
            console.error('Scoring failed:', error);
            setScoringError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsScoring(false);
        }
    };

    // Enhanced status change handler that uses Google Meet scheduling
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

    // Schedule interview handler - now uses Google Meet API
    const handleScheduleInterview = async (
        candidateId: string, 
        date: string, 
        time: string, 
        duration: number,
        adminEmail: string,
        notes?: string
    ) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        setIsScheduling(true);
        
        try {
            const response = await fetch('/api/schedule-interview-meet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: candidate.id,
                    candidateEmail: candidate.email,
                    candidateName: candidate.fullName,
                    interviewDate: date,
                    interviewTime: time,
                    duration,
                    jobTitle: candidate.jobTitleText,
                    adminEmail,
                    notes
                }),
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to schedule interview');
            }

            showToast('Interview scheduled successfully with Google Meet!', 'success');
            setIsInterviewSchedulingOpen(false);
            
        } catch (error) {
            console.error('Failed to schedule interview:', error);
            showToast(`Failed to schedule interview: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsScheduling(false);
        }
    };

    // Cancel interview handler
    const handleCancelInterview = async (candidateId: string, reason?: string) => {
        const candidate = candidates.find(c => c.id === candidateId);
        setConfirmationModal({
            isOpen: true,
            title: 'Cancel Scheduled Interview',
            message: `Are you sure you want to cancel the interview for ${candidate?.fullName || 'this candidate'}? This will delete the calendar event and notify the candidate.`,
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                setStatusUpdateLoading(prev => ({ ...prev, [candidateId]: true }));
                
                try {
                    const response = await fetch('/api/cancel-interview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            candidateId, 
                            reason: reason || 'Cancelled by admin'
                        }),
                    });
                    
                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to cancel interview');
                    }
                    
                    showToast('Interview cancelled successfully and candidate has been notified.', 'success');
                    closeProfileModal();
                } catch (error) {
                    console.error('Cancel interview failed:', error);
                    showToast(`Failed to cancel interview: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                } finally {
                    setStatusUpdateLoading(prev => ({ ...prev, [candidateId]: false }));
                }
            }
        });
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

            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Candidate List</h2>
                <Tabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={[
                        { label: 'Main', value: 'main' },
                        { label: 'Approved', value: 'approved' },
                        { label: 'Rejected', value: 'rejected' },
                    ]}
                >
                    <CandidateTable
                        candidates={filteredCandidates}
                        statusUpdateLoading={statusUpdateLoading}
                        onViewCandidate={openProfileModal}
                        onScoreCandidate={openScoringModal}
                        onStatusChange={handleStatusChange}
                        filters={{ status: filterStatus, name: filterName, city: filterCity, country: filterCountry, jobTitle: filterJobTitle, category: filterCategory, ageMin: filterAgeMin, ageMax: filterAgeMax }}
                    />
                </Tabs>
            </div>

            {/* Enhanced Calendar Section */}
            <section className="mt-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h3 className="text-xl font-bold text-gray-800">Interview Schedule</h3>
                        
                        {/* Calendar Filter Buttons */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 mr-2">Filter:</span>
                            <button
                                onClick={() => setCalendarFilter('all')}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                    calendarFilter === 'all' 
                                        ? 'bg-gray-600 text-white border-gray-600' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                All ({allInterviewEvents.length})
                            </button>
                            <button
                                onClick={() => setCalendarFilter('upcoming')}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                    calendarFilter === 'upcoming' 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                Upcoming ({allInterviewEvents.filter(e => !e.isCompleted).length})
                            </button>
                            <button
                                onClick={() => setCalendarFilter('completed')}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                    calendarFilter === 'completed' 
                                        ? 'bg-green-600 text-white border-green-600' 
                                        : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                                }`}
                            >
                                Completed ({allInterviewEvents.filter(e => e.isCompleted).length})
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center space-x-6 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded border-l-4 border-blue-700"></div>
                            <span className="text-sm text-gray-600">Upcoming Interviews</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-green-500 rounded border-l-4 border-green-700"></div>
                            <span className="text-sm text-gray-600">Completed Interviews</span>
                        </div>
                    </div>

                    <div style={{ height: '500px' }}>
                        <Calendar
                            localizer={localizer}
                            events={filteredInterviewEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={['month', 'week', 'day']}
                            defaultView="month"
                            popup
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={(event) => openProfileModal(event.resource)}
                            tooltipAccessor={(event) => {
                                const candidate = event.resource;
                                const status = event.isCompleted ? 'Completed' : 'Scheduled';
                                const time = format(event.start as Date, 'PPpp');
                                return `${status}: ${candidate.fullName} - ${time}`;
                            }}
                        />
                    </div>

                    {filteredInterviewEvents.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h2a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                            </svg>
                            <p className="text-lg font-medium">No interviews {calendarFilter === 'all' ? '' : calendarFilter}</p>
                            <p className="text-sm">
                                {calendarFilter === 'all' && 'Schedule some interviews to see them here.'}
                                {calendarFilter === 'upcoming' && 'No upcoming interviews scheduled.'}
                                {calendarFilter === 'completed' && 'No completed interviews yet.'}
                            </p>
                        </div>
                    )}
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
                onCancelInterview={handleCancelInterview} // Add this missing prop
                statusUpdateLoading={selectedCandidate ? statusUpdateLoading[selectedCandidate.id] || false : false}
                onScheduleInterview={() => setIsInterviewSchedulingOpen(true)}
            />

            <InterviewSchedulingModal
                isOpen={isInterviewSchedulingOpen}
                onClose={() => setIsInterviewSchedulingOpen(false)}
                candidate={selectedCandidate}
                onSchedule={handleScheduleInterview} // Updated to use the new handler instead of handleStatusChange
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
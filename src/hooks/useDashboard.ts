"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { Candidate, InterviewEvent } from '@/types';
import { isBefore } from 'date-fns';
import { calculateStats } from '@/lib/dashboardUtils';

export const useDashboard = () => {
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
    const [filterNationality, setFilterNationality] = useState<string>('');
    const [filterJobTitle, setFilterJobTitle] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterAgeMin, setFilterAgeMin] = useState<string>('');
    const [filterAgeMax, setFilterAgeMax] = useState<string>('');
    const [filterSpecialty, setFilterSpecialty] = useState<string>('');

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
                const duration = c.duration || 30;
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

    // Filtered calendar events
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
    const submitted = candidates.filter(c => c.status === 'submitted').length;
    const scheduled = candidates.filter(c => c.status === 'interview_scheduled').length;
    const rejected = candidates.filter(c => c.status === 'rejected').length;
    const approved = candidates.filter(c => c.status === 'approved').length; // 🔥 ADD: Calculate approved

    return {
        total,
        submitted,
        scheduled,
        rejected,
        approved // 🔥 ADD: Include approved in return
    };
}, [candidates]);

    // Filtered candidates
    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate => {
            const statusMatch = filterStatus === 'all' || candidate.status === filterStatus;
            const nameMatch = filterName === '' || candidate.fullName.toLowerCase().includes(filterName.toLowerCase());
            const cityMatch = filterCity === '' || (candidate.city && candidate.city.toLowerCase().includes(filterCity.toLowerCase()));
            const countryMatch = filterCountry === '' || (candidate.country && candidate.country.toLowerCase().includes(filterCountry.toLowerCase()));
            const nationalityMatch = filterNationality === '' || (candidate.nationality && candidate.nationality.toLowerCase().includes(filterNationality.toLowerCase()));
            const jobTitleMatch = filterJobTitle === '' || (candidate.jobTitleText && candidate.jobTitleText.toLowerCase().includes(filterJobTitle.toLowerCase()));
            const categoryMatch = filterCategory === '' || (candidate.jobCategory && candidate.jobCategory.toLowerCase().includes(filterCategory.toLowerCase()));
            const specialtyMatch = filterSpecialty === '' || (candidate.specialty && candidate.specialty.toLowerCase().includes(filterSpecialty.toLowerCase()));
            
            let ageMatch = true;
            if (candidate.dateOfBirth && (filterAgeMin || filterAgeMax)) {
                const birthDate = new Date(candidate.dateOfBirth);
                const today = new Date();
                if (!isNaN(birthDate.getTime())) {
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    if (filterAgeMin && age < parseInt(filterAgeMin)) ageMatch = false;
                    if (filterAgeMax && age > parseInt(filterAgeMax)) ageMatch = false;
                }
            }

            let tabMatch = true;
            if (activeTab === 'main') {
                tabMatch = candidate.status === 'submitted' || candidate.status === 'interview_scheduled';
            } else if (activeTab === 'approved') {
                tabMatch = candidate.status === 'approved';
            } else if (activeTab === 'rejected') {
                tabMatch = candidate.status === 'rejected';
            }
            
            return statusMatch && nameMatch && cityMatch && countryMatch && nationalityMatch && jobTitleMatch && categoryMatch && ageMatch && tabMatch;
        });
    }, [candidates, filterStatus, filterName, filterCity, filterCountry, filterNationality, filterJobTitle, filterCategory, filterAgeMin, filterAgeMax, activeTab]);

    // Toast handler
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToast({ message, type, isVisible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
        }, 5000);
    };

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

    const clearAllFilters = () => {
        setFilterStatus('all');
        setFilterName('');
        setFilterCity('');
        setFilterCountry('');
        setFilterNationality('');
        setFilterJobTitle('');
        setFilterCategory('');
        setFilterSpecialty('');
        setFilterAgeMin('');
        setFilterAgeMax('');
    };

    return {
        user,
        authLoading,
        signOut,
        candidates,
        loadingCandidates,
        activeTab,
        setActiveTab,
        filterStatus,
        setFilterStatus,
        filterName,
        setFilterName,
        filterCity,
        setFilterCity,
        filterCountry,
        setFilterCountry,
        filterNationality,
        setFilterNationality,
        filterJobTitle,
        setFilterJobTitle,
        filterCategory,
        setFilterCategory,
        filterAgeMin,
        setFilterAgeMin,
        filterAgeMax,
        setFilterAgeMax,
        filterSpecialty,
        setFilterSpecialty,
        calendarFilter,
        setCalendarFilter,
        isScoringModalOpen,
        setIsScoringModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isJobManagementOpen,
        setIsJobManagementOpen,
        isInterviewSchedulingOpen,
        setIsInterviewSchedulingOpen,
        selectedCandidate,
        setSelectedCandidate,
        statusUpdateLoading,
        setStatusUpdateLoading,
        statusUpdateError,
        setStatusUpdateError,
        isScoring,
        setIsScoring,
        isScheduling,
        setIsScheduling,
        scoringError,
        setScoringError,
        toast,
        setToast,
        confirmationModal,
        setConfirmationModal,
        allInterviewEvents,
        filteredInterviewEvents,
        stats,
        filteredCandidates,
        showToast,
        openScoringModal,
        closeScoringModal,
        openProfileModal,
        closeProfileModal,
        openJobManagement,
        closeJobManagement,
        clearAllFilters,
    };
};

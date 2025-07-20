"use client";

import React, { useMemo } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { getStatusChartData, getScoreDistributionData } from '@/lib/dashboardUtils';
import { createApiHandlers } from '@/lib/apiHandlers';

// Import components
import DashboardHeader from '../components/DashboardHeader';
import StatsCards from '../components/StatsCards';
import DashboardCharts from '../components/DashboardCharts';
import CandidateFilters from '../components/CandidateFilters';
import CandidateManagement from '../components/admin-dashboard/CandidateManagement';
import CalendarSection from '../components/admin-dashboard/CalendarSection';
import DashboardModals from '../components/admin-dashboard/DashboardModals';

function DashboardContent() {
    const {
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
    } = useDashboard();

    const statusChartData = useMemo(() => getStatusChartData(candidates), [candidates]);
    const scoreDistributionData = useMemo(() => getScoreDistributionData(candidates), [candidates]);

    const {
        handleScoreSubmit,
        handleStatusChange,
        handleScheduleInterview,
        handleCancelInterview,
        handleEditCandidate,
    } = createApiHandlers(
        showToast,
        closeScoringModal,
        closeProfileModal,
        setIsInterviewSchedulingOpen,
        setConfirmationModal,
        setStatusUpdateLoading,
        setIsScoring,
        setScoringError,
        setIsScheduling,
        selectedCandidate,
        candidates
    );

    if (authLoading || (user && loadingCandidates)) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

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
                filterNationality={filterNationality}
                filterJobTitle={filterJobTitle}
                filterCategory={filterCategory}
                filterSpecialty={filterSpecialty}
                filterAgeMin={filterAgeMin}
                filterAgeMax={filterAgeMax}
                onFilterStatusChange={setFilterStatus}
                onFilterNameChange={setFilterName}
                onFilterCityChange={setFilterCity}
                onFilterCountryChange={setFilterCountry}
                onFilterNationalityChange={setFilterNationality}
                onFilterJobTitleChange={setFilterJobTitle}
                onFilterCategoryChange={setFilterCategory}
                onFilterSpecialtyChange={setFilterSpecialty}
                onFilterAgeMinChange={setFilterAgeMin}
                onFilterAgeMaxChange={setFilterAgeMax}
                onClearAllFilters={clearAllFilters}
            />

            <CandidateManagement
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filteredCandidates={filteredCandidates}
                statusUpdateLoading={statusUpdateLoading}
                openProfileModal={openProfileModal}
                openScoringModal={openScoringModal}
                handleStatusChange={handleStatusChange}
                filters={{ 
                    status: filterStatus, 
                    name: filterName, 
                    city: filterCity, 
                    country: filterCountry, 
                    nationality: filterNationality,
                    jobTitle: filterJobTitle, 
                    category: filterCategory, 
                    specialty: filterSpecialty,
                    ageMin: filterAgeMin, 
                    ageMax: filterAgeMax 
                }}
            />

            <CalendarSection
                allInterviewEvents={allInterviewEvents}
                filteredInterviewEvents={filteredInterviewEvents}
                calendarFilter={calendarFilter}
                setCalendarFilter={setCalendarFilter}
                openProfileModal={openProfileModal}
            />

            <DashboardModals
                isJobManagementOpen={isJobManagementOpen}
                closeJobManagement={closeJobManagement}
                isScoringModalOpen={isScoringModalOpen}
                closeScoringModal={closeScoringModal}
                selectedCandidate={selectedCandidate}
                handleScoreSubmit={handleScoreSubmit}
                isScoring={isScoring}
                scoringError={scoringError}
                isProfileModalOpen={isProfileModalOpen}
                closeProfileModal={closeProfileModal}
                handleStatusChange={handleStatusChange}
                handleCancelInterview={handleCancelInterview}
                statusUpdateLoading={selectedCandidate ? statusUpdateLoading[selectedCandidate.id] || false : false}
                setIsInterviewSchedulingOpen={setIsInterviewSchedulingOpen}
                handleEditCandidate={handleEditCandidate}
                isInterviewSchedulingOpen={isInterviewSchedulingOpen}
                handleScheduleInterview={handleScheduleInterview}
                isScheduling={isScheduling}
                confirmationModal={confirmationModal}
                setConfirmationModal={setConfirmationModal}
                toast={toast}
                setToast={setToast}
            />
        </div>
    );
}

export default function AdminDashboard() {
    return <DashboardContent />;
}

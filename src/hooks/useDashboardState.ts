// src/app/hooks/useDashboardState.ts
import { useState } from 'react';
import { Candidate } from '@/types';

export const useDashboardState = () => {
  const [activeTab, setActiveTab] = useState<string>('main');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterName, setFilterName] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterNationality, setFilterNationality] = useState<string>('');
  const [filterJobTitle, setFilterJobTitle] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');
  const [filterAgeMin, setFilterAgeMin] = useState<string>('');
  const [filterAgeMax, setFilterAgeMax] = useState<string>('');
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isJobManagementOpen, setIsJobManagementOpen] = useState(false);
  const [isInterviewSchedulingOpen, setIsInterviewSchedulingOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<Record<string, boolean>>({});
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);
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

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  return {
    activeTab, setActiveTab,
    filterStatus, setFilterStatus,
    filterName, setFilterName,
    filterCity, setFilterCity,
    filterCountry, setFilterCountry,
    filterNationality, setFilterNationality,
    filterJobTitle, setFilterJobTitle,
    filterCategory, setFilterCategory,
    filterSpecialty, setFilterSpecialty,
    filterAgeMin, setFilterAgeMin,
    filterAgeMax, setFilterAgeMax,
    calendarFilter, setCalendarFilter,
    isScoringModalOpen, setIsScoringModalOpen,
    isProfileModalOpen, setIsProfileModalOpen,
    isJobManagementOpen, setIsJobManagementOpen,
    isInterviewSchedulingOpen, setIsInterviewSchedulingOpen,
    selectedCandidate, setSelectedCandidate,
    statusUpdateLoading, setStatusUpdateLoading,
    statusUpdateError, setStatusUpdateError,
    isScoring, setIsScoring,
    isScheduling, setIsScheduling,
    scoringError, setScoringError,
    toast, setToast,
    confirmationModal, setConfirmationModal,
    clearAllFilters,
    showToast,
  };
};

import { Timestamp } from 'firebase/firestore';
import { JobCategory } from '@/lib/job-categories';
import { User } from 'firebase/auth';
import { Event as CalendarEvent } from 'react-big-calendar';

export interface Candidate {
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    gender?: string;
    phoneNumber?: string;
    countryCode?: string;
    dateOfBirth?: string;
    age?: number; // 🔥 NEW: Add age field
    city?: string;
    country?: string;
    nationality?: string;
    doubleNationality?: string;
    jobTitle?: string;
    jobTitleText?: string;
    jobCategory?: string;
    specialty?: string;
    websites: string[];
    cvUrl: string;
    passportUrl: string;
    photoUrl?: string;
    submittedAt: Timestamp;
    status: 'submitted' | 'rejected' | 'interview_scheduled' | 'approved' | string;
    score: number | null;
    scoreAnalysis?: string;
    lastScoredAt?: Timestamp;
    interviewDate?: Timestamp;
    calendarEventId?: string;
    meetLink?: string;
    meetSpaceId?: string;
    duration?: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  specialties: string[]; // ✅ Add specialties array
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ScoringModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onSubmit: (jobId: string, jobTitle: string, jobDescription: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export interface CandidateTableProps {
  candidates: Candidate[];
  statusUpdateLoading: Record<string, boolean>;
  onViewCandidate: (candidate: Candidate) => void;
  onScoreCandidate: (candidate: Candidate) => void;
  onStatusChange: (candidateId: string, newStatus: string) => void;
  filters: {
    status: string;
    name: string;
    city: string;
    country: string;
    nationality: string; // 🔥 ADD: Missing nationality filter
    jobTitle: string;
    category: string;
    specialty: string; // 🔥 ADD: Missing specialty filter
    ageMin: string;
    ageMax: string;
  };
}

export type SortField = 'firstName' | 'lastName' | 'email' | 'age' | 'city' | 'country' | 'submittedAt' | 'status' | 'score';
export type SortDirection = 'asc' | 'desc';

export interface CandidateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onStatusChange: (candidateId: string, newStatus: string, interviewTimestampISO?: string) => Promise<void>;
    onCancelInterview: (candidateId: string, reason?: string) => Promise<void>;
    statusUpdateLoading: boolean;
    onScheduleInterview: () => void;
}

export interface JobManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CandidateFiltersProps {
  candidates: Candidate[];
  filterStatus: string;
  filterName: string;
  filterCity: string;
  filterCountry: string;
  filterNationality: string;
  filterJobTitle: string;
  filterCategory: string;
  filterSpecialty: string; // ✅ Add specialty filter
  filterAgeMin: string;
  filterAgeMax: string;
  onFilterStatusChange: (status: string) => void;
  onFilterNameChange: (name: string) => void;
  onFilterCityChange: (city: string) => void;
  onFilterCountryChange: (country: string) => void;
  onFilterNationalityChange: (nationality: string) => void;
  onFilterJobTitleChange: (jobTitle: string) => void;
  onFilterCategoryChange: (category: string) => void;
  onFilterSpecialtyChange: (specialty: string) => void; // ✅ Add specialty handler
  onFilterAgeMinChange: (ageMin: string) => void;
  onFilterAgeMaxChange: (ageMax: string) => void;
  onClearAllFilters: () => void;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export interface StatusChartData {
  name: string;
  value: number;
}

export interface ScoreDistributionData {
  name: string;
  count: number;
}

export interface DashboardChartsProps {
  statusChartData: StatusChartData[];
  scoreDistributionData: ScoreDistributionData[];
}

export interface DashboardHeaderProps {
  userEmail: string;
  onManageJobsClick: () => void;
  onSignOut: () => void;
}

export interface InterviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onSchedule: (
    candidateId: string, 
    date: string, 
    time: string, 
    duration: number,
    adminEmail: string,
    notes?: string
  ) => Promise<void>;
  isLoading: boolean;
}

export interface Stats {
  total: number;
  submitted: number;
  scheduled: number;
  rejected: number;
}

export interface StatsCardsProps {
  stats: Stats;
  candidates: Candidate[];
}

export interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // Add this optional property
}

export interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { label: string; value: string; }[];
  children: React.ReactNode;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface InterviewEvent extends CalendarEvent {
    resource: Candidate;
    isCompleted: boolean;
    eventType: 'scheduled' | 'completed';
}


export interface ApplicationStatusProps {
  applications: Candidate[];
  formatDate: (timestamp: any) => string;
}

export interface InterviewDetailsProps {
  applications: Candidate[];
  formatDate: (timestamp: any) => string;
}

export interface AdditionalInfoSectionProps {
  additionalInfo: { type: 'link' | 'file' | 'text'; content: string; file?: File }[];
  addAdditionalInfo: (type: 'link' | 'file' | 'text') => void;
  removeAdditionalInfo: (index: number) => void;
  updateAdditionalInfo: (index: number, content: string, file?: File) => void;
  isLoading: boolean;
}

export interface FileUploadSectionProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  isExistingCandidate: boolean;
}

export interface JobApplicationSectionProps {
  selectedCategory: string;
  handleCategorySelection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  jobTitle: string;
  handleJobSelection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filteredJobs: any[];
  selectedJob: any;
  specialty: string;
  setSpecialty: (specialty: string) => void;
  specialtySearch: string;
  setSpecialtySearch: (search: string) => void;
  availableSpecialties: string[];
  isLoading: boolean;
}

export interface PersonalInfoSectionProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  gender: string;
  setGender: (gender: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (date: string) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  city: string;
  setCity: (city: string) => void;
  country: string;
  setCountry: (country: string) => void;
  nationality: string;
  setNationality: (nationality: string) => void;
  doubleNationality: string;
  setDoubleNationality: (nationality: string) => void;
  isLoading: boolean;
  isExistingCandidate: boolean;
}

export interface FileInputProps {
  name: string;
  label: string;
  required?: boolean;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  helpText?: string;
}

export interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export interface StatusBadgeProps {
  status: string;
}
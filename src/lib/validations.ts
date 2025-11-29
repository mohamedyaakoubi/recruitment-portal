import { z } from 'zod';
import { CANDIDATE_STATUSES, INTERVIEW_DEFAULTS } from '@/lib/constants';

// Safe URL validation (prevents javascript: and data: protocols)
const safeUrlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => {
      const lower = url.toLowerCase().trim();
      return (
        !lower.startsWith('javascript:') &&
        !lower.startsWith('data:') &&
        !lower.startsWith('vbscript:')
      );
    },
    { message: 'URL contains unsafe protocol' }
  );

// Name validation schema (enhanced with max length and pattern validation)
const nameSchema = z
  .string()
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Cannot exceed 50 characters')
  .regex(
    /^[a-zA-Z\u00C0-\u00FF\u0100-\u017F\u0400-\u04FF\s'-]+$/,
    'Can only contain letters, spaces, hyphens, and apostrophes'
  )
  .refine((val) => !/\d/.test(val), 'Cannot contain numbers')
  .refine((val) => !/\./.test(val), 'Cannot contain dots')
  .refine((val) => !/\s{2,}/.test(val), 'Cannot contain multiple consecutive spaces')
  .refine(
    (val) => !/^[\s'-]|[\s'-]$/.test(val),
    'Cannot start or end with spaces, hyphens, or apostrophes'
  );

// Email schema (enhanced with length limits)
const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim()
  .max(254, 'Email address too long'); // RFC 5321

// Phone number schema (enhanced with international format support)
const phoneSchema = z
  .string()
  .min(6, 'Phone number must be at least 6 digits')
  .max(15, 'Phone number cannot exceed 15 digits') // E.164 format
  .regex(/^\d+$/, 'Phone number can only contain digits');

// Date of birth schema (must be 18+)
const dateOfBirthSchema = z.string().refine((dob) => {
  if (!dob) return false;
  const birthDate = new Date(dob);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return false;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
}, 'You must be at least 18 years old');

// Candidate form schema
export const candidateFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: phoneSchema,
  dateOfBirth: dateOfBirthSchema,
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  country: z.string().min(1, 'Country is required').max(100, 'Country name too long'),
  nationality: z.string().min(1, 'Nationality is required').max(100, 'Nationality too long'),
  doubleNationality: z.string().max(100, 'Nationality too long').optional(),
  jobCategory: z.string().min(1, 'Job category is required').max(200, 'Category too long'),
  jobTitle: z.string().min(1, 'Job position is required').max(200, 'Job title too long'),
  specialty: z.string().min(1, 'Specialty is required').max(200, 'Specialty too long'),
  websites: z.array(safeUrlSchema.or(z.literal(''))).optional(),
});

// Update candidate schema (partial)
export const updateCandidateSchema = candidateFormSchema.partial();

// Status update schema
export const statusUpdateSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required').max(200),
  newStatus: z.enum(CANDIDATE_STATUSES),
  interviewTimestampISO: z.string().datetime().optional(),
  calendarEventId: z.string().max(500).optional(),
  meetLink: safeUrlSchema.optional(),
  duration: z
    .number()
    .min(INTERVIEW_DEFAULTS.MIN_DURATION)
    .max(INTERVIEW_DEFAULTS.MAX_DURATION)
    .optional(),
});

// Score candidate schema
export const scoreCandidateSchema = z.object({
  candidateId: z.string().min(1).max(200),
  jobId: z.string().max(200).optional(),
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  jobDescription: z.string().min(10, 'Job description is required').max(10000),
});

// Schedule interview schema
export const scheduleInterviewSchema = z.object({
  candidateId: z.string().min(1).max(200),
  candidateEmail: z.string().email().max(254),
  candidateName: z.string().min(1).max(200),
  interviewDate: z.string().min(1).max(50),
  interviewTime: z.string().min(1).max(50),
  duration: z
    .number()
    .min(INTERVIEW_DEFAULTS.MIN_DURATION)
    .max(INTERVIEW_DEFAULTS.MAX_DURATION)
    .default(INTERVIEW_DEFAULTS.DEFAULT_DURATION),
  jobTitle: z.string().max(200).optional(),
  adminEmail: z.string().email().max(254),
  notes: z.string().max(5000).optional(),
});

export type CandidateFormData = z.infer<typeof candidateFormSchema>;
export type UpdateCandidateData = z.infer<typeof updateCandidateSchema>;
export type StatusUpdateData = z.infer<typeof statusUpdateSchema>;
export type ScoreCandidateData = z.infer<typeof scoreCandidateSchema>;
export type ScheduleInterviewData = z.infer<typeof scheduleInterviewSchema>;

// Check duplicate schema
export const checkDuplicateSchema = z.object({
  email: z.string().email().toLowerCase().trim().max(254),
  jobId: z.string().min(1).max(200),
  jobCategory: z.string().min(1).max(200),
});

// Cancel interview schema
export const cancelInterviewSchema = z.object({
  candidateId: z.string().min(1).max(200),
  reason: z.string().max(1000).optional(),
});

// Job schema (enhanced with max lengths)
export const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200, 'Title too long'),
  category: z.enum([
    'Agricole',
    'Bâtiment et travail publique',
    'Development & IT',
    'Industriel',
    'Restauration',
    'Santé',
    'Services',
    'Sociale',
    'Tourisme',
  ]),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description too long'),
  requirements: z.string().max(10000, 'Requirements too long').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  employmentType: z.string().max(100, 'Employment type too long').optional(),
  salary: z.string().max(100, 'Salary too long').optional(),
  isActive: z.boolean().default(true),
  specialties: z.array(z.string().max(200)).max(50, 'Too many specialties').default([]),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// Job update schema (includes jobId with validation)
export const jobUpdateSchema = jobSchema.extend({
  jobId: z.string().min(1, 'Job ID is required').max(200),
});

export type CheckDuplicateData = z.infer<typeof checkDuplicateSchema>;
export type CancelInterviewData = z.infer<typeof cancelInterviewSchema>;

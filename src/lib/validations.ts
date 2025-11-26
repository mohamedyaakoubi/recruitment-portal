import { z } from 'zod';

// Name validation schema
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

// Email schema
const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

// Phone number schema
const phoneSchema = z
  .string()
  .min(6, 'Phone number must be at least 6 digits')
  .max(15, 'Phone number cannot exceed 15 digits')
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
  city: z.string().min(1, 'City is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  nationality: z.string().min(1, 'Nationality is required').max(100),
  doubleNationality: z.string().max(100).optional(),
  jobCategory: z.string().min(1, 'Job category is required'),
  jobTitle: z.string().min(1, 'Job position is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  websites: z.array(z.string().url().optional()).optional(),
});

// Update candidate schema (partial)
export const updateCandidateSchema = candidateFormSchema.partial();

// Status update schema
export const statusUpdateSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  newStatus: z.enum(['submitted', 'rejected', 'interview_scheduled', 'approved']),
  interviewTimestampISO: z.string().datetime().optional(),
  calendarEventId: z.string().optional(),
  meetLink: z.string().url().optional(),
  duration: z.number().min(15).max(180).optional(),
});

// Score candidate schema
export const scoreCandidateSchema = z.object({
  candidateId: z.string().min(1),
  jobId: z.string().optional(),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobDescription: z.string().min(10, 'Job description is required'),
});

// Schedule interview schema
export const scheduleInterviewSchema = z.object({
  candidateId: z.string().min(1),
  candidateEmail: z.string().email(),
  candidateName: z.string().min(1),
  interviewDate: z.string().min(1),
  interviewTime: z.string().min(1),
  duration: z.number().min(15).max(180).default(30),
  jobTitle: z.string().optional(),
  adminEmail: z.string().email(),
  notes: z.string().optional(),
});

export type CandidateFormData = z.infer<typeof candidateFormSchema>;
export type UpdateCandidateData = z.infer<typeof updateCandidateSchema>;
export type StatusUpdateData = z.infer<typeof statusUpdateSchema>;
export type ScoreCandidateData = z.infer<typeof scoreCandidateSchema>;
export type ScheduleInterviewData = z.infer<typeof scheduleInterviewSchema>;

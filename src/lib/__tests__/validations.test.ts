import { describe, it, expect } from 'vitest';
import {
  candidateFormSchema,
  jobSchema,
  scheduleInterviewSchema,
  statusUpdateSchema,
  checkDuplicateSchema,
  cancelInterviewSchema,
} from '@/lib/validations';
import { FIELD_LENGTH_LIMITS } from '@/lib/constants';

describe('Validation Schemas - Security Tests', () => {
  describe('candidateFormSchema - Buffer Overflow Protection', () => {
    it('should reject firstName exceeding max length', () => {
      const longName = 'A'.repeat(FIELD_LENGTH_LIMITS.NAME + 1);
      const result = candidateFormSchema.safeParse({
        firstName: longName,
        lastName: 'Doe',
        email: 'test@example.com',
        gender: 'male',
        countryCode: '+358',
        phoneNumber: '123456789',
        dateOfBirth: '2000-01-01',
        city: 'Helsinki',
        country: 'Finland',
        nationality: 'Finnish',
        jobCategory: 'Development & IT',
        jobTitle: 'Developer',
        specialty: 'Frontend',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const firstNameError = result.error.issues.find((issue) =>
          issue.path.includes('firstName')
        );
        expect(firstNameError).toBeDefined();
      }
    });

    it('should reject unsafe URLs (javascript: protocol)', () => {
      const result = candidateFormSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        gender: 'male',
        countryCode: '+358',
        phoneNumber: '123456789',
        dateOfBirth: '2000-01-01',
        city: 'Helsinki',
        country: 'Finland',
        nationality: 'Finnish',
        jobCategory: 'Development & IT',
        jobTitle: 'Developer',
        specialty: 'Frontend',
        websites: ['javascript:alert("XSS")'],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const websiteError = result.error.issues.find((issue) => issue.path.includes('websites'));
        expect(websiteError).toBeDefined();
      }
    });

    it('should accept valid data at max length boundaries', () => {
      const maxName = 'A'.repeat(FIELD_LENGTH_LIMITS.NAME);
      const result = candidateFormSchema.safeParse({
        firstName: maxName,
        lastName: maxName,
        email: 'test@example.com',
        gender: 'male',
        countryCode: '+358',
        phoneNumber: '123456789',
        dateOfBirth: '2000-01-01',
        city: 'Helsinki',
        country: 'Finland',
        nationality: 'Finnish',
        jobCategory: 'Development & IT',
        jobTitle: 'Developer',
        specialty: 'Frontend',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('jobSchema - Buffer Overflow Protection', () => {
    it('should reject job title exceeding max length', () => {
      const longTitle = 'T'.repeat(FIELD_LENGTH_LIMITS.JOB_TITLE + 1);
      const result = jobSchema.safeParse({
        title: longTitle,
        category: 'Development & IT',
        description: 'A great job',
        specialties: ['Frontend'],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const titleError = result.error.issues.find((issue) => issue.path.includes('title'));
        expect(titleError).toBeDefined();
      }
    });

    it('should reject job description exceeding max length', () => {
      const longDesc = 'D'.repeat(FIELD_LENGTH_LIMITS.JOB_DESCRIPTION + 1);
      const result = jobSchema.safeParse({
        title: 'Developer',
        category: 'Development & IT',
        description: longDesc,
        specialties: ['Frontend'],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const descError = result.error.issues.find((issue) => issue.path.includes('description'));
        expect(descError).toBeDefined();
      }
    });

    it('should reject too many specialties', () => {
      const tooManySpecialties = Array(FIELD_LENGTH_LIMITS.MAX_SPECIALTIES + 1).fill('Specialty');
      const result = jobSchema.safeParse({
        title: 'Developer',
        category: 'Development & IT',
        description: 'A great job',
        specialties: tooManySpecialties,
      });

      expect(result.success).toBe(false);
    });

    it('should accept valid job at max length boundaries', () => {
      const maxTitle = 'T'.repeat(FIELD_LENGTH_LIMITS.JOB_TITLE);
      const maxDesc = 'D'.repeat(FIELD_LENGTH_LIMITS.JOB_DESCRIPTION);
      const result = jobSchema.safeParse({
        title: maxTitle,
        category: 'Development & IT',
        description: maxDesc,
        specialties: ['Frontend'],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('scheduleInterviewSchema - Buffer Overflow Protection', () => {
    it('should reject notes exceeding max length', () => {
      const longNotes = 'N'.repeat(FIELD_LENGTH_LIMITS.INTERVIEW_NOTES + 1);
      const result = scheduleInterviewSchema.safeParse({
        candidateId: 'candidate123',
        candidateEmail: 'test@example.com',
        candidateName: 'John Doe',
        interviewDate: '2026-01-15',
        interviewTime: '10:00',
        duration: 30,
        adminEmail: 'admin@example.com',
        notes: longNotes,
      });

      expect(result.success).toBe(false);
    });

    it('should accept notes at max length boundary', () => {
      const maxNotes = 'N'.repeat(FIELD_LENGTH_LIMITS.INTERVIEW_NOTES);
      const result = scheduleInterviewSchema.safeParse({
        candidateId: 'candidate123',
        candidateEmail: 'test@example.com',
        candidateName: 'John Doe',
        interviewDate: '2026-01-15',
        interviewTime: '10:00',
        duration: 30,
        adminEmail: 'admin@example.com',
        notes: maxNotes,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('statusUpdateSchema - Buffer Overflow Protection', () => {
    it('should reject candidateId exceeding max length', () => {
      const longId = 'I'.repeat(FIELD_LENGTH_LIMITS.CANDIDATE_ID + 1);
      const result = statusUpdateSchema.safeParse({
        candidateId: longId,
        newStatus: 'approved',
      });

      expect(result.success).toBe(false);
    });

    it('should reject calendarEventId exceeding max length', () => {
      const longEventId = 'E'.repeat(FIELD_LENGTH_LIMITS.CALENDAR_EVENT_ID + 1);
      const result = statusUpdateSchema.safeParse({
        candidateId: 'candidate123',
        newStatus: 'interview_scheduled',
        calendarEventId: longEventId,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('cancelInterviewSchema - Buffer Overflow Protection', () => {
    it('should reject reason exceeding max length', () => {
      const longReason = 'R'.repeat(FIELD_LENGTH_LIMITS.CANCEL_REASON + 1);
      const result = cancelInterviewSchema.safeParse({
        candidateId: 'candidate123',
        reason: longReason,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('checkDuplicateSchema - Buffer Overflow Protection', () => {
    it('should reject jobId exceeding max length', () => {
      const longJobId = 'J'.repeat(FIELD_LENGTH_LIMITS.JOB_ID + 1);
      const result = checkDuplicateSchema.safeParse({
        email: 'test@example.com',
        jobId: longJobId,
        jobCategory: 'Development & IT',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Cross-cutting Security Concerns', () => {
    it('should prevent SQL injection patterns in text fields', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const result = candidateFormSchema.safeParse({
        firstName: sqlInjection,
        lastName: 'Doe',
        email: 'test@example.com',
        gender: 'male',
        countryCode: '+358',
        phoneNumber: '123456789',
        dateOfBirth: '2000-01-01',
        city: 'Helsinki',
        country: 'Finland',
        nationality: 'Finnish',
        jobCategory: 'Development & IT',
        jobTitle: 'Developer',
        specialty: 'Frontend',
      });

      // Should fail because of special characters not allowed in names
      expect(result.success).toBe(false);
    });

    it('should prevent script tags in text fields', () => {
      const xssAttempt = '<script>alert("XSS")</script>';
      const result = candidateFormSchema.safeParse({
        firstName: xssAttempt,
        lastName: 'Doe',
        email: 'test@example.com',
        gender: 'male',
        countryCode: '+358',
        phoneNumber: '123456789',
        dateOfBirth: '2000-01-01',
        city: 'Helsinki',
        country: 'Finland',
        nationality: 'Finnish',
        jobCategory: 'Development & IT',
        jobTitle: 'Developer',
        specialty: 'Frontend',
      });

      // Should fail because of special characters not allowed in names
      expect(result.success).toBe(false);
    });
  });
});

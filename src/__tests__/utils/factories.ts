import { Candidate, Job } from "@/types";
import { Timestamp } from "firebase/firestore";

export function createMockCandidate(overrides: Partial<Candidate> = {}): Candidate {
    return {
        id: `candidate_${Math.random().toString(36).substr(2, 9)}`,
        fullName: "John Doe",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        gender: "male",
        phoneNumber: "+358 401234567",
        countryCode: "+358",
        dateOfBirth: "1990-01-15",
        age: 35,
        city: "Helsinki",
        country: "Finland",
        nationality: "Finnish",
        jobTitle: "job_123",
        jobTitleText: "Software Engineer",
        jobCategory: "Technology",
        specialty: "Backend Development",
        websites: [],
        cvUrl: "https://example.com/cv.pdf",
        passportUrl: "https://example.com/passport.pdf",
        submittedAt: Timestamp.now(),
        status: "submitted",
        score: null,
        ...overrides,
    };
}

export function createMockJob(overrides: Partial<Job> = {}): Job {
    return {
        id: `job_${Math.random().toString(36).substr(2, 9)}`,
        title: "Software Engineer",
        description: "We are looking for a skilled software engineer...",
        category: "Technology" as any,
        specialties: ["Backend Development", "Frontend Development", "DevOps"],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...overrides,
    };
}

export function createMockCandidates(count: number): Candidate[] {
    return Array.from({ length: count }, (_, i) =>
        createMockCandidate({
            id: `candidate_${i}`,
            fullName: `Candidate ${i}`,
            firstName: `First${i}`,
            lastName: `Last${i}`,
            email: `candidate${i}@example.com`,
        })
    );
}

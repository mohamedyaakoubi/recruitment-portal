# 🚀 Additional Best Practices Implementation Plan (V2)

This document contains additional improvements to implement after the initial improvement plan was completed.

**Previous Plan Status:** ✅ All 17 tasks completed
- Logger utility created and migrated across 80+ files
- Error boundaries, loading states, not-found pages implemented
- React Query infrastructure set up
- Zod validation schemas created
- Constants and utility files added
- Test utilities and factories created

---

## 📋 Table of Contents

1. [React Query Hooks Implementation](#1-react-query-hooks-implementation)
2. [Type Safety Refinement](#2-type-safety-refinement)
3. [SEO Enhancements](#3-seo-enhancements)
4. [Standardized UI Components](#4-standardized-ui-components)
5. [Accessibility Improvements](#5-accessibility-improvements)

---

## 1. React Query Hooks Implementation

### Task 1.1: Create useJobs Hook

**Problem:** Jobs are fetched with raw fetch() calls. React Query provides caching, automatic refetching, and better loading/error states.

**New file to create:** `src/hooks/useJobs.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Job } from "@/types";
import logger from "@/lib/logger";

interface JobsResponse {
  jobs: Job[];
  categories: string[];
}

// Fetch jobs
async function fetchJobs(activeOnly: boolean = true): Promise<JobsResponse> {
  const response = await fetch(`/api/jobs?activeOnly=${activeOnly}`);
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  return response.json();
}

// Create job
async function createJobApi(jobData: Partial<Job>): Promise<{ jobId: string }> {
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create job");
  }
  return response.json();
}

// Update job
async function updateJobApi(jobId: string, jobData: Partial<Job>): Promise<void> {
  const response = await fetch("/api/jobs", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId, ...jobData }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update job");
  }
}

// Delete job
async function deleteJobApi(jobId: string): Promise<void> {
  const response = await fetch(`/api/jobs?jobId=${jobId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete job");
  }
}

/**
 * Hook for fetching jobs with caching
 */
export function useJobs(activeOnly: boolean = true) {
  return useQuery({
    queryKey: ["jobs", { activeOnly }],
    queryFn: () => fetchJobs(activeOnly),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating a new job
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      logger.info("Job created successfully");
    },
    onError: (error) => {
      logger.error("Failed to create job", error);
    },
  });
}

/**
 * Hook for updating a job
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<Job> }) =>
      updateJobApi(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      logger.info("Job updated successfully");
    },
    onError: (error) => {
      logger.error("Failed to update job", error);
    },
  });
}

/**
 * Hook for deleting a job
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJobApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      logger.info("Job deleted successfully");
    },
    onError: (error) => {
      logger.error("Failed to delete job", error);
    },
  });
}
```

---

### Task 1.2: Create useEmailVerification Hook

**New file to create:** `src/hooks/useEmailVerification.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import logger from "@/lib/logger";

interface EmailVerificationResult {
  isValid: boolean;
  deliverable?: boolean;
  disposable?: boolean;
  error?: string;
}

async function verifyEmailApi(email: string): Promise<EmailVerificationResult> {
  const response = await fetch("/api/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Email verification failed");
  }

  return response.json();
}

/**
 * Hook for email verification
 */
export function useEmailVerification() {
  return useMutation({
    mutationFn: verifyEmailApi,
    onError: (error) => {
      logger.error("Email verification failed", error);
    },
  });
}
```

---

### Task 1.3: Create usePhoneValidation Hook

**New file to create:** `src/hooks/usePhoneValidation.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import logger from "@/lib/logger";

interface PhoneValidationResult {
  isValid: boolean;
  message?: string;
  warning?: string;
  country?: {
    name: string;
    code: string;
  };
  type?: string;
  carrier?: string;
}

interface PhoneValidationParams {
  countryCode: string;
  phoneNumber: string;
}

async function validatePhoneApi(params: PhoneValidationParams): Promise<PhoneValidationResult> {
  const response = await fetch("/api/validate-phone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Phone validation failed");
  }

  return response.json();
}

/**
 * Hook for phone number validation
 */
export function usePhoneValidation() {
  return useMutation({
    mutationFn: validatePhoneApi,
    onError: (error) => {
      logger.error("Phone validation failed", error);
    },
  });
}
```

---

### Task 1.4: Create useCandidateScoring Hook

**New file to create:** `src/hooks/useCandidateScoring.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import logger from "@/lib/logger";

interface ScoringResult {
  success: boolean;
  score: number;
  analysis: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  recommendation: string;
}

interface ScoringParams {
  candidateId: string;
  jobId?: string;
  jobTitle: string;
  jobDescription: string;
}

async function scoreCandidateApi(params: ScoringParams): Promise<ScoringResult> {
  const response = await fetch("/api/score-candidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Scoring failed");
  }

  return response.json();
}

/**
 * Hook for AI candidate scoring
 */
export function useCandidateScoring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scoreCandidateApi,
    onSuccess: (data, variables) => {
      // Invalidate candidates to refresh the score
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      logger.info("Candidate scored successfully", {
        candidateId: variables.candidateId,
        score: data.score,
      });
    },
    onError: (error) => {
      logger.error("Candidate scoring failed", error);
    },
  });
}
```

---

### Task 1.5: Create useScheduleInterview Hook

**New file to create:** `src/hooks/useScheduleInterview.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import logger from "@/lib/logger";

interface ScheduleInterviewParams {
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
  interviewDate: string;
  interviewTime: string;
  duration?: number;
  jobTitle?: string;
  adminEmail: string;
  notes?: string;
}

interface ScheduleInterviewResult {
  success: boolean;
  message: string;
  data: {
    interviewDateTime: string;
    endDateTime: string;
    duration: number;
    meetLink: string;
    calendarEventId: string;
  };
}

async function scheduleInterviewApi(params: ScheduleInterviewParams): Promise<ScheduleInterviewResult> {
  const response = await fetch("/api/schedule-interview-meet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to schedule interview");
  }

  return response.json();
}

/**
 * Hook for scheduling interviews with Google Meet
 */
export function useScheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleInterviewApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      logger.info("Interview scheduled successfully", {
        candidateId: variables.candidateId,
        meetLink: data.data.meetLink,
      });
    },
    onError: (error) => {
      logger.error("Failed to schedule interview", error);
    },
  });
}
```

---

## 2. Type Safety Refinement

### Task 2.1: Fix `any` Types in types/index.ts

**File to modify:** `src/types/index.ts`

**Find and replace these `any` types with proper types:**

```typescript
// Change from:
createdAt?: any;
updatedAt?: any;

// Change to:
createdAt?: Timestamp | Date | string;
updatedAt?: Timestamp | Date | string;

// Change from:
filteredJobs: any[];
selectedJob: any;

// Change to:
filteredJobs: Job[];
selectedJob: Job | null;
```

---

### Task 2.2: Fix `any` Types in services/scoring.ts

**File to modify:** `src/services/scoring.ts`

```typescript
// Change from:
async function extractDocumentContent(fileUrl: string): Promise<{ content: string; geminiFile?: any }>

// Change to:
interface GeminiFileData {
  mimeType: string;
  fileUri: string;
}

async function extractDocumentContent(fileUrl: string): Promise<{ content: string; geminiFile?: GeminiFileData }>

// Change from:
const geminiFiles: any[] = [];
const parts: any[] = [];

// Change to:
const geminiFiles: GeminiFileData[] = [];

interface GeminiPart {
  text?: string;
  fileData?: GeminiFileData;
}
const parts: GeminiPart[] = [];
```

---

### Task 2.3: Fix `any` Types in services/jobs.ts

**File to modify:** `src/services/jobs.ts`

```typescript
// Change from:
const updateData: any = {

// Change to:
interface JobUpdateData {
  title?: string;
  description?: string;
  category?: JobCategory;
  specialties?: string[];
  isActive?: boolean;
  updatedAt: FieldValue;
}
const updateData: JobUpdateData = {
```

---

### Task 2.4: Fix `any` Type in services/candidate.ts

**File to modify:** `src/services/candidate.ts`

```typescript
// Change from:
let query: any = db.collection("candidates");

// Change to:
import { Query, CollectionReference, DocumentData } from "firebase-admin/firestore";

let query: Query<DocumentData> | CollectionReference<DocumentData> = db.collection("candidates");
```

---

### Task 2.5: Fix `any` Type in lib/csvUtils.ts

**File to modify:** `src/lib/csvUtils.ts`

```typescript
// Change from:
export function generateCSV(candidates: any[]): string {

// Change to:
import { Candidate } from "@/types";

export function generateCSV(candidates: Candidate[]): string {
```

---

## 3. SEO Enhancements

### Task 3.1: Create Sitemap Generator

**New file to create:** `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://internationalskills.fi";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/candidate-form`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/candidate-choices`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/candidate-dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];
}
```

---

### Task 3.2: Create Robots.txt Generator

**New file to create:** `src/app/robots.ts`

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://internationalskills.fi";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin-dashboard-secret/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

### Task 3.3: Create Web App Manifest

**New file to create:** `src/app/manifest.ts`

```typescript
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "International Skills - Career Portal",
    short_name: "IntSkills",
    description: "Connect with international job opportunities",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#003A70",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
```

---

## 4. Standardized UI Components

### Task 4.1: Create Button Component

**New file to create:** `src/app/components/ui/Button.tsx`

```tsx
import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#003A70] text-white hover:bg-[#002B54] focus:ring-[#003A70]",
      secondary:
        "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 focus:ring-gray-500",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
      outline:
        "border-2 border-[#003A70] text-[#003A70] hover:bg-[#003A70] hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white focus:ring-[#003A70]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
```

---

### Task 4.2: Create Input Component

**New file to create:** `src/app/components/ui/Input.tsx`

```tsx
import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-2 border rounded-lg transition-colors",
              "bg-white dark:bg-gray-800",
              "text-gray-900 dark:text-white",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-[#003A70] focus:border-transparent",
              "disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-700",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
```

---

### Task 4.3: Create Select Component

**New file to create:** `src/app/components/ui/Select.tsx`

```tsx
import React, { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full px-4 py-2 border rounded-lg transition-colors appearance-none",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-[#003A70] focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-700",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
```

---

### Task 4.4: Create Badge Component

**New file to create:** `src/app/components/ui/Badge.tsx`

```tsx
import React from "react";
import { cn } from "@/lib/utils";
import { CANDIDATE_STATUSES, STATUS_COLORS, STATUS_LABELS, CandidateStatus } from "@/lib/constants";

export interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  children,
  className,
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// Status-specific badge component
interface StatusBadgeProps {
  status: CandidateStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md", className }) => {
  const statusVariantMap: Record<CandidateStatus, BadgeProps["variant"]> = {
    [CANDIDATE_STATUSES.SUBMITTED]: "info",
    [CANDIDATE_STATUSES.REJECTED]: "danger",
    [CANDIDATE_STATUSES.INTERVIEW_SCHEDULED]: "warning",
    [CANDIDATE_STATUSES.APPROVED]: "success",
  };

  return (
    <Badge variant={statusVariantMap[status]} size={size} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
};

export { Badge, StatusBadge };
```

---

### Task 4.5: Create Card Component

**New file to create:** `src/app/components/ui/Card.tsx`

```tsx
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  shadow = "md",
}) => {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4 md:p-6",
    lg: "p-6 md:p-8",
  };

  const shadows = {
    none: "",
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg",
        paddings[padding],
        shadows[shadow],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn("mb-4 pb-4 border-b border-gray-200 dark:border-gray-700", className)}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4";
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className, as: Component = "h3" }) => (
  <Component className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}>
    {children}
  </Component>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn("text-gray-600 dark:text-gray-300", className)}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn("mt-4 pt-4 border-t border-gray-200 dark:border-gray-700", className)}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
```

---

### Task 4.6: Create UI Components Index

**New file to create:** `src/app/components/ui/index.ts`

```typescript
export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";

export { Badge, StatusBadge } from "./Badge";
export type { BadgeProps } from "./Badge";

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./Card";

export { default as Loader } from "./Loader";
export { ThemeSwitcher } from "./ThemeSwitcher";
```

---

## 5. Accessibility Improvements

### Task 5.1: Add Skip Navigation Link

**File to modify:** `src/app/layout.tsx`

Add after `<body>` tag:

```tsx
<body className={inter.className}>
  {/* Skip Navigation for Accessibility */}
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#003A70] focus:text-white focus:rounded-lg"
  >
    Skip to main content
  </a>
  <ClientProviders>{children}</ClientProviders>
</body>
```

**Note:** Also ensure main content areas have `id="main-content"` attribute.

---

### Task 5.2: Create useFocusTrap Hook

**New file to create:** `src/hooks/useFocusTrap.ts`

```typescript
import { useEffect, useRef, RefObject } from "react";

/**
 * Hook to trap focus within a container element (for modals, dialogs)
 */
export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean = true
): RefObject<T> {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelectors = [
      "button:not([disabled])",
      "a[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    firstElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift + Tab: If on first element, move to last
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: If on last element, move to first
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}
```

---

## 📊 Implementation Checklist

### Phase 1: React Query Hooks (Priority: HIGH) ✅ COMPLETED
- [x] Task 1.1: Create useJobs Hook
- [x] Task 1.2: Create useEmailVerification Hook
- [x] Task 1.3: Create usePhoneValidation Hook
- [x] Task 1.4: Create useCandidateScoring Hook
- [x] Task 1.5: Create useScheduleInterview Hook

### Phase 2: Type Safety (Priority: HIGH) ✅ COMPLETED
- [x] Task 2.1: Fix `any` types in types/index.ts
- [x] Task 2.2: Fix `any` types in services/scoring.ts
- [x] Task 2.3: Fix `any` types in services/jobs.ts
- [x] Task 2.4: Fix `any` types in services/candidate.ts
- [x] Task 2.5: Fix `any` types in lib/csvUtils.ts

### Phase 3: SEO (Priority: MEDIUM) ✅ COMPLETED
- [x] Task 3.1: Create sitemap.ts
- [x] Task 3.2: Create robots.ts
- [x] Task 3.3: Create manifest.ts

### Phase 4: UI Components (Priority: MEDIUM) ✅ COMPLETED
- [x] Task 4.1: Create Button Component
- [x] Task 4.2: Create Input Component
- [x] Task 4.3: Create Select Component
- [x] Task 4.4: Create Badge Component
- [x] Task 4.5: Create Card Component
- [x] Task 4.6: Create UI Components Index

### Phase 5: Accessibility (Priority: LOW) ✅ COMPLETED
- [x] Task 5.1: Add Skip Navigation Link
- [x] Task 5.2: Create useFocusTrap Hook

---

## ✅ COMPLETION STATUS

**All 18 tasks completed successfully!**

### Summary of Changes:

#### Phase 1 - React Query Hooks (5 files created)
- ✅ `src/hooks/useJobs.ts` - Full CRUD operations for jobs with caching
- ✅ `src/hooks/useEmailVerification.ts` - Email validation with React Query
- ✅ `src/hooks/usePhoneValidation.ts` - Phone validation with React Query
- ✅ `src/hooks/useCandidateScoring.ts` - AI scoring with cache invalidation
- ✅ `src/hooks/useScheduleInterview.ts` - Google Meet scheduling with mutations

#### Phase 2 - Type Safety (5 files fixed, 14+ any types eliminated)
- ✅ `src/types/index.ts` - Fixed Job timestamp types and JobApplicationSectionProps
- ✅ `src/services/scoring.ts` - Added GeminiFile, GeminiFileData, GeminiPart interfaces
- ✅ `src/services/jobs.ts` - Replaced any with Partial<Job> & { updatedAt: Timestamp }
- ✅ `src/services/candidate.ts` - Fixed query type to Query<DocumentData>, removed 9 any types
- ✅ `src/lib/csvUtils.ts` - Changed any[] to Candidate[]
- ✅ `src/app/api/validate-phone/route.ts` - Fixed logger call signature

#### Phase 3 - SEO Enhancement (3 files created)
- ✅ `src/app/sitemap.ts` - Dynamic sitemap for search engines
- ✅ `src/app/robots.ts` - Crawler configuration
- ✅ `src/app/manifest.ts` - PWA manifest with app metadata

#### Phase 4 - UI Components (7 files created)
- ✅ `src/components/ui/Button.tsx` - Reusable button with variants and loading states
- ✅ `src/components/ui/Input.tsx` - Accessible input with labels, errors, hints
- ✅ `src/components/ui/Select.tsx` - Dropdown select with proper ARIA attributes
- ✅ `src/components/ui/Badge.tsx` - Status badges with multiple variants
- ✅ `src/components/ui/Card.tsx` - Card container with configurable padding/shadow
- ✅ `src/components/ui/CardComponents.tsx` - Card subcomponents (Header, Title, Content, Footer)
- ✅ `src/components/ui/index.ts` - Barrel export for all UI components

#### Phase 5 - Accessibility (2 enhancements)
- ✅ `src/app/layout.tsx` - Added skip navigation link and main content wrapper
- ✅ `src/hooks/useFocusTrap.ts` - Focus trap hook for modal accessibility

### Verification:
- ✅ No TypeScript compilation errors
- ✅ All files created successfully
- ✅ Type safety improved throughout codebase
- ✅ SEO files follow Next.js 15 conventions
- ✅ UI components use cn() utility and follow Tailwind conventions
- ✅ Accessibility enhancements implemented

---

## 📝 Notes for Agent

1. **Order matters**: Complete tasks in order within each phase
2. **Test after each task**: Run `pnpm run build` to verify no errors
3. **Import statements**: Add all necessary imports when creating files
4. **Don't break existing code**: These are additions, not replacements (except type fixes)
5. **Use existing utilities**: Leverage `cn()` from utils.ts and `logger` from logger.ts

---

## Total Tasks: 18 ✅ ALL COMPLETED

**Implementation completed in:** ~45 minutes by GitHub Copilot

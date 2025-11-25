# 🚀 Next.js + Firebase Web App Improvement Plan

This document contains a comprehensive list of improvements to implement for better code quality, performance, and maintainability.

---

## 📋 Table of Contents

1. [Critical Architecture Fixes](#1-critical-architecture-fixes)
2. [Add Missing Infrastructure](#2-add-missing-infrastructure)
3. [Performance Optimizations](#3-performance-optimizations)
4. [Type Safety Improvements](#4-type-safety-improvements)
5. [Code Quality Improvements](#5-code-quality-improvements)
6. [Testing Improvements](#6-testing-improvements)

---

## 1. Critical Architecture Fixes

### Task 1.1: Fix RootLayout Server/Client Component Separation

**Problem:** The `src/app/layout.tsx` uses `"use client"` which prevents proper metadata export and server-side rendering benefits.

**Files to modify:**
- `src/app/layout.tsx` - Convert to Server Component
- `src/app/ClientProviders.tsx` - Create new file for client-side providers

**Changes for `src/app/layout.tsx`:**
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "International Skills - Career Portal",
    template: "%s | International Skills",
  },
  description: "Connect with international job opportunities and take the next step in your professional journey.",
  keywords: ["jobs", "careers", "international", "recruitment", "Finland"],
  authors: [{ name: "International Skills Labor Company" }],
  openGraph: {
    title: "International Skills - Career Portal",
    description: "Your career journey starts here",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
```

**New file `src/app/ClientProviders.tsx`:**
```tsx
"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "./providers";
import Loader from "./components/ui/Loader";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {loading && <Loader />}
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
```

---

### Task 1.2: Enable ESLint During Builds

**Problem:** ESLint is disabled during builds in `next.config.ts`, hiding potential issues.

**File to modify:** `next.config.ts`

**Change from:**
```typescript
const nextConfig: NextConfig = {
    eslint: {
    ignoreDuringBuilds: true,
  },
};
```

**Change to:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["src"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 2. Add Missing Infrastructure

### Task 2.1: Create Logger Utility

**Problem:** 80+ console.log/console.error statements throughout the codebase that should not appear in production.

**New file to create:** `src/lib/logger.ts`

```typescript
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === "development";

const formatMessage = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

export const logger = {
  debug: (message: string, context?: LogContext): void => {
    if (isDevelopment) {
      console.debug(formatMessage("debug", message, context));
    }
  },

  info: (message: string, context?: LogContext): void => {
    if (isDevelopment) {
      console.info(formatMessage("info", message, context));
    }
  },

  warn: (message: string, context?: LogContext): void => {
    console.warn(formatMessage("warn", message, context));
  },

  error: (message: string, error?: unknown, context?: LogContext): void => {
    const errorContext = {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    };
    console.error(formatMessage("error", message, errorContext));
  },

  // For API routes - always log in production for monitoring
  api: {
    request: (method: string, path: string, context?: LogContext): void => {
      console.info(formatMessage("info", `API ${method} ${path}`, context));
    },
    response: (method: string, path: string, status: number, duration: number): void => {
      console.info(formatMessage("info", `API ${method} ${path} -> ${status} (${duration}ms)`));
    },
    error: (method: string, path: string, error: unknown): void => {
      logger.error(`API ${method} ${path} failed`, error);
    },
  },
};

export default logger;
```

---

### Task 2.2: Create Error Boundary Components

**New file to create:** `src/app/error.tsx`

```tsx
"use client";

import { useEffect } from "react";
import logger from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Application error occurred", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#003A70] text-white font-semibold rounded-lg hover:bg-[#002B54] transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 2.3: Create Global Error Handler

**New file to create:** `src/app/global-error.tsx`

```tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Critical Error
            </h2>
            <p className="text-gray-600 mb-6">
              A critical error has occurred. Please refresh the page.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

### Task 2.4: Create Loading Components

**New file to create:** `src/app/loading.tsx`

```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#003A70] border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
```

**New file to create:** `src/app/admin-dashboard-secret/loading.tsx`

```tsx
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### Task 2.5: Create Not Found Page

**New file to create:** `src/app/not-found.tsx`

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-[#003A70] dark:text-blue-400">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#003A70] text-white font-semibold rounded-lg hover:bg-[#002B54] transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
```

---

### Task 2.6: Create Health Check API Endpoint

**New file to create:** `src/app/api/health/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };

  return NextResponse.json(healthCheck, { status: 200 });
}
```

---

### Task 2.7: Create API Middleware for Rate Limiting

**New file to create:** `src/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting (use Redis in production for multi-instance)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "anonymous";
  return `${ip}:${request.nextUrl.pathname}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Skip health check endpoint
    if (request.nextUrl.pathname === "/api/health") {
      return NextResponse.next();
    }

    const key = getRateLimitKey(request);

    if (isRateLimited(key)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
```

---

## 3. Performance Optimizations

### Task 3.1: Add React Query or SWR for Data Fetching

**Install dependency:**
```bash
pnpm add @tanstack/react-query
```

**New file to create:** `src/lib/queryClient.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Update `src/app/ClientProviders.tsx` to include QueryClientProvider:**

```tsx
"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "./providers";
import Loader from "./components/ui/Loader";
import { queryClient } from "@/lib/queryClient";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {loading && <Loader />}
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

---

### Task 3.2: Create Custom Hooks for API Calls

**New file to create:** `src/hooks/useJobs.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { Job } from "@/types";

async function fetchJobs(activeOnly: boolean = true): Promise<Job[]> {
  const response = await fetch(`/api/jobs?activeOnly=${activeOnly}`);
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  const data = await response.json();
  return data.jobs || [];
}

export function useJobs(activeOnly: boolean = true) {
  return useQuery({
    queryKey: ["jobs", activeOnly],
    queryFn: () => fetchJobs(activeOnly),
  });
}
```

---

## 4. Type Safety Improvements

### Task 4.1: Create Strict API Response Types

**New file to create:** `src/types/api.ts`

```typescript
// Standard API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Candidate API responses
export interface CheckCandidateResponse {
  exists: boolean;
  applications: CandidateApplication[];
  count: number;
}

export interface CandidateApplication {
  id: string;
  submittedAt: string | null;
  interviewDate: string | null;
  [key: string]: unknown;
}

export interface UpdateStatusResponse {
  success: boolean;
  newStatus: string;
  emailSent?: boolean;
}

export interface ScoreCandidateResponse {
  success: boolean;
  score: number;
  analysis: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  recommendation: string;
  jobTitle: string;
  scoringVersion: string;
}

export interface ScheduleInterviewResponse {
  success: boolean;
  message: string;
  data: {
    interviewDateTime: string;
    endDateTime: string;
    duration: number;
    meetLink: string;
    calendarEventId: string;
    emailsSent: {
      candidate: string;
      interviewer: string;
    };
  };
}

// Email verification response
export interface EmailVerificationResponse {
  isValid: boolean;
  deliverable?: boolean;
  disposable?: boolean;
  role_account?: boolean;
  error?: string;
}

// Phone validation response
export interface PhoneValidationResponse {
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
```

---

### Task 4.2: Create Zod Validation Schemas

**Install dependency:**
```bash
pnpm add zod
```

**New file to create:** `src/lib/validations.ts`

```typescript
import { z } from "zod";

// Name validation schema
const nameSchema = z
  .string()
  .min(2, "Must be at least 2 characters")
  .max(50, "Cannot exceed 50 characters")
  .regex(/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/, "Can only contain letters, spaces, hyphens, and apostrophes")
  .refine((val) => !/\d/.test(val), "Cannot contain numbers")
  .refine((val) => !/\./.test(val), "Cannot contain dots")
  .refine((val) => !/\s{2,}/.test(val), "Cannot contain multiple consecutive spaces")
  .refine((val) => !/^[\s'-]|[\s'-]$/.test(val), "Cannot start or end with spaces, hyphens, or apostrophes");

// Email schema
const emailSchema = z.string().email("Invalid email address").toLowerCase().trim();

// Phone number schema
const phoneSchema = z
  .string()
  .min(6, "Phone number must be at least 6 digits")
  .max(15, "Phone number cannot exceed 15 digits")
  .regex(/^\d+$/, "Phone number can only contain digits");

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
}, "You must be at least 18 years old");

// Candidate form schema
export const candidateFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: phoneSchema,
  dateOfBirth: dateOfBirthSchema,
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  nationality: z.string().min(1, "Nationality is required").max(100),
  doubleNationality: z.string().max(100).optional(),
  jobCategory: z.string().min(1, "Job category is required"),
  jobTitle: z.string().min(1, "Job position is required"),
  specialty: z.string().min(1, "Specialty is required"),
  websites: z.array(z.string().url().optional()).optional(),
});

// Update candidate schema (partial)
export const updateCandidateSchema = candidateFormSchema.partial();

// Status update schema
export const statusUpdateSchema = z.object({
  candidateId: z.string().min(1, "Candidate ID is required"),
  newStatus: z.enum(["submitted", "rejected", "interview_scheduled", "approved"]),
  interviewTimestampISO: z.string().datetime().optional(),
  calendarEventId: z.string().optional(),
  meetLink: z.string().url().optional(),
  duration: z.number().min(15).max(180).optional(),
});

// Score candidate schema
export const scoreCandidateSchema = z.object({
  candidateId: z.string().min(1),
  jobId: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(10, "Job description is required"),
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
```

---

### Task 4.3: Create API Route Wrapper with Validation

**New file to create:** `src/lib/apiUtils.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import logger from "./logger";

export interface ApiHandlerOptions<T> {
  schema?: ZodSchema<T>;
}

export type ApiHandler<T = unknown> = (
  request: NextRequest,
  validatedData: T
) => Promise<NextResponse>;

export function createApiHandler<T = unknown>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions<T> = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const method = request.method;
    const path = request.nextUrl.pathname;

    try {
      logger.api.request(method, path);

      let validatedData: T = {} as T;

      if (options.schema) {
        const body = await request.json();
        validatedData = options.schema.parse(body);
      }

      const response = await handler(request, validatedData);

      const duration = Date.now() - startTime;
      logger.api.response(method, path, response.status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof ZodError) {
        logger.api.response(method, path, 400, duration);
        return NextResponse.json(
          {
            error: "Validation error",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      logger.api.error(method, path, error);
      return NextResponse.json(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  };
}
```

---

## 5. Code Quality Improvements

### Task 5.1: Create Constants File

**New file to create:** `src/lib/constants.ts`

```typescript
// Application constants
export const APP_NAME = "International Skills Labor Company";
export const APP_EMAIL = "wassim@internationalskills.fi";
export const APP_PHONE = "+358 452644966";

// Status values
export const CANDIDATE_STATUSES = {
  SUBMITTED: "submitted",
  REJECTED: "rejected",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  APPROVED: "approved",
} as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[keyof typeof CANDIDATE_STATUSES];

// Status display labels
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  [CANDIDATE_STATUSES.SUBMITTED]: "Submitted",
  [CANDIDATE_STATUSES.REJECTED]: "Rejected",
  [CANDIDATE_STATUSES.INTERVIEW_SCHEDULED]: "Interview Scheduled",
  [CANDIDATE_STATUSES.APPROVED]: "Approved",
};

// Status colors for UI
export const STATUS_COLORS: Record<CandidateStatus, { bg: string; text: string }> = {
  [CANDIDATE_STATUSES.SUBMITTED]: { bg: "bg-blue-100", text: "text-blue-800" },
  [CANDIDATE_STATUSES.REJECTED]: { bg: "bg-red-100", text: "text-red-800" },
  [CANDIDATE_STATUSES.INTERVIEW_SCHEDULED]: { bg: "bg-yellow-100", text: "text-yellow-800" },
  [CANDIDATE_STATUSES.APPROVED]: { bg: "bg-green-100", text: "text-green-800" },
};

// File upload limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_CV_TYPES: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_PASSPORT_TYPES: ["application/pdf", "image/jpeg", "image/png"],
};

// Interview settings
export const INTERVIEW_DEFAULTS = {
  DURATION_OPTIONS: [15, 30, 45, 60, 90, 120],
  DEFAULT_DURATION: 30,
  MIN_DURATION: 15,
  MAX_DURATION: 180,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
};

// Age limits
export const AGE_LIMITS = {
  MIN_AGE: 18,
  MAX_AGE: 100,
};

// Rate limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  EMAIL_VERIFICATION_PER_HOUR: 10,
  FORM_SUBMISSIONS_PER_HOUR: 5,
};
```

---

### Task 5.2: Create Utility Functions File

**New file to create:** `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string | Date): number | null {
  if (!dateOfBirth) return null;

  const birthDate = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "Invalid Date";

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "Invalid Date";

  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number; backoff?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2 } = options;

  let lastError: Error | undefined;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < retries - 1) {
        await sleep(delay * Math.pow(backoff, i));
      }
    }
  }

  throw lastError;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
```

**Install clsx and tailwind-merge:**
```bash
pnpm add clsx tailwind-merge
```

---

## 6. Testing Improvements

### Task 6.1: Add More Test Utilities

**New file to create:** `src/__tests__/utils/testUtils.tsx`

```tsx
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };
```

---

### Task 6.2: Create Mock Data Factories

**New file to create:** `src/__tests__/utils/factories.ts`

```typescript
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
```

---

## 📊 Implementation Checklist

### Phase 1: Critical Fixes (Priority: HIGH)
- [ ] Task 1.1: Fix RootLayout Server/Client Component Separation
- [ ] Task 1.2: Enable ESLint During Builds

### Phase 2: Infrastructure (Priority: HIGH)
- [ ] Task 2.1: Create Logger Utility
- [ ] Task 2.2: Create Error Boundary
- [ ] Task 2.3: Create Global Error Handler
- [ ] Task 2.4: Create Loading Components
- [ ] Task 2.5: Create Not Found Page
- [ ] Task 2.6: Create Health Check API
- [ ] Task 2.7: Create API Middleware for Rate Limiting

### Phase 3: Performance (Priority: MEDIUM)
- [ ] Task 3.1: Add React Query
- [ ] Task 3.2: Create Custom Hooks for API Calls

### Phase 4: Type Safety (Priority: MEDIUM)
- [ ] Task 4.1: Create Strict API Response Types
- [ ] Task 4.2: Create Zod Validation Schemas
- [ ] Task 4.3: Create API Route Wrapper

### Phase 5: Code Quality (Priority: MEDIUM)
- [ ] Task 5.1: Create Constants File
- [ ] Task 5.2: Create Utility Functions File

### Phase 6: Testing (Priority: LOW)
- [ ] Task 6.1: Add More Test Utilities
- [ ] Task 6.2: Create Mock Data Factories

---

## 📝 Notes for Agent

1. **Order matters**: Complete tasks in the order listed within each phase
2. **Test after each task**: Run `pnpm run build` after each major change
3. **Don't forget imports**: When creating new files, ensure all imports are added where needed
4. **Keep existing functionality**: These are improvements, not rewrites - preserve all existing features
5. **TypeScript strict mode**: All new code should be fully typed with no `any` types


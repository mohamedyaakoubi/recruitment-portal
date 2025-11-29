# Candidate Portal - Recruitment Management System

A production-ready, enterprise-grade full-stack web application designed to streamline the recruitment process. It provides a comprehensive platform for candidates to apply for jobs and for administrators to manage candidates, schedule interviews, and track the hiring process with AI-powered candidate scoring.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Security](#security)
- [Testing](#testing)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Candidate Portal is a comprehensive recruitment management system built for **International Skills Labor Company**. It enables:

- **Candidates** to submit job applications with CVs, photos, and supporting documents
- **Candidates** to track their application status through a dedicated dashboard
- **Administrators** to manage the entire recruitment pipeline from a secure dashboard
- **AI-powered evaluation** of candidates using Google's Gemini 2.5 Pro
- **Seamless interview scheduling** with Google Calendar and Meet integration
- **Automated email notifications** for application confirmations, status updates, and interview invites

---

## Features

### Candidate Features

- **📝 Job Application Form**
  - Multi-step application with personal info, job selection, and document uploads
  - Support for CV (PDF/DOC/DOCX), passport, and photo uploads
  - Additional information section (links, files, or text)
  - Email verification with disposable email detection
  - Phone number validation with country code support
  - Real-time form validation with Zod schema

- **📊 Candidate Dashboard**
  - Email-based lookup to view all submitted applications
  - Application status tracking (Submitted, Interview Scheduled, Approved, Rejected)
  - Interview details with Google Meet links
  - View AI scoring results and recommendations

- **🌐 Job Categories**
  - Agricole, Bâtiment et travail publique, Development & IT
  - Industriel, Restauration, Santé, Services, Sociale, Tourisme
  - Dynamic specialty selection per job

### Admin Features

- **🔒 Secure Admin Dashboard** (hidden route with Firebase Auth)
  - Real-time statistics and charts (status distribution, score distribution)
  - Comprehensive candidate table with sorting and pagination
  - Advanced multi-criteria filtering

- **🤖 AI-Powered Candidate Scoring**
  - Gemini 2.5 Pro integration for CV analysis
  - Document upload and processing via Google AI File Manager
  - Website and portfolio analysis
  - Scoring breakdown: Job Match (40%), Experience (30%), Skills (20%), Potential (10%)
  - Key strengths and areas for improvement identification
  - AI recommendation levels: Highly Recommended, Recommended, Conditional, Not Recommended

- **📅 Interview Scheduling**
  - Google Calendar API integration
  - Automatic Google Meet link generation
  - Email invitations to candidates and administrators
  - Interview rescheduling and cancellation support
  - Calendar view for scheduled interviews

- **👤 Candidate Management**
  - View detailed candidate profiles with all documents
  - Edit candidate information inline
  - Status management with automated email notifications
  - Bulk operations support

- **💼 Job Management**
  - Create, edit, and delete job listings
  - Category and specialty management
  - Active/Inactive job status toggling

- **📤 Data Export**
  - Export to CSV, XLSX, or JSON formats
  - Filtered exports based on current view

- **☀️/🌙 Theme Support**
  - Light and dark mode with system preference detection
  - Persistent theme preference

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [React 18](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [Lucide React](https://lucide.dev/) | Icon library |
| [React Icons](https://react-icons.github.io/react-icons/) | Additional icons |
| [Recharts](https://recharts.org/) | Data visualization |
| [React Big Calendar](https://github.com/jquense/react-big-calendar) | Calendar component |
| [Headless UI](https://headlessui.com/) | Accessible UI components |
| [next-themes](https://github.com/pacocoursey/next-themes) | Theme management |
| [TanStack Query](https://tanstack.com/query) | Server state management |

### Backend
| Technology | Purpose |
|------------|---------|
| [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) | Serverless API endpoints |
| [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) | Server-side Firebase operations |
| [Nodemailer](https://nodemailer.com/) | Email sending |
| [Google APIs](https://github.com/googleapis/google-api-nodejs-client) | Calendar & Meet integration |
| [Zod](https://zod.dev/) | Runtime schema validation |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| [Firebase Firestore](https://firebase.google.com/docs/firestore) | NoSQL document database |
| [Firebase Storage](https://firebase.google.com/docs/storage) | File storage for documents |
| [Firebase Authentication](https://firebase.google.com/docs/auth) | Admin authentication |

### AI & ML
| Technology | Purpose |
|------------|---------|
| [Google Gemini 2.5 Pro](https://ai.google.dev/) | CV analysis and candidate scoring |
| [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) | Gemini SDK |

### Security & Rate Limiting
| Technology | Purpose |
|------------|---------|
| [Upstash Redis](https://upstash.com/) | Distributed rate limiting |
| [csrf](https://www.npmjs.com/package/csrf) | CSRF protection |
| [isomorphic-dompurify](https://www.npmjs.com/package/isomorphic-dompurify) | XSS sanitization |

### Testing
| Technology | Purpose |
|------------|---------|
| [Vitest](https://vitest.dev/) | Unit testing framework |
| [React Testing Library](https://testing-library.com/) | Component testing |
| [Playwright](https://playwright.dev/) | End-to-end testing |
| [jsdom](https://github.com/jsdom/jsdom) | DOM simulation |

### Code Quality
| Technology | Purpose |
|------------|---------|
| [ESLint](https://eslint.org/) | Code linting |
| [Prettier](https://prettier.io/) | Code formatting |
| [Husky](https://typicode.github.io/husky/) | Git hooks |
| [lint-staged](https://github.com/okonet/lint-staged) | Staged files linting |

---

## Architecture

### Application Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Candidate     │────▶│   Next.js App   │────▶│    Firebase     │
│   Browser       │◀────│   (Frontend)    │◀────│   Firestore     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   API Routes    │
                        │   (Backend)     │
                        └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Firebase Admin │     │   Google APIs   │     │   Nodemailer    │
│  (Auth/Storage) │     │ (Gemini/Calendar)│     │   (SMTP)        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Security Layers

```
Request → Middleware → Rate Limiting → CSRF Validation → Origin Check → API Handler
                          │                   │                │
                          ▼                   ▼                ▼
                    Upstash Redis      Token Store       Origin Whitelist
```

---

## Getting Started

### Prerequisites

- **Node.js** v20.x or later
- **pnpm** (recommended) or npm/yarn
- **Firebase Project** with Firestore, Storage, and Authentication enabled
- **Google Cloud Platform** project with Gemini API and Calendar API enabled
- **SMTP Server** for email notifications (e.g., SendGrid, Mailgun, Gmail)
- **Upstash Redis** account (optional, for production rate limiting)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohamedyaakoubi/candidate.git
   cd candidate
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in the required values.

4. **Set up Firebase:**
   - Deploy Firestore rules: `firebase deploy --only firestore:rules`
   - Deploy Storage rules: `firebase deploy --only storage`

5. **Run the development server:**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check code formatting |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:ui` | Run tests with Vitest UI |
| `pnpm test:e2e` | Run E2E tests with Playwright |
| `pnpm test:e2e:ui` | Run E2E tests with Playwright UI |
| `pnpm reset-db` | Reset database (use with caution) |

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# ─────────────────────────────────────────────────────────────
# Firebase Configuration
# ─────────────────────────────────────────────────────────────
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# ─────────────────────────────────────────────────────────────
# Google APIs
# ─────────────────────────────────────────────────────────────
GEMINI_API_KEY=your-gemini-api-key

# Google OAuth (for Calendar integration)
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# ─────────────────────────────────────────────────────────────
# SMTP Configuration (Email)
# ─────────────────────────────────────────────────────────────
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# ─────────────────────────────────────────────────────────────
# Rate Limiting (Upstash Redis - Production)
# ─────────────────────────────────────────────────────────────
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# ─────────────────────────────────────────────────────────────
# Application Configuration
# ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
FALLBACK_ADMIN_EMAIL=admin@yourdomain.com
```

---

## Configuration

### Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)

2. **Enable Firestore Database:**
   - Create in production mode
   - Deploy the included `firestore.rules`

3. **Enable Firebase Storage:**
   - Deploy the included `storage.rules`

4. **Enable Authentication:**
   - Enable Email/Password provider
   - Create an admin user account

5. **Generate Service Account:**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Use credentials for `FIREBASE_*` environment variables

### Google Cloud Platform Setup

1. **Enable APIs** in [Google Cloud Console](https://console.cloud.google.com/):
   - Generative Language API (Gemini)
   - Google Calendar API
   - Google Meet API (optional)

2. **Create API Key** for Gemini:
   - Go to APIs & Services → Credentials
   - Create API Key → Restrict to Generative Language API

3. **Configure OAuth** for Calendar:
   - Create OAuth 2.0 Client ID
   - Configure consent screen
   - Add authorized redirect URIs

### SMTP Configuration

Configure with your preferred email provider:

| Provider | SMTP Host | Port |
|----------|-----------|------|
| Gmail | smtp.gmail.com | 587 |
| SendGrid | smtp.sendgrid.net | 587 |
| Mailgun | smtp.mailgun.org | 587 |
| Amazon SES | email-smtp.region.amazonaws.com | 587 |

---

## Project Structure

```
candidate/
├── .github/                    # GitHub configurations
│   └── instructions/           # Copilot instructions
├── e2e/                        # End-to-end tests (Playwright)
│   ├── fixtures/               # Test fixtures
│   ├── pages/                  # Page objects
│   ├── utils/                  # Test utilities
│   └── *.spec.ts               # Test files
├── public/                     # Static assets
├── scripts/                    # Automation scripts
│   └── reset-database.ts       # Database reset utility
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin-dashboard-secret/  # Admin dashboard (protected)
│   │   │   └── login/          # Admin login page
│   │   ├── api/                # API routes
│   │   │   ├── cancel-interview/
│   │   │   ├── check-candidate/
│   │   │   ├── check-duplicate/
│   │   │   ├── csrf-token/
│   │   │   ├── export-candidates/
│   │   │   ├── get-candidate-applications/
│   │   │   ├── google-auth/
│   │   │   ├── health/
│   │   │   ├── jobs/
│   │   │   ├── schedule-interview-meet/
│   │   │   ├── score-candidate/
│   │   │   ├── send-confirmation-email/
│   │   │   ├── update-candidate/
│   │   │   ├── update-status/
│   │   │   ├── validate-phone/
│   │   │   └── verify-email/
│   │   ├── candidate-choices/   # Email-based application lookup
│   │   ├── candidate-dashboard/ # Candidate status tracking
│   │   ├── candidate-form/      # Job application form
│   │   ├── components/          # App-specific components
│   │   │   ├── admin-dashboard/ # Admin components
│   │   │   ├── candidate-choices/
│   │   │   ├── candidate-dashboard/
│   │   │   ├── candidate-form/
│   │   │   ├── candidate-table/
│   │   │   ├── common/
│   │   │   ├── edit-candidate-modal/
│   │   │   ├── profile-modal/
│   │   │   └── ui/
│   │   ├── error.tsx            # Error boundary
│   │   ├── global-error.tsx     # Global error handler
│   │   ├── layout.tsx           # Root layout
│   │   ├── loading.tsx          # Loading state
│   │   ├── not-found.tsx        # 404 page
│   │   ├── page.tsx             # Landing page
│   │   ├── manifest.ts          # PWA manifest
│   │   ├── robots.ts            # Robots.txt
│   │   └── sitemap.ts           # Sitemap
│   ├── components/
│   │   └── ui/                  # Shared UI components
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── Input.tsx
│   │       └── Select.tsx
│   ├── data/                    # Static data files
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.tsx
│   │   ├── useCandidateDashboard.ts
│   │   ├── useCandidateForm.ts
│   │   ├── useCandidates.ts
│   │   ├── useCandidateScoring.ts
│   │   ├── useDashboard.ts
│   │   ├── useEmailVerification.ts
│   │   ├── useFocusTrap.ts
│   │   ├── useInterviewEvents.ts
│   │   ├── useJobs.ts
│   │   ├── usePhoneValidation.ts
│   │   └── useScheduleInterview.ts
│   ├── lib/                     # Utility functions
│   │   ├── constants/           # Application constants
│   │   │   ├── emails.ts
│   │   │   └── errors.ts
│   │   ├── emailTemplates/      # Email HTML/TXT templates
│   │   ├── __mocks__/           # Test mocks
│   │   ├── __tests__/           # Unit tests
│   │   ├── apiHandlers.ts       # API utilities
│   │   ├── apiResponse.ts       # Response helpers
│   │   ├── auth.ts              # Auth utilities
│   │   ├── constants.ts         # Shared constants
│   │   ├── csrf.ts              # CSRF protection
│   │   ├── csrf-middleware.ts   # CSRF middleware
│   │   ├── csvUtils.ts          # CSV export
│   │   ├── dateUtils.ts         # Date formatting
│   │   ├── disposableEmailDomains.ts
│   │   ├── env-validation.ts    # Environment validation
│   │   ├── errors.ts            # Error handling
│   │   ├── fileValidation.ts    # File upload validation
│   │   ├── firebase-admin.ts    # Firebase Admin SDK
│   │   ├── firebase.ts          # Firebase Client SDK
│   │   ├── googleOAuth.ts       # Google OAuth helpers
│   │   ├── honeypot.ts          # Spam prevention
│   │   ├── job-categories.ts    # Job category definitions
│   │   ├── logger.ts            # Logging utility
│   │   ├── origin-validation.ts # Origin/referer validation
│   │   ├── phoneValidationService.ts
│   │   ├── queryClient.ts       # TanStack Query client
│   │   ├── rate-limit.ts        # Rate limiting
│   │   ├── requestId.ts         # Request correlation
│   │   ├── sanitize.ts          # XSS sanitization
│   │   ├── security-logger.ts   # Security event logging
│   │   ├── securityAlerts.ts    # Security alerting
│   │   ├── tokenEncryption.ts   # Token handling
│   │   └── validations.ts       # Zod schemas
│   ├── middleware.ts            # Next.js middleware
│   ├── instrumentation.ts       # Server startup hooks
│   ├── services/                # External service integrations
│   │   ├── candidate.ts         # Candidate CRUD
│   │   ├── email.ts             # Email service
│   │   ├── emailVerification.ts
│   │   ├── interview.ts         # Interview scheduling
│   │   ├── jobs.ts              # Job management
│   │   └── scoring.ts           # AI scoring
│   ├── types/                   # TypeScript definitions
│   │   ├── api.ts               # API types
│   │   └── index.ts             # Shared types
│   └── __tests__/               # Integration tests
├── .env.local                   # Environment variables (not committed)
├── eslint.config.mjs            # ESLint configuration
├── firebase.json                # Firebase configuration
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore indexes
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
├── playwright.config.ts         # Playwright configuration
├── postcss.config.mjs           # PostCSS configuration
├── storage.rules                # Firebase Storage rules
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.ts             # Vitest configuration
└── vitest.setup.ts              # Vitest setup
```

---

## API Reference

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | GET | List all active jobs |
| `/api/check-candidate` | POST | Check candidate by email |
| `/api/check-duplicate` | POST | Check for duplicate applications |
| `/api/send-confirmation-email` | POST | Send application confirmation |
| `/api/verify-email` | POST | Verify email validity |
| `/api/validate-phone` | POST | Validate phone number |
| `/api/get-candidate-applications` | POST | Get applications by email |
| `/api/csrf-token` | GET | Get CSRF token |
| `/api/health` | GET | Health check endpoint |

### Protected Endpoints (Admin Only)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | POST | Create new job |
| `/api/jobs` | PUT | Update job |
| `/api/jobs` | DELETE | Delete job |
| `/api/update-status` | POST | Update candidate status |
| `/api/update-candidate` | PUT | Update candidate info |
| `/api/score-candidate` | POST | Score candidate with AI |
| `/api/schedule-interview-meet` | POST | Schedule interview |
| `/api/cancel-interview` | POST | Cancel interview |
| `/api/export-candidates` | GET | Export candidate data |
| `/api/google-auth/*` | Various | Google OAuth flow |

### Rate Limits

| Endpoint Pattern | Requests | Window |
|-----------------|----------|--------|
| `/api/auth/*` | 5 | 1 min |
| `/api/admin/*` | 60 | 1 min |
| `/api/check-*` | 5 | 1 min |
| `/api/validate-phone` | 5 | 1 min |
| `/api/verify-email` | 5 | 1 min |
| `/api/send-confirmation-email` | 3 | 1 min |
| `/api/export-candidates` | 3 | 1 min |
| Default | 30 | 1 min |

---

## Data Models

### Candidate

```typescript
interface Candidate {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  gender?: string;
  phoneNumber?: string;
  countryCode?: string;
  dateOfBirth?: string;
  age?: number;
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
  status: 'submitted' | 'rejected' | 'interview_scheduled' | 'approved';
  
  // AI Scoring fields
  score: number | null;
  scoreAnalysis?: string;
  keyStrengths?: string[];
  areasForImprovement?: string[];
  aiRecommendation?: 'highly_recommended' | 'recommended' | 'conditional' | 'not_recommended';
  scoringVersion?: string;
  lastScoredAt?: Timestamp;
  
  // Interview fields
  interviewDate?: Timestamp;
  calendarEventId?: string;
  meetLink?: string;
  meetSpaceId?: string;
  duration?: number;
  
  // Additional information
  additionalInfo?: {
    type: 'link' | 'file' | 'text';
    content: string;
    fileUrl?: string;
  }[];
}
```

### Job

```typescript
interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  specialties: string[];
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Job Categories

- Agricole
- Bâtiment et travail publique
- Development & IT
- Industriel
- Restauration
- Santé
- Services
- Sociale
- Tourisme

---

## Security

### Security Headers

The application enforces strict security headers via middleware:

- **Content-Security-Policy**: Strict CSP with whitelisted sources
- **Strict-Transport-Security**: HSTS with 1-year max-age
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restrictive feature policy

### Rate Limiting

- **Production**: Upstash Redis for distributed rate limiting
- **Development**: In-memory rate limiting
- **Endpoint-specific limits** for sensitive operations

### CSRF Protection

- Token-based CSRF protection for state-changing operations
- 15-minute token expiration
- Session-bound tokens

### Input Validation

- **Zod schemas** for runtime validation
- **XSS sanitization** with DOMPurify
- **File validation** with magic byte verification
- **URL sanitization** to prevent protocol attacks

### Authentication

- Firebase Authentication for admin access
- Email/Password provider
- Token verification via Firebase Admin SDK

### Firestore Security Rules

```javascript
// Candidates: Public create, admin-only read/update/delete
// Jobs: Public read, admin-only write operations
```

### Storage Security Rules

- 10MB file size limit
- Allowed MIME types: PDF, DOC, DOCX, JPEG, PNG, WebP
- Read access requires authentication

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run with UI
pnpm test:ui

# Run specific test file
pnpm test src/lib/__tests__/sanitize.test.ts
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e e2e/admin-login.spec.ts

# Run in specific browser
pnpm test:e2e --project=chromium
```

### Test Coverage

| Category | Test Files |
|----------|------------|
| Admin Dashboard | `admin-*.spec.ts` |
| Candidate Flow | `candidate-*.spec.ts` |
| Authentication | `auth.spec.ts` |
| Error Handling | `error-pages.spec.ts` |
| Responsive Design | `responsive.spec.ts` |
| Cross-Browser | `cross-browser.spec.ts` |

### Test Configuration

- **Vitest**: jsdom environment, path aliases
- **Playwright**: Chromium, Firefox, WebKit
- **CI/CD**: Single worker, 2 retries

---

## Scripts

### Database Reset

```bash
# Reset all data (requires confirmation)
pnpm reset-db

# With confirmation prompt
pnpm reset-db:confirm
```

### Code Quality

```bash
# Lint and fix
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Pre-commit Hooks

Husky runs automatically on commit:
- ESLint fix for TypeScript files
- Prettier formatting

---

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy

### Firebase

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Environment Requirements

- Node.js 20.x runtime
- 512MB+ memory for AI scoring
- Redis for production rate limiting

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the code style
4. Run tests: `pnpm test && pnpm test:e2e`
5. Commit with conventional commits
6. Push and create a Pull Request

### Code Style

- TypeScript strict mode
- ESLint with strict rules
- Prettier for formatting
- No `console.log` (use `logger`)
- No `any` types

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For questions or issues, please open a GitHub issue or contact the development team.

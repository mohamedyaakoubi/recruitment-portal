# Project Documentation

This document provides a comprehensive overview of the Candidate Portal application, including its architecture, features, and technical implementation.

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Components](#components)
- [Backend](#backend)
  - [API Routes](#api-routes)
- [Services and Integrations](#services-and-integrations)
- [Data Models](#data-models)
- [Testing](#testing)

## Project Overview

The Candidate Portal is a full-stack web application designed to streamline the recruitment process. It provides a platform for candidates to apply for jobs and for administrators to manage candidates, schedule interviews, and track the hiring process.

## Getting Started

### Prerequisites

- Node.js (v20.x or later)
- pnpm (or npm/yarn)
- Firebase Project
- Google Cloud Platform Project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd candidate-portal
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary environment variables for Firebase and other services. You can use `.env.example` as a template.

### Running the Application

-   **Development:**
    ```bash
    pnpm dev
    ```
    This will start the development server with Turbopack at `http://localhost:3000`.

-   **Production:**
    ```bash
    pnpm build
    pnpm start
    ```
    This will build the application for production and start the production server.

-   **Testing:**
    ```bash
    pnpm test
    ```
    This will run the test suite using Jest.

-   **Linting:**
    ```bash
    pnpm lint
    ```
    This will lint the codebase using ESLint.

## Project Structure

The project follows a standard Next.js application structure. Here's an overview of the most important files and directories:

-   `.next/`: Stores the build output of the Next.js application.
-   `public/`: Contains static assets like images, fonts, and SVGs.
-   `src/`: The main source code of the application.
    -   `app/`: The core of the Next.js application, using the App Router.
        -   `api/`: Contains all the backend API routes.
        -   `components/`: Reusable React components used throughout the application.
        -   `hooks/`: Custom React hooks for managing state and logic.
        -   `lib/`: Utility functions, libraries, and configurations.
        -   `services/`: Modules for interacting with external services like Firebase and Google APIs.
        -   `types/`: TypeScript type definitions.
-   `scripts/`: Contains scripts for automating tasks, such as `reset-database.ts`.
-   `package.json`: Lists the project's dependencies and scripts.
-   `next.config.ts`: The configuration file for Next.js.
-   `tsconfig.json`: The configuration file for TypeScript.
-   `jest.config.js`: The configuration file for Jest.
-   `eslint.config.mjs`: The configuration file for ESLint.

## Frontend

The frontend of the application is built with Next.js, React, and Tailwind CSS. It uses the App Router for routing and server-side rendering.

### Pages

The application consists of the following pages:

-   **`/` (Landing Page):** (`src/app/page.tsx`)
    -   This is the main entry point of the application.
    -   It features a hero section, a brief introduction to the company, and an email form to start the application process.
    -   The form checks if the candidate already exists in the database. If so, it redirects to the candidate choices page. Otherwise, it verifies the email and redirects to the candidate form.

-   **`/admin-dashboard-secret` (Admin Dashboard):** (`src/app/admin-dashboard-secret/page.tsx`)
    -   This is the main dashboard for administrators.
    -   It displays statistics, charts, a list of candidates with advanced filtering options, and a calendar for managing interviews.
    -   Admins can perform various actions like scoring candidates, scheduling interviews, and updating candidate statuses.
    -   This page is protected and requires authentication.

-   **`/admin-dashboard-secret/login` (Admin Login):** (`src/app/admin-dashboard-secret/login/page.tsx`)
    -   A simple login page for administrators to access the dashboard.
    -   It uses Firebase Authentication for email and password-based login.

-   **`/candidate-choices` (Candidate Choices):** (`src/app/candidate-choices/page.tsx`)
    -   This page is displayed to candidates who already have an account.
    -   It gives them the choice to either start a new application or view their existing applications.

-   **`/candidate-dashboard` (Candidate Dashboard):** (`src/app/candidate-dashboard/page.tsx`)
    -   This page allows candidates to view their application history, check the status of their applications, and see upcoming interview schedules.

-   **`/candidate-form` (Candidate Form):** (`src/app/candidate-form/page.tsx`)
    -   A comprehensive form for new candidates to submit their applications.
    -   It includes sections for personal information, job application details, file uploads (CV, passport, photo), and additional information.
    -   For existing candidates submitting a new application, the form is pre-filled with their information.

### Components

The application is built using a variety of reusable components, organized into different categories.

#### UI Components (`src/app/components/ui`)

These are the most basic and generic components used throughout the application.

-   **`ConfirmationModal.tsx`**: A reusable modal to confirm user actions.
    -   **Props**: `isOpen`, `title`, `message`, `confirmText`, `cancelText`, `onConfirm`, `onCancel`, `type` ('danger', 'warning', 'info').

-   **`FileInput.tsx`**: A styled file input component for forms.
    -   **Props**: `name`, `label`, `required`, `accept`, `onChange`, `disabled`, `helpText`.

-   **`Loader.tsx`**: A simple full-screen loading spinner.
    -   **Props**: None.

-   **`SearchableDropdown.tsx`**: A dropdown component with a search filter.
    -   **Props**: `options`, `value`, `onChange`, `placeholder`, `disabled`, `id`.

-   **`SocialIcon.tsx`**: A component to display a social media icon with a link.
    -   **Props**: `href`, `children`.

-   **`StatusBadge.tsx`**: A badge to display the status of a candidate's application.
    -   **Props**: `status` (string).

-   **`SuccessToast.tsx`**: A toast notification for successful form submissions.
    -   **Props**: `message`, `isVisible`, `onClose`, `duration`.

-   **`Tabs.tsx`**: A component for creating tabbed navigation.
    -   **Props**: `activeTab`, `onTabChange`, `tabs` (array of `{label, value}`), `children`.

-   **`ThemeSwitcher.tsx`**: A button to toggle between light and dark themes.
    -   **Props**: None.

-   **`Toast.tsx`**: A generic toast notification component for different message types.
    -   **Props**: `message`, `type` ('success', 'error', 'warning', 'info'), `isVisible`, `onClose`, `duration`.

#### Candidate Form Components (`src/app/components/candidate-form`)

These components are used to build the candidate application form.

-   **`AdditionalInfoSection.tsx`**: Allows candidates to add additional information like links, files, or text.
    -   **Props**: `additionalInfo`, `addAdditionalInfo`, `removeAdditionalInfo`, `updateAdditionalInfo`, `isLoading`.

-   **`DebugInfo.tsx`**: A component for debugging the form state during development. It is not rendered in production.
    -   **Props**: All the state variables from the `useCandidateForm` hook.

-   **`FileUploadSection.tsx`**: A section for uploading required documents (CV, passport, photo).
    -   **Props**: `handleFileChange`, `isLoading`, `isExistingCandidate`.

-   **`Footer.tsx`**: The footer for the candidate form page.
    -   **Props**: None.

-   **`Header.tsx`**: The header for the candidate form page.
    -   **Props**: None.

-   **`JobApplicationSection.tsx`**: A section for selecting a job category, position, and specialty.
    -   **Props**: `selectedCategory`, `handleCategorySelection`, `jobTitle`, `handleJobSelection`, `filteredJobs`, `selectedJob`, `specialty`, `setSpecialty`, `specialtySearch`, `setSpecialtySearch`, `availableSpecialties`, `isLoading`.

-   **`PersonalInfoSection.tsx`**: A large form section for collecting the candidate's personal information.
    -   **Props**: All the state variables and setters for personal information from the `useCandidateForm` hook.

#### Candidate Dashboard Components (`src/app/components/candidate-dashboard`)

These components are used to build the candidate dashboard.

-   **`ApplicationStatus.tsx`**: Displays a list of the candidate's applications with their status and details.
    -   **Props**: `applications`, `formatDate`.

-   **`DashboardFooter.tsx`**: The footer for the candidate dashboard page.
    -   **Props**: None.

-   **`DashboardHeader.tsx`**: The header for the candidate dashboard page.
    -   **Props**: None.

-   **`HelpSection.tsx`**: Displays a help section with contact information.
    -   **Props**: None.

-   **`InterviewDetails.tsx`**: Displays a list of upcoming interviews for the candidate.
    -   **Props**: `applications`, `formatDate`.

-   **`WelcomeSection.tsx`**: Displays a welcome message and a button to start a new application.
    -   **Props**: `candidateEmail`, `handleNewApplication`.

#### Admin Dashboard Components (`src/app/components/admin-dashboard`)

These components are used to build the admin dashboard.

-   **`CalendarSection.tsx`**: Displays a calendar of interviews using `react-big-calendar`.
    -   **Props**: `allInterviewEvents`, `filteredInterviewEvents`, `calendarFilter`, `setCalendarFilter`, `openProfileModal`.

-   **`CandidateManagement.tsx`**: Displays a table of candidates with tabs for filtering by status.
    -   **Props**: `activeTab`, `setActiveTab`, `filteredCandidates`, `statusUpdateLoading`, `openProfileModal`, `openScoringModal`, `handleStatusChange`, `filters`.

-   **`DashboardModals.tsx`**: A wrapper for all the modals used in the admin dashboard.
    -   **Props**: A large number of props for managing the state and actions of the different modals.

-   **`DashboardActions.ts`**: This is not a component, but a file containing functions for handling API calls and other actions in the admin dashboard.

#### Candidate Table Components (`src/app/components/candidate-table`)

These components are used to build the candidate table in the admin dashboard.

-   **`CandidateTableActions.tsx`**: Displays action buttons for each candidate (view, edit, score).
    -   **Props**: `candidate`, `onViewCandidate`, `onScoreCandidate`, `onEditCandidate`.

-   **`CandidateTableHeader.tsx`**: Renders the header of the candidate table with sortable columns.
    -   **Props**: `sortField`, `sortDirection`, `handleSort`.

-   **`CandidateTableRow.tsx`**: Renders a single row in the candidate table with candidate information.
    -   **Props**: `candidate`, `splitName`, `calculateAge`, `onViewCandidate`, `onScoreCandidate`, `onEditCandidate`.

-   **`ExportButtons.tsx`**: Provides buttons to export the candidate data in different formats (CSV, XLSX, JSON).
    -   **Props**: `isExporting`, `handleExport`.

#### Edit Candidate Modal Components (`src/app/components/edit-candidate-modal`)

These components are used to build the modal for editing candidate information.

-   **`EditModalFooter.tsx`**: Renders the footer of the modal with "Cancel" and "Save Changes" buttons.
    -   **Props**: `onClose`, `handleSubmit`, `isLoading`, `loadingJobs`.

-   **`EditModalHeader.tsx`**: Renders the header of the modal with a title and a close button.
    -   **Props**: `onClose`, `isLoading`.

-   **`JobInfoForm.tsx`**: A form for editing the job-related information of a candidate.
    -   **Props**: `formData`, `jobCategories`, `filteredJobs`, `availableSpecialties`, `handleCategoryChange`, `handleJobChange`, `handleInputChange`, `isLoading`, `loadingJobs`.

-   **`LocationInfoForm.tsx`**: A form for editing the location information of a candidate.
    -   **Props**: `formData`, `errors`, `handleInputChange`, `isLoading`.

-   **`PersonalInfoForm.tsx`**: A form for editing the personal information of a candidate.
    -   **Props**: `formData`, `errors`, `handleInputChange`, `isLoading`.

#### Profile Modal Components (`src/app/components/profile-modal`)

These components are used to build the candidate profile modal, which displays detailed information about a candidate.

-   **`ActionsCard.tsx`**: Displays actions that can be performed on a candidate (schedule interview, approve, reject).
    -   **Props**: `candidate`, `onStatusChange`, `onScheduleInterview`, `statusUpdateLoading`.

-   **`ApplicationDetailsCard.tsx`**: Displays the details of the candidate's application.
    -   **Props**: `candidate`.

-   **`DocumentsAndLinksCard.tsx`**: Displays links to the candidate's documents and websites.
    -   **Props**: `candidate`.

-   **`InfoCard.tsx`**: A generic card component for displaying information.
    -   **Props**: `title`, `icon`, `children`.

-   **`InfoRow.tsx`**: A component for displaying a label and a value in a row.
    -   **Props**: `label`, `value`, `icon`.

-   **`InterviewCard.tsx`**: Displays the details of a scheduled interview.
    -   **Props**: `candidate`, `onScheduleInterview`, `onCancelInterview`, `statusUpdateLoading`.

-   **`PersonalInfoCard.tsx`**: Displays the candidate's personal information.
    -   **Props**: `candidate`, `age`.

-   **`ProfileHeader.tsx`**: Renders the header of the profile modal.
    -   **Props**: `candidate`, `onClose`, `onEdit`, `isUpdating`, `statusUpdateLoading`.

-   **`ScoringCard.tsx`**: Displays the AI-powered scoring analysis of the candidate.
    -   **Props**: `candidate`.

-   **`SystemDetailsCard.tsx`**: Displays system-related details for the candidate.
    -   **Props**: `candidate`.

## Backend

The backend of the application is built using Next.js API Routes. It handles all the business logic, data processing, and communication with external services like Firebase and Google APIs.

### API Routes

The following API routes are available:

-   **`POST /api/cancel-interview`**: Cancels an interview for a candidate.
    -   **Request Body**: `{ "candidateId": string, "reason": string (optional) }`
    -   **Response**: `{ "success": boolean, "message": string }`

-   **`POST /api/check-candidate`**: Checks if a candidate with a given email already exists.
    -   **Request Body**: `{ "email": string }`
    -   **Response**: `{ "exists": boolean, "applications": Candidate[] }`

-   **`POST /api/check-duplicate`**: Checks for duplicate applications from the same candidate.
    -   **Request Body**: `{ "email": string, "jobId": string, "jobCategory": string }`
    -   **Response**: `{ "isDuplicate": boolean, "message": string, "lastApplicationDate": string }`

-   **`GET /api/export-candidates`**: Exports candidate data in different formats (CSV, XLSX, JSON).
    -   **Query Parameters**: `format`, `status`, `name`, `city`, `country`, `nationality`, `jobTitle`, `category`, `specialty`, `ageMin`, `ageMax`.
    -   **Response**: The exported file.

-   **`POST /api/get-candidate-applications`**: Retrieves all applications for a given candidate email.
    -   **Request Body**: `{ "email": string }`
    -   **Response**: `{ "applications": Candidate[] }`

-   **`GET, POST, PUT, DELETE /api/jobs`**: Handles CRUD operations for jobs.
    -   **`GET`**: Retrieves a list of jobs and categories.
    -   **`POST`**: Creates a new job.
    -   **`PUT`**: Updates an existing job.
    -   **`DELETE`**: Deletes a job.

-   **`POST /api/schedule-interview-meet`**: Schedules an interview with a Google Meet link.
    -   **Request Body**: `{ "candidateId": string, "candidateEmail": string, "candidateName": string, "interviewDate": string, "interviewTime": string, "duration": number, "jobTitle": string, "adminEmail": string, "notes": string (optional) }`
    -   **Response**: `{ "success": boolean, "message": string, "data": object }`

-   **`POST /api/score-candidate`**: Scores a candidate using AI.
    -   **Request Body**: `{ "candidateId": string, "jobId": string, "jobTitle": string, "jobDescription": string }`
    -   **Response**: `{ "success": boolean, "score": number, "analysis": string, "keyStrengths": string[], "areasForImprovement": string[], "recommendation": string, "jobTitle": string, "scoringVersion": string }`

-   **`PUT /api/update-candidate`**: Updates a candidate's information.
    -   **Request Body**: `{ "candidateId": string, "updatedData": object }`
    -   **Response**: `{ "success": boolean, "message": string, "candidateId": string, "updatedAt": string }`

-   **`POST /api/update-status`**: Updates the status of a candidate's application.
    -   **Request Body**: `{ "candidateId": string, "newStatus": string, "interviewTimestampISO": string (optional), "calendarEventId": string (optional), "meetLink": string (optional), "duration": number (optional) }`
    -   **Response**: `{ "success": boolean, "newStatus": string, "emailSent": boolean }`

-   **`POST /api/verify-email`**: Verifies an email address using an external service.
    -   **Request Body**: `{ "email": string }`
    -   **Response**: `{ "isValid": boolean, "deliverable": boolean, "disposable": boolean, "role_account": boolean, "error": string (optional) }`

## Services and Integrations

The application uses several services and integrations to provide its features.

### Services (`src/services`)

-   **`candidate.ts`**: Contains functions for managing candidates, including calculating age, updating status, and exporting data.
-   **`email.ts`**: Handles sending emails to candidates using `nodemailer` and SMTP.
-   **`google.ts`**: Authenticates with Google APIs using a service account.
-   **`interview.ts`**: Manages scheduling and canceling interviews with Google Calendar and Google Meet.
-   **`jobs.ts`**: Handles CRUD operations for jobs in the Firestore database.
-   **`scoring.ts`**: Scores candidates using the Gemini 2.5 Pro AI model.

### Integrations

-   **Firebase**: Used for the database (Firestore) and authentication.
-   **Google Cloud Platform**: Used for hosting and other services.
-   **Google APIs**: Used for Google Calendar and Google Meet integration.
-   **Gemini API**: Used for AI-powered candidate scoring.
-   **Abstract API / Hunter.io**: Used for email verification.
-   **Nodemailer**: Used for sending emails via SMTP.

## Data Models

The application uses the following data models, defined in `src/types/index.ts`:

-   **`Candidate`**: Represents a candidate's application.
    -   `id`: string
    -   `fullName`: string
    -   `email`: string
    -   `status`: 'submitted' | 'rejected' | 'interview_scheduled' | 'approved'
    -   ...and many other fields for personal information, job details, scoring, etc.

-   **`Job`**: Represents a job posting.
    -   `id`: string
    -   `title`: string
    -   `description`: string
    -   `category`: string
    -   `specialties`: string[]
    -   `isActive`: boolean

-   **`InterviewEvent`**: Represents an interview event in the calendar.
    -   `resource`: Candidate
    -   `isCompleted`: boolean
    -   `eventType`: 'scheduled' | 'completed'
    -   ...and other fields from `react-big-calendar`.

## Testing

The project uses **Jest** and **React Testing Library** for unit and component testing.

### Configuration

-   **`jest.config.js`**: Configures Jest to work with Next.js, using the `jsdom` environment and mapping module aliases for easier imports.
-   **`jest.setup.ts`**: Sets up the testing environment by importing `@testing-library/jest-dom` for extended DOM assertions, and polyfills for `fetch` and `TextEncoder`.

### Running Tests

To run the tests, use the following command:

```bash
pnpm test
```

This will execute all test files in the project and provide a summary of the results.

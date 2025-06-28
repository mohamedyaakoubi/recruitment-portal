# Current Project Features

## Candidate Page (Landing Page)
- Allows candidates to submit applications.
- Collects Full Name, Email, Cover Letter, Websites (optional), CV, and Passport/ID.
- Uploads CV and Passport/ID files to Firebase Storage.
- Stores candidate data (fullName, email, coverLetter, websites, cvUrl, passportUrl, submittedAt, status, score) in Firestore.
- Basic form validation.

## Admin Dashboard
- User authentication via Firebase (uses `useAuth` hook).
- Displays a list of submitted candidates with their status.
- Provides statistics on total, rejected, scheduled, and submitted candidates.
- Visualizes candidate status distribution (Pie Chart) and AI score distribution (Bar Chart).
- Allows filtering candidates by status and full name.
- Modals for:
    - **Scoring:** Allows admin to input a job description to score a candidate using the `/api/score-candidate` endpoint.
    - **Candidate Profile:** Displays detailed candidate information, including links to CV and Passport/ID, and AI scoring analysis. Allows updating candidate status (reject, schedule interview).
- Interview scheduling functionality with date and time input.

## API Endpoints
- `/api/score-candidate`:
    - Takes `candidateId` and `jobDescription`.
    - Uses Google Gemini API to score candidates based on cover letter and job description.
    - Updates candidate's score and analysis in Firestore.
- `/api/update-status`:
    - Takes `candidateId`, `newStatus`, and optionally `interviewTimestampISO`.
    - Updates the candidate's status in Firestore.

## Database (Firestore)
- `candidates` collection:
    - `fullName` (string)
    - `email` (string)
    - `coverLetter` (string)
    - `websites` (array of strings)
    - `cvUrl` (string - URL to Firebase Storage)
    - `passportUrl` (string - URL to Firebase Storage)
    - `submittedAt` (Timestamp)
    - `status` (string: `submitted`, `rejected`, `interview_scheduled`, etc.)
    - `score` (number | null)
    - `scoreAnalysis` (string | undefined)
    - `lastScoredAt` (Timestamp | undefined)
    - `interviewDate` (Timestamp | undefined)

## File Storage (Firebase Storage)
- Stores uploaded CVs and Passports/IDs in `candidate_files/`.

## Authentication
- Firebase Authentication for admin dashboard login.

## AI Integration
- Uses Google Gemini API for candidate scoring based on provided job description and candidate's cover letter.


# Candidate Portal - Next.js + Firebase

This project is a web application for managing candidate applications, built with Next.js, Tailwind CSS, TypeScript, and Firebase.

## Features

*   **Candidate Form:** Public-facing form for candidates to submit their full name, **email address**, cover letter, optional websites, CV (PDF/DOC/DOCX), and Passport/ID (PDF/JPG/PNG).
*   **Firebase Backend:** Uses Firebase Firestore for storing candidate data and Firebase Storage for storing uploaded files (CV, Passport).
*   **Hidden Admin Dashboard:** A protected dashboard accessible via a secret URL (`/admin-dashboard-secret`) for administrators.
*   **Admin Authentication:** Uses Firebase Email/Password authentication to secure the admin dashboard.
*   **Candidate Management:** Admins can view a list of submitted candidates, filter them by name or status, and view key statistics (total, submitted, scheduled, rejected).
*   **Status Updates:** Admins can change the status of a candidate directly from the dashboard.
*   **File Access:** Admins can directly access uploaded CVs and Passports via links.
*   **Real AI Scoring:** Admins can input a job description to trigger **real AI scoring** using the Gemini API for a selected candidate. The score is reflected on the dashboard.
*   **Automated Email Notifications:** Sends automated emails to candidates when their status is changed to `rejected` or `interview_scheduled` (requires SMTP configuration).

## Prerequisites

*   Node.js (v20.x or later recommended)
*   pnpm (package manager)
*   A Firebase project
*   A Google Cloud project with the Gemini API enabled (for AI scoring)
*   An SMTP server/service (e.g., SendGrid, Mailgun, Gmail) for sending email notifications.

## Setup Instructions

1.  **Clone/Unzip:** Get the project code onto your local machine.
2.  **Install Dependencies:** Navigate to the project directory in your terminal and run:
    ```bash
    pnpm install
    ```
3.  **Firebase Configuration (Client-Side):**
    *   Open the file `/src/lib/firebase.ts`.
    *   Replace the placeholder values in the `firebaseConfig` object with your actual Firebase project's web app configuration. You can find this in your Firebase project settings > Project settings > General > Your apps > SDK setup and configuration.

4.  **Environment Variables:**
    *   Create a `.env.local` file in the project root.
    *   Add the following environment variables:

        ```env
        # Firebase Admin SDK Configuration (Required for backend functions)
        FIREBASE_PROJECT_ID=your-firebase-project-id
        FIREBASE_CLIENT_EMAIL=your-firebase-service-account-client-email
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

        # Gemini API Key (Required for AI Scoring)
        GEMINI_API_KEY=your-gemini-api-key

        # SMTP Configuration (Required for Email Notifications)
        SMTP_HOST=your-smtp-host.com
        SMTP_PORT=587 # Or 465, etc.
        SMTP_USER=your-smtp-username
        SMTP_PASS=your-smtp-password
        SMTP_FROM_EMAIL=Your Name <noreply@yourdomain.com> # Email address to send from
        ```

    *   **Firebase Admin SDK:** Get credentials from your Firebase project settings > Service accounts > Generate new private key. Ensure the private key is formatted correctly in the `.env.local` file (often requires replacing literal `\n` with actual newlines).
    *   **Gemini API Key:** Obtain this from your Google Cloud project where the Gemini API is enabled.
    *   **SMTP Configuration:** Use the details from your email provider (SendGrid, Mailgun, Gmail, etc.).

5.  **Firebase Project Setup:**
    *   **Authentication:** Enable the "Email/Password" sign-in method in the Firebase Authentication section. Create at least one admin user account.
    *   **Firestore:** Create a Firestore database in your Firebase project.
    *   **Storage:** Enable Firebase Storage.
    *   **Security Rules (Firestore):** Set appropriate security rules. Here are some basic examples ( **review and adapt these for production security needs** ):
        ```javascript
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow anyone to submit candidate data (includes email now)
            match /candidates/{candidateId} {
              allow create: if request.auth == null && request.resource.data.email is string; // Basic check
              // Allow authenticated admins to read, update (score, status), delete
              // Ensure admin email matches your configured admin user(s)
              allow read, update, delete: if request.auth != null && request.auth.token.email == "your-admin-email@example.com"; 
            }
          }
        }
        ```
    *   **Security Rules (Storage):** Set appropriate security rules. Basic example ( **review and adapt for production** ):
        ```javascript
        rules_version = '2';
        service firebase.storage {
          match /b/{bucket}/o {
            // Allow anyone to upload to candidate_files, check size/type
            match /candidate_files/{fileName} {
              allow write: if request.auth == null && request.resource.size < 5 * 1024 * 1024 // Max 5MB
                         && request.resource.contentType.matches('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document|image/jpeg|image/png');
              // Allow authenticated admins to read files
              // Ensure admin email matches your configured admin user(s)
              allow read: if request.auth != null && request.auth.token.email == "your-admin-email@example.com";
            }
          }
        }
        ```

## Running Locally

1.  Ensure you have set up the `.env.local` file with all required credentials (Firebase Admin, Gemini, SMTP).
2.  Run the development server:
    ```bash
    pnpm dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) to view the candidate form.
4.  Access the admin dashboard at [http://localhost:3000/admin-dashboard-secret](http://localhost:3000/admin-dashboard-secret) (you will be redirected to login if not authenticated).

## Building for Production

1.  Ensure your environment variables are accessible during the build if needed (though the current setup initializes lazily at runtime).
2.  Run:
    ```bash
    pnpm build
    ```

## Deployment

*   Platforms like Vercel or Netlify are well-suited for deploying Next.js applications.
*   **Environment Variables:** Make sure to configure **all** the environment variables (Firebase Admin SDK, Gemini API Key, SMTP details) in your deployment platform's settings.
*   **Build Command:** Set the build command to `pnpm build`.
*   **Output Directory:** Usually `.next`.

## Notes

*   **AI Scoring:** Uses the Gemini API key provided in environment variables. Ensure the API is enabled in your Google Cloud project.
*   **Email Notifications:** Require valid SMTP credentials in environment variables. If not configured, emails will not be sent, but status updates will still work.
*   **Security:** The provided Firebase security rules are basic examples. **Review and strengthen them** based on your specific security requirements before deploying to production.



This line was added by Manus AI.


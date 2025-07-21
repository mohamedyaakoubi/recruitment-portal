# Candidate Portal

This is a full-stack web application designed to streamline the recruitment process. It provides a platform for candidates to apply for jobs and for administrators to manage candidates, schedule interviews, and track the hiring process.

![Candidate Portal Screenshot](https://i.imgur.com/your-screenshot.png)

## Features

-   **📝 Candidate Application Form**: A public-facing form for candidates to submit their applications, including personal information, job preferences, and document uploads.
-   **🔒 Admin Dashboard**: A secure, hidden dashboard for administrators to manage the entire recruitment workflow.
-   **🤖 AI-Powered Scoring**: Utilizes the Gemini 2.5 Pro API to analyze candidate CVs and provide a comprehensive scoring analysis.
-   **📅 Interview Scheduling**: Integrated with Google Calendar and Google Meet to schedule and manage interviews seamlessly.
-   **📧 Automated Email Notifications**: Sends automated emails to candidates for status updates, interview schedules, and rejections using Nodemailer.
-   **🔍 Advanced Candidate Filtering**: Admins can filter candidates by name, status, location, job title, and more.
-   **📤 Data Export**: Export candidate data to CSV, XLSX, or JSON formats.
-   **☀️/🌙 Theme Switching**: Light and dark mode support for a better user experience.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
-   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
-   **File Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
-   **AI**: [Google Gemini API](https://ai.google.dev/)
-   **Calendar**: [Google Calendar API](https://developers.google.com/calendar)
-   **Email**: [Nodemailer](https://nodemailer.com/)
-   **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Getting Started

### Prerequisites

-   Node.js (v20.x or later)
-   pnpm (or npm/yarn)
-   A Firebase project
-   A Google Cloud Platform project with the Gemini API and Google Calendar API enabled
-   An SMTP server/service for sending emails

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
    Create a `.env.local` file in the root of the project and add the following environment variables. See the [Configuration](#configuration) section for more details.

    ```env
    # Firebase Admin SDK
    FIREBASE_PROJECT_ID=
    FIREBASE_CLIENT_EMAIL=
    FIREBASE_PRIVATE_KEY=

    # Google APIs
    GEMINI_API_KEY=
    GOOGLE_PROJECT_ID=
    GOOGLE_PRIVATE_KEY_ID=
    GOOGLE_PRIVATE_KEY=
    GOOGLE_SERVICE_ACCOUNT_EMAIL=
    GOOGLE_CLIENT_ID=

    # SMTP Configuration
    SMTP_HOST=
    SMTP_PORT=
    SMTP_USER=
    SMTP_PASS=
    SMTP_FROM_EMAIL=
    ```

### Running the Application

-   **Development:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

-   **Production:**
    ```bash
    pnpm build
    pnpm start
    ```

-   **Testing:**
    ```bash
    pnpm test
    ```

-   **Linting:**
    ```bash
    pnpm lint
    ```

## Configuration

### Firebase

1.  **Create a Firebase project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Set up Firestore**: Create a Firestore database in your project.
3.  **Set up Storage**: Enable Firebase Storage.
4.  **Set up Authentication**: Enable the "Email/Password" sign-in method.
5.  **Get Service Account Credentials**: In your Firebase project settings, go to "Service accounts" and generate a new private key. Use these credentials to fill in the `FIREBASE_*` environment variables.

### Google Cloud Platform

1.  **Enable APIs**: In the [Google Cloud Console](https://console.cloud.google.com/), enable the **Gemini API** and **Google Calendar API** for your project.
2.  **Get API Keys**:
    -   Create a Gemini API key and add it to your `.env.local` file.
    -   Use the same service account credentials from Firebase for the `GOOGLE_*` environment variables.

### SMTP

-   Configure the `SMTP_*` environment variables with the details from your email provider (e.g., SendGrid, Mailgun, Gmail).

## Project Structure

The project follows a standard Next.js application structure:

-   `src/app/`: The core of the application, using the App Router.
    -   `api/`: Backend API routes.
    -   `components/`: Reusable React components.
    -   `hooks/`: Custom React hooks.
    -   `lib/`: Utility functions and configurations.
    -   `services/`: Modules for interacting with external services.
    -   `types/`: TypeScript type definitions.
-   `public/`: Static assets.
-   `scripts/`: Automation scripts.

## API Routes

The application exposes several API routes for handling backend logic. For detailed information, see the [API documentation](DOCUMENTATION.md#api-routes).

## Data Models

The main data models used in the application are `Candidate` and `Job`. For detailed information, see the [Data Models documentation](DOCUMENTATION.md#data-models).

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
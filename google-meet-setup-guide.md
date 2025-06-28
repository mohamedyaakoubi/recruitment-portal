# Google Meet Integration Setup Guide

## Current Implementation

The current implementation provides a **simulated Google Meet integration** that:

1. **Generates simulated Meet links** in the format `https://meet.google.com/xxx-xxxx-xxx`
2. **Sends professional email invitations** with meeting details to both candidates and interviewers
3. **Includes all necessary meeting information** (date, time, duration, preparation instructions)
4. **Provides a foundation** for future Google Calendar API integration

## To Enable Real Google Meet Integration

To upgrade to actual Google Meet links and calendar integration, follow these steps:

### 1. Google Cloud Console Setup

1. **Create or select a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Required APIs**:
   - Enable Google Calendar API
   - Enable Google Meet API (optional, for advanced features)

3. **Configure OAuth Consent Screen**:
   - Go to APIs & Services > OAuth consent screen
   - Choose "Internal" for organization use or "External" for public use
   - Fill in required app information
   - Add test users if using external type

4. **Create OAuth 2.0 Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs (your domain)
   - Download the credentials JSON file

### 2. Environment Variables Setup

Add these variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Google Service Account (alternative approach)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Code Implementation

Replace the simulated implementation in `/api/schedule-interview/route.ts` with:

```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Initialize OAuth client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials (you'll need to implement OAuth flow)
oauth2Client.setCredentials({
  refresh_token: 'stored_refresh_token'
});

// Create calendar event with Google Meet
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const event = {
  summary: `Interview: ${jobTitle} - ${candidateName}`,
  start: {
    dateTime: interviewDateTime.toISOString(),
    timeZone: 'Europe/Helsinki'
  },
  end: {
    dateTime: new Date(interviewDateTime.getTime() + 60 * 60 * 1000).toISOString(),
    timeZone: 'Europe/Helsinki'
  },
  attendees: [
    { email: candidateEmail },
    { email: interviewerEmail }
  ],
  conferenceData: {
    createRequest: {
      requestId: `interview-${Date.now()}`,
      conferenceSolutionKey: {
        type: 'hangoutsMeet'
      }
    }
  }
};

const response = await calendar.events.insert({
  calendarId: 'primary',
  conferenceDataVersion: 1,
  sendUpdates: 'all',
  requestBody: event
});

// Real Google Meet link will be in response.data.conferenceData.entryPoints
const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;
```

### 4. OAuth Flow Implementation

You'll need to implement an OAuth flow for users to authorize calendar access:

1. **Create OAuth authorization endpoint** (`/api/auth/google`)
2. **Handle OAuth callback** (`/api/auth/google/callback`)
3. **Store refresh tokens** securely for ongoing access
4. **Implement token refresh logic**

### 5. Alternative: Service Account Approach

For server-to-server integration without user OAuth:

1. **Create a Service Account** in Google Cloud Console
2. **Download service account key** (JSON file)
3. **Share calendar with service account email**
4. **Use service account for API calls**

```typescript
const { JWT } = require('google-auth-library');

const serviceAccount = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3', auth: serviceAccount });
```

## Benefits of Full Integration

Once implemented, you'll get:

- ✅ **Real Google Meet links** that work seamlessly
- ✅ **Automatic calendar invitations** sent to all attendees
- ✅ **Calendar integration** with reminders and notifications
- ✅ **Meeting recordings** (if enabled in Google Workspace)
- ✅ **Automatic timezone handling**
- ✅ **Meeting management** (reschedule, cancel, etc.)

## Current Functionality

The current implementation already provides:

- ✅ **Professional email notifications** with meeting details
- ✅ **Simulated Meet links** for testing and demonstration
- ✅ **Complete meeting information** including preparation instructions
- ✅ **Admin notifications** for interview scheduling
- ✅ **Error handling** and validation
- ✅ **SMTP integration** for reliable email delivery

## Next Steps

1. **Test current implementation** to ensure email delivery works
2. **Set up Google Cloud project** when ready for production
3. **Implement OAuth flow** for calendar access
4. **Replace simulated links** with real Google Calendar API calls
5. **Test with real Google Meet integration**

The current system provides a solid foundation and can be upgraded to full Google integration when needed.


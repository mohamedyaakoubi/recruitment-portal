// src/services/google.ts
import { google } from 'googleapis';

export const getGoogleAuth = () => {
  const credentials = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID || "gen-lang-client-0974626110",
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || "REDACTED_PRIVATE_KEY_ID",
    private_key: process.env.GOOGLE_PRIVATE_KEY 
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : "",
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "notyet4r@gen-lang-client-0974626110.iam.gserviceaccount.com",
    client_id: process.env.GOOGLE_CLIENT_ID || "114007455869209644114",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "notyet4r@gen-lang-client-0974626110.iam.gserviceaccount.com")}`,
    universe_domain: "googleapis.com"
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });

  return auth;
};

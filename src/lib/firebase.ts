// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Optional: Import Analytics if needed, though not strictly required for core functionality
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'REDACTED_GOOGLE_API_KEY',
  authDomain: 'international-skills.firebaseapp.com',
  projectId: 'international-skills',
  storageBucket: 'international-skills.firebasestorage.app', // Fix this line
  messagingSenderId: '1093075040692',
  appId: '1:1093075040692:web:a7feb048441dc000279ae1',
  measurementId: 'G-54NZWDZVBH',
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Optional: Initialize Analytics if needed
// const analytics = getAnalytics(app);

export { app, auth, db, storage };


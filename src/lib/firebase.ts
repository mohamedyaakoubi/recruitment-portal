// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Optional: Import Analytics if needed, though not strictly required for core functionality
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDN3SZRpUKD1UMYyhnc04StfoCWz0jV_E",
  authDomain: "notyet-68c17.firebaseapp.com",
  // databaseURL: "https://notyet-68c17-default-rtdb.firebaseio.com", // Firestore is used, not Realtime Database
  projectId: "notyet-68c17",
  storageBucket: "notyet-68c17.appspot.com",
  messagingSenderId: "748147703768",
  appId: "1:748147703768:web:2cbd8ad952aca41b453cad",
  measurementId: "G-TK5Z7HEY7K" // Optional
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


// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Function to initialize Firebase Admin SDK lazily
const initializeFirebaseAdmin = () => {
  if (!getApps().length) {
    // Check if already initialized
    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      if (
        !serviceAccount.projectId ||
        !serviceAccount.clientEmail ||
        !serviceAccount.privateKey
      ) {
        throw new Error(
          'Firebase Admin SDK environment variables are not fully set.'
        );
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      // Throw the error to prevent API routes from proceeding without proper admin access
      throw new Error('Failed to initialize Firebase Admin SDK.');
    }
  }
  return admin;
};

// Export functions to get specific admin services, ensuring initialization
const getFirestoreAdmin = () => {
  const adminInstance = initializeFirebaseAdmin();
  return adminInstance.firestore();
};

const getAuthAdmin = () => {
  const adminInstance = initializeFirebaseAdmin();
  return adminInstance.auth();
};

const getStorageAdmin = () => {
  const adminInstance = initializeFirebaseAdmin();
  return adminInstance.storage();
};

// Export the functions, not the direct instances
export {
  getFirestoreAdmin,
  getAuthAdmin,
  getStorageAdmin,
  initializeFirebaseAdmin,
};

/**
 * Integration Test Setup
 * Configures Firebase emulators for integration testing
 */

import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

// Emulator configuration
const EMULATOR_CONFIG = {
  firestore: {
    host: 'localhost',
    port: 8080,
  },
  auth: {
    host: 'localhost',
    port: 9099,
  },
  storage: {
    host: 'localhost',
    port: 9199,
  },
};

// Test Firebase configuration - use demo project for emulator
// Note: demo-* projects don't require real credentials
const testFirebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-integration-test.firebaseapp.com',
  projectId: 'demo-integration-test',
  storageBucket: 'demo-integration-test.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
};

let testApp: FirebaseApp | null = null;
let testDb: Firestore | null = null;
let testAuth: Auth | null = null;
let testStorage: FirebaseStorage | null = null;
let emulatorsConnected = false;

/**
 * Initialize Firebase for integration testing with emulators
 */
export async function initializeTestFirebase(): Promise<{
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}> {
  // Clean up existing apps
  const existingApps = getApps();
  for (const app of existingApps) {
    await deleteApp(app);
  }

  // Initialize fresh app
  testApp = initializeApp(testFirebaseConfig, 'integration-test');
  testDb = getFirestore(testApp);
  testAuth = getAuth(testApp);
  testStorage = getStorage(testApp);

  // Connect to emulators (only once)
  if (!emulatorsConnected) {
    connectFirestoreEmulator(
      testDb,
      EMULATOR_CONFIG.firestore.host,
      EMULATOR_CONFIG.firestore.port
    );
    connectAuthEmulator(
      testAuth,
      `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`
    );
    connectStorageEmulator(testStorage, EMULATOR_CONFIG.storage.host, EMULATOR_CONFIG.storage.port);
    emulatorsConnected = true;
  }

  return { app: testApp, db: testDb, auth: testAuth, storage: testStorage };
}

/**
 * Clean up test Firebase instance
 */
export async function cleanupTestFirebase(): Promise<void> {
  if (testApp) {
    await deleteApp(testApp);
    testApp = null;
    testDb = null;
    testAuth = null;
    testStorage = null;
  }
}

/**
 * Clear all Firestore data in emulator
 */
export async function clearFirestoreData(): Promise<void> {
  const response = await fetch(
    `http://${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}/emulator/v1/projects/${testFirebaseConfig.projectId}/databases/(default)/documents`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(`Failed to clear Firestore data: ${response.statusText}`);
  }
}

/**
 * Clear all Auth data in emulator
 */
export async function clearAuthData(): Promise<void> {
  const response = await fetch(
    `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}/emulator/v1/projects/${testFirebaseConfig.projectId}/accounts`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(`Failed to clear Auth data: ${response.statusText}`);
  }
}

/**
 * Clear all emulator data
 */
export async function clearAllEmulatorData(): Promise<void> {
  await Promise.all([clearFirestoreData(), clearAuthData()]);
}

/**
 * Check if emulators are running
 */
export async function checkEmulatorsRunning(): Promise<boolean> {
  try {
    const response = await fetch(
      `http://${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}/`
    );
    return response.ok;
  } catch {
    return false;
  }
}

export { EMULATOR_CONFIG, testFirebaseConfig };

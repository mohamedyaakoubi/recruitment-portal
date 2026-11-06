/**
 * Authentication Flow Integration Tests
 * Tests authentication with Firebase Auth emulator
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeTestFirebase, cleanupTestFirebase, clearAllEmulatorData } from '../setup';
import { generateTestEmail } from '../helpers';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

describe('Authentication Flow Integration', () => {
  let db: Firestore;
  let auth: Auth;

  beforeAll(async () => {
    const result = await initializeTestFirebase();
    db = result.db;
    auth = result.auth;
  });

  afterAll(async () => {
    await cleanupTestFirebase();
  });

  beforeEach(async () => {
    await clearAllEmulatorData();
    // Sign out any existing user
    if (auth.currentUser) {
      await signOut(auth);
    }
  });

  describe('User Registration', () => {
    it('should create a new user with email and password', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      expect(userCredential.user).toBeDefined();
      expect(userCredential.user.email).toBe(email);
      expect(userCredential.user.uid).toBeDefined();
    });

    it('should fail to create user with weak password', async () => {
      const email = generateTestEmail();
      const weakPassword = '123';

      await expect(createUserWithEmailAndPassword(auth, email, weakPassword)).rejects.toThrow();
    });

    it('should fail to create duplicate user', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      // First registration should succeed
      await createUserWithEmailAndPassword(auth, email, password);

      // Second registration with same email should fail
      await expect(createUserWithEmailAndPassword(auth, email, password)).rejects.toThrow();
    });
  });

  describe('User Login', () => {
    it('should sign in existing user', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      // Create user first
      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth);

      // Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      expect(userCredential.user).toBeDefined();
      expect(userCredential.user.email).toBe(email);
      expect(auth.currentUser).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth);

      await expect(signInWithEmailAndPassword(auth, email, 'WrongPassword!')).rejects.toThrow();
    });

    it('should fail with non-existent user', async () => {
      await expect(
        signInWithEmailAndPassword(auth, 'nonexistent@example.com', 'password')
      ).rejects.toThrow();
    });
  });

  describe('User Sign Out', () => {
    it('should sign out user', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      await createUserWithEmailAndPassword(auth, email, password);
      expect(auth.currentUser).toBeDefined();

      await signOut(auth);
      expect(auth.currentUser).toBeNull();
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth);

      // In emulator, this won't actually send an email but should not throw
      await expect(sendPasswordResetEmail(auth, email)).resolves.not.toThrow();
    });
  });

  describe('Profile Updates', () => {
    it('should update user display name', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(user, { displayName: 'Test User' });

      // Reload user to get updated data
      await user.reload();
      expect(user.displayName).toBe('Test User');
    });
  });

  describe('Admin Role Check', () => {
    it('should identify admin users from Firestore', async () => {
      const adminEmail = 'admin@test.com';
      const regularEmail = generateTestEmail();

      // Create admin document in Firestore
      await setDoc(doc(db, 'admins', adminEmail), {
        email: adminEmail,
        role: 'admin',
      });

      // Check admin exists
      const adminDoc = await getDoc(doc(db, 'admins', adminEmail));
      expect(adminDoc.exists()).toBe(true);
      expect(adminDoc.data()?.role).toBe('admin');

      // Check non-admin doesn't exist
      const regularDoc = await getDoc(doc(db, 'admins', regularEmail));
      expect(regularDoc.exists()).toBe(false);
    });

    it('should check admin status by email list', async () => {
      const adminEmails = ['admin1@test.com', 'admin2@test.com'];
      const testEmail = 'admin1@test.com';
      const nonAdminEmail = 'user@test.com';

      // Simulate ADMIN_EMAILS environment check
      const isAdmin = (email: string) => adminEmails.includes(email);

      expect(isAdmin(testEmail)).toBe(true);
      expect(isAdmin(nonAdminEmail)).toBe(false);
    });
  });
});

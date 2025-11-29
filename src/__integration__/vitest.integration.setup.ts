/**
 * Vitest Integration Test Setup
 * Runs before all integration tests
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { checkEmulatorsRunning, clearAllEmulatorData } from './setup';

beforeAll(async () => {
  // Check if emulators are running
  const emulatorsRunning = await checkEmulatorsRunning();
  if (!emulatorsRunning) {
    console.error('\n❌ Firebase emulators are not running!');
    console.error('Please start them with: pnpm emulators\n');
    throw new Error('Firebase emulators must be running for integration tests');
  }
  // eslint-disable-next-line no-console
  console.log('✅ Firebase emulators are running');
});

beforeEach(async () => {
  // Clear all data before each test for isolation
  try {
    await clearAllEmulatorData();
  } catch (error) {
    console.warn('Could not clear emulator data:', error);
  }
});

afterAll(async () => {
  // Final cleanup
  try {
    await clearAllEmulatorData();
  } catch {
    // Ignore cleanup errors
  }
});

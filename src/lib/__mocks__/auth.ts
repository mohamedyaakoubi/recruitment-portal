// Mock authentication module for testing
import { NextRequest } from 'next/server';
import { vi } from 'vitest';

export const requireAdminAuth = vi.fn(async (_request: NextRequest) => {
  // Return null to indicate successful authentication in tests
  return null;
});

export const isAdminAuthenticated = vi.fn(async (_request: NextRequest): Promise<boolean> => {
  return true;
});

export const getUserFromRequest = vi.fn((request: NextRequest) => {
  const ip = request.headers.get('x-forwarded-for') || 'test-ip';
  return {
    id: 'test-admin',
    ip,
  };
});

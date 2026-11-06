'use client';

import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiLogIn, FiRefreshCw } from 'react-icons/fi';
import logger from '@/lib/logger';

const GoogleAuthManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/google-auth/status');
        if (response.ok) {
          const result = await response.json();
          // Handle wrapped API response: { success: true, data: { isConnected, email } }
          const statusData = result.data || result;
          setIsConnected(statusData.isConnected ?? false);
          setConnectedEmail(statusData.email ?? null);
        } else {
          setIsConnected(false);
          setConnectedEmail(null);
        }
      } catch (error) {
        logger.error('Failed to fetch Google auth status', error);
        setIsConnected(false);
        setConnectedEmail(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 h-4 w-48 rounded bg-slate-200 dark:bg-gray-700"></div>
            <div className="h-3 w-64 rounded bg-slate-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-9 w-36 rounded-md bg-slate-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">
            Google Calendar Integration
          </h4>
          {isConnected && connectedEmail ? (
            <p className="mt-1 flex items-center text-sm text-green-600 dark:text-green-400">
              <FiCheckCircle className="mr-2" />
              Connected as: <strong className="ml-1 font-medium">{connectedEmail}</strong>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Connect your account to create and manage interview events.
            </p>
          )}
        </div>
        {isConnected ? (
          <a
            href="/api/google-auth/connect"
            className="flex items-center whitespace-nowrap rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-gray-600"
          >
            <FiRefreshCw className="mr-2" /> Change Account
          </a>
        ) : (
          <a
            href="/api/google-auth/connect"
            className="flex items-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <FiLogIn className="mr-2" /> Connect Google Account
          </a>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthManager;

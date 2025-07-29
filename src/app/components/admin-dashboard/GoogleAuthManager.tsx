"use client";

import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiLogIn, FiRefreshCw } from 'react-icons/fi';

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
                    const data = await response.json();
                    setIsConnected(data.isConnected);
                    setConnectedEmail(data.email);
                } else {
                    setIsConnected(false);
                    setConnectedEmail(null);
                }
            } catch (error) {
                console.error("Failed to fetch Google auth status:", error);
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
            <div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-lg border border-slate-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-64"></div>
                    </div>
                    <div className="h-9 w-36 bg-slate-200 dark:bg-gray-700 rounded-md"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-lg border border-slate-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Google Calendar Integration</h4>
                    {isConnected && connectedEmail ? (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                            <FiCheckCircle className="mr-2" />
                            Connected as: <strong className="ml-1 font-medium">{connectedEmail}</strong>
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Connect your account to create and manage interview events.
                        </p>
                    )}
                </div>
                {isConnected ? (
                     <a
                        href="/api/google-auth/connect"
                        className="bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300 font-semibold px-4 py-2 rounded-md hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors text-sm whitespace-nowrap flex items-center"
                    >
                        <FiRefreshCw className="mr-2" /> Change Account
                    </a>
                ) : (
                    <a
                        href="/api/google-auth/connect"
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm whitespace-nowrap flex items-center"
                    >
                        <FiLogIn className="mr-2" /> Connect Google Account
                    </a>
                )}
            </div>
        </div>
    );
};

export default GoogleAuthManager;
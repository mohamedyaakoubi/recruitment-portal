"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types';

export const useCandidateDashboard = () => {
    const [candidateEmail, setCandidateEmail] = useState('');
    const [applications, setApplications] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        if (email) {
            setCandidateEmail(email);
            loadApplications(email);
        } else {
            router.push('/');
        }
    }, [router]);

    const loadApplications = async (email: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/get-candidate-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to load applications');
            }

            setApplications(result.applications || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewApplication = () => {
        router.push(`/candidate-form?email=${encodeURIComponent(candidateEmail)}`);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        
        let date: Date;
        if (timestamp && typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else {
            return 'N/A';
        }
        
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return {
        candidateEmail,
        applications,
        isLoading,
        error,
        handleNewApplication,
        formatDate,
        router
    };
};

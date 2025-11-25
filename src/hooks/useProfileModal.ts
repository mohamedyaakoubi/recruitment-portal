"use client";

import { useState } from 'react';
import type { Candidate } from '@/types';
import logger from '@/lib/logger';

export const useProfileModal = (
    candidate: Candidate | null,
    onEditCandidate?: (candidateId: string, updatedData: Partial<Candidate>) => Promise<void>
) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleEditCandidate = async (candidateId: string, updatedData: Partial<Candidate>) => {
        if (!onEditCandidate) return;
        
        setIsUpdating(true);
        try {
            await onEditCandidate(candidateId, updatedData);
            setIsEditModalOpen(false);
        } catch (error) {
            logger.error('Failed to update candidate', error, { candidateId });
        } finally {
            setIsUpdating(false);
        }
    };

    const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return null;
        try {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            if (isNaN(birthDate.getTime())) return null;
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        } catch {
            return null;
        }
    };

    return {
        isEditModalOpen,
        setIsEditModalOpen,
        isUpdating,
        handleEditCandidate,
        calculateAge,
    };
};

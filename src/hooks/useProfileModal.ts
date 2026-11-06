'use client';

import { useState } from 'react';
import { calculateAge } from '@/lib/utils';
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

  return {
    isEditModalOpen,
    setIsEditModalOpen,
    isUpdating,
    handleEditCandidate,
    calculateAge,
  };
};

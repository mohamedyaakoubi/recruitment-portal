// src/hooks/useInterviewEvents.ts
import { useMemo } from 'react';
import { isBefore } from 'date-fns';
import { Candidate, InterviewEvent } from '@/types';

export const useInterviewEvents = (candidates: Candidate[], calendarFilter: 'all' | 'upcoming' | 'completed') => {
  const allInterviewEvents: InterviewEvent[] = useMemo(() => {
    const now = new Date();
    
    return candidates
      .filter(c => c.interviewDate)
      .map(c => {
        const interviewStart = c.interviewDate!.toDate();
        const duration = c.duration || 30;
        const interviewEnd = new Date(interviewStart.getTime() + (duration * 60 * 1000));
        const isCompleted = isBefore(interviewEnd, now);
        
        return {
          title: isCompleted 
            ? `✓ Completed: ${c.fullName}` 
            : `Interview: ${c.fullName}`,
          start: interviewStart,
          end: interviewEnd,
          resource: c,
          isCompleted,
          eventType: isCompleted ? 'completed' as const : 'scheduled' as const,
        };
      });
  }, [candidates]);

  const filteredInterviewEvents = useMemo(() => {
    switch (calendarFilter) {
      case 'upcoming':
        return allInterviewEvents.filter(event => !event.isCompleted);
      case 'completed':
        return allInterviewEvents.filter(event => event.isCompleted);
      default:
        return allInterviewEvents;
    }
  }, [allInterviewEvents, calendarFilter]);

  return { allInterviewEvents, filteredInterviewEvents };
};

// src/hooks/useCandidates.ts
import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Candidate } from '@/types';

export const useCandidates = (user: any) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  useEffect(() => {
    if (user) {
      setLoadingCandidates(true);
      const q = query(collection(db, "candidates"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const candidatesData: Candidate[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          candidatesData.push({
            id: doc.id,
            email: data.email || '',
            scoreAnalysis: data.scoreAnalysis || '',
            interviewDate: data.interviewDate || undefined,
            calendarEventId: data.calendarEventId || '',
            meetLink: data.meetLink || '',
            duration: data.duration || 30,
            ...data
          } as Candidate);
        });
        candidatesData.sort((a, b) => (b.submittedAt?.toMillis() ?? 0) - (a.submittedAt?.toMillis() ?? 0));
        setCandidates(candidatesData);
        setLoadingCandidates(false);
      }, (error) => {
        console.error("Error fetching candidates: ", error);
        setLoadingCandidates(false);
      });
      return () => unsubscribe();
    } else {
      setCandidates([]);
      setLoadingCandidates(false);
    }
  }, [user]);

  return { candidates, loadingCandidates };
};

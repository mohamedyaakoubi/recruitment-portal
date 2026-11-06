'use client';

import React from 'react';
import { useCandidateForm } from '@/hooks/useCandidateForm';
import CandidateFormUI from './CandidateFormUI';

export default function CandidateFormContainer({ emailParam }: { emailParam?: string }) {
  const formProps = useCandidateForm(emailParam);

  return <CandidateFormUI {...formProps} />;
}

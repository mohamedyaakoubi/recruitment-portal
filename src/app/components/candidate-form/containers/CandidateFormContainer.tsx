'use client';

import React from 'react';
import { useCandidateForm } from '@/hooks/useCandidateForm';
import CandidateFormUI from './CandidateFormUI';

export default function CandidateFormContainer() {
  const formProps = useCandidateForm();

  return <CandidateFormUI {...formProps} />;
}

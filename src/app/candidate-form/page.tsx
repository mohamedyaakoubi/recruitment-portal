import React, { Suspense } from 'react';
import CandidateFormContainer from '../components/candidate-form/containers/CandidateFormContainer';

export default async function CandidateForm({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">Loading form...</div>
      }
    >
      <CandidateFormContainer emailParam={params.email} />
    </Suspense>
  );
}

// src/app/api/score-candidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scoreCandidate } from '@/services/scoring';

export async function POST(request: NextRequest) {
  try {
    const { candidateId, jobId, jobTitle, jobDescription } = await request.json();

    if (!candidateId || !jobTitle || !jobDescription) {
      return NextResponse.json({ error: 'Missing candidateId, jobTitle, or jobDescription' }, { status: 400 });
    }

    const scoringResult = await scoreCandidate(candidateId, jobId, jobTitle, jobDescription);

    return NextResponse.json({ 
        success: true, 
        score: scoringResult.score, 
        analysis: scoringResult.analysis,
        jobTitle: jobTitle
    });

  } catch (error) {
    console.error("Error in /api/score-candidate:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes("AI Scoring is not configured")) {
        return NextResponse.json({ error: 'AI Scoring is not configured on the server.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to score candidate', details: errorMessage }, { status: 500 });
  }
}
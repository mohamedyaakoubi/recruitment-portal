import { NextRequest, NextResponse } from 'next/server';
import { scoreCandidate } from '@/services/scoring';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Starting Gemini 2.5 Pro scoring request');
    
    const { candidateId, jobId, jobTitle, jobDescription } = await request.json();

    if (!candidateId || !jobTitle || !jobDescription) {
      return NextResponse.json({ 
        error: 'Missing required fields: candidateId, jobTitle, or jobDescription' 
      }, { status: 400 });
    }

    logger.info('Scoring candidate', { candidateId, jobTitle });

    const scoringResult = await scoreCandidate(candidateId, jobId, jobTitle, jobDescription);

    logger.info('Scoring completed', { candidateId, score: scoringResult.score });

    return NextResponse.json({
        success: true, 
        score: scoringResult.score, 
        analysis: scoringResult.analysis,
        keyStrengths: scoringResult.keyStrengths,
        areasForImprovement: scoringResult.areasForImprovement,
        recommendation: scoringResult.recommendation,
        jobTitle: jobTitle,
        scoringVersion: 'gemini-2.5-pro'
    });

  } catch (error) {
    logger.error('Error in Gemini 2.5 Pro scoring', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes("AI Scoring is not configured")) {
        return NextResponse.json({ 
          error: 'AI Scoring is not configured on the server.' 
        }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to score candidate with Gemini 2.5 Pro', 
      details: errorMessage 
    }, { status: 500 });
  }
}
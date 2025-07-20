import { NextRequest, NextResponse } from 'next/server';
import { scoreCandidate } from '@/services/scoring';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Starting Gemini 2.5 Pro scoring request...');
    
    const { candidateId, jobId, jobTitle, jobDescription } = await request.json();

    if (!candidateId || !jobTitle || !jobDescription) {
      return NextResponse.json({ 
        error: 'Missing required fields: candidateId, jobTitle, or jobDescription' 
      }, { status: 400 });
    }

    console.log(`📊 Scoring candidate ${candidateId} for position: ${jobTitle}`);

    const scoringResult = await scoreCandidate(candidateId, jobId, jobTitle, jobDescription);

    console.log(`✅ Scoring completed with score: ${scoringResult.score}`);

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
    console.error("❌ Error in Gemini 2.5 Pro scoring:", error);
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
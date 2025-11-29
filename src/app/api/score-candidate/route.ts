import { NextRequest } from 'next/server';
import { scoreCandidate } from '@/services/scoring';
import logger from '@/lib/logger';
import { scoreCandidateSchema } from '@/lib/validations';
import { successResponse, ApiErrors, errorResponse } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    logger.info('Starting Gemini 2.5 Pro scoring request');

    const body = await request.json();
    const validatedData = scoreCandidateSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const { candidateId, jobId, jobTitle, jobDescription } = validatedData.data;

    logger.info('Scoring candidate', { candidateId, jobTitle });

    const scoringResult = await scoreCandidate(candidateId, jobId || '', jobTitle, jobDescription);

    logger.info('Scoring completed', { candidateId, score: scoringResult.score });

    return successResponse({
      score: scoringResult.score,
      analysis: scoringResult.analysis,
      keyStrengths: scoringResult.keyStrengths,
      areasForImprovement: scoringResult.areasForImprovement,
      recommendation: scoringResult.recommendation,
      jobTitle: jobTitle,
      scoringVersion: 'gemini-2.5-pro',
    });
  } catch (error) {
    logger.error('Error in Gemini 2.5 Pro scoring', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('AI Scoring is not configured')) {
      return errorResponse('AI Scoring is not configured on the server.', {
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
      });
    }

    return ApiErrors.internal('Failed to score candidate with Gemini 2.5 Pro', error);
  }
}

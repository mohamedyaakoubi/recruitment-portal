import { useMutation, useQueryClient } from "@tanstack/react-query";
import logger from "@/lib/logger";

interface ScoringResult {
  success: boolean;
  score: number;
  analysis: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  recommendation: string;
}

interface ScoringParams {
  candidateId: string;
  jobId?: string;
  jobTitle: string;
  jobDescription: string;
}

async function scoreCandidateApi(params: ScoringParams): Promise<ScoringResult> {
  const response = await fetch("/api/score-candidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Scoring failed");
  }

  return response.json();
}

/**
 * Hook for AI candidate scoring
 */
export function useCandidateScoring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scoreCandidateApi,
    onSuccess: (data, variables) => {
      // Invalidate candidates to refresh the score
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      logger.info("Candidate scored successfully", {
        candidateId: variables.candidateId,
        score: data.score,
      });
    },
    onError: (error) => {
      logger.error("Candidate scoring failed", error);
    },
  });
}

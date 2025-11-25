import { useMutation, useQueryClient } from "@tanstack/react-query";
import logger from "@/lib/logger";

interface ScheduleInterviewParams {
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
  interviewDate: string;
  interviewTime: string;
  duration?: number;
  jobTitle?: string;
  adminEmail: string;
  notes?: string;
}

interface ScheduleInterviewResult {
  success: boolean;
  message: string;
  data: {
    interviewDateTime: string;
    endDateTime: string;
    duration: number;
    meetLink: string;
    calendarEventId: string;
  };
}

async function scheduleInterviewApi(params: ScheduleInterviewParams): Promise<ScheduleInterviewResult> {
  const response = await fetch("/api/schedule-interview-meet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to schedule interview");
  }

  return response.json();
}

/**
 * Hook for scheduling interviews with Google Meet
 */
export function useScheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleInterviewApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      logger.info("Interview scheduled successfully", {
        candidateId: variables.candidateId,
        meetLink: data.data.meetLink,
      });
    },
    onError: (error) => {
      logger.error("Failed to schedule interview", error);
    },
  });
}

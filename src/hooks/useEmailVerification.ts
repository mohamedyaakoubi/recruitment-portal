import { useMutation } from "@tanstack/react-query";
import logger from "@/lib/logger";

interface EmailVerificationResult {
  isValid: boolean;
  deliverable?: boolean;
  disposable?: boolean;
  error?: string;
}

async function verifyEmailApi(email: string): Promise<EmailVerificationResult> {
  const response = await fetch("/api/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Email verification failed");
  }

  return response.json();
}

/**
 * Hook for email verification
 */
export function useEmailVerification() {
  return useMutation({
    mutationFn: verifyEmailApi,
    onError: (error) => {
      logger.error("Email verification failed", error);
    },
  });
}

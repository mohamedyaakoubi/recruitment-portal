import { useMutation } from "@tanstack/react-query";
import logger from "@/lib/logger";

interface PhoneValidationResult {
  isValid: boolean;
  message?: string;
  warning?: string;
  country?: {
    name: string;
    code: string;
  };
  type?: string;
  carrier?: string;
}

interface PhoneValidationParams {
  countryCode: string;
  phoneNumber: string;
}

async function validatePhoneApi(params: PhoneValidationParams): Promise<PhoneValidationResult> {
  const response = await fetch("/api/validate-phone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Phone validation failed");
  }

  return response.json();
}

/**
 * Hook for phone number validation
 */
export function usePhoneValidation() {
  return useMutation({
    mutationFn: validatePhoneApi,
    onError: (error) => {
      logger.error("Phone validation failed", error);
    },
  });
}

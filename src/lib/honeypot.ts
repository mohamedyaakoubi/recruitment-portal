/**
 * Honeypot Field Validation
 * Detects bot submissions using invisible fields
 */

/**
 * Validate honeypot field (should be empty for legitimate users)
 */
export function validateHoneypot(honeypotValue: string | undefined): {
  isBot: boolean;
  reason?: string;
} {
  // Honeypot field should be empty (not filled by humans, filled by bots)
  if (honeypotValue && honeypotValue.trim() !== '') {
    return {
      isBot: true,
      reason: 'Honeypot field was filled',
    };
  }

  return {
    isBot: false,
  };
}

/**
 * Validate timestamp field (submission should take reasonable time)
 */
export function validateTimestamp(
  submissionTimestamp: number | undefined,
  minSeconds: number = 3,
  maxSeconds: number = 3600
): {
  isBot: boolean;
  reason?: string;
} {
  if (!submissionTimestamp) {
    return {
      isBot: true,
      reason: 'No submission timestamp',
    };
  }

  const now = Date.now();
  const elapsed = (now - submissionTimestamp) / 1000; // seconds

  // Too fast - likely a bot
  if (elapsed < minSeconds) {
    return {
      isBot: true,
      reason: `Form submitted too quickly (${elapsed.toFixed(1)}s)`,
    };
  }

  // Too slow - session might have expired
  if (elapsed > maxSeconds) {
    return {
      isBot: true,
      reason: `Form submission took too long (${Math.floor(elapsed / 60)} minutes)`,
    };
  }

  return {
    isBot: false,
  };
}

/**
 * Combined bot detection
 */
export function detectBot(data: { honeypot?: string; timestamp?: number }): {
  isBot: boolean;
  reason?: string;
} {
  // Check honeypot
  const honeypotResult = validateHoneypot(data.honeypot);
  if (honeypotResult.isBot) {
    return honeypotResult;
  }

  // Check timestamp
  const timestampResult = validateTimestamp(data.timestamp);
  if (timestampResult.isBot) {
    return timestampResult;
  }

  return {
    isBot: false,
  };
}

/**
 * Disposable Email Domain Blocklist
 * Source: https://github.com/disposable-email-domains/disposable-email-domains
 * Contains 4900+ known disposable email domains
 */

import fs from 'fs';
import path from 'path';

let cachedDomains: Set<string> | null = null;

/**
 * Load disposable email domains from the blocklist file
 * Uses lazy loading and caching for performance
 */
export function getDisposableEmailDomains(): Set<string> {
  if (cachedDomains) {
    return cachedDomains;
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'disposable_email_blocklist.conf');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse the file: one domain per line, filter out empty lines and comments
    const domains = fileContent
      .split('\n')
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line && !line.startsWith('#'));

    cachedDomains = new Set(domains);
    return cachedDomains;
  } catch (error) {
    // Fallback to a minimal list if file cannot be read
    console.error('Failed to load disposable email blocklist, using fallback:', error);
    cachedDomains = new Set([
      'tempmail.com',
      'throwaway.email',
      'guerrillamail.com',
      'mailinator.com',
      '10minutemail.com',
      'temp-mail.org',
      'fakeinbox.com',
      'trashmail.com',
      'yopmail.com',
      'disposablemail.com',
    ]);
    return cachedDomains;
  }
}

/**
 * Get disposable domains as an array (for the email validator library)
 */
export function getDisposableEmailDomainsArray(): string[] {
  return Array.from(getDisposableEmailDomains());
}

/**
 * Check if a domain is in the disposable email blocklist
 */
export function isDisposableEmailDomain(domain: string): boolean {
  return getDisposableEmailDomains().has(domain.toLowerCase());
}

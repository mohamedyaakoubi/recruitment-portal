/**
 * HTML Sanitization Utilities
 * Protects against XSS by sanitizing user-generated content
 *
 * Uses sanitize-html (pure JS, no jsdom) instead of isomorphic-dompurify
 * so the module works on Vercel Serverless without the jsdom/parse5 ESM crash.
 */

import sanitize from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
  });
}

/**
 * Sanitize text content (strips all HTML)
 */
export function sanitizeText(text: string): string {
  return sanitize(text, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Sanitize URL to prevent javascript: protocol and XSS
 */
export function sanitizeUrl(url: string): string {
  // Remove dangerous protocols
  const sanitized = url.trim().toLowerCase();

  if (
    sanitized.startsWith('javascript:') ||
    sanitized.startsWith('data:') ||
    sanitized.startsWith('vbscript:')
  ) {
    return '';
  }

  return url;
}

/**
 * Sanitize object recursively (for JSON data)
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeText(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }

  return obj;
}

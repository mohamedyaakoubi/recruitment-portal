/**
 * File Upload Validation Service
 * Server-side validation for uploaded files
 */

import logger from './logger';

// Allowed MIME types and their magic bytes (file signatures)
const ALLOWED_FILE_TYPES = {
  // Documents
  'application/pdf': {
    extension: '.pdf',
    magicBytes: [[0x25, 0x50, 0x44, 0x46]], // %PDF
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  'application/msword': {
    extension: '.doc',
    magicBytes: [[0xd0, 0xcf, 0x11, 0xe0]], // DOC
    maxSize: 10 * 1024 * 1024,
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: '.docx',
    magicBytes: [[0x50, 0x4b, 0x03, 0x04]], // ZIP (DOCX is ZIP-based)
    maxSize: 10 * 1024 * 1024,
  },

  // Images
  'image/jpeg': {
    extension: '.jpg',
    magicBytes: [[0xff, 0xd8, 0xff]],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  'image/png': {
    extension: '.png',
    magicBytes: [[0x89, 0x50, 0x4e, 0x47]],
    maxSize: 5 * 1024 * 1024,
  },
  'image/webp': {
    extension: '.webp',
    magicBytes: [[0x52, 0x49, 0x46, 0x46]], // RIFF
    maxSize: 5 * 1024 * 1024,
  },
};

interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

/**
 * Validate file based on type, size, and content
 */
export async function validateFile(
  file: File,
  expectedType: 'document' | 'image' | 'passport'
): Promise<ValidationResult> {
  try {
    // 1. Check file size
    const fileConfig = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
    if (!fileConfig) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Please upload PDF, DOC, DOCX, JPG, PNG, or WEBP files.`,
      };
    }

    if (file.size > fileConfig.maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${fileConfig.maxSize / (1024 * 1024)}MB.`,
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty.',
      };
    }

    // 2. Validate file extension
    const filename = file.name.toLowerCase();
    const hasValidExtension = filename.endsWith(fileConfig.extension);
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `File extension does not match type. Expected ${fileConfig.extension}.`,
      };
    }

    // 3. Verify magic bytes (file signature)
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const isValidSignature = fileConfig.magicBytes.some((signature) =>
      signature.every((byte, index) => bytes[index] === byte)
    );

    if (!isValidSignature) {
      logger.warn('File signature mismatch', {
        filename: file.name,
        type: file.type,
        firstBytes: Array.from(bytes.slice(0, 10)),
      });
      return {
        isValid: false,
        error: 'File content does not match its type. File may be corrupted or misnamed.',
      };
    }

    // 4. Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);

    // 5. Additional checks based on expected type
    if (expectedType === 'image' && !file.type.startsWith('image/')) {
      return {
        isValid: false,
        error: 'Expected an image file.',
      };
    }

    if (
      expectedType === 'document' &&
      !file.type.includes('pdf') &&
      !file.type.includes('document')
    ) {
      return {
        isValid: false,
        error: 'Expected a document file (PDF or DOC).',
      };
    }

    return {
      isValid: true,
      sanitizedFilename,
    };
  } catch (error) {
    logger.error('File validation error', error);
    return {
      isValid: false,
      error: 'Failed to validate file. Please try again.',
    };
  }
}

/**
 * Sanitize filename to prevent path traversal and injection attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  let sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots
    .replace(/^\./, '_') // Replace leading dot
    .substring(0, 255); // Limit length

  // Ensure file has an extension
  if (!sanitized.includes('.')) {
    sanitized = `${sanitized}.unknown`;
  }

  return sanitized;
}

/**
 * Generate secure filename with timestamp
 */
export function generateSecureFilename(originalFilename: string, prefix: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = sanitized.substring(sanitized.lastIndexOf('.'));
  return `${prefix}_${timestamp}_${randomSuffix}${extension}`;
}

/**
 * Validate multiple files in batch
 */
export async function validateFiles(
  files: { file: File; type: 'document' | 'image' | 'passport' }[]
): Promise<{ isValid: boolean; errors: string[]; validatedFiles: File[] }> {
  const errors: string[] = [];
  const validatedFiles: File[] = [];

  for (const { file, type } of files) {
    const result = await validateFile(file, type);
    if (!result.isValid) {
      errors.push(`${file.name}: ${result.error}`);
    } else {
      validatedFiles.push(file);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedFiles,
  };
}

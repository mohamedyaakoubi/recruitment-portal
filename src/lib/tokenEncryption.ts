/**
 * Token Encryption Service
 * Encrypts/decrypts sensitive tokens before storage
 */

import crypto from 'crypto';
import logger from './logger';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const _AUTH_TAG_LENGTH = 16;

/**
 * Get or generate encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.TOKEN_ENCRYPTION_KEY;

  if (!envKey) {
    logger.warn('TOKEN_ENCRYPTION_KEY not set, using fallback (not recommended for production)');
    // In production, this should fail instead of using a fallback
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TOKEN_ENCRYPTION_KEY must be set in production');
    }
    // Development fallback - derive key from app secrets
    const fallbackSecret = process.env.FIREBASE_PROJECT_ID || 'development-secret-key';
    return crypto.scryptSync(fallbackSecret, 'salt', KEY_LENGTH);
  }

  // Decode base64 key or derive from string
  if (envKey.length === 44 && envKey.match(/^[A-Za-z0-9+/]+=*$/)) {
    // Base64 encoded key
    return Buffer.from(envKey, 'base64');
  } else {
    // Derive key from string
    return crypto.scryptSync(envKey, 'salt', KEY_LENGTH);
  }
}

/**
 * Encrypt sensitive data
 */
export function encryptToken(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Token encryption failed', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptToken(encrypted: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encrypted.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }

    const ivPart = parts[0];
    const authTagPart = parts[1];
    const encryptedData = parts[2];

    if (!ivPart || !authTagPart || !encryptedData) {
      throw new Error('Invalid encrypted token format');
    }

    const iv = Buffer.from(ivPart, 'hex');
    const authTag = Buffer.from(authTagPart, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Token decryption failed', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Encrypt object (for storing multiple tokens)
 */
export function encryptTokenObject(data: Record<string, unknown>): string {
  return encryptToken(JSON.stringify(data));
}

/**
 * Decrypt object
 */
export function decryptTokenObject<T = Record<string, unknown>>(encrypted: string): T {
  const decrypted = decryptToken(encrypted);
  return JSON.parse(decrypted) as T;
}

/**
 * Generate encryption key (for initial setup)
 * Run this once and save the output to TOKEN_ENCRYPTION_KEY env var
 */
export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  return key.toString('base64');
}

/**
 * Check if data is encrypted (has proper format)
 */
export function isEncrypted(data: string): boolean {
  return /^[0-9a-f]{32}:[0-9a-f]{32}:[0-9a-f]+$/.test(data);
}

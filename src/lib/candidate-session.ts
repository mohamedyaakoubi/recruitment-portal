/**
 * Candidate Session Utilities
 * Lightweight HMAC-signed session cookie using the Web Crypto API.
 * Edge-runtime compatible (Next.js Middleware, Vercel Edge, etc.).
 */

export const SESSION_COOKIE_NAME = '_candidate_session';
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

interface Payload {
  email: string;
  exp: number;
}

function getSecret(): string {
  return (
    process.env.CANDIDATE_SESSION_SECRET ||
    process.env.TOKEN_ENCRYPTION_KEY ||
    'dev-secret-change-me'
  );
}

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(payload: Payload): Promise<string> {
  const enc = new TextEncoder();
  const data = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await importKey(getSecret());
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return `${data}.${toBase64Url(sig)}`;
}

async function verifyToken(token: string): Promise<Payload | null> {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const enc = new TextEncoder();
  const key = await importKey(getSecret());
  let valid: boolean;
  try {
    valid = await crypto.subtle.verify('HMAC', key, fromBase64Url(sig), enc.encode(data));
  } catch {
    return null;
  }
  if (!valid) return null;
  try {
    const dec = new TextDecoder();
    const payload = JSON.parse(dec.decode(fromBase64Url(data))) as Payload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Create a signed session cookie value for the given email. */
export async function createSessionCookieValue(email: string): Promise<string> {
  return sign({ email, exp: Date.now() + SESSION_MAX_AGE * 1000 });
}

/** Parse and verify a session cookie value. Returns the email or null. */
export async function parseSessionCookie(value: string): Promise<string | null> {
  return (await verifyToken(value))?.email ?? null;
}

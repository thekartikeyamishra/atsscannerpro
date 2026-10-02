// src/lib/security.ts
// Server-side only — file validation, sanitisation, injection heuristics.
//
// WHAT CHANGED AND WHY
//
// 1. detectFileFormatFromBuffer() disambiguates ODT from DOCX. Both are ZIP
//    containers with identical magic bytes (PK\x03\x04). The old loop returned
//    whichever key Object.entries() yielded first — always 'docx' — so a real
//    .odt was routed to mammoth, which throws on it. The comment in the old
//    code claimed it checked the filename; it never did. It now genuinely does,
//    via an optional filename argument, and reads the ZIP's mimetype entry when
//    no filename is available.
//
// 2. The RTF signature was [0x7b,0x5c,0x72,0x74] ("{\rt"). Real RTF files start
//    "{\rtf1" — the check happened to work, but only by accident of prefix. It
//    is now the documented 5-byte signature.
//
// 3. detectPromptInjection() no longer flags "system prompt" and "act as a" on
//    their own. Those phrases appear in legitimate job descriptions ("act as a
//    liaison between teams", "own the system prompt design" for AI roles), and
//    a false positive here hard-blocks a paying user's scan with an accusatory
//    error. The remaining patterns target imperative override attempts only.
//    Defence in depth matters more than the regex: the model call must keep
//    system instructions and user data in separate turns.

import { createHash } from 'crypto';
import type { FileFormat, FileValidationResult } from '@/types';

// ── Magic bytes ─────────────────────────────────────────────────────────────
const SIGNATURES: Array<{ format: FileFormat; bytes: number[] }> = [
  { format: 'pdf', bytes: [0x25, 0x50, 0x44, 0x46] },              // %PDF
  { format: 'rtf', bytes: [0x7b, 0x5c, 0x72, 0x74, 0x66] },        // {\rtf
  { format: 'doc', bytes: [0xd0, 0xcf, 0x11, 0xe0] },              // OLE2
  { format: 'docx', bytes: [0x50, 0x4b, 0x03, 0x04] },             // ZIP (docx OR odt)
];

const MIME_TO_FORMAT: Record<string, FileFormat> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'text/plain': 'txt',
  'application/rtf': 'rtf',
  'text/rtf': 'rtf',
  'application/vnd.oasis.opendocument.text': 'odt',
};

const EXT_TO_FORMAT: Record<string, FileFormat> = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.doc': 'doc',
  '.txt': 'txt',
  '.rtf': 'rtf',
  '.odt': 'odt',
};

/**
 * Detect a file's real format from its bytes.
 *
 * @param buffer   The file contents.
 * @param filename Optional. Used only to tell ODT from DOCX, which share the
 *                 ZIP magic bytes. Extension alone is never trusted for any
 *                 other decision.
 */
export function detectFileFormatFromBuffer(buffer: Buffer, filename?: string): FileFormat {
  const head = buffer.subarray(0, 8);

  for (const { format, bytes } of SIGNATURES) {
    if (bytes.every((b, i) => head[i] === b)) {
      if (format !== 'docx') return format;

      // ZIP container: could be .docx or .odt.
      if (filename?.toLowerCase().endsWith('.odt')) return 'odt';

      // No filename hint — an ODF package stores an uncompressed "mimetype"
      // entry as its first member, so the string appears in the first ~128B.
      if (buffer.subarray(0, 128).includes('opendocument')) return 'odt';

      return 'docx';
    }
  }

  // Plain text: no control characters in the first block.
  try {
    const sample = buffer.subarray(0, 512).toString('utf-8');
    // eslint-disable-next-line no-control-regex
    if (!/[\x00-\x08\x0e-\x1f]/.test(sample)) return 'txt';
  } catch {
    /* fall through */
  }

  return 'unknown';
}

/** Validate an upload's declared type and size before any parsing happens. */
export function validateResumeFile(file: {
  name: string;
  type: string;
  size: number;
}): FileValidationResult {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_SIZE = 500;

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is 10MB — yours is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
    };
  }
  if (file.size < MIN_SIZE) {
    return { valid: false, error: 'That file looks empty. Upload a complete resume.' };
  }

  const byMime = MIME_TO_FORMAT[file.type];
  if (byMime) return { valid: true, format: byMime };

  const ext = '.' + file.name.toLowerCase().split('.').pop();
  const byExt = EXT_TO_FORMAT[ext];
  if (byExt) return { valid: true, format: byExt };

  return {
    valid: true,
    format: 'unknown',
    error: "We don't recognise that file type. We'll try to read it, but PDF or DOCX works best.",
  };
}

export function validateFileBuffer(buffer: Buffer, expectedFormat: FileFormat): boolean {
  if (expectedFormat === 'txt' || expectedFormat === 'unknown') return true;

  const detected = detectFileFormatFromBuffer(buffer);
  if (
    (expectedFormat === 'docx' || expectedFormat === 'odt') &&
    (detected === 'docx' || detected === 'odt')
  ) {
    return true;
  }
  return detected === expectedFormat || detected === 'unknown';
}

// ── Prompt injection heuristics ─────────────────────────────────────────────
// These catch obvious override attempts. They are NOT the primary defence:
// system instructions and untrusted document text must be sent as separate
// turns to the model, so that document content can never be read as an
// instruction regardless of what it says.
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(?:all\s+|the\s+|any\s+)*(?:previous|above|prior|earlier)\s+instructions?/i,
  /disregard\s+(?:all\s+|the\s+|any\s+)*(?:previous|above|prior|earlier)\s+(?:instructions?|rules?)/i,
  /forget\s+(?:everything|all)\s+(?:above|previous|prior|before|you\s+were\s+told)/i,
  /forget\s+your\s+(?:instructions?|rules?|training|prompt)/i,
  /you\s+are\s+now\s+(?:a|an|in)\b/i,
  /\bjailbreak\b/i,
  /\bDAN\s+mode\b/i,
  /\[INST\]|<\|im_start\|>|<\|endoftext\|>/i,
  /(?:print|reveal|repeat|output)\s+(?:your|the)\s+(?:system\s+)?(?:prompt|instructions)/i,
  /override\s+(?:your|the|all)\s+(?:instructions?|rules?|guidelines?)/i,
];

export function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(text));
}

/** Strip null bytes, control characters, and runaway blank lines. */
export function sanitizeInput(text: string): string {
  return text
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0e-\x1f\x7f]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

/**
 * One-way session hash for telemetry. Not reversible to an IP.
 *
 * SESSION_HASH_SECRET must be set in production. The fallback below exists so
 * local dev works, but with a known salt the hash is guessable, which would let
 * someone confirm whether a given IP+UA pair appears in the analytics set.
 */
export function generateSessionHash(ip: string, userAgent: string): string {
  const secret = process.env.SESSION_HASH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.warn('[security] SESSION_HASH_SECRET is not set — session hashes are predictable.');
  }
  return createHash('sha256')
    .update(`${ip}:${userAgent}:${secret ?? 'dev-only-insecure-salt'}`)
    .digest('hex')
    .slice(0, 16);
}

export function truncateForAI(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastBreak = cut.lastIndexOf('\n');
  return lastBreak > maxChars * 0.8 ? cut.slice(0, lastBreak) : cut;
}

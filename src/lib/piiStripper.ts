// src/lib/piiStripper.ts
// Server-side redaction engine for sensitive identifiers.
//
// DESIGN PRINCIPLES:
// 1. Privacy First: Strip PII *before* it touches any external AI API (Gemini).
// 2. High Recall: It is better to over-redact (e.g., redact a generic company URL) 
//    than to leak personal contact data.
// 3. Fast & Synchronous: Pure regex, no external dependencies, runs in under 5ms.

const PII_PATTERNS = [
  {
    // Emails
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replacement: '[REDACTED_EMAIL]',
  },
  {
    // Phone numbers (US, UK, India, and general international formats)
    // Matches +1-555-555-5555, (555) 555-5555, 555 555 5555, +91 9999999999
    regex: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
    replacement: '[REDACTED_PHONE]',
  },
  {
    // URLs and links (LinkedIn, GitHub, Personal Sites)
    regex: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
    replacement: '[REDACTED_URL]',
  },
  {
    // Standalone LinkedIn/GitHub handles lacking the https:// protocol prefix
    regex: /(?:www\.)?(?:linkedin\.com|github\.com|twitter\.com|x\.com)\/[a-zA-Z0-9_-]+/gi,
    replacement: '[REDACTED_URL]',
  },
  {
    // US Social Security Numbers (SSN) - highly unlikely on resumes but critical risk
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[REDACTED_SSN]',
  },
  {
    // Basic Address indicators (US Zip Codes, P.O. Box, UK Postcodes)
    regex: /\b(?:P\.O\.\s*Box\s*\d+|[A-Z]{2}\s+\d{5}(?:-\d{4})?|[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})\b/gi,
    replacement: '[REDACTED_ADDRESS]',
  }
];

/**
 * Synchronously strips common Personal Identifiable Information (PII) from a string.
 * Must be executed immediately after text extraction and BEFORE passing text to the LLM.
 * 
 * Note: Candidate names are intentionally not stripped by regex because they lack 
 * a reliable deterministic signature.
 * 
 * @param text The raw extracted resume text.
 * @returns The redacted text safe for AI processing.
 */
export function stripPII(text: string): string {
  if (!text) return '';

  let redacted = text;

  for (const { regex, replacement } of PII_PATTERNS) {
    redacted = redacted.replace(regex, replacement);
  }

  return redacted;
}
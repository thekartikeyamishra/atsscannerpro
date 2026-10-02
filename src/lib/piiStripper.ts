// src/lib/piiStripper.ts
// Server-side only. The SINGLE source of truth for PII removal.
//
// WHY THIS FILE WAS REWRITTEN
// The codebase previously contained THREE different stripPII() implementations:
//   1. src/lib/piiStripper.ts   (this file — used by /api/scan)
//   2. src/lib/ai/analyze.ts    (a weaker regex set)
//   3. src/lib/gemini.ts        (a third, different set)
// They disagreed about what counts as PII, so the guarantee printed on
// /privacy depended on which code path ran. Now there is one implementation;
// the other two must be deleted and re-exported from here (see APPLY.md).
//
// ORDERING MATTERS. Specific patterns run BEFORE generic ones, otherwise the
// generic phone rule eats 12-digit Aadhaar numbers and the ID rule never fires.
//
// HONESTY NOTE: regex PII removal is best-effort, not a guarantee. It cannot
// catch every name or address variant. /privacy has been reworded to say
// "designed to remove" rather than "your identity is never sent" — do not
// re-strengthen that claim without a verified detector behind it.

export interface StripResult {
  text: string;
  /** Count of redactions by category — safe to log, contains no PII. */
  redactions: Record<string, number>;
}

type Rule = {
  label: string;
  pattern: RegExp;
  replacement: string;
  /** Optional second pass. Return false to leave the match untouched — used
   *  where a regex must be loose enough to catch real variation but would
   *  otherwise swallow legitimate numbers. */
  validate?: (match: string) => boolean;
};

// Ordered most-specific → most-generic.
const RULES: Rule[] = [
  // ── Named identifiers (must precede the generic digit rules) ──────────────
  {
    label: 'AADHAAR',
    // 12 digits in 4-4-4 grouping. Runs before PHONE so it is not swallowed.
    pattern: /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: '[AADHAAR]',
  },
  {
    label: 'PAN',
    pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    replacement: '[PAN]',
  },
  {
    label: 'PASSPORT_IN',
    pattern: /\b[A-PR-WY][0-9]{7}\b/g,
    replacement: '[PASSPORT]',
  },
  {
    label: 'SSN',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[SSN]',
  },

  // ── Contact details ───────────────────────────────────────────────────────
  {
    label: 'EMAIL',
    // Quantifiers are BOUNDED. The unbounded form
    //   [A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}
    // backtracks catastrophically on a long run of word characters with no '@':
    // the first class consumes the whole run, fails to find '@', gives back one
    // character, fails again — then the engine restarts one position along.
    // That is O(n^2). Measured on a single 100k-character token: 11 SECONDS,
    // and ~50s at 200k, against a 60s function timeout.
    //
    // This is reachable in practice. A PDF with an embedded image sometimes
    // extracts as one enormous unbroken token, and a resume is attacker-supplied
    // input. RFC limits are 64 chars local / 255 domain, so bounding costs
    // nothing real and makes the worst case linear.
    pattern: /\b[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}\b/g,
    replacement: '[EMAIL]',
  },
  {
    label: 'PHONE',
    // Matches a loose candidate run, then `validate` decides by digit count.
    // A fixed-shape regex cannot express "a phone number" across locales:
    // the previous one required 2-4 digits before a separator and therefore
    // missed "+91 98765 43210", the 5-5 grouping used across India — the
    // product's primary market. It reached the model on every scan.
    pattern: /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?\d[\d\s.-]{6,16}\d/g,
    replacement: '[PHONE]',
    validate: (match: string) => {
      const digits = match.replace(/\D/g, '');
      // Real numbers carry 10-13 digits. "2021 - 2024" yields 8 and is spared.
      if (digits.length < 10 || digits.length > 13) return false;
      // Without a + or parentheses, only national lengths qualify. This keeps
      // two adjacent six-figure metrics ("250000 340000" = 12) intact.
      const hasPrefix = /^\s*[+(]/.test(match);
      return hasPrefix || digits.length === 10 || digits.length === 11;
    },
  },

  // ── Profile URLs (before the generic URL rule) ────────────────────────────
  {
    label: 'LINKEDIN',
    pattern: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[A-Za-z0-9_%-]+\/?/gi,
    replacement: '[LINKEDIN]',
  },
  {
    label: 'GITHUB',
    pattern: /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_.-]+\/?/gi,
    replacement: '[GITHUB]',
  },
  {
    label: 'SOCIAL',
    pattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x|medium|behance|dribbble)\.com\/@?[A-Za-z0-9_.-]+\/?/gi,
    replacement: '[SOCIAL]',
  },
  {
    label: 'URL',
    // Generic personal/portfolio URLs. Own domain is preserved.
    pattern: /https?:\/\/(?!atsscannerpro\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/\S*)?/gi,
    replacement: '[URL]',
  },

  // ── Postal ────────────────────────────────────────────────────────────────
  {
    label: 'ADDRESS',
    pattern:
      /\b\d{1,5}[A-Za-z]?[,\s]+[A-Za-z\s]{2,30}(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Nagar|Colony|Sector|Block|Phase)\b[,\s.]*[A-Za-z\s,]{0,30}\b\d{5,6}\b/gi,
    replacement: '[ADDRESS]',
  },
  {
    label: 'POSTCODE',
    // Only when preceded by an explicit postcode word. The old rule redacted
    // EVERY 6-digit number, which destroyed metrics like "handled 250000 rows".
    pattern: /\b(?:PIN|PIN\s?Code|Pincode|Postal\s?Code|ZIP(?:\s?Code)?)\b[:\s-]*\d{5,6}\b/gi,
    replacement: '[POSTCODE]',
  },
];

/**
 * Redact the candidate's own name from the header block of a resume.
 *
 * Names are the one PII category regex genuinely cannot solve in general, so
 * this is deliberately narrow: it only looks at the first few lines, where a
 * resume's name almost always sits, and only redacts a short Title Case line
 * that contains no role/section vocabulary. It will miss names in body text.
 * Scoped this way it is very unlikely to redact a job title or section header.
 */
function stripHeaderName(text: string): { text: string; hit: number } {
  const lines = text.split('\n');
  const limit = Math.min(lines.length, 6);
  const VOCAB =
    /\b(resume|curriculum|vitae|cv|summary|objective|profile|experience|education|skills|engineer|developer|manager|analyst|designer|scientist|intern|consultant|lead|senior|junior)\b/i;
  let hit = 0;

  for (let i = 0; i < limit; i++) {
    const line = lines[i].trim();
    if (!line || line.length > 40) continue;
    if (VOCAB.test(line)) continue;
    if (/[@\d]/.test(line)) continue;
    // 2–4 Title Case words, e.g. "Kartikeya Mishra" / "Ana María López"
    if (/^([A-ZÀ-Þ][a-zà-ÿ'’.-]+)(\s+[A-ZÀ-Þ][a-zà-ÿ'’.-]+){1,3}$/.test(line)) {
      lines[i] = lines[i].replace(line, '[CANDIDATE_NAME]');
      hit++;
      break; // exactly one name line
    }
  }
  return { text: lines.join('\n'), hit };
}

/** Strip PII and report what was removed. Use this when you want telemetry. */
export function stripPIIWithReport(input: string): StripResult {
  const redactions: Record<string, number> = {};
  let text = input;

  const named = stripHeaderName(text);
  text = named.text;
  if (named.hit) redactions.CANDIDATE_NAME = named.hit;

  for (const { label, pattern, replacement, validate } of RULES) {
    let count = 0;
    text = text.replace(pattern, (match) => {
      if (validate && !validate(match)) return match;
      count++;
      return replacement;
    });
    if (count) redactions[label] = count;
  }

  return { text: text.trim(), redactions };
}

/** Backwards-compatible signature used by /api/scan. */
export function stripPII(input: string): string {
  return stripPIIWithReport(input).text;
}

export default stripPII;

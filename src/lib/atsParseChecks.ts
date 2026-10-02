// src/lib/atsParseChecks.ts
// Deterministic ATS formatting analysis. NO AI CALL.
//
// ── WHY THIS EXISTS (moat #1: measured behaviour, not generated opinion) ────
//
// Asking a language model "does this resume have formatting problems?" produces
// a plausible answer. This file produces a CHECKED one. Every finding below is
// derived from the extracted text and the raw file bytes — it is reproducible,
// explainable to a user line by line, and identical on every run.
//
// That distinction is the defensible part. A competitor can prompt a model to
// sound like this. They cannot reproduce findings tied to what a real parser
// actually did to a real file unless they also build the harness. And because
// this runs before the AI call, it:
//
//   • costs nothing per scan (pure CPU, no tokens)
//   • returns instantly, so the UI has real findings while the model works
//   • lets the AI prompt shrink — it no longer needs to guess at formatting
//   • degrades gracefully: if Gemini is down, users still get this
//
// ── HONESTY CONSTRAINT ─────────────────────────────────────────────────────
// Every check reports what was OBSERVED, never what an ATS "will" do. There is
// no single ATS. Confidence is stated per finding. Do not add a check here
// unless you can point at the evidence in the text that triggered it.

import type { FileFormat } from '@/types';

export type Severity = 'critical' | 'warning' | 'info';
export type Confidence = 'measured' | 'likely' | 'heuristic';

export interface ParseFinding {
  /** Stable id — safe to use as an analytics key and a translation key. */
  code: string;
  severity: Severity;
  /** 'measured'  = observed directly in the extracted text/bytes.
   *  'likely'    = strong signal, small chance of a false positive.
   *  'heuristic' = a rule of thumb; say so in the UI. */
  confidence: Confidence;
  title: string;
  detail: string;
  /** What the user should actually do. */
  fix: string;
  /** The text that triggered it, so the finding is auditable by the user. */
  evidence?: string;
}

export interface ParseReport {
  findings: ParseFinding[];
  /** 0–100. Deterministic: the same document always scores identically. */
  parseScore: number;
  stats: {
    charCount: number;
    wordCount: number;
    lineCount: number;
    avgLineLength: number;
    bulletCount: number;
    dateRangeCount: number;
    quantifiedCount: number;
    estimatedPages: number;
  };
}

// Roughly one page of a normal single-column resume.
const CHARS_PER_PAGE = 3200;

const STANDARD_SECTIONS = [
  { name: 'experience', re: /^\s*(work\s+)?(experience|employment|professional\s+(experience|history)|career\s+history)\s*:?\s*$/im },
  { name: 'education', re: /^\s*(education|academic(\s+background)?|qualifications)\s*:?\s*$/im },
  { name: 'skills', re: /^\s*((technical|core|key)\s+)?(skills|competencies|technologies|expertise)\s*:?\s*$/im },
];

/** Glyphs that commonly survive extraction as mojibake or get dropped. */
const RISKY_GLYPHS = /[\uE000-\uF8FF\uFFFD]/g; // private-use area + replacement char

/** Characters that indicate a symbol font was used for bullets. */
const SYMBOL_BULLETS = /[\uF0A7\uF0B7\uF06C\uF0D8]/g;

function countMatches(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

/**
 * Analyse extracted resume text for parsing risk.
 *
 * @param text     Extracted text, AFTER sanitisation, BEFORE PII stripping.
 *                 Order matters: stripping replaces contact details with
 *                 tokens, which would defeat the contact-block check.
 * @param format   Detected file format.
 * @param rawBytes Optional original buffer. Enables byte-level checks that the
 *                 text alone cannot support.
 */
export function runParseChecks(
  text: string,
  format: FileFormat,
  rawBytes?: Buffer,
): ParseReport {
  const findings: ParseFinding[] = [];
  const lines = text.split('\n');
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);

  const stats = {
    charCount: text.length,
    wordCount: words.length,
    lineCount: nonEmpty.length,
    avgLineLength: nonEmpty.length
      ? Math.round(nonEmpty.reduce((a, l) => a + l.trim().length, 0) / nonEmpty.length)
      : 0,
    bulletCount: countMatches(text, /^\s*[•·▪◦‣∙*\-–—]\s+/gm),
    dateRangeCount: countMatches(
      text,
      /\b(19|20)\d{2}\s*[-–—to]{1,3}\s*((19|20)\d{2}|present|current|now)\b/gi,
    ),
    quantifiedCount: countMatches(text, /\b\d+(\.\d+)?\s*(%|percent|x\b)|[$₹€£]\s?\d|(\b\d{3,}\b)/g),
    estimatedPages: Math.max(1, Math.round(text.length / CHARS_PER_PAGE)),
  };

  // ── 1. Extraction volume ─────────────────────────────────────────────────
  // The clearest measurable failure: a file that produced almost no text.
  if (stats.wordCount < 120) {
    findings.push({
      code: 'LOW_TEXT_YIELD',
      severity: 'critical',
      confidence: 'measured',
      title: 'Very little text could be extracted',
      detail: `We recovered only ${stats.wordCount} words from this file. A resume that parses correctly usually yields 300–800. This normally means the content is inside images, or the PDF has no text layer.`,
      fix: 'Export directly from your word processor rather than scanning or screenshotting. If you exported from a design tool, re-export with text as live text rather than outlines.',
    });
  }

  // ── 2. Column layout ─────────────────────────────────────────────────────
  // Multi-column PDFs interleave when read in reading order. The signature is
  // many short lines with fragments of two ideas adjacent on one line.
  if (format === 'pdf' && stats.avgLineLength > 0 && stats.avgLineLength < 26 && stats.lineCount > 40) {
    findings.push({
      code: 'SHORT_LINE_RUNS',
      severity: 'warning',
      confidence: 'likely',
      title: 'Layout may be multi-column',
      detail: `Average extracted line length is ${stats.avgLineLength} characters across ${stats.lineCount} lines. Single-column resumes typically extract at 45–90. Short runs like this usually mean text was pulled column-by-column, which can interleave unrelated sections.`,
      fix: 'Move to a single-column layout. Sidebars holding skills or contact details are the most common cause.',
    });
  }

  // ── 3. Section headings ──────────────────────────────────────────────────
  const missing = STANDARD_SECTIONS.filter((s) => !s.re.test(text)).map((s) => s.name);
  if (missing.length > 0) {
    findings.push({
      code: 'NONSTANDARD_HEADINGS',
      severity: missing.length >= 2 ? 'warning' : 'info',
      confidence: 'measured',
      title: `No standard heading found for: ${missing.join(', ')}`,
      detail:
        'Parsers segment a resume by matching heading text against a known list. Creative headings ("Where I\'ve Been", "My Toolkit") are readable to a person but often leave a section unassigned.',
      fix: `Use plain headings on their own line: ${missing.map((m) => `"${m[0].toUpperCase()}${m.slice(1)}"`).join(', ')}.`,
      evidence: missing.join(', '),
    });
  }

  // ── 4. Contact block position ────────────────────────────────────────────
  // Runs before PII stripping — see the @param note above.
  // Bounded quantifiers — see the note in lib/piiStripper.ts. The unbounded
  // form takes ~11s on a single 100k-character token and ~50s at 200k, which
  // on a 60s function limit is a denial of service triggered by an upload.
  const EMAIL_RE = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}/;
  const head = text.slice(0, 600);
  const hasEmail = EMAIL_RE.test(head);
  const emailAnywhere = EMAIL_RE.test(text);
  if (!hasEmail && emailAnywhere) {
    findings.push({
      code: 'CONTACT_NOT_AT_TOP',
      severity: 'warning',
      confidence: 'likely',
      title: 'Contact details are not near the top',
      detail:
        'Your email appears in the document but not in the first block of extracted text. Contact details placed in a header, footer, or sidebar often extract out of order — or not at all.',
      fix: 'Put your name and contact details in the document body, at the top, not in the page header.',
    });
  } else if (!emailAnywhere) {
    findings.push({
      code: 'NO_EMAIL_FOUND',
      severity: 'critical',
      confidence: 'measured',
      title: 'No email address was found',
      detail:
        'We could not find an email anywhere in the extracted text. If your resume has one, it is in a region that did not extract — typically a page header, a text box, or an image.',
      fix: 'Type your email as plain text in the body of the document.',
    });
  }

  // ── 5. Encoding damage ───────────────────────────────────────────────────
  const glyphs = countMatches(text, RISKY_GLYPHS);
  if (glyphs > 0) {
    findings.push({
      code: 'ENCODING_ARTIFACTS',
      severity: 'warning',
      confidence: 'measured',
      title: `${glyphs} character${glyphs === 1 ? '' : 's'} did not decode`,
      detail:
        'Some characters came through as replacement or private-use glyphs. This usually comes from an embedded font without proper character mapping, and means those words are unreadable to any parser.',
      fix: 'Re-export using a standard font (Calibri, Arial, Times New Roman, Helvetica) with font embedding enabled.',
    });
  }

  const symbolBullets = countMatches(text, SYMBOL_BULLETS);
  if (symbolBullets > 2) {
    findings.push({
      code: 'SYMBOL_FONT_BULLETS',
      severity: 'info',
      confidence: 'measured',
      title: 'Bullets use a symbol font',
      detail: `${symbolBullets} bullet markers decoded as symbol-font characters rather than text. Harmless for scoring, but it indicates Wingdings or a similar font is in use, which can affect other characters too.`,
      fix: 'Use your word processor\u2019s standard bullet list rather than a custom symbol.',
    });
  }

  // ── 6. Tables ────────────────────────────────────────────────────────────
  // A table flattens to a line with several runs separated by wide whitespace.
  const tabbyLines = nonEmpty.filter((l) => /\S {3,}\S.* {3,}\S/.test(l)).length;
  if (tabbyLines > 5) {
    findings.push({
      code: 'TABULAR_LAYOUT',
      severity: 'warning',
      confidence: 'heuristic',
      title: 'Table-like layout detected',
      detail: `${tabbyLines} lines contain several text runs separated by wide gaps, which is what a table looks like after extraction. Cell contents can be read in the wrong order, or merged.`,
      fix: 'Replace tables with plain paragraphs and bullet lists. Skills grids are the usual culprit.',
      evidence: nonEmpty.find((l) => /\S {3,}\S.* {3,}\S/.test(l))?.trim().slice(0, 80),
    });
  }

  // ── 7. Dates ─────────────────────────────────────────────────────────────
  if (stats.dateRangeCount === 0 && stats.wordCount > 150) {
    findings.push({
      code: 'NO_DATE_RANGES',
      severity: 'warning',
      confidence: 'measured',
      title: 'No employment date ranges found',
      detail:
        'We found no date ranges in a recognisable format. Systems use these to compute years of experience, and a missing range often reads as a gap.',
      fix: 'Write ranges plainly: "Mar 2021 – Present" or "2021 – 2024".',
    });
  }

  // ── 8. Length ────────────────────────────────────────────────────────────
  if (stats.estimatedPages > 3) {
    findings.push({
      code: 'LENGTH_LONG',
      severity: 'info',
      confidence: 'heuristic',
      title: `Roughly ${stats.estimatedPages} pages of text`,
      detail:
        'Length is not itself a parsing problem — everything gets indexed. It is a human-attention problem once a recruiter opens the file.',
      fix: 'Two pages is a common ceiling outside academic and senior research roles.',
    });
  }

  // ── 9. Achievements ──────────────────────────────────────────────────────
  if (stats.quantifiedCount < 3 && stats.wordCount > 150) {
    findings.push({
      code: 'FEW_QUANTIFIED',
      severity: 'info',
      confidence: 'heuristic',
      title: 'Few measurable results',
      detail: `We found ${stats.quantifiedCount} numeric result${stats.quantifiedCount === 1 ? '' : 's'}. Numbers make a claim checkable, which matters to the person reading, not to the parser.`,
      fix: 'Rewrite one bullet per role with a number: scale, percentage, time saved, or money.',
    });
  }

  // ── 10. Format ───────────────────────────────────────────────────────────
  if (format === 'doc') {
    findings.push({
      code: 'LEGACY_DOC',
      severity: 'info',
      confidence: 'measured',
      title: 'Legacy .doc format',
      detail: 'The pre-2007 Word format is inconsistently supported by newer parsers.',
      fix: 'Save as .docx or export to PDF.',
    });
  }
  if (format === 'unknown') {
    findings.push({
      code: 'UNKNOWN_FORMAT',
      severity: 'warning',
      confidence: 'measured',
      title: 'File type not recognised',
      detail: 'We read this as plain text because its structure did not match a known format. Some content may be missing.',
      fix: 'Upload a PDF or DOCX.',
    });
  }

  // ── 11. Byte-level: embedded-image-heavy PDFs ────────────────────────────
  if (rawBytes && format === 'pdf') {
    const sample = rawBytes.subarray(0, Math.min(rawBytes.length, 2_000_000)).toString('latin1');
    const images = countMatches(sample, /\/Subtype\s*\/Image/g);
    const bytesPerWord = stats.wordCount > 0 ? rawBytes.length / stats.wordCount : Infinity;
    if (images > 3 && bytesPerWord > 4000) {
      findings.push({
        code: 'IMAGE_HEAVY_PDF',
        severity: 'warning',
        confidence: 'measured',
        title: 'File is mostly images',
        detail: `This PDF contains ${images} embedded images and is large relative to the text recovered from it. Any text inside those images is invisible to a parser.`,
        fix: 'Make sure skills, job titles, and contact details are live text, not part of a graphic.',
      });
    }
  }

  // ── Score ────────────────────────────────────────────────────────────────
  // Fixed weights, so the number is reproducible and explainable. This scores
  // MACHINE READABILITY only — not job fit, which is the AI's job.
  const penalty = findings.reduce(
    (sum, f) => sum + (f.severity === 'critical' ? 28 : f.severity === 'warning' ? 11 : 3),
    0,
  );
  const parseScore = Math.max(0, Math.min(100, 100 - penalty));

  return { findings, parseScore, stats };
}

/** Stable codes only — safe to store as telemetry, contains no resume content. */
export function findingCodes(report: ParseReport): string[] {
  return report.findings.map((f) => f.code);
}

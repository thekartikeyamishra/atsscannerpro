// src/lib/fileParser.ts
// cspell:ignore certif turbopack mammoth
// PATH FIX: imports now use the corrected '@/*' → './src/*' alias
// (was '@/src/types' / '@/src/lib/security', which double-counted 'src').
import type { FileFormat, FileParseResult, FileValidationResult } from '@/types';
import { validateResumeFile, detectFileFormatFromBuffer, sanitizeInput } from '@/lib/security';

// ── Section Detection & Analytics ──────────────────────────────────────────

const SECTION_PATTERNS = [
  { name: 'experience', patterns: [/work experience/i, /professional experience/i, /employment history/i, /experience/i] },
  { name: 'skills', patterns: [/technical skills/i, /skills/i, /competencies/i, /technologies/i] },
  { name: 'education', patterns: [/education/i, /academic background/i, /qualifications/i, /degree/i] },
  { name: 'summary', patterns: [/summary/i, /objective/i, /profile/i, /about me/i, /overview/i] },
  { name: 'certifications', patterns: [/certif/i, /licenses/i, /credentials/i] },
  { name: 'projects', patterns: [/projects/i, /portfolio/i, /open.?source/i] },
  { name: 'awards', patterns: [/awards/i, /honors/i, /achievements/i, /recognition/i] },
  { name: 'languages', patterns: [/languages/i] },
  { name: 'publications', patterns: [/publications/i, /papers/i, /research/i] },
];

function detectSections(text: string): string[] {
  const detected = new Set<string>();
  const lines = text.split('\n').slice(0, 200); // Usually sections are headers

  for (const line of lines) {
    if (line.length > 40) continue; // Skip long paragraph lines
    for (const section of SECTION_PATTERNS) {
      if (section.patterns.some(regex => regex.test(line))) {
        detected.add(section.name);
      }
    }
  }
  return Array.from(detected);
}

function estimateWordCount(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function hasQuantifiedAchievements(text: string): boolean {
  // Matches percentages, dollar amounts, and large numbers indicating metrics
  const metricRegex = /(\d{1,3}%|\$\d+[kmbKMB]?|\b[1-9]\d{2,}\b)/g;
  const matches = text.match(metricRegex);
  return matches !== null && matches.length > 2;
}

// ── File Extraction Engines ────────────────────────────────────────────────

async function extractFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import with .mjs extension for Next.js 15+ Turbopack compatibility.
  // pdfjs-dist is also listed in next.config.ts serverExternalPackages so the
  // bundler leaves it alone entirely.
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Safe initialization for the server environment (disables browser worker expectation)
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useWorkerFetch: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  // Dynamic import to prevent Turbopack CommonJS bundling crashes
  const mammothModule = await import('mammoth');
  const mammoth = mammothModule.default || mammothModule;

  const result = await mammoth.extractRawText({ buffer });
  if (result.messages?.length) {
    console.warn('Mammoth extraction warnings:', result.messages);
  }

  return result.value;
}

function extractFromTXT(buffer: Buffer): string {
  return new TextDecoder('utf-8').decode(buffer);
}

// ── Main Controller ────────────────────────────────────────────────────────

/**
 * Main entry point for parsing uploaded resume files.
 * Handles buffer extraction, format routing, and security sanitization.
 */
export async function parseResumeFile(file: File): Promise<FileParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Filename is passed so ODT can be told apart from DOCX — both are ZIP
  // containers with identical magic bytes. Without it every .odt was routed
  // to mammoth, which throws on OpenDocument.
  const detectedFormat = detectFileFormatFromBuffer(buffer, file.name);
  let rawText = '';

  switch (detectedFormat) {
    case 'pdf':
      rawText = await extractFromPDF(buffer);
      break;
    case 'docx':
    case 'doc':
      rawText = await extractFromDOCX(buffer);
      break;
    case 'txt':
    case 'rtf':
    default:
      rawText = extractFromTXT(buffer);
      break;
  }

  // Sanitize to prevent basic XSS or prompt injection artifacts
  const cleanText = sanitizeInput(rawText);

  if (!cleanText || cleanText.length < 50) {
    throw new Error(
      `Could not extract readable text from your ${detectedFormat.toUpperCase()} file. ` +
        'Please ensure it contains actual text (not just images/scanned pages) and try again.'
    );
  }

  return {
    text: cleanText,
    format: detectedFormat,
    wordCount: estimateWordCount(cleanText),
    metadata: {
      sectionsDetected: detectSections(cleanText).join(','),
      hasQuantifiedAchievements: String(hasQuantifiedAchievements(cleanText)),
    },
  };
}

/**
 * Validates a File object prior to processing.
 */
export function validateResumeUpload(file: File): FileValidationResult {
  return validateResumeFile({
    name: file.name,
    type: file.type,
    size: file.size,
  });
}

/**
 * Returns a user-friendly format label for the UI.
 */
export function getFormatLabel(format: FileFormat): string {
  const labels: Record<FileFormat | string, string> = {
    pdf: 'PDF',
    docx: 'Word (DOCX)',
    doc: 'Word (DOC)',
    txt: 'Plain Text',
    rtf: 'Rich Text',
  };
  return labels[format] || format.toUpperCase();
}

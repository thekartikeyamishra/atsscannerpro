// src/lib/atsParseChecks.ts
// Deterministic layout and formatting heuristics.
// 
// Why deterministic? Because LLMs hallucinate formatting errors. You cannot prompt
// an LLM with plain text and ask "were there tables?" — the text has already lost
// the table structure. These checks run on the raw extracted string and look for
// artifacts of bad extraction before the LLM ever sees the data.

export type FindingSeverity = 'critical' | 'warning' | 'info';
export type FindingConfidence = 'measured' | 'heuristic';

export interface ParseFinding {
  code: string;
  severity: FindingSeverity;
  title: string;
  confidence: FindingConfidence;
  detail: string;
  fix: string;
  evidence?: string;
}

export interface ParseReport {
  findings: ParseFinding[];
  isMachineReadable: boolean;
}

/**
 * Runs a series of regex and heuristic checks on the raw extracted text
 * to determine if the document will parse correctly in standard ATS software.
 */
export function runFormattingChecks(rawText: string): ParseReport {
  const findings: ParseFinding[] = [];
  const normalizedText = rawText.replace(/\r\n/g, '\n');
  
  // 1. IMAGE-ONLY PDF (No extractable text)
  // If a document has fewer than 100 characters, it is almost certainly a scan or image.
  if (normalizedText.trim().length < 100) {
    findings.push({
      code: 'ERR_EMPTY_OR_IMAGE',
      severity: 'critical',
      title: 'Unreadable Document',
      confidence: 'measured',
      detail: 'Applicant Tracking Systems cannot read images or scanned documents. We extracted almost no text from your file.',
      fix: 'Export your resume directly from Word or Google Docs as a PDF. Do not scan a printed copy or use image-heavy design tools like Photoshop.',
      evidence: `Extracted only ${normalizedText.trim().length} characters.`
    });
    // Short-circuit: no point running other checks on an empty document
    return { findings, isMachineReadable: false };
  }

  // 2. ENCODING / FONT ISSUES
  // Look for the Unicode replacement character (\uFFFD), which happens when custom fonts lack proper encoding mappings.
  const replacementMatches = normalizedText.match(/\uFFFD/g);
  const replacementCharsCount = replacementMatches ? replacementMatches.length : 0;
  
  if (replacementCharsCount > 3) {
    findings.push({
      code: 'ERR_ENCODING',
      severity: 'critical',
      title: 'Font Encoding Issues',
      confidence: 'measured',
      detail: 'Your document uses a font that ATS parsers cannot translate into standard text. Letters are being read as broken symbols.',
      // cspell:disable-next-line
      fix: 'Use standard, system-safe fonts like Arial, Calibri, Helvetica, or Times New Roman. Avoid custom or downloaded fonts.',
      evidence: `Found ${replacementCharsCount} unrecognized characters.`
    });
  }

  // 3. TABLE / COLUMN FLATTENING ARTIFACTS
  // When tables or columns are flattened to plain text, they often result in large gaps
  // or interleaved lines (e.g. Date 1 \t Date 2 \t Role 1 \t Role 2).
  // We check for excessive consecutive spaces/tabs on multiple lines.
  const lines = normalizedText.split('\n');
  let linesWithLargeGaps = 0;
  for (const line of lines) {
    if (line.match(/\s{5,}/) && line.trim().length > 15) {
      linesWithLargeGaps++;
    }
  }
  
  if (linesWithLargeGaps > 5) {
    findings.push({
      code: 'WARN_COMPLEX_LAYOUT',
      severity: 'warning',
      title: 'Complex Columns or Tables Detected',
      confidence: 'heuristic',
      detail: 'The text extraction shows large horizontal gaps. Multi-column layouts and tables often cause parsers to read left-to-right across the whole page, mixing up different job entries.',
      fix: 'Use a single-column layout. Avoid using tables or text boxes to align dates; use standard paragraph tabs and margins instead.',
    });
  }

  // 4. MISSING CONTACT INFORMATION
  // ATS systems automatically populate the candidate profile based on these fields.
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const hasEmail = emailRegex.test(normalizedText);
  if (!hasEmail) {
    findings.push({
      code: 'WARN_NO_EMAIL',
      severity: 'warning',
      title: 'Email Address Missing',
      confidence: 'measured',
      detail: 'No valid email address was detected in the text.',
      fix: 'Ensure your email address is spelled correctly, uses a standard font, and is placed clearly at the top of the document. Do not put it in a header/footer region.',
    });
  }

  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const hasPhone = phoneRegex.test(normalizedText);
  if (!hasPhone) {
    findings.push({
      code: 'INFO_NO_PHONE',
      severity: 'info',
      title: 'Phone Number Not Detected',
      confidence: 'heuristic',
      detail: 'A standard phone number format could not be found.',
      fix: 'If you included a phone number, ensure it uses standard spacing (e.g., 555-555-5555). If omitted intentionally for privacy, you can ignore this.',
    });
  }

  // 5. HEADER/FOOTER ARTIFACTS
  // Look for repeating lines (like page numbers or names) at the start/end of pages.
  // We approximate this by looking for lines that consist entirely of "Page X of Y"
  const pageNumberRegex = /^page\s+\d+\s+(?:of\s+\d+)?$/i;
  const hasPageNumbers = lines.some(line => pageNumberRegex.test(line.trim()));
  if (hasPageNumbers) {
     findings.push({
      code: 'INFO_PAGE_NUMBERS',
      severity: 'info',
      title: 'Page Numbers Detected',
      confidence: 'measured',
      detail: 'Page numbers were extracted. While not harmful, some ATS parsers accidentally ingest header/footer text into job descriptions if they aren\'t configured well.',
      fix: 'Consider removing headers, footers, and page numbers from your document. Keep all text in the main body.',
    });
  }

  // 6. STANDARD SECTION HEADERS
  // Check if standard sections exist. If not, the ATS might not know where jobs start and end.
  const hasExperience = /\b(experience|employment|work history)\b/i.test(normalizedText);
  const hasEducation = /\b(education|academic)\b/i.test(normalizedText);
  
  if (!hasExperience) {
    findings.push({
      code: 'WARN_NO_EXPERIENCE_HEADER',
      severity: 'warning',
      title: 'Missing "Experience" Section Header',
      confidence: 'heuristic',
      detail: 'Could not find a standard header for your work history. ATS systems use headers to categorize your text.',
      fix: 'Use a standard section title like "Professional Experience" or "Work History". Standalone bold text is usually best.',
    });
  }

  if (!hasEducation) {
    findings.push({
      code: 'WARN_NO_EDUCATION_HEADER',
      severity: 'warning',
      title: 'Missing "Education" Section Header',
      confidence: 'heuristic',
      detail: 'Could not find a standard header for your education.',
      fix: 'Ensure you have a section explicitly titled "Education".',
    });
  }

  // If there are critical errors, the machine readability is compromised
  const isMachineReadable = !findings.some(f => f.severity === 'critical');

  return {
    findings,
    isMachineReadable
  };
}
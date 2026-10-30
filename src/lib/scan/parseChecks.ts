// src/lib/scan/parseChecks.ts
// Deterministic formatting checks. These look at the extracted text and the
// layout signals gathered while reading the file — not at what a model
// guesses — so each finding says whether it was measured or inferred.

import type { Finding, LayoutSignals } from './types';
import { lines } from './text';

interface Input {
  text: string;
  layout: LayoutSignals;
  fileName?: string;
  sections: { contact: boolean; experience: boolean; education: boolean; skills: boolean; summary: boolean };
  words: number;
  bullets: number;
  overused: string[];
}

export function runParseChecks({ text, layout, fileName, sections, words, bullets, overused }: Input): Finding[] {
  const f: Finding[] = [];
  const clean = text.replace(/\r\n?/g, '\n');
  const trimmed = clean.trim();

  if (trimmed.length < 150 || (layout.format === 'pdf' && (layout.charsPerPage ?? 1000) < 120)) {
    f.push({
      code: 'IMAGE_ONLY',
      severity: 'critical',
      confidence: 'measured',
      title: 'Almost no readable text',
      detail: `We could only extract ${trimmed.length} characters. That usually means the resume is a scan, a photo, or text converted to outlines — an ATS sees a blank page.`,
      fix: 'Export the resume straight from Word or Google Docs as PDF or DOCX. Don\'t scan a printout or export from an image editor.',
    });
    return f;
  }

  const broken = (clean.match(/�|[\u0000-\u0008\u000E-\u001F]/g) || []).length;
  if (broken > 3) {
    f.push({
      code: 'ENCODING',
      severity: 'critical',
      confidence: 'measured',
      title: 'Some characters come out as gibberish',
      detail: 'Parts of the text extract as broken symbols. This happens with decorative or unembedded fonts.',
      fix: 'Switch to a standard font such as Calibri, Arial, Georgia or Garamond and export again.',
      evidence: `${broken} unreadable characters`,
    });
  }

  if (layout.columnShare !== undefined && layout.columnShare > 0.25) {
    f.push({
      code: 'COLUMNS',
      severity: 'warning',
      confidence: 'measured',
      title: 'Two-column layout',
      detail: `About ${Math.round(layout.columnShare * 100)}% of lines sit side by side with another block of text. Many parsers read straight across the page, mixing a sidebar into your job history.`,
      fix: 'Move to a single-column layout. Put skills in their own section under a plain heading instead of a sidebar.',
    });
  } else if (layout.format !== 'pdf') {
    const gapLines = lines(clean).filter((l) => /\S\s{6,}\S/.test(l) && l.trim().length > 20).length;
    if (gapLines > 5) {
      f.push({
        code: 'GAPS',
        severity: 'warning',
        confidence: 'heuristic',
        title: 'Text aligned with long runs of spaces',
        detail: 'Several lines use wide gaps to line things up. When this comes from columns or tables, parsers often merge unrelated text.',
        fix: 'Use one column and a right-aligned tab stop for dates instead of spaces or tables.',
      });
    }
  }

  if (layout.tables && layout.tables > 0) {
    f.push({
      code: 'TABLES',
      severity: 'warning',
      confidence: 'measured',
      title: `${layout.tables === 1 ? 'A table' : `${layout.tables} tables`} in the document`,
      detail: 'Tables are read cell by cell, sometimes out of order, and some systems skip them entirely.',
      fix: 'Rebuild table content as plain lines: "Job title, Company — City | Mar 2021 – Present".',
    });
  }

  if (layout.images && layout.images > 0) {
    f.push({
      code: 'IMAGES',
      severity: 'info',
      confidence: 'measured',
      title: `${layout.images === 1 ? 'An image' : `${layout.images} images`} found`,
      detail: 'ATS software ignores images. Logos, skill bars and icons add nothing to your profile, and a photo can be inappropriate for US/UK applications.',
      fix: 'Remove skill-rating bars and icons. If something matters, say it in words.',
    });
  }

  if (!/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(clean)) {
    f.push({
      code: 'NO_EMAIL',
      severity: 'warning',
      confidence: 'measured',
      title: 'No email address found',
      detail: 'Without an email in the body text, the system can\'t fill in your contact details. Headers and footers are often skipped.',
      fix: 'Put your email as plain text near the top of the page, not in a header, footer, or image.',
    });
  }
  if (!/(\+?\d[\d\s().-]{8,}\d)/.test(clean)) {
    f.push({
      code: 'NO_PHONE',
      severity: 'info',
      confidence: 'heuristic',
      title: 'No phone number detected',
      detail: 'We couldn\'t find a phone number in a standard format.',
      fix: 'If you want calls, add one in a plain format such as +91 98765 43210 or (555) 123-4567.',
    });
  }

  if (!sections.experience) {
    f.push({
      code: 'NO_EXPERIENCE_HEADING',
      severity: 'warning',
      confidence: 'heuristic',
      title: 'No standard "Experience" heading',
      detail: 'Parsers use headings to decide where jobs start and end. Creative names like "My Journey" or "Where I\'ve Been" aren\'t recognised.',
      fix: 'Title the section "Experience", "Work Experience" or "Professional Experience". Students can use "Internships" or "Projects".',
    });
  }
  if (!sections.education) {
    f.push({
      code: 'NO_EDUCATION_HEADING',
      severity: 'info',
      confidence: 'heuristic',
      title: 'No "Education" heading',
      detail: 'Many application forms filter on degree. If your education is listed under another heading, it may not be picked up.',
      fix: 'Add an "Education" section with degree, institution and year.',
    });
  }
  if (!sections.skills) {
    f.push({
      code: 'NO_SKILLS_HEADING',
      severity: 'info',
      confidence: 'heuristic',
      title: 'No "Skills" section',
      detail: 'A short skills section gives recruiters searching by tool name an easy hit.',
      fix: 'Add a "Skills" section listing the tools and methods you can discuss in an interview — grouped, not rated.',
    });
  }

  const years = clean.match(/\b(19[89]\d|20[0-3]\d)\b/g) || [];
  if (sections.experience && years.length < 2) {
    f.push({
      code: 'NO_DATES',
      severity: 'warning',
      confidence: 'heuristic',
      title: 'Few or no dates',
      detail: 'Systems calculate years of experience from your job dates. Without them, you may be filtered out of "3+ years" searches.',
      fix: 'Give every role a start and end date in one format, e.g. "Jan 2022 – Present".',
    });
  }

  if (words < 180) {
    f.push({
      code: 'SHORT',
      severity: 'warning',
      confidence: 'measured',
      title: 'Very short resume',
      detail: `${words} words. That leaves little for a keyword search to find.`,
      fix: 'Aim for roughly 350–700 words on one page, or up to two pages with 8+ years of experience.',
    });
  } else if (words > 1300 || (layout.pages ?? 1) > 3) {
    f.push({
      code: 'LONG',
      severity: 'info',
      confidence: 'measured',
      title: 'Long resume',
      detail: `${layout.pages ? `${layout.pages} pages, ` : ''}${words} words. ATS will read it all; recruiters skim the first page.`,
      fix: 'Cut roles older than 10–15 years to one line each and keep the most relevant work on page one.',
    });
  }

  if (bullets === 0 && sections.experience) {
    f.push({
      code: 'NO_BULLETS',
      severity: 'info',
      confidence: 'heuristic',
      title: 'Experience written as paragraphs',
      detail: 'Dense paragraphs are harder to skim and hide your results.',
      fix: 'Break each role into 3–6 bullets that start with a verb and end with a result.',
    });
  }

  if (/^\s*page\s+\d+(\s+of\s+\d+)?\s*$/im.test(clean)) {
    f.push({
      code: 'PAGE_NUMBERS',
      severity: 'info',
      confidence: 'measured',
      title: 'Page numbers in the text',
      detail: 'Header and footer text sometimes gets merged into your last job entry.',
      fix: 'Remove page numbers and keep anything important in the main body.',
    });
  }

  if (/[☎✉✆📞📧📍🏠🔗★☆●○◉◎]/u.test(clean)) {
    f.push({
      code: 'SYMBOLS',
      severity: 'info',
      confidence: 'measured',
      title: 'Icons used as labels',
      detail: 'Symbols like ✉ or 📞 can confuse contact-detail parsing.',
      fix: 'Write labels in words ("Email:", "Phone:") or drop them.',
    });
  }

  if (overused.length) {
    f.push({
      code: 'STUFFING',
      severity: 'warning',
      confidence: 'measured',
      title: 'Some keywords repeat a lot',
      detail: `${overused.slice(0, 3).join(', ')} appear${overused.length === 1 ? 's' : ''} more than eight times. Repetition doesn't help ranking much and reads as stuffing to the person who opens the file.`,
      fix: 'Keep each key term to a few natural mentions: summary, one or two bullets, and the skills list.',
    });
  }

  if (fileName && /(final|v\d|copy|\(\d\)|untitled|document|resume\.|cv\.|scan)/i.test(fileName)) {
    f.push({
      code: 'FILENAME',
      severity: 'info',
      confidence: 'measured',
      title: 'Generic file name',
      detail: `"${fileName}" is what the recruiter sees in their downloads.`,
      fix: 'Name the file "Firstname-Lastname-Resume.pdf".',
    });
  }

  return f;
}

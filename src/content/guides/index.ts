// src/content/guides/index.ts
import howAts from './how-ats-reads-your-resume';
import keywords from './find-resume-keywords';
import format from './ats-friendly-resume-format';
import score from './ats-score-explained';
import pdf from './pdf-or-docx';
import quantify from './quantify-resume-bullets';
import tailor from './tailor-resume-in-15-minutes';
import intl from './resume-india-us-uk';

export interface Guide {
  slug: string;
  title: string;
  /** Short title for cards and breadcrumbs */
  short: string;
  description: string;
  published: string;
  updated: string;
  /** Markdown subset — see lib/markdown.tsx. `{{ad}}` marks the in-article ad spot. */
  body: string;
  faqs: { q: string; a: string }[];
  related: string[];
}

export const GUIDES: Guide[] = [howAts, keywords, format, score, pdf, quantify, tailor, intl];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}

export function readingMinutes(md: string) {
  return Math.max(3, Math.round(md.split(/\s+/).length / 230));
}

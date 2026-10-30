// src/lib/scan/types.ts
import type { KeywordKind } from './lexicon';

export type Severity = 'critical' | 'warning' | 'info';

export interface Finding {
  code: string;
  severity: Severity;
  title: string;
  detail: string;
  fix: string;
  /** measured = directly observed in the file; heuristic = a strong signal, not proof */
  confidence: 'measured' | 'heuristic';
  evidence?: string;
}

/** Layout facts gathered while reading the file (PDF/DOCX only). */
export interface LayoutSignals {
  format: 'pdf' | 'docx' | 'txt' | 'paste';
  pages?: number;
  /** Share of text lines that sit in a second column (PDF). 0–1. */
  columnShare?: number;
  tables?: number;
  images?: number;
  /** Characters of extractable text per page (PDF). */
  charsPerPage?: number;
}

export type Importance = 'required' | 'preferred' | 'mentioned';

export interface JdKeyword {
  name: string;
  kind: KeywordKind | 'phrase';
  importance: Importance;
  /** How many times the posting mentions it */
  count: number;
  /** Matching forms (lowercase, normalised) */
  forms: string[];
  cased?: string[];
}

export type MatchStatus = 'matched' | 'partial' | 'missing';

export interface KeywordResult extends JdKeyword {
  status: MatchStatus;
  /** Times it appears in the resume */
  resumeCount: number;
  /** True when it only appears in a skills list, never in a sentence/bullet */
  onlyInSkills: boolean;
  /** The resume form that matched, when it differs from the posting's wording */
  matchedAs?: string;
}

export interface ScoreBreakdown {
  keywords: number; // of 45
  title: number; // of 10
  parsing: number; // of 20
  sections: number; // of 10
  impact: number; // of 15
}

export interface ScanReport {
  score: number;
  band: 'strong' | 'good' | 'fair' | 'weak';
  breakdown: ScoreBreakdown;
  keywordMatchPct: number;
  keywords: KeywordResult[];
  findings: Finding[];
  jd: {
    title: string | null;
    yearsRequired: number | null;
    degree: string | null;
  };
  resume: {
    words: number;
    bullets: number;
    quantifiedBullets: number;
    actionVerbBullets: number;
    weakOpeners: string[];
    sections: Record<'contact' | 'summary' | 'experience' | 'education' | 'skills', boolean>;
    titleMatch: 'exact' | 'close' | 'none' | 'unknown';
    overused: string[];
  };
  fixes: string[];
  layout: LayoutSignals;
  createdAt: number;
}

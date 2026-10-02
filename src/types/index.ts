// types/index.ts — Complete type definitions for ATS Scanner Pro

// ── Core Scan Types ────────────────────────────────────────────────────────

export type FileFormat = 'pdf' | 'docx' | 'doc' | 'txt' | 'rtf' | 'odt' | 'unknown';

export interface ScanResult {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  summary: string;
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  semanticMatches: SemanticMatch[];
  sectionScores: SectionScores;
  improvements: string[];
  strengths: string[];
  atsWarnings: string[];
  cached?: boolean;
  analyzedAt: string;
  fileFormat?: FileFormat;
  processingMs?: number;

  /**
   * Anonymous id for this scan, generated server-side.
   * Used ONLY as the join key when a user later reports what happened to the
   * application (POST /api/outcome). It identifies a scan, never a person.
   */
  scanId?: string;

  /**
   * Deterministic formatting findings from lib/atsParseChecks.ts.
   * Produced without an AI call, so it is present even when the model fails.
   */
  parseReport?: ParseReportSummary;

  /**
   * Token for the saved, revisitable copy of this result at /r/<token>.
   * Absent when Upstash is not configured, in which case result links are
   * simply unavailable and the scanner still works normally.
   */
  resultToken?: string;
}

/** Serialisable subset of ParseReport — safe to cache and to store in a
 *  result link, since it contains no resume text beyond short evidence
 *  snippets that have already passed through the PII stripper. */
export interface ParseReportSummary {
  parseScore: number;
  findings: Array<{
    code: string;
    severity: 'critical' | 'warning' | 'info';
    confidence: 'measured' | 'likely' | 'heuristic';
    title: string;
    detail: string;
    fix: string;
    evidence?: string;
  }>;
}

export interface MatchedKeyword {
  keyword: string;
  count: number;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface MissingKeyword {
  keyword: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface SemanticMatch {
  resumeTerm: string;
  jobTerm: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface SectionScores {
  skills: number;
  experience: number;
  education: number;
  formatting: number;
}

// ── Role Types ─────────────────────────────────────────────────────────────

export type RoleCategory =
  | 'Technology'
  | 'Product & Design'
  | 'Business & Operations'
  | 'Finance'
  | 'Marketing'
  | 'Healthcare'
  | 'Human Resources'
  | 'Data & Analytics';

export interface RoleKeyword {
  keyword: string;
  importance: 'critical' | 'high' | 'medium';
}

export interface SalaryRange {
  india: string;
  global: string;
  currency: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Role {
  slug: string;
  title: string;
  category: RoleCategory;
  description: string;
  salaryRange: SalaryRange;
  /** Qualitative judgement, presented as such. Not a measurement. */
  demandTrend: 'very-high' | 'high' | 'stable' | 'declining';
  topKeywords: RoleKeyword[];
  criticalSkills: string[];
  softSkills: string[];
  certifications: string[];
  commonTools: string[];
  faqs: FAQ[];
  relatedRoles: string[];
  resumeTips: string[];
  hiringCompanies: string[];
}

// ── Analytics / Telemetry Types ────────────────────────────────────────────

export interface ScanAnalytics {
  // Identity (no PII)
  scanId: string;              // UUID v4
  sessionHash: string;         // SHA-256(IP + UA) — one-way hash

  // Scan quality metrics
  score: number;
  grade: string;
  roleSlug: string | null;
  roleCategory: string | null;

  // Resume intelligence (no PII)
  fileFormat: FileFormat;
  estimatedWordCount: number;
  sectionsDetected: string[];  // ['skills', 'experience', 'education', ...]
  hasQuantifiedAchievements: boolean;
  resumeLanguage: string;      // 'en', 'hi', etc.

  // Keyword intelligence (for market analysis)
  matchedKeywordsCount: number;
  missingKeywordsCount: number;
  missingCriticalCount: number;
  topMissingKeywords: string[];
  topMatchedKeywords: string[];
  semanticMatchCount: number;

  // Job description intelligence
  jdWordCount: number;
  jdCharCount: number;

  // ATS health
  atsWarningCount: number;
  atsWarningTypes: string[];   // categorized warning types

  // Session metadata
  deviceType: 'mobile' | 'tablet' | 'desktop';
  country: string;             // ISO 3166-1 alpha-2
  referrerDomain: string | null;
  timeOfDay: number;           // 0-23 UTC hour
  dayOfWeek: number;           // 0=Sunday, 6=Saturday

  // Performance
  processingMs: number;
  cacheHit: boolean;
  aiTokensUsed?: number;   // Gemini tokens consumed

  // Market signals
  sectionScores: SectionScores;
  improvements: string[];      // anonymized improvement categories
}

// ── API Types ──────────────────────────────────────────────────────────────

export interface ScanRequest {
  jobDescription: string;
  role?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  retryAfter?: number;
}

export interface RateLimit {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface FileParseResult {
  text: string;
  format: FileFormat;
  wordCount: number;
  pageCount?: number;
  metadata?: Record<string, string>;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  format?: FileFormat;
  detectedType?: string;
}

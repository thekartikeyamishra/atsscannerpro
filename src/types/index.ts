// src/types/index.ts
// Core type definitions for ATS Scanner Pro.

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

export interface MissingKeyword {
  keyword: string;
}

export interface ScanResult {
  roleTitle: string;
  score: number;
  grade: string;
  isMachineReadable: boolean;
  formattingFindings: ParseFinding[];
  foundKeywords: string[];
  missingKeywords: MissingKeyword[];
  suggestions: string[];
  hasActionVerbs: boolean;
  hasQuantifiedMetrics: boolean;
}

export interface ScanHistoryItem {
  token: string;
  roleTitle: string;
  score: number;
  grade: string;
  timestamp: number;
}
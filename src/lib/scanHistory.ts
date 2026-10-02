'use client';
// src/lib/scanHistory.ts
// Browser-local scan history. Nothing here touches the server.
//
// ── WHY LOCAL RATHER THAN AN ACCOUNT ───────────────────────────────────────
//
// The product loop your brief describes is: scan → understand → fix → RESCAN →
// improve → return. The rescan step is the whole point, and it was impossible:
// there was no record of the previous score, so "did my fix work?" had no
// answer beyond the user remembering a number.
//
// The obvious solution is accounts. But accounts mean storing user data, which
// undercuts the strongest claim the product makes about itself. So the first
// version of history lives entirely in the user's own browser: it costs nothing,
// stores nothing server-side, needs no consent banner, and cannot leak.
//
// ── ITS HONEST LIMIT ───────────────────────────────────────────────────────
// This is NOT the switching cost described as Moat 5. localStorage is per-device
// and per-browser, and clearing site data wipes it. It gives the product loop
// and the return trigger without the privacy trade — but a durable, portable
// history still needs real accounts. Do not mistake this for that.
//
// Result LINKS (lib/resultStore.ts) are the portable half: the token stored here
// lets a user reopen a result on another device if they kept the URL.

import type { ScanResult } from '@/types';

const STORAGE_KEY = 'atsp:history:v1';
const MAX_ENTRIES = 25;

export interface HistoryEntry {
  /** Result token, if the scan was saved to a shareable link. */
  token: string | null;
  score: number;
  grade: ScanResult['grade'];
  roleSlug: string | null;
  /** Job description fingerprint — lets us group rescans of the SAME job
   *  without storing the job description itself. */
  jdKey: string;
  scannedAt: string;
}

/**
 * Cheap, non-cryptographic fingerprint of the job description.
 *
 * Used only to group rescans against the same posting. It is not a security
 * boundary and never leaves the browser. A real hash would need SubtleCrypto
 * and an async API for no benefit here.
 */
export function jdFingerprint(jobDescription: string): string {
  const norm = jobDescription.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 2000);
  let h = 5381;
  for (let i = 0; i < norm.length; i++) {
    h = ((h << 5) + h + norm.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function safeRead(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    // Private browsing, disabled storage, or corrupt JSON. History is a
    // convenience — never let it break the scanner.
    return [];
  }
}

function safeWrite(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* quota or unavailable — silently skip */
  }
}

export function getHistory(): HistoryEntry[] {
  return safeRead();
}

export function addToHistory(entry: HistoryEntry): void {
  const existing = safeRead();
  safeWrite([entry, ...existing]);
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export interface Progress {
  /** Previous scan against this same job description, if any. */
  previous: HistoryEntry | null;
  /** Score change since that scan. Positive is improvement. */
  delta: number | null;
  /** How many times this job description has been scanned, including now. */
  attempt: number;
}

/**
 * Compare the current scan against the last one for the SAME job description.
 *
 * This is what turns a score into feedback. "72" tells a user very little;
 * "72, up from 58" tells them their edit worked, which is the only thing that
 * makes a rescan worth doing.
 */
export function getProgressForJD(jdKey: string, currentScore: number): Progress {
  const matches = safeRead().filter((e) => e.jdKey === jdKey);
  const previous = matches[0] ?? null;

  return {
    previous,
    delta: previous ? currentScore - previous.score : null,
    attempt: matches.length + 1,
  };
}

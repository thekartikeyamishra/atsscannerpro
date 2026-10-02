// src/lib/marketIntel.ts
// Server-side only. Aggregation over anonymised scan telemetry.
//
// ── WHY THIS EXISTS (moat #3: a dataset that only accrues by operating) ────
//
// lib/analytics.ts writes scan_analytics and market_signals. Until now nothing
// ever read them — the data was write-only, which is the same as not collecting
// it. This module turns that exhaust into the one asset a competitor cannot
// copy and a language model cannot generate: a longitudinal record of what
// employers actually asked for, by role, by month, measured rather than
// recalled.
//
// A model can tell you which skills are *generally* associated with a role,
// from its training data, frozen at its cutoff. It cannot tell you which terms
// appeared in job descriptions people pasted in last month, or that a term is
// rising. That requires having been running, with users, over time. There is
// no shortcut to elapsed time.
//
// ── THE RULE THAT MAKES IT CREDIBLE ────────────────────────────────────────
// Nothing is published below MIN_SAMPLE. Your own brief is explicit: do not
// imply statistical significance without sufficient sample size, and do not
// create research pages until there is enough legitimate data. Every function
// here returns `null` or `insufficient` rather than a small-sample number, and
// the UI is built to render that state honestly rather than hide it.
//
// A thin statistic published confidently would destroy exactly the credibility
// this data is meant to build.

import type { Firestore } from 'firebase-admin/firestore';

/** Below this, we report "not enough data" instead of a number. */
export const MIN_SAMPLE = 100;

/** Below this for a keyword, it is noise and is dropped entirely. */
const MIN_KEYWORD_OCCURRENCES = 10;

let dbPromise: Promise<Firestore | null> | null = null;

function getDb(): Promise<Firestore | null> {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) return null;
    try {
      const [{ getApps, initializeApp, cert }, { getFirestore }] = await Promise.all([
        import('firebase-admin/app'),
        import('firebase-admin/firestore'),
      ]);
      const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8');
      const app =
        getApps().find((a) => a.name === 'analytics') ??
        initializeApp({ credential: cert(JSON.parse(json)) }, 'analytics');
      return getFirestore(app);
    } catch {
      return null;
    }
  })();
  return dbPromise;
}

// ── Outcome capture ─────────────────────────────────────────────────────────
export interface OutcomeInput {
  scanId: string;
  outcome: 'callback' | 'rejected' | 'no_response' | 'not_applied';
  daysElapsed: number | null;
}

/**
 * Record what actually happened after a scan.
 *
 * Stored in its own collection keyed by scanId, so one scan yields at most one
 * outcome and a resubmission overwrites rather than double-counts. We store no
 * identifier that could link this back to a person.
 */
export async function recordScanOutcome(input: OutcomeInput): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.collection('scan_outcomes').doc(input.scanId).set(
    {
      scanId: input.scanId,
      outcome: input.outcome,
      daysElapsed: input.daysElapsed,
      recordedAt: new Date(),
    },
    { merge: true },
  );
}

// ── Aggregates ──────────────────────────────────────────────────────────────
export interface KeywordDemand {
  keyword: string;
  /** How many scans in the window were missing this term. */
  occurrences: number;
  /** Share of scans for this role that lacked it, 0–1. */
  share: number;
}

export interface RoleInsight {
  roleSlug: string;
  sampleSize: number;
  windowStart: string;
  windowEnd: string;
  topMissingKeywords: KeywordDemand[];
  medianScore: number | null;
  commonParseIssues: Array<{ code: string; share: number }>;
}

export type InsightResult =
  | { status: 'ok'; data: RoleInsight }
  | { status: 'insufficient'; sampleSize: number; needed: number }
  | { status: 'unavailable' };

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * What were employers asking for, for this role, over the last N days?
 *
 * Returns `insufficient` rather than a number when the sample is too small.
 * Callers must render that state — do not fall back to a placeholder figure.
 */
export async function getRoleInsight(roleSlug: string, days = 90): Promise<InsightResult> {
  const db = await getDb();
  if (!db) return { status: 'unavailable' };

  const since = new Date(Date.now() - days * 86400000);

  let docs;
  try {
    const snap = await db
      .collection('scan_analytics')
      .where('roleSlug', '==', roleSlug)
      .where('createdAt', '>=', since)
      .limit(5000)
      .get();
    docs = snap.docs.map((d) => d.data());
  } catch {
    // Most likely a missing composite index. firestore.indexes.json needs an
    // index on (roleSlug ASC, createdAt ASC) — see APPLY-4.md.
    return { status: 'unavailable' };
  }

  if (docs.length < MIN_SAMPLE) {
    return { status: 'insufficient', sampleSize: docs.length, needed: MIN_SAMPLE };
  }

  const keywordCounts = new Map<string, number>();
  const parseIssueCounts = new Map<string, number>();
  const scores: number[] = [];

  for (const d of docs) {
    if (typeof d.score === 'number') scores.push(d.score);

    for (const kw of (d.topMissingKeywords as string[] | undefined) ?? []) {
      const norm = kw.toLowerCase().trim();
      if (norm.length < 2 || norm.length > 40) continue;
      keywordCounts.set(norm, (keywordCounts.get(norm) ?? 0) + 1);
    }
    for (const code of (d.atsWarningTypes as string[] | undefined) ?? []) {
      parseIssueCounts.set(code, (parseIssueCounts.get(code) ?? 0) + 1);
    }
  }

  const topMissingKeywords: KeywordDemand[] = [...keywordCounts.entries()]
    .filter(([, n]) => n >= MIN_KEYWORD_OCCURRENCES)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([keyword, occurrences]) => ({
      keyword,
      occurrences,
      share: Number((occurrences / docs.length).toFixed(3)),
    }));

  const commonParseIssues = [...parseIssueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([code, n]) => ({ code, share: Number((n / docs.length).toFixed(3)) }));

  return {
    status: 'ok',
    data: {
      roleSlug,
      sampleSize: docs.length,
      windowStart: since.toISOString().slice(0, 10),
      windowEnd: new Date().toISOString().slice(0, 10),
      topMissingKeywords,
      medianScore: median(scores),
      commonParseIssues,
    },
  };
}

// ── Score calibration ───────────────────────────────────────────────────────
export interface CalibrationBand {
  scoreRange: string;
  sampleSize: number;
  /** Share reporting a callback, 0–1. Null when the band is too small. */
  callbackRate: number | null;
}

export type CalibrationResult =
  | { status: 'ok'; bands: CalibrationBand[]; totalOutcomes: number; asOf: string }
  | { status: 'insufficient'; totalOutcomes: number; needed: number }
  | { status: 'unavailable' };

/**
 * Does our score correlate with getting a response?
 *
 * This is the question the whole outcome loop exists to answer. Publish the
 * result whatever it says — including if it turns out the score does not
 * predict callbacks well. Being the only people who measured it is the asset;
 * a flattering answer is not required, and claiming one we did not measure
 * would forfeit the entire point.
 */
export async function getScoreCalibration(): Promise<CalibrationResult> {
  const db = await getDb();
  if (!db) return { status: 'unavailable' };

  let outcomes;
  try {
    const snap = await db.collection('scan_outcomes').limit(10000).get();
    outcomes = snap.docs.map((d) => d.data());
  } catch {
    return { status: 'unavailable' };
  }

  const usable = outcomes.filter((o) => o.outcome !== 'not_applied');
  if (usable.length < MIN_SAMPLE) {
    return { status: 'insufficient', totalOutcomes: usable.length, needed: MIN_SAMPLE };
  }

  // Join each outcome to its scan's score. Chunked: Firestore caps documentId()
  // `in` queries at 30 values.
  const scoreById = new Map<string, number>();
  const ids = usable.map((o) => String(o.scanId));

  for (let i = 0; i < ids.length; i += 30) {
    const chunk = ids.slice(i, i + 30);
    try {
      const { FieldPath } = await import('firebase-admin/firestore');
      const snap = await db
        .collection('scan_analytics')
        .where(FieldPath.documentId(), 'in', chunk)
        .get();
      for (const d of snap.docs) {
        const score = d.data().score;
        if (typeof score === 'number') scoreById.set(d.id, score);
      }
    } catch {
      /* skip this chunk rather than fail the whole report */
    }
  }

  const BANDS = [
    { label: '0–39', min: 0, max: 39 },
    { label: '40–59', min: 40, max: 59 },
    { label: '60–79', min: 60, max: 79 },
    { label: '80–100', min: 80, max: 100 },
  ];

  const bands: CalibrationBand[] = BANDS.map((band) => {
    const inBand = usable.filter((o) => {
      const s = scoreById.get(String(o.scanId));
      return s !== undefined && s >= band.min && s <= band.max;
    });
    const callbacks = inBand.filter((o) => o.outcome === 'callback').length;
    return {
      scoreRange: band.label,
      sampleSize: inBand.length,
      // Per-band floor as well as an overall floor: a 3-person band must not
      // be rendered as "67% callback rate".
      callbackRate: inBand.length >= 30 ? Number((callbacks / inBand.length).toFixed(3)) : null,
    };
  });

  return {
    status: 'ok',
    bands,
    totalOutcomes: usable.length,
    asOf: new Date().toISOString().slice(0, 10),
  };
}

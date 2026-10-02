// src/lib/analytics.ts
// Server-side only. Anonymised scan telemetry. No PII is ever written here.
//
// WHY THIS FILE WAS REWRITTEN
// The old version imported the Firebase *client* SDK ('firebase/app',
// 'firebase/firestore') inside a server route and authenticated with the
// NEXT_PUBLIC_* browser config. That has two problems:
//
//   1. Client SDK writes are evaluated against firestore.rules. Once the rules
//      are locked down (as they now are), every write is denied. Because every
//      call site swallows errors in an empty catch, you would see no telemetry
//      and no error — exactly the state the project is in today.
//   2. Making it work would require leaving Firestore world-writable, which is
//      how the database ended up publicly exposed in the first place.
//
// The Admin SDK is the correct tool: it authenticates with a service account,
// bypasses security rules legitimately, and never ships to the browser.
//
// SETUP: add FIREBASE_SERVICE_ACCOUNT_KEY to your environment (see .env.example).
// If it is absent, telemetry degrades to a no-op and logs ONE warning rather
// than failing silently forever.

import { randomUUID } from 'crypto';
import type { ScanResult, ScanAnalytics, FileFormat } from '@/types';

// ── Admin SDK (lazy, single init) ───────────────────────────────────────────
type Firestore = import('firebase-admin/firestore').Firestore;

let dbPromise: Promise<Firestore | null> | null = null;
let warned = false;

function warnOnce(message: string): void {
  if (warned) return;
  warned = true;
  console.warn(`[analytics] ${message} Telemetry is disabled.`);
}

function getDb(): Promise<Firestore | null> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) {
      warnOnce('FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
      return null;
    }

    try {
      const [{ getApps, initializeApp, cert }, { getFirestore }] = await Promise.all([
        import('firebase-admin/app'),
        import('firebase-admin/firestore'),
      ]);

      // Accept either raw JSON or base64-encoded JSON (easier in some CI/host UIs).
      const json = raw.trim().startsWith('{')
        ? raw
        : Buffer.from(raw, 'base64').toString('utf-8');
      const credentials = JSON.parse(json);

      const app =
        getApps().find((a) => a.name === 'analytics') ??
        initializeApp({ credential: cert(credentials) }, 'analytics');

      return getFirestore(app);
    } catch (err) {
      warnOnce(
        `Failed to initialise the Admin SDK (${err instanceof Error ? err.message : 'unknown error'}).`,
      );
      return null;
    }
  })();

  return dbPromise;
}

// ── Categorisation helpers ──────────────────────────────────────────────────
function categorizeWarnings(warnings: string[]): string[] {
  const out = new Set<string>();
  for (const warning of warnings) {
    const w = warning.toLowerCase();
    if (w.includes('table') || w.includes('column')) out.add('layout_table');
    else if (w.includes('image') || w.includes('graphic')) out.add('image_content');
    else if (w.includes('font') || w.includes('character')) out.add('font_encoding');
    else if (w.includes('header') || w.includes('footer')) out.add('header_footer');
    else if (w.includes('date') || w.includes('format')) out.add('date_format');
    else if (w.includes('length') || w.includes('page')) out.add('length_issue');
    else out.add('other');
  }
  return [...out];
}

function categorizeImprovements(improvements: string[]): string[] {
  const out = new Set<string>();
  for (const imp of improvements) {
    const i = imp.toLowerCase();
    if (i.includes('keyword') || i.includes('skill')) out.add('keyword_gap');
    else if (i.includes('quantif') || i.includes('metric') || i.includes('number'))
      out.add('needs_metrics');
    else if (i.includes('format') || i.includes('structure')) out.add('formatting');
    else if (i.includes('summary') || i.includes('objective')) out.add('summary_missing');
    else if (i.includes('certif') || i.includes('course')) out.add('certifications');
    else if (i.includes('action') || i.includes('verb')) out.add('weak_language');
    else out.add('other');
  }
  return [...out];
}

function getWeekKey(now: Date): string {
  // ISO-8601 week number. The old implementation mixed local getDay() with a
  // UTC-derived offset and drifted by a week around year boundaries.
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ── Public API ──────────────────────────────────────────────────────────────
export interface CollectParams {
  scanResult: ScanResult;
  roleSlug: string | null;
  roleCategory: string | null;
  fileFormat: FileFormat;
  wordCount: number;
  sectionsDetected: string[];
  hasQuantifiedAchievements: boolean;
  jdWordCount: number;
  processingMs: number;
  cacheHit: boolean;
  sessionHash: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  country: string;
  referrerDomain: string | null;
}

/**
 * Write scan telemetry and return the anonymous scanId.
 *
 * The id is generated even when the database is unavailable, because it is the
 * join key the outcome loop needs (lib/marketIntel.ts). Returning null here
 * would mean no outcome could ever be attached to this scan.
 */
export async function collectScanAnalytics(params: CollectParams): Promise<string> {
  const scanId = randomUUID();
  const db = await getDb();
  if (!db) return scanId;

  const { scanResult } = params;
  const now = new Date();

  const analytics: ScanAnalytics = {
    scanId,
    sessionHash: params.sessionHash,

    score: Math.round(scanResult.score),
    grade: scanResult.grade,
    roleSlug: params.roleSlug,
    roleCategory: params.roleCategory,

    fileFormat: params.fileFormat,
    estimatedWordCount: params.wordCount,
    sectionsDetected: params.sectionsDetected,
    hasQuantifiedAchievements: params.hasQuantifiedAchievements,
    resumeLanguage: 'en',

    matchedKeywordsCount: scanResult.matchedKeywords.length,
    missingKeywordsCount: scanResult.missingKeywords.length,
    missingCriticalCount: scanResult.missingKeywords.filter((k) => k.importance === 'critical')
      .length,
    topMissingKeywords: scanResult.missingKeywords
      .filter((k) => k.importance === 'critical' || k.importance === 'high')
      .slice(0, 10)
      .map((k) => k.keyword),
    topMatchedKeywords: scanResult.matchedKeywords
      .filter((k) => k.importance === 'critical' || k.importance === 'high')
      .slice(0, 10)
      .map((k) => k.keyword),
    semanticMatchCount: scanResult.semanticMatches.length,

    jdWordCount: params.jdWordCount,
    jdCharCount: params.jdWordCount * 5, // estimate — flagged as such in /methodology

    atsWarningCount: scanResult.atsWarnings.length,
    atsWarningTypes: categorizeWarnings(scanResult.atsWarnings),

    deviceType: params.deviceType,
    country: params.country,
    referrerDomain: params.referrerDomain,
    timeOfDay: now.getUTCHours(),
    dayOfWeek: now.getUTCDay(),

    processingMs: params.processingMs,
    cacheHit: params.cacheHit,

    sectionScores: scanResult.sectionScores,
    improvements: categorizeImprovements(scanResult.improvements),
  };

  try {
    const batch = db.batch();
    batch.set(db.collection('scan_analytics').doc(analytics.scanId), {
      ...analytics,
      createdAt: new Date(),
    });

    if (analytics.topMissingKeywords.length > 0) {
      batch.set(db.collection('market_signals').doc(), {
        type: 'missing_keywords',
        keywords: analytics.topMissingKeywords,
        roleSlug: analytics.roleSlug,
        roleCategory: analytics.roleCategory,
        country: analytics.country,
        weekOf: getWeekKey(now),
        createdAt: new Date(),
      });
    }

    await batch.commit();
    return scanId;
  } catch (err) {
    // Telemetry must never break a scan, but it should be visible in logs so a
    // silent outage cannot last for months again.
    console.warn('[analytics] scan write failed:', err instanceof Error ? err.message : err);
    return scanId;
  }
}

export async function trackPageView(params: {
  page: string;
  roleSlug: string | null;
  referrerDomain: string | null;
  country: string;
  deviceType: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.collection('page_views').add({ ...params, createdAt: new Date() });
  } catch (err) {
    console.warn('[analytics] page view write failed:', err instanceof Error ? err.message : err);
  }
}

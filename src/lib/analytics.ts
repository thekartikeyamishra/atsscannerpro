// src/lib/analytics.ts
// Server-side telemetry using Firebase Admin.
//
// DESIGN PRINCIPLES:
// 1. Privacy-First: Absolutely no PII, raw text, IPs, or user identifiers are logged.
// 2. Non-Blocking: Telemetry must never delay a user response or throw a 500 error if it fails.
// 3. Market Intel: We aggregate score buckets, grades, and real-world outcomes to build 
//    our proprietary dataset for the insights engine.

import * as admin from 'firebase-admin';

// Initialize Firebase Admin safely for Next.js hot-reloading environments
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newline characters from environment variables
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export interface ScanTelemetry {
  /** The final calculated score (0-100) */
  score: number;
  /** The letter grade assigned (A+, B, etc.) */
  grade: string;
  /** The target role slug (e.g., 'frontend-engineer') */
  roleSlug: string;
  /** How long the Gemini API and parsing pipeline took */
  processingTimeMs: number;
  /** Count of missing critical keywords */
  missingKeywordCount: number;
  /** Whether the parser detected major formatting/extraction risks */
  hasFormattingIssues: boolean;
}

export interface OutcomeTelemetry {
  /** The anonymous token/ID linking back to the original scan metrics */
  scanId: string;
  /** The real-world application result */
  outcome: 'callback' | 'rejected' | 'no_response' | 'not_applied';
}

/**
 * Logs high-level, anonymized scan metrics to Firestore.
 * This is a fire-and-forget operation.
 */
export async function logScanMetrics(data: ScanTelemetry): Promise<void> {
  if (!db) return;

  try {
    // We intentionally do not await this in the main request handler
    // to ensure telemetry never adds latency to the user experience.
    db.collection('telemetry_scans').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }).catch(() => {
      // Silently swallow network/permission errors in production
    });
  } catch (error) {
    // Failsafe catch for synchronous errors
  }
}

/**
 * Logs the real-world outcome of a resume submission.
 * This is the collection point for the proprietary dataset.
 */
export async function logApplicationOutcome(data: OutcomeTelemetry): Promise<void> {
  if (!db) return;

  try {
    db.collection('telemetry_outcomes').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }).catch(() => {
      // Silently swallow errors
    });
  } catch (error) {
    // Failsafe catch
  }
}
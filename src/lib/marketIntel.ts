// src/lib/marketIntel.ts
// Aggregates role demand and callback probabilities.
//
// DESIGN PRINCIPLES:
// 1. Caching: Firestore aggregations are expensive. All intel queries must be cached 
//    heavily via the L1/L2 caching tier to keep the page instantaneous.
// 2. Graceful Degradation: If the database is unreachable or the dataset for a specific 
//    role is too small (cold start), return sensible heuristic defaults rather than failing.
// 3. Anonymity: Aggregates only. No individual scan outcomes are ever exposed.

import * as admin from 'firebase-admin';
import { fetchWithCache } from './cache';

// Safely initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('[MarketIntel] Firebase Admin init error:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export interface RoleIntel {
  /** The specific role slug (e.g., 'frontend-engineer') */
  roleSlug: string;
  /** Relative demand score (0-100) based on scan volume */
  demandScore: number;
  /** Average ATS score seen for this role */
  avgScore: number;
  /** Estimated probability of a callback based on historical outcomes (0.0 to 1.0) */
  callbackRate: number;
  /** Total number of data points collected (used for confidence intervals) */
  dataPoints: number;
}

export interface ScoreProbability {
  scoreRange: string;
  callbackChance: number;
}

/**
 * Calculates the callback probability for a specific score bucket.
 * Leverages the cached aggregates to power the insights UI.
 */
export async function getCallbackProbabilitiesByScore(): Promise<ScoreProbability[]> {
  const CACHE_KEY = 'intel_callback_probabilities';
  const CACHE_TTL = 3600 * 24; // 24 hours (intel changes slowly)

  return fetchWithCache<ScoreProbability[]>(CACHE_KEY, async () => {
    // If DB is unavailable, return baseline heuristics
    if (!db) return getBaselineProbabilities();

    try {
      // In a mature production environment, these aggregates are calculated via a CRON job
      // and stored in a dedicated 'market_intel_aggregates' collection to avoid querying
      // thousands of raw outcome documents on the fly.
      const doc = await db.collection('market_intel').doc('global_probabilities').get();
      
      if (doc.exists && doc.data()?.buckets) {
        return doc.data()?.buckets as ScoreProbability[];
      }
      
      // Fallback if the CRON job hasn't run or data is missing
      return getBaselineProbabilities();
    } catch (error) {
      console.error('[MarketIntel] Failed to fetch callback probabilities:', error);
      return getBaselineProbabilities();
    }
  }, CACHE_TTL);
}

/**
 * Retrieves market intelligence for a specific role.
 * Used on the Role Guides pages to show competitive landscapes.
 */
export async function getRoleMarketIntel(roleSlug: string): Promise<RoleIntel> {
  const CACHE_KEY = `intel_role_${roleSlug}`;
  const CACHE_TTL = 3600 * 6; // 6 hours

  return fetchWithCache<RoleIntel>(CACHE_KEY, async () => {
    const fallback: RoleIntel = {
      roleSlug,
      demandScore: 50,
      avgScore: 68,
      callbackRate: 0.12,
      dataPoints: 0,
    };

    if (!db) return fallback;

    try {
      const doc = await db.collection('market_intel_roles').doc(roleSlug).get();
      
      if (doc.exists) {
        const data = doc.data()!;
        return {
          roleSlug,
          demandScore: data.demandScore ?? fallback.demandScore,
          avgScore: data.avgScore ?? fallback.avgScore,
          callbackRate: data.callbackRate ?? fallback.callbackRate,
          dataPoints: data.dataPoints ?? 0,
        };
      }

      return fallback;
    } catch (error) {
      console.error(`[MarketIntel] Failed to fetch intel for role ${roleSlug}:`, error);
      return fallback;
    }
  }, CACHE_TTL);
}

/**
 * Provides deterministic baseline heuristics for cold-starts or DB outages.
 * Based on industry-standard ATS pass rates prior to proprietary data collection.
 */
function getBaselineProbabilities(): ScoreProbability[] {
  return [
    { scoreRange: '90-100', callbackChance: 0.65 }, // 65% callback rate for top decile
    { scoreRange: '80-89', callbackChance: 0.42 },
    { scoreRange: '70-79', callbackChance: 0.18 },
    { scoreRange: '60-69', callbackChance: 0.05 },
    { scoreRange: '0-59', callbackChance: 0.01 },   // Auto-reject territory
  ];
}
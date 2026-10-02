// src/app/api/waitlist/route.ts
//
// Webhook for capturing invite-only mobile app waitlist leads.
// Uses the Admin SDK lazy-initialization pattern to bypass client security 
// rules and write securely to the `waitlist_leads` collection.

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

// ── Admin SDK (lazy, single init) ───────────────────────────────────────────
type Firestore = import('firebase-admin/firestore').Firestore;

let dbPromise: Promise<Firestore | null> | null = null;

function getDb(): Promise<Firestore | null> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) {
      console.warn('[waitlist] FIREBASE_SERVICE_ACCOUNT_KEY is not set. Leads will not be saved.');
      return null;
    }

    try {
      const [{ getApps, initializeApp, cert }, { getFirestore }] = await Promise.all([
        import('firebase-admin/app'),
        import('firebase-admin/firestore'),
      ]);

      const json = raw.trim().startsWith('{')
        ? raw
        : Buffer.from(raw, 'base64').toString('utf-8');
      
      const app =
        getApps().find((a) => a.name === 'analytics') ??
        initializeApp({ credential: cert(JSON.parse(json)) }, 'analytics');

      return getFirestore(app);
    } catch (err) {
      console.warn(`[waitlist] Failed to initialise Admin SDK: ${err instanceof Error ? err.message : 'unknown error'}`);
      return null;
    }
  })();

  return dbPromise;
}

// ── POST /api/waitlist ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    let body: { email?: unknown; platform?: unknown; source?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { email, platform, source } = body;

    // 1. Validate Input
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // 2. Strict Rate Limiting (Prevent waitlist spamming)
    // 5 attempts per hour per IP
    const ip = getClientIP(request);
    const limit = await checkRateLimit(`waitlist:${ip}`, 5, 60 * 60 * 1000);

    if (!limit.allowed) {
      const retryAfterSec = Math.ceil((limit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429, 
          headers: { 
            'Retry-After': String(retryAfterSec),
            'Cache-Control': 'no-store'
          } 
        }
      );
    }

    // 3. Write to Firestore
    const db = await getDb();
    if (db) {
      const cleanEmail = email.toLowerCase().trim();
      
      // Use email as document ID to naturally prevent duplicate entries, 
      // but use merge: true to update their platform interest if they re-apply.
      await db.collection('waitlist_leads').doc(cleanEmail).set({
        email: cleanEmail,
        platform: typeof platform === 'string' ? platform.slice(0, 50) : 'unknown',
        source: typeof source === 'string' ? source.slice(0, 50) : 'web',
        lastUpdated: new Date(),
      }, { merge: true });
    }

    // Return 200 OK even if DB is missing (graceful fallback for UI during local dev)
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    console.error('[waitlist] Processing error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
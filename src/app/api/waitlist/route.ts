// POST /api/waitlist — invite-list signups for the mobile app.
// Stores the minimum: email, platform, optional role, consent time, source.
// No IP address is stored; it's only used (hashed, in memory or Redis) for rate limiting.

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/server/rateLimit';

export const dynamic = 'force-dynamic';

type Firestore = import('firebase-admin/firestore').Firestore;
let dbPromise: Promise<Firestore | null> | null = null;

function getDb(): Promise<Firestore | null> {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) return null;
    try {
      const [{ getApps, initializeApp, cert }, { getFirestore }] = await Promise.all([import('firebase-admin/app'), import('firebase-admin/firestore')]);
      const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
      const app = getApps().find((a) => a.name === 'waitlist') ?? initializeApp({ credential: cert(JSON.parse(json)) }, 'waitlist');
      return getFirestore(app);
    } catch (err) {
      console.error('[waitlist] Firebase Admin init failed:', err instanceof Error ? err.message : err);
      return null;
    }
  })();
  return dbPromise;
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
const PLATFORMS = new Set(['android', 'ios', 'both']);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Bots fill the hidden field; pretend success so they move on.
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: 'Please confirm we can email you.' }, { status: 400 });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const limit = await rateLimit(`waitlist:${ip}`, 5, 60 * 60);
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
  }

  const db = await getDb();
  if (!db) {
    console.error('[waitlist] FIREBASE_SERVICE_ACCOUNT_KEY is not set — signup NOT saved.');
    return NextResponse.json({ error: 'The invite list is temporarily unavailable. Please email us instead.' }, { status: 503 });
  }

  const platform = typeof body.platform === 'string' && PLATFORMS.has(body.platform) ? body.platform : 'android';
  const role = typeof body.role === 'string' ? body.role.replace(/[<>]/g, '').trim().slice(0, 60) : '';
  const source = typeof body.source === 'string' ? body.source.replace(/[^\w-]/g, '').slice(0, 30) : 'web';

  try {
    const ref = db.collection('waitlist_leads').doc(email);
    const snap = await ref.get();
    await ref.set(
      {
        email,
        platform,
        role,
        source,
        consentAt: new Date(),
        updatedAt: new Date(),
        ...(snap.exists ? {} : { createdAt: new Date(), invited: false }),
      },
      { merge: true },
    );
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[waitlist] write failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'We couldn\'t save that. Please try again.' }, { status: 500 });
  }
}

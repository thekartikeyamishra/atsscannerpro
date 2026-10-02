// src/app/api/analytics/route.ts
// Lightweight page-view tracking. Anonymised, no PII.
//
// WHAT CHANGED AND WHY
// This route defined its own private trackPageView() that initialised the
// Firebase *client* SDK with the NEXT_PUBLIC_ browser config — a fourth copy of
// the same pattern, and one that stopped working the moment the Firestore rules
// were locked down. It now calls the shared Admin-SDK implementation in
// lib/analytics.ts, which authenticates properly and logs failures instead of
// swallowing them.

import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/rateLimiter';
import { checkRateLimit } from '@/lib/rateLimiter';
import { trackPageView } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { page?: string; roleSlug?: string };

    if (!body.page || typeof body.page !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // This endpoint was previously unlimited: anyone could POST in a loop and
    // run up unbounded Firestore document writes on your bill.
    const ip = getClientIP(request);
    const limit = await checkRateLimit(`pv:${ip}`, 60, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const ua = request.headers.get('user-agent') ?? '';
    const deviceType = /iPad|Tablet/i.test(ua)
      ? 'tablet'
      : /Mobile|Android|iPhone/i.test(ua)
        ? 'mobile'
        : 'desktop';

    const country =
      request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry') ??
      'unknown';

    let referrerDomain: string | null = null;
    const referrer = request.headers.get('referer');
    if (referrer) {
      try {
        referrerDomain = new URL(referrer).hostname;
      } catch {
        /* malformed referer — ignore */
      }
    }

    // Fire and forget: telemetry must never delay or fail a page view.
    void trackPageView({
      page: body.page.slice(0, 200),
      roleSlug: typeof body.roleSlug === 'string' ? body.roleSlug.slice(0, 80) : null,
      deviceType,
      country,
      referrerDomain,
    });

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    // Analytics must never surface an error to the user.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
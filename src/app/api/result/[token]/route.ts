// src/app/api/result/[token]/route.ts
// Fetch or revoke a saved scan result.
//
// The token IS the credential — there is no account to authenticate against.
// That is why generateResultToken() uses 192 bits: enumeration has to be
// infeasible, because nothing else protects a result.

import { NextRequest, NextResponse } from 'next/server';
import { loadResult, deleteResult, isValidToken } from '@/lib/resultStore';
import { checkRateLimit, getClientIP } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

// NOTE: params is a Promise in this Next version. Awaiting it is required.
type Ctx = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  // Rate limited because the token space, while large, is publicly guessable
  // in principle. This makes scanning for valid tokens pointless in practice.
  const limit = await checkRateLimit(`result:${getClientIP(request)}`, 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const stored = await loadResult(token);
  if (!stored) {
    return NextResponse.json({ error: 'Not found or expired.' }, { status: 404 });
  }

  return NextResponse.json(stored, {
    // no-store: a result link is semi-private. It must not sit in a shared CDN
    // cache where a later request for the same URL could be served it.
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const limit = await checkRateLimit(`resultdel:${getClientIP(request)}`, 20, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  await deleteResult(token);

  // Always 200, whether or not it existed. Distinguishing "deleted" from
  // "never existed" would confirm which tokens are real.
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
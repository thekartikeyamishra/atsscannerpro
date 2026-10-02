// src/app/api/outcome/route.ts
//
// ── WHY THIS EXISTS (moat #2: ground truth) ────────────────────────────────
//
// Every ATS tool on the market, including this one, scores a resume against a
// job description and then has no idea whether that score meant anything. The
// number is an assertion. Nobody validates it, because validation requires
// something no model can generate: what actually happened to the applicant.
//
// This endpoint captures that. When a user comes back and tells us a scan led
// to a callback — or didn't — we can, at sufficient volume, answer a question
// no competitor and no language model can answer from first principles:
//
//     "Does our score correlate with getting a response at all?"
//
// It might not. That result would be worth knowing and worth publishing. The
// point of the moat is not that the answer is flattering; it is that we would
// be the only people holding the evidence either way.
//
// ── PRIVACY ────────────────────────────────────────────────────────────────
// We store the scan's own id, a coarse outcome, and nothing else. No company,
// no job title, no free text, no user identifier. There is deliberately no way
// to link an outcome back to a person, which is also why we cannot dedupe
// beyond rate limiting — an acceptable trade.

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rateLimiter';
import { recordScanOutcome } from '@/lib/marketIntel';

export const dynamic = 'force-dynamic';

// Coarse buckets only. Free text would invite PII and would not aggregate.
const OUTCOMES = ['callback', 'rejected', 'no_response', 'not_applied'] as const;
type Outcome = (typeof OUTCOMES)[number];

function isOutcome(v: unknown): v is Outcome {
  return typeof v === 'string' && (OUTCOMES as readonly string[]).includes(v);
}

export async function POST(request: NextRequest) {
  let body: { scanId?: unknown; outcome?: unknown; daysElapsed?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  if (!isOutcome(body.outcome)) {
    return NextResponse.json(
      { ok: false, error: `outcome must be one of: ${OUTCOMES.join(', ')}` },
      { status: 400 },
    );
  }

  // scanId is a UUID we generated. Validate the shape so this cannot be used
  // to write arbitrary document ids.
  const scanId = typeof body.scanId === 'string' ? body.scanId.trim() : '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(scanId)) {
    return NextResponse.json({ ok: false, error: 'Invalid scanId.' }, { status: 400 });
  }

  const days =
    typeof body.daysElapsed === 'number' && Number.isFinite(body.daysElapsed)
      ? Math.max(0, Math.min(365, Math.round(body.daysElapsed)))
      : null;

  // Tight limit: this endpoint writes to the dataset the whole moat rests on.
  // Poisoning it with automated submissions would be the cheapest possible
  // attack on the one asset that is genuinely hard to rebuild.
  const limit = await checkRateLimit(`outcome:${getClientIP(request)}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many submissions. Try again later.' },
      { status: 429 },
    );
  }

  try {
    await recordScanOutcome({ scanId, outcome: body.outcome, daysElapsed: days });
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    // Never surface an internal failure for an optional, altruistic action.
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
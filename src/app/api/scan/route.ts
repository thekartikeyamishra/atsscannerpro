// src/app/api/scan/route.ts
// ATS Scanner Pro — Production scan API
// Multi-format parsing -> PII strip -> cache -> Gemini -> cache write -> telemetry

import { NextRequest, NextResponse } from 'next/server';
import { parseResumeFile, validateResumeUpload } from '@/lib/fileParser';
import { stripPII } from '@/lib/piiStripper';
import { runParseChecks } from '@/lib/atsParseChecks';
import { analyzeResumeWithAI } from '@/lib/gemini';
import { getCachedResult, setCachedResult, cacheKey } from '@/lib/cache';
import { checkRateLimit, getClientIP } from '@/lib/rateLimiter';
import { detectPromptInjection, generateSessionHash } from '@/lib/security';
import { collectScanAnalytics } from '@/lib/analytics';
import { generateResultToken, saveResult } from '@/lib/resultStore';
import type { ScanResult } from '@/types';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ── POST /api/scan ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // ── 1. Our own rate limit (protects the Gemini quota) ───
  const clientIP  = getClientIP(request);
  const rateLimit = await checkRateLimit(clientIP, 8, 10 * 60 * 1000); // 8 per 10 min

  if (!rateLimit.allowed) {
    const retryAfterSec = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        error:      `Rate limit reached. Please wait ${Math.ceil(retryAfterSec / 60)} minute(s) before scanning again.`,
        code:       'RATE_LIMITED',
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          'Retry-After':          String(retryAfterSec),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(rateLimit.resetAt),
        },
      }
    );
  }

  // ── 2. Parse FormData ─────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request. Expected multipart/form-data.', code: 'INVALID_FORMAT' },
      { status: 400 }
    );
  }

  const file           = formData.get('file') as File | null;
  const jobDescription = (formData.get('jobDescription') as string | null)?.trim() ?? '';
  const role           = (formData.get('role') as string | null)?.trim() ?? '';

  // ── 3. Validate ───────────────────────────────────────────────────────
  if (!file) {
    return NextResponse.json({ error: 'Resume file is required.', code: 'MISSING_FILE' }, { status: 400 });
  }

  const fileValidation = validateResumeUpload(file);
  if (!fileValidation.valid) {
    return NextResponse.json({ error: fileValidation.error, code: 'INVALID_FILE' }, { status: 400 });
  }

  if (jobDescription.length < 50) {
    return NextResponse.json(
      { error: 'Job description must be at least 50 characters for accurate analysis.', code: 'JD_TOO_SHORT' },
      { status: 400 }
    );
  }
  if (jobDescription.length > 10000) {
    return NextResponse.json(
      { error: 'Job description is too long. Please trim to under 10,000 characters.', code: 'JD_TOO_LONG' },
      { status: 400 }
    );
  }

  // ── 4. Prompt injection check ─────────────────────────────────────────
  if (detectPromptInjection(jobDescription)) {
    return NextResponse.json(
      { error: 'Job description contains invalid content. Please paste a real job posting.', code: 'INVALID_CONTENT' },
      { status: 400 }
    );
  }

  // ── 5. Parse resume file ──────────────────────────────────────────────
  let parseResult: Awaited<ReturnType<typeof parseResumeFile>>;
  try {
    parseResult = await parseResumeFile(file);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to read file.';
    return NextResponse.json({ error: msg, code: 'FILE_PARSE_ERROR' }, { status: 422 });
  }

  if (parseResult.text.length < 100) {
    return NextResponse.json(
      {
        error: 'Could not extract enough text from your resume. Please ensure it is not image-only or a scanned PDF.',
        code:  'INSUFFICIENT_TEXT',
      },
      { status: 422 }
    );
  }

  // ── 5b. Deterministic formatting checks (NO AI CALL) ──────────────────
  // Runs BEFORE stripPII: the contact-block check needs to see the real email
  // to tell "no email anywhere" from "email present but not at the top".
  // Costs no tokens, returns instantly, and still produces findings if the
  // model call fails below.
  let parseReport;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    parseReport = runParseChecks(parseResult.text, parseResult.format, bytes);
  } catch {
    // Byte-level checks are a bonus, never a reason to fail a scan.
    parseReport = runParseChecks(parseResult.text, parseResult.format);
  }

  // ── 6. Strip PII before AI call ───────────────────────────────────────
  // BOTH documents. A pasted job description routinely carries a recruiter
  // name, email and direct line — third-party personal data with no bearing on
  // keyword matching. gemini.ts used to strip the JD internally with a weaker
  // regex set; now that it doesn't, this is the only place it happens.
  const cleanResume = stripPII(parseResult.text);
  const cleanJD     = stripPII(jobDescription);

  // ── 7. Cache key from cleaned content ────────────────────────────────
  // Shared helper so /api/scan and runAtsAnalysis() derive the SAME key. They
  // previously used different prefixes and different inputs, so identical
  // scans missed the cache and paid for a second Gemini call.
  const key = cacheKey(cleanResume, cleanJD, role);

  // ── 8. Cache lookup ───────────────────────────────────────────────────
  try {
    const cached = await getCachedResult(key);
    if (cached) {
      // lib/cache.ts returns a ScanResult directly. The old redis.ts
      // double-encoded (stringify on write, parse on read) on top of the
      // Upstash SDK's own serialisation, so cache hits threw and silently
      // fell through to a fresh, billable AI call.
      const cachedResult: ScanResult = cached;
      cachedResult.cached      = true;
      // Recomputed rather than served from cache: the checks are cheap and
      // depend on THIS upload's bytes, which may differ from the cached scan
      // even when the extracted text hashes identically.
      cachedResult.parseReport = { parseScore: parseReport.parseScore, findings: parseReport.findings };
      cachedResult.processingMs = Date.now() - startTime;

      // Fire-and-forget analytics for cache hits
      const sessionHash = generateSessionHash(clientIP, request.headers.get('user-agent') ?? '');
      collectScanAnalytics({
        scanResult:               cachedResult,
        roleSlug:                 role || null,
        roleCategory:             null,
        fileFormat:               parseResult.format,
        wordCount:                parseResult.wordCount,
        sectionsDetected:         parseResult.metadata?.sectionsDetected?.split(',').filter(Boolean) ?? [],
        hasQuantifiedAchievements: parseResult.metadata?.hasQuantifiedAchievements === 'true',
        jdWordCount:              jobDescription.split(/\s+/).length,
        processingMs:             Date.now() - startTime,
        cacheHit:                 true,
        sessionHash,
        deviceType:               (request.headers.get('x-device-type') as 'mobile' | 'tablet' | 'desktop') ?? 'desktop',
        country:                  request.headers.get('x-country') ?? 'unknown',
        referrerDomain:           request.headers.get('x-referrer-domain') ?? null,
      }).catch(() => {});

      // A cached result carries the PREVIOUS scan's token and id. Both must be
      // replaced: reusing them would attach this user's outcome report to
      // someone else's scan and corrupt the calibration data.
      const cachedToken = generateResultToken();
      cachedResult.scanId = undefined;
      cachedResult.resultToken = (await saveResult(cachedToken, cachedResult, role || null))
        ? cachedToken
        : undefined;

      return NextResponse.json(cachedResult, {
        headers: {
          'X-Cache':               'HIT',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      });
    }
  } catch {
    // Cache miss — continue to AI
  }

  // ── 9. AI Analysis ────────────────────────────────────────────────────
  let scanResult: ScanResult;
  try {
    scanResult = await analyzeResumeWithAI(cleanResume, cleanJD, role || undefined);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';

    const isQuota = msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('429');
    // GRACEFUL DEGRADATION.
    // The deterministic checks already ran at step 5b and cost nothing. When
    // the model is unavailable there is no reason to throw that work away and
    // show the user a bare error — formatting findings are genuinely useful on
    // their own, and they are the half of the analysis that does not depend on
    // an external service.
    //
    // The status stays an error code so clients and monitoring see the failure
    // honestly; the payload simply carries what we do have.
    const partial = {
      parseReport: { parseScore: parseReport.parseScore, findings: parseReport.findings },
      degraded: true as const,
    };

    if (isQuota) {
      return NextResponse.json(
        {
          ...partial,
          error:      'Keyword analysis is temporarily unavailable — the AI service is busy. Your formatting results are below, and this usually clears within a minute or two.',
          code:       'QUOTA_EXCEEDED',
          retryAfter: 90,
        },
        { status: 503, headers: { 'Retry-After': '90' } }
      );
    }

    return NextResponse.json(
      {
        ...partial,
        error: 'Keyword analysis failed, but we were able to check your formatting — results below.',
        code:  'AI_ERROR',
        // The raw message may contain fragments of the submitted text, so it
        // is logged rather than returned.
        detail: process.env.NODE_ENV === 'development' ? msg : undefined,
      },
      { status: 502 }
    );
  }

  scanResult.processingMs = Date.now() - startTime;
  scanResult.fileFormat   = parseResult.format;
  scanResult.parseReport  = { parseScore: parseReport.parseScore, findings: parseReport.findings };

  // ── 10. Write to cache ────────────────────────────────────────────────
  setCachedResult(key, scanResult).catch(() => {}); // TTL lives in lib/cache.ts

  // ── 11. Analytics ─────────────────────────────────────────────────────
  // Awaited, unlike the cache-hit path below, because we need the scanId it
  // returns: it is the join key that lets a user later tell us what happened to
  // this application (lib/marketIntel.ts). One Firestore write is an acceptable
  // cost for the only dataset in this product a competitor cannot copy.
  const sessionHash = generateSessionHash(clientIP, request.headers.get('user-agent') ?? '');
  const scanId = await collectScanAnalytics({
    scanResult,
    roleSlug:                 role || null,
    roleCategory:             null,
    fileFormat:               parseResult.format,
    wordCount:                parseResult.wordCount,
    sectionsDetected:         parseResult.metadata?.sectionsDetected?.split(',').filter(Boolean) ?? [],
    hasQuantifiedAchievements: parseResult.metadata?.hasQuantifiedAchievements === 'true',
    jdWordCount:              jobDescription.split(/\s+/).length,
    processingMs:             Date.now() - startTime,
    cacheHit:                 false,
    sessionHash,
    deviceType:               (request.headers.get('x-device-type') as 'mobile' | 'tablet' | 'desktop') ?? 'desktop',
    country:                  request.headers.get('x-country') ?? 'unknown',
    referrerDomain:           request.headers.get('x-referrer-domain') ?? null,
  }).catch(() => '');

  scanResult.scanId = scanId || undefined;

  // ── 12. Save a revisitable result link ────────────────────────────────
  // Only the ANALYSIS is stored — no resume text, no job description, no
  // identifier. See lib/resultStore.ts for exactly what that covers and why it
  // does not contradict the "we never store your resume" claim.
  //
  // This is what gives a user a reason to come back, which is in turn what
  // makes outcome capture possible at all.
  const resultToken = generateResultToken();
  const saved = await saveResult(resultToken, scanResult, role || null);
  if (saved) scanResult.resultToken = resultToken;

  // ── 13. Respond ───────────────────────────────────────────────────────
  return NextResponse.json(scanResult, {
    headers: {
      'X-Cache':               'MISS',
      'X-RateLimit-Remaining': String(rateLimit.remaining),
    },
  });
}
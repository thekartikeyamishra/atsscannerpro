// src/lib/ai/analyze.ts
// Convenience wrapper: PII strip → cache → Gemini → cache write.
//
// WHAT CHANGED AND WHY
// This file previously carried its own stripPII() and its own cache module
// (ai/cache.ts, prefix "ats:v2:", 30-day TTL), while /api/scan used a third
// stripper and a different cache (prefix "ats:", 24h). The same scan therefore
// hashed to two different keys depending on the entry point, so the cache
// missed and a second billable Gemini call ran. Both now delegate to the shared
// modules, so either entry point warms the cache for the other.

import { analyzeResumeWithAI } from '@/lib/gemini';
import { stripPII } from '@/lib/piiStripper';
import { cacheKey, getCachedResult, setCachedResult } from '@/lib/cache';
import type { ScanResult } from '@/types';

export interface AtsAnalysisResult extends ScanResult {
  cached: boolean;
}

// Re-exported so existing imports of stripPII from this module keep working.
export { stripPII };

export async function runAtsAnalysis(
  resumeText: string,
  jobDescription: string,
  role?: string,
): Promise<AtsAnalysisResult> {
  // Strip BOTH documents. gemini.ts no longer strips internally.
  const resume = stripPII(resumeText);
  const jd = stripPII(jobDescription);

  const key = cacheKey(resume, jd, role ?? '');

  const cached = await getCachedResult(key);
  if (cached) return { ...cached, cached: true };

  const fresh = await analyzeResumeWithAI(resume, jd, role);
  await setCachedResult(key, fresh);

  return { ...fresh, cached: false };
}

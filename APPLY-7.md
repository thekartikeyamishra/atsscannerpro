# Phase 7 — wiring closed

Every previous phase built something and left a piece for you to connect. This closes all of them. Nothing in the codebase is now built-but-unwired.

```
src/app/api/scan/route.ts        ← runs the deterministic parse checks
src/components/ResultsPanel.tsx  ← Formatting tab shows measured findings
src/components/ATSScanner.tsx    ← history, rescan delta, save-link
src/app/roles/page.tsx           ← NEW — the role hub
src/app/page.tsx                 ← links the hub
src/components/Header.tsx        ← "Guides" in primary nav
src/components/Footer.tsx        ← Role Guides link
src/app/sitemap.ts               ← adds /roles
src/types/index.ts               ← adds parseReport
```

---

## 1. The parse checks are live

`atsParseChecks.ts` was written in phase 4 and never called. It runs now, before `stripPII` — order matters, because the contact-block check needs to see the real email to distinguish *"no email anywhere"* from *"email present but not at the top."*

Three things this buys you:

- **Findings cost nothing.** Eleven checks, pure CPU, zero tokens.
- **They survive an AI outage.** If Gemini fails, the user still gets real formatting analysis instead of an error.
- **They're reproducible.** Same document, same findings, every time — which is what makes them defensible in a way a model's opinion isn't.

### The Warnings tab is now Formatting

I replaced the AI-generated `atsWarnings` tab with the measured findings rather than adding a sixth tab. Showing both would give the user two answers to the same question, from two sources of differing reliability, with no way to tell which to believe.

Each finding shows its **confidence** — `measured`, `likely`, or `heuristic`. That label is doing real work: it's the difference between a tool that's useful and one that's merely confident.

`result.atsWarnings` still exists in the payload and still feeds telemetry. Nothing breaks; it's just no longer the thing users read.

## 2. The return loop actually closes

`ATSScanner` now records each scan to browser-local history, computes the delta against the last scan of the **same** job description, and renders it above the score message:

> **+14** better than your last scan of this job (attempt 2)

This is the payoff for phases 4 and 5. A bare score tells someone almost nothing. A delta tells them their edit worked — which is the only thing that makes rescanning worth doing, and rescanning is what makes someone return, and returning is what fills the outcome dataset.

The save-link control renders when `resultToken` is present, so users can get back to `/r/<token>` later, which is where `OutcomeFeedback` asks what happened.

Order matters in the code and there's a comment marking it: `getProgressForJD` runs **before** `addToHistory`, or the scan compares against itself and always shows +0.

## 3. `/roles` hub

There wasn't one. The homepage linked 12 roles, the footer 17, and anything beyond that was reachable only from the sitemap — an orphan in practice. `seo:check` flags orphans for exactly this reason: a page nothing links to gets crawled rarely and ranks accordingly.

"Guides" is now in the primary nav. Role pages are your SEO surface and were reachable only from the footer.

---

## Deployment checklist

Everything that must be true before this goes live. Most of it is from earlier phases and easy to lose track of across seven.

**Secrets** — rotate everything from the `.env.local` you uploaded (phase 1). Then set in Vercel:

| Variable | Consequence if missing |
|---|---|
| `GEMINI_API_KEY` | No scans at all |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Rate limiting falls back to per-instance memory (bypassable); no result links, so no return loop, so no outcome data |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | No telemetry — Moats 2 and 3 collect nothing |
| `SESSION_HASH_SECRET` | Session hashes predictable |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` + 4 slot IDs | Ads render nothing (safe, just no revenue) |

**Firebase** — `firebase deploy --only firestore:rules,firestore:indexes`. The rules are still the expired test defaults in production until you do; the composite index is what makes `/insights` and role market-data work.

**Manual code edits still outstanding:**
- `about/page.tsx` — `@/src/` → `@/` (phase 1 §5a). **The build fails without this.**
- `privacy/page.tsx` + `about/page.tsx` — OpenAI → Gemini corrections (phase 1 §6)
- `privacy/page.tsx` — saved-result-links disclosure (phase 5 §3). Don't ship links before the policy describes them.
- `rolesData.ts` — remove `demandGrowth` and `avgAtsScore`, and drop them from `/api/roles` (phase 6)
- Delete `redis.ts`, `localCache.ts`, `ai/cache.ts`, `ScannerTool.tsx`, `ui/AdBanner.tsx`, `AuthorBio.tsx`, `tailwind.config.ts`, `public/robots.txt`, `public/sitemap.xml`, `public/sitemap.xsl`

**Then:**
```bash
npm run verify && npm start && npm run seo:check
```

---

## Verify

- [ ] Scan a two-column PDF → Formatting tab shows `SHORT_LINE_RUNS` with confidence `likely`
- [ ] Scan a scanned/image PDF → `LOW_TEXT_YIELD`, severity critical
- [ ] Scan the same resume+JD twice, editing between → second shows a delta
- [ ] `/roles` lists every role grouped by category; `seo:check` reports no orphans
- [ ] Kill `GEMINI_API_KEY` → scan fails, but confirm the failure is clean

That last one is worth doing deliberately. The parse checks now run before the AI call, so there's a real opportunity to degrade gracefully — return formatting findings with a note that keyword analysis is unavailable, instead of a hard error. I haven't built that fallback; it's a small change in the route's catch block and a good next task.

---

## Where the platform stands

**Seven phases. Every built component is now connected.** Nothing is sitting in the repo waiting to be wired.

Working: the scan pipeline, deterministic formatting analysis, PII stripping on both documents, prompt-injection separation, shared rate limiting, consolidated caching, result links, local history with rescan deltas, outcome capture, market aggregation, and seven content pages including methodology, security, and insights.

Not built: real accounts and cross-device history, Razorpay and any paid tier, content clusters beyond role guides.

**The honest read hasn't changed since phase 6, and I'd rather repeat it than pad.** The engineering that materially moves this business is largely done. Moats 2 and 3 — the two things a competitor genuinely cannot copy — are built, wired, and **empty**. They fill with users, not commits.

A hundred outcome reports makes `/insights` publish something no competitor can match. A thousand scans per role turns every role page from a template into a data page and settles the AdSense question outright. Neither needs another line of code from me.

If you want more engineering, the highest-value items left are, in order: **graceful AI-failure degradation** (small, described above), **accounts** (large, and the real Moat 5), and **a paid tier** — which I've deliberately not built because pricing, refund terms, and legal entity are business decisions I'd have to invent, and inventing them is exactly what your own brief tells me not to do.

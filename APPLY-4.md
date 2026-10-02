# Phase 4 — moat foundations

Read `MOATS.md` first. It explains why these six and, more importantly, why the premise you asked for isn't achievable as stated.

```
MOATS.md                              ← NEW — the strategy
src/lib/atsParseChecks.ts             ← NEW — deterministic ATS checks, no AI
src/lib/marketIntel.ts                ← NEW — aggregation + outcome capture
src/app/api/outcome/route.ts          ← NEW
src/components/OutcomeFeedback.tsx    ← NEW
src/app/insights/page.tsx             ← NEW
src/app/sitemap.ts                    ← adds /insights (supersedes phase 3)
src/components/Footer.tsx             ← links /insights
firestore.rules                       ← adds scan_outcomes
firestore.indexes.json                ← NEW — required composite index
```

---

## Wiring required — these do nothing until you connect them

I can't complete these because they touch `/api/scan`'s response shape and `ATSScanner.tsx`'s result rendering, and I'd rather you make the call on where they surface.

### 1. Return `scanId` to the client

The outcome loop joins an outcome to a scan. Right now `scanId` is generated inside `collectScanAnalytics()` and never leaves the server, so there's nothing for the client to send back.

In `src/types/index.ts`, add to `ScanResult`:
```ts
/** Anonymous id for this scan. Used only to attach a self-reported outcome. */
scanId?: string;
```

In `src/lib/analytics.ts`, make `collectScanAnalytics` return the id it generates (it already creates one with `randomUUID()` — just `return analytics.scanId;` and change the signature to `Promise<string | null>`).

In `/api/scan`, await it for the non-cached path and attach:
```ts
scanResult.scanId = await collectScanAnalytics({ ... }) ?? undefined;
```
Note this makes analytics blocking for that one call. It's a single Firestore write and it's the price of the join key. If latency matters, generate the UUID in the route instead and pass it *into* the analytics call.

### 2. Run the deterministic checks

In `/api/scan`, after parsing and **before** `stripPII` — order matters, the contact-block check needs the real email:

```ts
import { runParseChecks, findingCodes } from '@/lib/atsParseChecks';

const parseReport = runParseChecks(parseResult.text, parseResult.format, buffer);
```

Then attach `parseReport` to the response and pass `findingCodes(parseReport)` into `collectScanAnalytics` as `sectionsDetected`'s sibling. You'll need `parseResult` to expose the buffer, or call `runParseChecks` without it — the byte-level image check is the only thing that needs it.

Surface the findings in `ResultsPanel` as a sixth tab ("Formatting"). They're available instantly, so you can render them while the AI call is still running — which makes the wait feel shorter and gives the user something real if Gemini fails.

### 3. Mount `OutcomeFeedback`

**Not immediately after a scan** — asking "did you hear back?" ten seconds after someone uploads a resume is nonsense and will poison the data with `not_applied`.

Mount it when a user returns to a result they've seen before. Without accounts, the practical trigger is a link: after a scan, offer "email me a reminder in 10 days" or a shareable result URL they can return to. Both need work you haven't built yet — which is exactly the Moat 5 dependency `MOATS.md` flags.

Interim option: show it only when `document.referrer` is external and the result came from cache (`X-Cache: HIT`), meaning they've scanned this before.

### 4. Deploy the index

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

`getRoleInsight()` filters `scan_analytics` by `roleSlug` and a `createdAt` range. Without the composite index that query throws `FAILED_PRECONDITION` and `/insights` renders "unavailable" — fails closed, which is correct, but silently.

---

## What `/insights` shows today

Nothing, and that's intentional.

You have no outcome data, so it renders the honest empty state: *"We have 0 reported outcomes and want at least 100 before publishing a rate."* It does not show a placeholder, an illustrative figure, or a fake chart.

This will feel wrong. It looks like an unfinished page. Resist filling it — the entire value of the page is that when a number does appear, it means something. A site that publishes confident statistics on a sample of nine is the thing this page exists to be the opposite of.

Same rule in the code: `MIN_SAMPLE = 100` overall, 30 per calibration band, 10 occurrences per keyword. Every function returns `insufficient` rather than a small number.

---

## Verify

```bash
npm run verify && npm start
npm run seo:check
```

- [ ] `/insights` renders the empty state with a sample count, not a fake chart
- [ ] `POST /api/outcome` with a bogus scanId → 400; eleven valid posts in an hour → 429
- [ ] `/insights` and the footer link appear in `/sitemap.xml`
- [ ] `runParseChecks` on a two-column PDF flags `SHORT_LINE_RUNS`; on a scanned PDF, `LOW_TEXT_YIELD`

That last one is worth doing by hand with three or four real resumes before you trust the thresholds. `avgLineLength < 26` and `tabbyLines > 5` are calibrated on reasoning, not on a corpus — which is precisely the gap the parse-harness project in `MOATS.md` closes.

---

## Where the platform stands

**Phases 1–3 fixed what was broken.** Build integrity, security, honesty. That work is done.

**Phase 4 starts the part that makes the business defensible** — but three of the six moats are foundations, not finished systems, and two aren't started:

| Moat | State |
|---|---|
| 1 · Measured parse behaviour | Built; needs the parse harness to become real |
| 2 · Outcome data | Built; **empty until users return** |
| 3 · Market dataset | Built; **empty until volume** |
| 4 · Published methodology | Built and live |
| 5 · Switching cost | **Not started** — needs accounts |
| 6 · Cost per scan | Substantially built |

**Moat 5 is the bottleneck and I want to be blunt about it.** Moats 2 and 3 are engines that need fuel, and the fuel is users coming back. Nothing in the product currently gives anyone a reason to return: you scan once, fix your resume, and leave. Until that changes, the two data moats stay empty no matter how good the collection code is.

So the next real work is accounts and scan history — with the opt-in boundary `MOATS.md` describes, so you don't trade your privacy position for it.

**Still outstanding since phase 1:** `app/page.tsx` and `app/role/[slug]/page.tsx`. The homepage still carries unsourced statistics and a third wrong model name. The role template is still where the AdSense low-value-content decision gets made — and it's also where Moat 3's data would surface first, since role pages are exactly where "what employers asked for this quarter" belongs.

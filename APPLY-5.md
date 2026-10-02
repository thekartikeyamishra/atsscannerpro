# Phase 5 — the return loop

This closes the gap phase 4 ended on: nothing gave anyone a reason to come back, so the outcome and market-data moats had no way to fill.

```
src/lib/resultStore.ts                  ← NEW — token-based result persistence
src/lib/scanHistory.ts                  ← NEW — browser-local history
src/app/api/result/[token]/route.ts     ← NEW — fetch / revoke
src/app/r/[token]/page.tsx              ← NEW — the permalink page
src/components/ResultLinkActions.tsx    ← NEW — copy / delete
src/components/ScanHistory.tsx          ← NEW — past scans + score movement
src/app/api/scan/route.ts               ← saves a link, returns scanId (supersedes v4)
src/lib/analytics.ts                    ← returns the scanId (supersedes v1)
src/types/index.ts                      ← adds scanId + resultToken
```

---

## Why this shape rather than accounts

Accounts are the textbook answer to "no reason to return", and they're what Moat 5 eventually needs. But they collide with the strongest thing this product says about itself — *we never store your resume* — which is the actual reason to pick it over Jobscan or Teal.

So this is the version that doesn't make the trade.

**What a result link stores:** the analysis. Score, grade, summary, keyword lists, suggestions.

**What it does not store:** the resume file, the extracted resume text, the job description, IP, user agent, or anything linking the result to a person.

A `ScanResult` is the *model's output*. Keyword names come from the job description, not from the candidate. The privacy claim survives intact.

**One rule to keep it true:** if you ever add a field to `ScanResult` that echoes resume content — an `extractedSummary`, a quoted bullet — it must be stripped in `saveResult()` before persistence. There's a note in `resultStore.ts` at the point where you'd have to make that decision.

## Why the permalink page matters more than it looks

Phase 4 built outcome capture and then couldn't mount it anywhere sensible. Asking "did you hear back?" ten seconds after a scan produces `no_response` answers that mean nothing and would poison the calibration data.

`/r/<token>` is the moment that was missing. Someone opening their result a week after applying is exactly the person who knows what happened — so `OutcomeFeedback` renders there and nowhere else, gated on `age >= 1` day.

It's also free distribution: a result you can send to a friend or a mentor is a link into the product that costs nothing to produce.

**It is `noindex` and must stay that way.** These pages are semi-private, unique per user, and would be textbook thin duplicate content at scale — the exact pattern that endangers an AdSense account. They're deliberately absent from `sitemap.ts`.

## Local history is not Moat 5

`scanHistory.ts` gives the product loop — *scan → fix → rescan → see what changed* — which was impossible before, since there was no record of the previous score.

But it's per-device, per-browser, and clearing site data wipes it. It delivers the return trigger without the privacy cost; it is **not** the durable switching cost. Don't let it become an excuse to skip real accounts.

---

## Wiring left to do

### 1. Show the link and record history after a scan

In `ATSScanner.tsx`, once a result lands:

```ts
import { addToHistory, jdFingerprint, getProgressForJD } from '@/lib/scanHistory';

const jdKey = jdFingerprint(jobDescription);
const progress = getProgressForJD(jdKey, data.score);   // BEFORE addToHistory

addToHistory({
  token: data.resultToken ?? null,
  score: data.score,
  grade: data.grade,
  roleSlug: selectedRole || null,
  jdKey,
  scannedAt: new Date().toISOString(),
});
```

Order matters — call `getProgressForJD` first or you'll compare the scan against itself.

Then surface two things in the result view:

- **`progress.delta`** when it isn't null: *"72 — up 14 from your last scan of this job."* This is the single highest-value line in the product. A bare score tells a user almost nothing; a delta tells them their edit worked, which is the only thing that makes rescanning worth doing.
- **The result link**, if `data.resultToken` exists: *"Save this result — [copy link]"*, pointing at `/r/${data.resultToken}`.

### 2. Mount `ScanHistory`

Below the scanner on the homepage. It renders `null` when empty, so it costs nothing for first-time visitors and needs no conditional.

### 3. Privacy policy — required before this ships

Add to the "Data We Collect" list in `src/app/privacy/page.tsx`:

```ts
{
  label: 'Saved result links',
  desc: 'When a scan completes we store the analysis — your score, matched and missing keywords, and suggestions — behind a random link so you can return to it. This contains no resume text, no job description, and no contact details. Links expire 30 days after the scan, and anyone holding a link can delete it immediately from the result page.',
},
```

And to the retention table:

```ts
{ label: 'Saved result links', val: 'Auto-expire 30 days after the scan; deletable at any time' },
```

Don't ship the feature before the policy describes it. That's the whole difference between this and the thing you're trying not to be.

### 4. Upstash is now load-bearing

Result links need it. Without `UPSTASH_REDIS_REST_URL` / `_TOKEN` the scanner still works — `resultToken` is simply absent and the UI should hide the save option — but there are no links, so no return trigger, so no outcome data.

---

## Verify

```bash
npm run verify && npm start
```

- [ ] Scan → response includes `resultToken` and `scanId`
- [ ] `/r/<token>` renders the result; a bogus token 404s
- [ ] Delete on the result page → the link 404s afterwards
- [ ] `/r/<token>` HTML contains `noindex`, and the path is **not** in `/sitemap.xml`
- [ ] Scan the same resume+JD twice → `X-Cache: HIT`, and the second response has a **different** `resultToken`

That last one is the subtle bug this phase had to avoid: a cached result carries the previous scan's token and id. Reusing them would attach one user's outcome report to another user's scan and quietly corrupt the calibration dataset — the one thing in this product that's hard to rebuild. The route now issues a fresh token and clears `scanId` on every cache hit.

---

## Where the platform stands

**Fixed (phases 1–3):** build integrity, security, honesty.
**Moats (phase 4):** measurement, outcome capture, market aggregation, published methodology.
**Return loop (phase 5):** result links, local history, rescan comparison.

The product now has a complete loop for the first time: scan → see problems → fix → rescan → see the delta → come back later → report what happened.

**Not started:** accounts and durable cross-device history (real Moat 5), Razorpay and any paid tier, content clusters and guides.

**Still outstanding since phase 1** — and this is now the biggest single gap: `app/page.tsx` and `app/role/[slug]/page.tsx`. The homepage still carries unsourced statistics and a third wrong model name, and it's where `ScanHistory` and the progress delta need to be mounted. The role template is both the AdSense low-value-content decision point and where Moat 3's market data would surface first. I've now built four phases of infrastructure that partly terminates in two files I've never seen.

# ATS Scanner Pro — Codebase Audit

Audit date: 7 September 2026
Scope: the 68 files uploaded. Severity is by business impact, not by how hard the fix is.

**Read this before applying anything.** Some findings mean data that is already public, and a few mean the site is not currently doing what its own privacy policy says it does.

---

## The short version

Four things are true right now, and each one is independently serious:

1. **Tailwind never compiles.** `globals.css` uses v3 directives; `package.json` installs v4. Every utility class in the app is a no-op.
2. **The Firestore database was world-writable, and is now fully locked.** The default test rules expired on 6 June 2026. Before that date anyone could read or delete everything; since that date all analytics writes have failed silently.
3. **The structured data contains invented review ratings.** 4.8 stars from 3,241 ratings, in JSON-LD, on every page.
4. **The build almost certainly does not compile.** Several imports resolve to `src/src/…`.

Below, P0 items are things I would not leave running over a weekend.

---

## P0 — Fix before the next deploy

### P0-1 · Tailwind v4 installed, v3 syntax in the stylesheet
`src/app/globals.css` opens with `@tailwind base; @tailwind components; @tailwind utilities;`. Those directives were removed in Tailwind v4, which `package.json` pins (`tailwindcss: ^4`, `@tailwindcss/postcss: ^4`, and `postcss.config.mjs` loads the v4 plugin).

Two consequences compound:
- v4 does **not** auto-load `tailwind.config.ts`. Every token in it — `navy-900`, `brand-gold`, `font-syne`, `font-jakarta`, the type scale, the glow shadows — is undefined. `text-brand-gold` in `Footer.tsx` and `font-syne` across every heading resolve to nothing.
- The `content` globs in that config list `./pages`, `./components`, `./app`. Your components live in `./src/components`. Even under v3 those globs would have missed the entire source tree.

The 617 lines of hand-written CSS in `globals.css` still apply, because they are plain CSS in native `@layer` blocks. That is why the site renders as *something* rather than raw HTML — you are seeing the hand-written component classes with no utility layer underneath.

Fixed in `src/app/globals.css`. Zero `@apply` usage in the original made this a clean migration: only the directive block changed, plus a new `@theme` block carrying the config tokens.

**Bonus bug found while migrating:** the `:root` block defines `--radius-sm: 8px … --radius-3xl: 32px`. Those are Tailwind v4's own reserved token names. Because that block sits outside any cascade layer, it would have overridden v4's radius scale sitewide, silently changing `rounded-lg` from 8px to 16px and `rounded-3xl` from 24px to 32px on every element. Renamed to `--r-*` (9 usages).

### P0-2 · Firestore was open to the internet; now everything is denied
`firestore.rules` is the unmodified Firebase test-mode default:

```
allow read, write: if request.time < timestamp.date(2026, 6, 6);
```

- **Until 6 June 2026**: any person who knew the project ID could read, edit, or delete every document. The project ID ships to every browser in `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. Treat all data written before that date as having been publicly exposed. If any scan telemetry was ever written with fields you would not publish, that is a disclosure question, not just a bug.
- **Since 6 June 2026**: all client requests are denied. `lib/analytics.ts` uses the Firebase *client* SDK server-side, so every write has been failing. Every call site wraps the write in `.catch(() => {})` or a bare `catch {}`, so nothing was logged and nothing surfaced. You have been collecting no telemetry for roughly three months.

The silent-catch pattern is the real lesson here: it converted a total outage into invisibility.

Fixed in `firestore.rules` (deny-all) and `src/lib/analytics.ts` (rewritten on `firebase-admin`, which bypasses rules legitimately and never reaches the browser). Failures now log once instead of vanishing.

**Action outside the code:** rotate the Firebase credentials, and review what was in those collections.

### P0-3 · Fabricated review ratings in JSON-LD
`layout.tsx` ships:

```js
aggregateRating: { ratingValue: '4.8', ratingCount: '3241', … }
```

Those 3,241 ratings do not exist. Invented review markup is explicitly against Google's structured-data policy and is a common trigger for a manual action — which would also put an AdSense application at risk, since you are applying with the same domain. This was the highest-risk single line in the codebase, and it directly contradicts your own brief ("Never use fake… ratings").

Removed in the new `layout.tsx`. Do not restore it until real, verifiable reviews exist and are visible on the page. Schema must describe what a user can actually see.

### P0-4 · Build-breaking import paths
`tsconfig.json` maps `@/*` → `./src/*`. So `@/src/components/Header` resolves to `src/src/components/Header`.

Affected:
- `app/about/page.tsx` — `@/src/components/Header`, `Footer`, `SchemaMarkup`, `@/src/components/AdUnit`
- `components/ScannerTool.tsx` — `@/src/components/ui/AdBanner`

Meanwhile `not-found.tsx` and `Footer.tsx` correctly use `@/components/…`. The codebase does both. Patches in `APPLY.md`.

### P0-5 · Every icon is the same 4.36 MB file
`favicon.ico`, `icon-192x192.png`, and `icon-512x512.png` are byte-identical (MD5 `90ac57ba…`). All three are a **2816×1536 PNG weighing 4.36 MB**, and `favicon.ico` is a PNG that has simply been renamed.

- A 4.36 MB favicon is requested on essentially every page load.
- Neither "192x192" nor "512x512" is square or the stated size, so the PWA install prompt has nothing valid to use.
- `layout.tsx` references `/icon-192.png` and `/icon-512.png` — filenames that do not exist. Every icon reference 404s.
- `/og-image.png` is referenced in OpenGraph, Twitter, and both manifests, but is not in the project at all. Every social share has a broken preview image.

Regenerated in `public/`: correct square icons at 192/512, a real multi-resolution `.ico`, an Apple touch icon, and an OG card — **13 MB down to about 190 KB total.** The logo is keyed off its white background so it sits properly on the navy theme.

### P0-6 · Rate limiting does not work in production
`lib/rateLimiter.ts` keeps an in-memory `Map` of IP → timestamps. On Vercel each concurrent lambda has its own memory, so the real limit is "8 scans per 10 minutes *per instance*" — bypassed by firing requests in parallel and landing on cold instances. This is the only thing standing between an abusive client and your Gemini bill.

`@upstash/ratelimit` was already in `package.json` and never imported once. Rewritten to use it, with the in-memory path kept as a local-dev fallback.

Also removed: the module-scope `setInterval` cleanup timers in `rateLimiter.ts` and `localCache.ts`, which keep a serverless instance's event loop referenced after the response is sent.

---

## P1 — High

### P1-1 · The privacy policy describes a different product than the one running
`/privacy` and `/about` both state that resume text is sent to **OpenAI's GPT-4o Mini**. The code calls **Google Gemini 2.5 Flash**, with `gemini-2.5-flash-lite` as fallback (`lib/gemini.ts`). The `openai` package is installed but never imported.

This is a factual error about who receives user data, on the page whose entire job is to say who receives user data. Under both DPDP and GDPR, naming the wrong processor is not a cosmetic mistake. Exact replacement text is in `APPLY.md`.

Related: your own external audit noted the homepage says "Powered by Google Gemini 1.5 Flash" while the scanner section says "Powered by GPT-4o Mini". Neither matches the code, which is on 2.5.

### P1-2 · "Your personal identity is never part of the AI prompt" was not true
Both `/about` and `/privacy` make that claim in bold. The stripper removed emails, phones, URLs, Aadhaar, and PAN — but **never the candidate's name**, which sits at the top of essentially every resume and went to the model on every scan.

Two fixes, and you need both:
- `src/lib/piiStripper.ts` now redacts a Title Case name from the resume header block.
- The claim is still softened to "designed to remove" in the copy patch. Regex PII removal is best-effort; a guarantee is not something this implementation can honestly make, and the stronger phrasing is exactly the kind of claim your brief says not to ship without verification behind it.

### P1-3 · Three different `stripPII` implementations
`lib/piiStripper.ts`, `lib/ai/analyze.ts`, and `lib/gemini.ts` each define their own, with different rules. Which privacy guarantee a user got depended on which code path ran. Consolidated into one.

The old rules also had real defects:
- The 12-digit Aadhaar rule ran *after* the phone rule, which had already consumed the digits, so it could never fire.
- `\b\d{6}\b` redacted **every** six-digit number as a PIN code — destroying resume metrics like "processed 250000 records" before the model ever scored them. That directly suppressed the achievement signal the tool exists to measure.

### P1-4 · Three caching layers that disagree
`lib/redis.ts` (prefix `ats:`, 24h), `lib/localCache.ts` (15m), and `lib/ai/cache.ts` (prefix `ats:v2:`, 30d). `/api/scan` uses the first two; `runAtsAnalysis()` uses the third. Identical scans miss the cache and pay for a second Gemini call.

`redis.ts` also double-encodes: it calls `JSON.stringify` on write and `JSON.parse` on read, but the Upstash SDK already serialises. Reading back a cached object throws, is caught, and falls through to a fresh AI call — so the Redis tier was largely paying for itself and returning nothing. Consolidated into `src/lib/cache.ts`.

### P1-5 · A dead scanner wired to the wrong API contract
Two scanner components exist:
- `ATSScanner.tsx` — dark theme, posts `file` / `jobDescription` / `role`. **Correct**, matches `/api/scan`.
- `ScannerTool.tsx` — light theme, posts `resumeFile` / `jobTitle` / `deviceData`. Would fail validation with `MISSING_FILE` on every submission.

`ScannerTool.tsx` also enforces a 2 MB limit where the API allows 10 MB, and renders `AdBanner` with the literal slot string `YOUR_IN_ARTICLE_SLOT_ID`. It, `AdBanner.tsx`, and `AuthorBio.tsx` are an orphaned light-theme generation. Delete them (listed in `APPLY.md`) — if either is actually reachable in production, that route is broken today.

### P1-6 · Static files shadow your metadata routes
`/public/robots.txt` and `/public/sitemap.xml` both exist alongside `app/robots.ts` and `app/sitemap.ts`. A static file in `public/` wins. So:
- The dynamic sitemap — the one that enumerates every role page from `rolesData.ts` — **is not being served**. Google sees the hand-written `sitemap.xml` instead.
- Edits to `robots.ts` do nothing.

Same conflict with two different `manifest.json` files: one dark (`#040B1A`, `/icon-192.png`), one light (`#f8fafc`, `#2563eb`, `/icon-192x192.png`). They disagree about theme colour, background, and icon paths.

Also: `/terms` exists as a route, is linked from the scanner's consent checkbox, but appears in no sitemap and is not linked from the footer.

### P1-7 · One AdSense slot ID reused for six placements
`AD_SLOTS` in `AdUnit.tsx` maps all six placements to `6467467898`. Ads still serve, but all placements collapse into a single reporting line, so you cannot tell which unit earns and which only costs engagement. That makes placement optimisation guesswork — and placement optimisation is the whole lever on ad revenue.

The publisher ID is hardcoded in two components and `layout.tsx`. Moved to env vars; placements with no configured slot now render nothing instead of an empty `<ins>`.

---

## P2 — Worth doing before you push for traffic

- **`StickyBottomAd` + `BannerAd` + `InContentAd` on a single-tool mobile page** is the ad-density shape that draws AdSense scrutiny, and the fixed overlay can cover the scan CTA on short viewports. Not exported in the rewrite; use Google's own Anchor unit if you want one.
- **Fake progress.** `ATSScanner.tsx` advances a progress bar with `Math.random() * 7 + 2` on a timer. Your own brief says "Never fake progress." Wire it to real stages (uploading → parsing → analysing) or use an indeterminate spinner.
- **Mobile drawer is a keyboard trap in reverse.** `Header.tsx` sets `aria-hidden={!mobileOpen}` on a container whose links stay in the tab order — `pointer-events-none` does not remove focusability. A keyboard user tabs into invisible links. Use `inert` on the closed state.
- **`max-h-96` on the FAQ accordion** truncates any answer over ~384px with no scroll.
- **Unsourced statistics.** The homepage claims 75% ATS rejection, 3.5× more interviews, 95% Fortune 500. The 75% figure in particular is widely repeated and traces back to no primary source. Your brief says to source or remove these; I could not fix the homepage because `app/page.tsx` was not among the files that survived upload.
- **`jdCharCount: jdWordCount * 5`** is stored as if measured. It is an estimate; label it.
- **ISO week calculation** in `getWeekKey()` mixed local `getDay()` with a UTC-derived offset and drifted around year boundaries. Fixed.

---

## What I could not audit

These were listed in the uploads but their contents did not reach me — several files share a filename and overwrote each other on disk:

- `app/page.tsx` (homepage) — where the unsourced statistics and the conflicting "Powered by" claims live
- `app/role/[slug]/page.tsx` — the main SEO surface; the templating question in your external audit turns on this file
- `app/api/analytics/route.ts` and `app/api/roles/route.ts` (I have these from the conversation, not disk)
- `src/lib/rolesData.ts` (52 KB — present, not reviewed in depth)
- `sitemap.xsl`, `package-lock.json`

Send `app/page.tsx` and `app/role/[slug]/page.tsx` and I can take the content-quality and thin-content questions properly — those two files are where the AdSense low-value-content decision will actually be won or lost.

---

## One note on Next.js 16

Your `AGENTS.md` says this version has breaking changes from training data and to read `node_modules/next/dist/docs/` first. I do not have `node_modules` here, and Next 16.2.5 is past my reliable knowledge. I have therefore stuck to long-stable App Router APIs — `next/font/google`, `next/script`, `MetadataRoute`, file-based metadata — and avoided anything version-specific. **Run `npm run build` and `npm run typecheck` before deploying**, and if `next/font` or `next/script` has changed shape in 16.x, that is the first place to look.

# How to apply this fix pack

Work on a branch. Read `AUDIT.md` first — a few of these are security items with actions outside the code.

```bash
git checkout -b fix/p0-audit
```

---

## 0. Do these first, outside the repo

**Rotate your secrets.** `.env.local` was uploaded to this conversation. Treat every value in it as compromised:

- Gemini API key → regenerate at aistudio.google.com
- Upstash Redis token → rotate in the Upstash console
- Firebase service account / web config → rotate in the Firebase console
- `SESSION_HASH_SECRET` → regenerate: `openssl rand -hex 32`

`.gitignore` already covers `.env*`, so this is an upload exposure, not a git one.

**Review the Firestore exposure.** Until 6 June 2026 the database was world-readable and world-writable (see AUDIT P0-2). Check what is in `scan_analytics`, `market_signals`, and `page_views`, and decide whether anything there needed protecting.

---

## 1. Copy files in

Paths are relative to the repo root. All of these replace an existing file except where noted.

```
src/app/globals.css          ← Tailwind v4 migration + @theme tokens
src/app/layout.tsx           ← fake ratings removed, fonts/scripts/icons fixed
src/app/sitemap.ts           ← adds /terms
src/app/robots.ts            ← now reads SITE_URL from lib/seo
src/components/AdUnit.tsx    ← env-driven slots, StickyBottomAd dropped
src/lib/piiStripper.ts       ← the single stripper
src/lib/cache.ts             ← NEW: replaces redis.ts + localCache.ts + ai/cache.ts
src/lib/rateLimiter.ts       ← Upstash-backed, now async
src/lib/analytics.ts         ← firebase-admin
src/lib/security.ts          ← ODT/DOCX fix, injection heuristics tuned
firestore.rules              ← deny-all
package.json                 ← +firebase-admin, −openai, −@types/pdf-parse
.env.example                 ← NEW
public/manifest.json         ← single canonical version
public/favicon.ico           ← real .ico, 42 KB (was a 4.36 MB PNG)
public/icon-192x192.png      ← 13 KB, actually 192×192
public/icon-512x512.png      ← 66 KB, actually 512×512
public/apple-touch-icon.png  ← NEW
public/og-image.png          ← NEW (was referenced everywhere, never existed)
```

## 2. Delete these

```bash
git rm tailwind.config.ts                    # v4 is CSS-first; tokens now in globals.css
git rm src/lib/redis.ts src/lib/localCache.ts src/lib/ai/cache.ts
git rm src/components/ScannerTool.tsx        # wrong API contract, always 400s
git rm src/components/ui/AdBanner.tsx        # duplicate ad pusher, invalid slot
git rm src/components/AuthorBio.tsx          # orphaned light-theme component
git rm public/robots.txt public/sitemap.xml public/sitemap.xsl
git rm src/app/manifest.json                 # if a second manifest lives under app/
```

`AuthorBio.tsx` is the one judgement call — if it is rendered somewhere I could not see, keep it but restyle it for the dark theme.

## 3. Install

```bash
npm install
```

## 4. Set environment variables

Copy `.env.example` → `.env.local` and fill it in. New variables that did not exist before:

| Variable | Why | Where |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Admin SDK credentials. Without it telemetry is a no-op and logs one warning. | Firebase console → Project settings → Service accounts |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Was hardcoded in 3 files. Must match `public/ads.txt`. | AdSense → Account → `ca-pub-…` |
| `NEXT_PUBLIC_AD_SLOT_BANNER_TOP` | One slot per placement. | AdSense → Ads → By ad unit |
| `NEXT_PUBLIC_AD_SLOT_IN_CONTENT` | " | " |
| `NEXT_PUBLIC_AD_SLOT_SIDEBAR` | " | " |
| `NEXT_PUBLIC_AD_SLOT_RESULTS` | " | " |

Set all of these in Vercel too. Placements with no slot render nothing, so ads simply stay off until you configure them.

Deploy the rules: `firebase deploy --only firestore:rules`

---

## 5. Code edits you need to make by hand

I did not have these files, or the change is a one-liner inside a file I am not replacing.

### 5a. Fix the broken import paths — required, the build fails without this

**`src/app/about/page.tsx`** — four imports:
```diff
-import Header from '@/src/components/Header';
-import Footer from '@/src/components/Footer';
-import SchemaMarkup from '@/src/components/SchemaMarkup';
-import { InContentAd } from '@/src/components/AdUnit';
+import Header from '@/components/Header';
+import Footer from '@/components/Footer';
+import SchemaMarkup from '@/components/SchemaMarkup';
+import { InContentAd } from '@/components/AdUnit';
```

Then check the whole tree:
```bash
grep -rn "@/src/" src/    # must return nothing
```

### 5b. `/api/scan` — `checkRateLimit` is now async

```diff
-const rateLimit = checkRateLimit(clientIP, 8, 10 * 60 * 1000);
+const rateLimit = await checkRateLimit(clientIP, 8, 10 * 60 * 1000);
```

And repoint the cache import:
```diff
-import { getCachedResult, setCachedResult } from '@/lib/redis';
+import { getCachedResult, setCachedResult, cacheKey } from '@/lib/cache';
```

The route builds its own SHA-256 cache key inline. Replace that block with `cacheKey(cleanResume, jobDescription, role)` so it matches what `runAtsAnalysis` uses, and drop the now-unused `createHash` import. `setCachedResult` no longer takes a TTL argument.

### 5c. `src/lib/gemini.ts` and `src/lib/ai/analyze.ts` — remove their private strippers

Both export their own `stripPII`. Delete those function bodies and re-export:

```ts
export { stripPII } from '@/lib/piiStripper';
```

In `analyze.ts`, also repoint the cache import to `@/lib/cache`.

### 5d. `src/lib/fileParser.ts` — pass the filename through

```diff
-const detectedFormat = detectFileFormatFromBuffer(buffer) as FileFormat;
+const detectedFormat = detectFileFormatFromBuffer(buffer, file.name);
```

Without this, a real `.odt` is routed to mammoth and throws.

### 5e. Footer — link `/terms`

`TOOL_LINKS` in `src/components/Footer.tsx` omits it, while the scanner's consent checkbox links to it. Add:
```ts
{ href: '/terms', label: 'Terms of Service' },
```

---

## 6. Copy corrections — factual accuracy on the legal pages

These say the wrong thing about who receives user data. See AUDIT P1-1 and P1-2.

### `src/app/privacy/page.tsx`

In `THIRD_PARTIES`, replace the OpenAI entry:

```ts
{
  name: 'Google Gemini API',
  desc: "PII-stripped resume text is sent to Google's Gemini 2.5 Flash model for analysis (with gemini-2.5-flash-lite as a fallback). Google's API terms apply. Content submitted through the paid API tier is not used to train Google's models; if you are on the free tier, review Google's current AI Studio terms, which differ.",
},
```

That last clause matters and is easy to get wrong: free-tier AI Studio usage and paid API usage have **different** data-use terms. State whichever tier you are actually on.

In Section 3, replace both mentions of OpenAI's GPT-4o Mini with Gemini 2.5 Flash, and soften the guarantee:

```diff
-The text sent to OpenAI contains only professional content: skills, work experience
-descriptions, education, and certifications. <strong>Your personal identity is never
-part of the AI prompt.</strong>
+The text sent to Google contains professional content: skills, work experience,
+education, and certifications. Our PII stripper is designed to remove contact
+details and identifiers before this happens, including your name where it appears
+in the resume header. <strong>Automated redaction is thorough but not perfect — it
+cannot guarantee that every identifier is caught in every document format.</strong>
```

### `src/app/about/page.tsx`

In `TECH_STACK`, replace the OpenAI entry:

```ts
{
  name: 'Google Gemini 2.5 Flash',
  desc: 'Structured JSON output via a response schema, so results are consistent without parse retries. Falls back to gemini-2.5-flash-lite under load.',
  icon: '🤖',
},
```

Apply the same softening to the "Privacy by Design" section, which repeats the identity claim verbatim.

**Also review** the "shipped 10+ production apps in fintech, healthcare, and productivity domains" line. If that is accurate, keep it. If not, cut it — E-E-A-T claims are exactly what a reviewer checks.

---

## 7. Verify

```bash
npm run typecheck
npm run build
npm run dev
```

Then check by hand:

- [ ] **Tailwind is alive.** Headings render in Syne, not the fallback. `text-brand-gold` on the footer "Pro" is amber. If these look wrong, the v4 migration needs another pass before anything else matters.
- [ ] **No fake ratings.** View source, search `aggregateRating` — should be absent. Re-run Google's Rich Results Test.
- [ ] **Icons.** DevTools → Network → favicon is ~42 KB, not 4.36 MB. `/og-image.png` returns 200.
- [ ] **Sitemap.** `/sitemap.xml` is the generated one and lists every role page. If you still see the old hand-written file, `public/sitemap.xml` did not get deleted.
- [ ] **A scan completes end to end**, and a document appears in `scan_analytics`. If not, check the server log for the `[analytics]` warning — it now tells you instead of failing silently.
- [ ] **Rate limiting is shared.** Nine scans in ten minutes from one IP; the ninth should 429 regardless of which instance serves it.
- [ ] **`grep -rn "@/src/" src/`** returns nothing.

---

## 8. What is deliberately not done

- **The homepage and role pages are untouched** — those files did not reach me. The unsourced statistics (75% rejection, 3.5× interviews, 95% Fortune 500) and the conflicting "Powered by" claims are still live.
- **No Razorpay, no premium tier, no content system.** Those are product build-outs, not fixes, and they should follow a working build rather than land on top of a broken one.
- **No `/methodology`, `/security`, or `/refund-policy` pages.** Worth adding, but they need real content about how your scoring actually works, which is a decision you make rather than one I can invent.
- **Terms of Service is still three short paragraphs** on a light background with no header or footer. It needs a real draft and a lawyer's eye, and I am not able to give you either.

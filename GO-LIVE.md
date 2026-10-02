# Go-live checklist

Eight phases produced eight APPLY files. This is the single consolidated list. Work top to bottom — the order matters, because the build fails partway down until step 3 is done.

---

## 1 · Rotate secrets — before anything else

The `.env.local` you uploaded in phase 1 must be treated as compromised.

- [ ] Gemini API key — regenerate at aistudio.google.com
- [ ] Upstash Redis token — rotate in the Upstash console
- [ ] Firebase service account — revoke the old key, generate a new one
- [ ] `SESSION_HASH_SECRET` — `openssl rand -hex 32`

`.gitignore` already covers `.env*`, so this is an upload exposure, not a git one.

## 2 · Review the Firestore exposure

Until 6 June 2026 the database was world-readable and world-writable — the rules were the untouched test defaults, and the project ID ships to every browser. Check what is in `scan_analytics`, `market_signals`, and `page_views`, and decide whether anything there needed protecting.

## 3 · Copy the files in, delete the dead ones

Everything under `src/`, `public/`, plus `firestore.rules`, `firestore.indexes.json`, `package.json`, `.env.example`, `scripts/`.

Then delete:

```bash
git rm src/lib/redis.ts src/lib/localCache.ts src/lib/ai/cache.ts
git rm src/components/ScannerTool.tsx src/components/ui/AdBanner.tsx src/components/AuthorBio.tsx
git rm tailwind.config.ts
git rm public/robots.txt public/sitemap.xml public/sitemap.xsl
```

`tailwind.config.ts` in particular: Tailwind v4 does not load it, and leaving it there implies it's doing something.

## 4 · Fix the import paths — the build fails without this

`src/app/about/page.tsx` imports `@/src/components/…`, which resolves to `src/src/…`.

```diff
-import Header from '@/src/components/Header';
+import Header from '@/components/Header';
```

Four imports in that file. Then confirm:

```bash
grep -rn "@/src/" src/     # must return nothing
```

## 5 · Environment variables

| Variable | If missing |
|---|---|
| `GEMINI_API_KEY` | No scans |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Rate limiting is per-instance and bypassable; no result links, so no return loop, so no outcome data |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | No telemetry — Moats 2 and 3 collect nothing |
| `SESSION_HASH_SECRET` | Session hashes predictable |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` + 4 slots | Ads render nothing (safe — just no revenue) |

Set these in Vercel too, not only locally.

## 6 · Deploy Firebase config

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

The rules are still the expired test defaults in production until you do this. The composite index is what makes `/insights` and role market-data work rather than failing closed.

## 7 · Copy corrections — factual accuracy

**`src/app/privacy/page.tsx`** and **`src/app/about/page.tsx`** both name **OpenAI GPT-4o Mini** as your data processor. The code calls **Gemini 2.5 Flash**. Exact replacement text is in `APPLY.md` §6.

Both also claim *"your personal identity is never part of the AI prompt."* Soften to *"designed to remove"* — regex redaction is best-effort and a guarantee is not something this implementation can honestly make.

**`src/app/privacy/page.tsx`** also needs the saved-result-links disclosure from `APPLY-5.md` §3. Don't ship the feature before the policy describes it.

## 8 · Verify

```bash
npm install
npm run verify          # typecheck + lint + build
npm start
npm run seo:check       # in a second terminal
```

Expect `seo:check` to fail on `/terms` — it contains `[GOVERNING LAW]` and `[LEGAL ENTITY NAME]` placeholders. That is the script working. Fill them in, and have the document reviewed before you take any payment.

---

## Smoke test

- [ ] Headings render in Syne — if not, the Tailwind v4 migration needs another look before anything else matters
- [ ] View source: no `aggregateRating`
- [ ] Favicon is ~42 KB, not 4.36 MB; `/og-image.png` returns 200
- [ ] `/sitemap.xml` is generated and lists every role page
- [ ] A scan completes; a document appears in `scan_analytics`
- [ ] Nine scans in ten minutes from one IP → the ninth 429s
- [ ] Scan twice with an edit between → the second shows a score delta
- [ ] `/r/<token>` loads; delete on that page makes it 404
- [ ] `/r/` is `noindex` and absent from the sitemap
- [ ] Tab through the scanner with no mouse — the file input must be reachable
- [ ] Unset `GEMINI_API_KEY` → the scan returns formatting findings, not a bare error

---

## What is deliberately unfinished

**`/insights` shows nothing.** It renders "0 reported outcomes, want at least 100." That is correct behaviour, not a bug. Resist filling it — the value of the page is that a number appearing there means something.

**Role market-data blocks are hidden.** Same reason: below `MIN_SAMPLE` they don't render.

**`/terms` is a draft** with placeholders and a visible banner saying so.

**No accounts, no payments, no content clusters.** Accounts are the real Moat 5 and the honest next build. Payments need pricing, refund terms, and a legal entity — business decisions I'd have to invent, which your brief tells me not to do.

---

## After launch, in priority order

1. **Get scans through the loop.** Moats 2 and 3 are built, wired, and empty. They fill with users, not commits.
2. **Watch `/insights`.** At 100 outcomes you can publish something no competitor in this category has.
3. **Watch role pages.** At ~100 scans per role, the market-data block appears and those pages stop being templates — which is what actually settles the AdSense low-value-content question.
4. **Then build accounts**, once you know whether people return at all.

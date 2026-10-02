# ATS Scanner Pro — complete project

**This is a complete, runnable project.** Previous downloads were *overlays* —
sets of changed files meant to be copied into your existing repo. That is why
`npm run dev` failed with every `@/` import unresolved: the overlay had no
`tsconfig.json`, so the path alias did not exist and nothing resolved. My fault
for shipping partial trees.

## Run it

```powershell
npm install
Copy-Item .env.example .env.local     # then fill it in
npm run dev
```

Verified in a clean environment before packaging:

- `npm install` — 629 packages, no errors
- `npx tsc --noEmit` — clean
- `npx next build` — **succeeds**, 31 routes, 17 role pages prerendered
- `npx vitest run` — 48 tests passing
- `node scripts/doctor.mjs` — 0 errors, 0 warnings

## One build requirement worth knowing

`next/font/google` downloads Syne and Plus Jakarta Sans from
`fonts.googleapis.com` during `next build` and self-hosts them. **If that domain
is unreachable the build fails** with "Failed to fetch `Syne` from Google Fonts".

Vercel and normal local builds are fine. A locked-down corporate network or CI
runner is not. If you hit it, allow `fonts.googleapis.com` and
`fonts.gstatic.com`, or switch to `next/font/local` with the `.woff2` files
committed. There is a note at the point in `src/app/layout.tsx` where you would
make that change.

## Before it goes live

`GO-LIVE.md` has the full checklist. The three that actually block you:

1. **Rotate every secret** in the `.env.local` you uploaded earlier — treat all
   of them as compromised.
2. **Deploy the Firestore rules.** Yours are still the expired test defaults:
   `firebase deploy --only firestore:rules,firestore:indexes`
3. **Fill in `.env.local`.** Without `GEMINI_API_KEY` nothing scans. Without the
   Upstash pair, rate limiting is per-instance and bypassable, and result links
   do not work.

## What changed in this build vs the v9 overlay

- Added everything a project needs to run: `tsconfig.json`, `next.config.ts`,
  `postcss.config.mjs`, `.eslintrc.json`, `.gitignore`
- Added the untouched originals the overlays never carried: `lib/seo.ts`,
  `SchemaMarkup`, `ScoreDial`, `ClientOnly`, `loading.tsx`, `not-found.tsx`
- **Wrote `/about`, `/contact`, `/privacy`** with every correction I had been
  asking you to apply by hand:
  - `@/src/…` imports fixed (this alone broke the build)
  - "OpenAI GPT-4o Mini" → Google Gemini 2.5 Flash on both pages. Naming the
    wrong recipient of user data is a substantive error, not a typo.
  - "your personal identity is never part of the AI prompt" softened to what
    regex redaction can actually support
  - saved-result-links and outcome data disclosed in the privacy policy
- **Fixed two type errors** the overlay had never been compiled to catch:
  `JSX.Element` in `FileUpload` (not a global namespace under React 19 types),
  and the `/api/scan` degraded-response shape in `ATSScanner`
- **Fixed a bug in `doctor.mjs`**: it scanned raw source for imports, so a
  comment mentioning an import path was reported as unresolvable
- Added `vitest` to devDependencies — the tests existed but the runner did not

# ATS Scanner Pro

Free ATS resume checker. Upload a resume, paste a job description, get keyword
coverage, formatting risks, and prioritised fixes.

Live: https://atsscannerpro.com

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 (CSS-first, no config file) ·
Google Gemini 2.5 Flash · Upstash Redis · Firebase Admin (telemetry) · Vercel

## Running locally

```bash
npm install
cp .env.example .env.local     # fill in at minimum GEMINI_API_KEY
npm run dev
```

Without Upstash the app still runs: rate limiting falls back to in-process
memory and result links are unavailable. Without Firebase, telemetry is a no-op
and logs one warning.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run verify` | typecheck → lint → test → build. Run before every deploy. |
| `npm test` | Unit tests (vitest) |
| `npm run seo:check` | Crawls the running site for SEO/content errors; exits 1 on failure |

## How a scan works

```
upload → validate (magic bytes, size)
       → extract text (pdf.js / mammoth)
       → deterministic parse checks        ← no AI, no cost, always runs
       → strip PII from resume AND job description
       → cache lookup (SHA-256 of stripped text)
       → Gemini 2.5 Flash, schema-constrained
       → cache write + telemetry + result link
```

The parse checks run **before** the model call, so a scan still returns real
formatting analysis when the AI is unavailable — see the degraded response in
`app/api/scan/route.ts`.

## Layout

```
src/app/          routes; api/scan is the core pipeline
src/components/   UI; ATSScanner is the main surface
src/lib/          the interesting parts:
  piiStripper.ts    single source of truth for redaction
  atsParseChecks.ts deterministic formatting analysis
  gemini.ts         model call, schema-constrained
  cache.ts          Upstash + in-process LRU
  marketIntel.ts    aggregates + outcome calibration
  resultStore.ts    shareable result links
tests/            vitest; piiStripper is the one that matters most
scripts/          seo-check.mjs quality gate
```

## Things that will bite you

**Tailwind v4 is CSS-first.** There is no `tailwind.config.ts`. Design tokens
live in the `@theme` block at the top of `src/app/globals.css`. Adding a colour
or font means editing that block.

**`piiStripper.ts` carries every privacy claim on the site.** If a regex there
regresses, the claims on `/privacy`, `/security`, and the homepage become false
and nothing else breaks — no error, no failing build. That is why it has the
most thorough test file in the repo. Do not weaken those tests to make a change
pass.

**Regexes that run over full resume text must have bounded quantifiers.** An
unbounded `+` before a required character is a denial-of-service vector: the
email pattern once took ~50s on a 200k-character token, against a 60s function
limit. There is a performance regression test guarding this.

**Statistics need sources.** `scripts/seo-check.mjs` fails the build if certain
unsourced claims reappear in rendered HTML. They were removed deliberately —
see `AUDIT.md`. If you publish a figure, it needs a citation, a date, and a
sample description, and it belongs on `/methodology`.

**Never fabricate structured data.** The site previously shipped an
`aggregateRating` of 4.8 from 3,241 non-existent ratings. Schema must describe
what a user can actually see on the page.

## Documentation

- `AUDIT.md` — the original findings, still the best map of why things are shaped as they are
- `MOATS.md` — the six durable advantages and which are built
- `APPLY-1.md` … `APPLY-8.md` — what changed in each phase and why

# Phase 9 — integration tooling + statistics hiding in prose

```
scripts/doctor.mjs      ← NEW — finds every build blocker in one pass
src/lib/rolesData.ts    ← three fabricated statistics removed from prose
src/types/index.ts      ← comment named the wrong AI provider
package.json            ← adds `npm run doctor`, wires it into `verify`
```

## Start here

```bash
npm run doctor
```

You hit `Module not found: '@/components/ATSScanner'`. That is one of roughly
fifteen files the phases introduced, so fixing it by rebuilding gets you the
next one, and the next. The doctor resolves **every** import in the project up
front and reports them together, alongside the migration steps that fail
silently rather than loudly.

It checks seven things:

| Check | Why it matters |
|---|---|
| Unresolved imports | The actual build blocker. Lists every one at once. |
| `@/src/` paths | Resolve to `src/src/…`. Four in `about/page.tsx`. |
| Tailwind v4 migration | v3 directives under a v4 toolchain emit **no utilities at all** — and the build still succeeds. |
| Files that should be deleted | `redis.ts`, `ScannerTool.tsx` and friends fail silently: the build passes and the wrong code runs. |
| Missing phase files | The ~15 new modules, by name. |
| Env vars | Which are missing and what breaks without each. |
| Banned content | Fabricated ratings, unsourced stats, wrong AI provider. |

Read-only. It changes nothing.

## What the doctor found on its first run

Phase 8 removed the fabricated `demandGrowth` and `avgAtsScore` **fields**. It
missed three claims written into role **prose**:

- `"Industry data shows that resumes scoring above 70 are 3.5x more likely to receive an interview call"`
- `"PMP … appears in 68% of PM job postings"`
- `"Product-focused AI engineer roles (70% of market)"`

The first is the worst of the three, and it is worse than the homepage versions
were: it lives in a **FAQ answer**, and role pages emit FAQ answers as
`FAQPage` structured data. That is a fabricated statistic published as
machine-readable markup for other systems to cite.

All three are removed. The doctor now scans prose for statistic-shaped language
(`industry data shows`, `Nx more likely`, `appears in N%`) and reports it as a
**warning** — a number in prose can be fine if it is sourced, so this flags for
a human rather than blocking.

One number was deliberately **kept**: `"Delivered 94% of projects on time over
3 years"`. That is an example resume bullet demonstrating what a quantified
achievement looks like, not a claim about the world. Removing it would remove
the lesson.

## Two false positives I had to fix in my own checker

Worth knowing, because they show where the rules are deliberately narrow:

1. **Trailing comments were being read as code.** `aiTokensUsed?: number; // OpenAI tokens consumed` was reported as a wrong-provider claim. The comment stripper only handled whole-line `//`. (The comment was also wrong, and is now corrected to Gemini.)

2. **"OpenAI" is legitimate in `rolesData.ts`.** An AI engineer's tooling genuinely includes the OpenAI API, and Anthropic and OpenAI are real employers worth naming. That rule is now scoped to `src/app/` and `src/components/`, where the concern is naming the wrong **data processor** in user-facing copy.

## Then

```bash
npm run doctor      # until 0 errors
npm run verify      # doctor + typecheck + lint + build
```

Expect one warning on a fresh checkout: `.env.local not found`. That is correct.

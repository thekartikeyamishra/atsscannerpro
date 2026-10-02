#!/usr/bin/env node
// scripts/doctor.mjs
//
// Integration checker. Finds every problem that stops this project building,
// in one pass, instead of one `npm run build` cycle per broken import.
//
//   node scripts/doctor.mjs
//   npm run doctor
//
// Why this exists: applying eight phases of changes by hand means a missing
// file surfaces as a single "Module not found", you fix it, rebuild, and hit
// the next one. With ~15 new files across the phases that is a long loop. This
// resolves every import in the project up front and reports all of them
// together, plus the migration steps that are easy to miss because they fail
// silently rather than loudly.
//
// Zero dependencies. Node 18+. Read-only — it changes nothing.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

let errors = 0;
let warnings = 0;
const problems = [];

const err = (area, msg, hint) => { problems.push({ level: 'ERROR', area, msg, hint }); errors++; };
const warn = (area, msg, hint) => { problems.push({ level: 'WARN', area, msg, hint }); warnings++; };

// Strip block and line comments, including trailing ones.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:"'\\])\/\/.*$/gm, '$1');
}

// ── Walk source files ───────────────────────────────────────────────────────
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mts)$/.test(entry)) out.push(full);
  }
  return out;
}

// ── Resolve an import the way the bundler would ─────────────────────────────
const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

function resolveModule(spec, fromFile) {
  let base;

  if (spec.startsWith('@/')) {
    // tsconfig maps "@/*" -> "./src/*"
    base = join(SRC, spec.slice(2));
  } else if (spec.startsWith('.')) {
    base = resolve(dirname(fromFile), spec);
  } else {
    return true; // bare package specifier — npm's problem, not ours
  }

  if (existsSync(base) && statSync(base).isFile()) return true;
  for (const ext of EXTS) if (existsSync(base + ext)) return true;
  for (const ext of EXTS) if (existsSync(join(base, 'index' + ext))) return true;
  return false;
}

// ── 1. Alias configuration ──────────────────────────────────────────────────
function checkTsconfig() {
  const path = join(ROOT, 'tsconfig.json');
  if (!existsSync(path)) {
    err('config', 'tsconfig.json not found', 'Are you running this from the project root?');
    return;
  }
  const raw = readFileSync(path, 'utf-8');
  if (!/"@\/\*"\s*:\s*\[\s*"\.\/src\/\*"\s*\]/.test(raw)) {
    warn(
      'config',
      'tsconfig paths does not map "@/*" to "./src/*"',
      'Every import in this project assumes that mapping. If your components live outside src/, move them rather than changing the alias.',
    );
  }
}

// ── 2. Unresolved imports — the actual build blocker ────────────────────────
function checkImports(files) {
  const missing = new Map(); // specifier -> [importing files]

  for (const file of files) {
    // Comments are stripped first: a comment that mentions an import path
    // ("corrected from '@/components/X'") was being parsed as a real import
    // and reported as unresolvable.
    const src = stripComments(readFileSync(file, 'utf-8'));
    const specs = [
      ...src.matchAll(/^\s*import\s[^'"]*from\s*['"]([^'"]+)['"]/gm),
      ...src.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm),
      ...src.matchAll(/\bfrom\s*['"](@\/[^'"]+)['"]/g),
    ].map((m) => m[1]);

    for (const spec of new Set(specs)) {
      if (spec.startsWith('@/src/')) {
        err(
          'imports',
          `${relative(ROOT, file)} imports "${spec}"`,
          'Resolves to src/src/… — replace "@/src/" with "@/".',
        );
        continue;
      }
      if (!resolveModule(spec, file)) {
        if (!missing.has(spec)) missing.set(spec, []);
        missing.get(spec).push(relative(ROOT, file));
      }
    }
  }

  for (const [spec, importers] of missing) {
    const guess = spec.startsWith('@/') ? `src/${spec.slice(2)}.tsx (or .ts)` : spec;
    err(
      'imports',
      `Cannot resolve "${spec}" — imported by ${importers.join(', ')}`,
      `Expected a file at ${guess}. Copy it from the pack, or fix the import path.`,
    );
  }
}

// ── 3. Files that should have been deleted ──────────────────────────────────
// These fail SILENTLY rather than loudly, which is what makes them dangerous:
// the build succeeds and the wrong code runs.
const SHOULD_BE_GONE = [
  ['src/lib/redis.ts', 'Superseded by src/lib/cache.ts. Double-encodes JSON, so every cache hit throws and falls through to a billable AI call.'],
  ['src/lib/localCache.ts', 'Superseded by src/lib/cache.ts. Starts a module-scope setInterval that keeps serverless instances alive.'],
  ['src/lib/ai/cache.ts', 'Superseded by src/lib/cache.ts. Uses a different key prefix, so identical scans miss the cache.'],
  ['src/components/ScannerTool.tsx', 'Posts resumeFile/jobTitle; the API expects file/jobDescription. Fails with MISSING_FILE on every submit.'],
  ['src/components/ui/AdBanner.tsx', 'Second adsbygoogle pusher with an invalid placeholder slot id.'],
  ['src/components/AuthorBio.tsx', 'Orphaned light-theme component.'],
  ['tailwind.config.ts', 'Tailwind v4 does not load it. Tokens now live in the @theme block in globals.css.'],
  ['public/robots.txt', 'Shadows app/robots.ts — a static file in public/ wins, so edits to the route do nothing.'],
  ['public/sitemap.xml', 'Shadows app/sitemap.ts, so your generated sitemap with every role page is never served.'],
  ['public/sitemap.xsl', 'Companion to the shadowing sitemap.xml.'],
];

function checkDeletions() {
  for (const [path, why] of SHOULD_BE_GONE) {
    if (existsSync(join(ROOT, path))) {
      err('cleanup', `${path} still exists`, why);
    }
  }
}

// ── 4. Tailwind v4 migration ────────────────────────────────────────────────
// Silent failure: v3 directives under a v4 toolchain emit no utilities at all.
function checkTailwind() {
  const css = join(SRC, 'app', 'globals.css');
  if (!existsSync(css)) {
    err('tailwind', 'src/app/globals.css not found', 'Copy it from the pack.');
    return;
  }
  const raw = readFileSync(css, 'utf-8');

  if (/@tailwind\s+(base|components|utilities)/.test(raw)) {
    err(
      'tailwind',
      'globals.css still uses v3 @tailwind directives',
      'package.json installs Tailwind v4, which removed them. Replace with @import "tailwindcss"; and the @theme block. NO utility class works until this is fixed.',
    );
  }
  if (!raw.includes('@import "tailwindcss"')) {
    err('tailwind', 'globals.css has no @import "tailwindcss"', 'Copy the migrated file from the pack.');
  }
  if (!raw.includes('@theme')) {
    warn(
      'tailwind',
      'No @theme block found',
      'Brand tokens (navy-900, brand-gold, font-syne) come from @theme in v4. Without it those classes silently do nothing.',
    );
  }
  if (/--radius-(xs|sm|md|lg|xl|2xl|3xl)\s*:/.test(raw.split('@theme')[0] ?? '')) {
    warn(
      'tailwind',
      ':root defines --radius-* outside @theme',
      "Those are Tailwind v4's own token names and unlayered CSS wins, so rounded-* changes size sitewide. The pack renames them to --r-*.",
    );
  }
}

// ── 5. Required files ───────────────────────────────────────────────────────
const REQUIRED = [
  'src/lib/cache.ts',
  'src/lib/piiStripper.ts',
  'src/lib/rateLimiter.ts',
  'src/lib/atsParseChecks.ts',
  'src/lib/marketIntel.ts',
  'src/lib/resultStore.ts',
  'src/lib/scanHistory.ts',
  'src/components/AdUnit.tsx',
  'src/components/OutcomeFeedback.tsx',
  'src/components/ResultLinkActions.tsx',
  'src/components/ScanHistory.tsx',
  'src/app/error.tsx',
  'src/app/global-error.tsx',
  'firestore.rules',
];

function checkRequired() {
  for (const path of REQUIRED) {
    if (!existsSync(join(ROOT, path))) {
      warn('files', `${path} missing`, 'Introduced by one of the phases. Copy it from the pack.');
    }
  }
}

// ── 6. Environment ──────────────────────────────────────────────────────────
const ENV_VARS = [
  ['GEMINI_API_KEY', 'error', 'No scans work without it.'],
  ['UPSTASH_REDIS_REST_URL', 'warn', 'Rate limiting falls back to per-instance memory (bypassable); no result links, so no return loop.'],
  ['UPSTASH_REDIS_REST_TOKEN', 'warn', 'Same as above.'],
  ['FIREBASE_SERVICE_ACCOUNT_KEY', 'warn', 'No telemetry — the outcome and market-data moats collect nothing.'],
  ['SESSION_HASH_SECRET', 'warn', 'Session hashes become predictable.'],
  ['NEXT_PUBLIC_ADSENSE_CLIENT_ID', 'warn', 'Ads render nothing. Safe, just no revenue.'],
];

function checkEnv() {
  const path = join(ROOT, '.env.local');
  if (!existsSync(path)) {
    warn('env', '.env.local not found', 'Copy .env.example to .env.local and fill it in.');
    return;
  }
  const raw = readFileSync(path, 'utf-8');
  for (const [name, level, why] of ENV_VARS) {
    const m = raw.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, 'm'));
    const value = m?.[1]?.trim().replace(/^["']|["']$/g, '');
    if (!value) {
      (level === 'error' ? err : warn)('env', `${name} is not set`, why);
    }
  }
}

// ── 7. Content that must not ship ───────────────────────────────────────────
// `scope` limits a rule to paths matching a pattern. Without it, "OpenAI"
// flags legitimate role keywords — an AI engineer's tooling genuinely includes
// the OpenAI API, and Anthropic and OpenAI are real employers to name.
const BANNED = [
  [/aggregateRating/, 'Fabricated review schema (4.8 from 3,241 ratings). Structured-data policy violation and a manual-action risk.'],
  [/75\s*%\s*of\s*resumes/i, 'Unsourced statistic.'],
  [/3\.5\s*[x×]\s*more/i, 'Unsourced statistic.'],
  [/95\s*%\s*(of\s*)?fortune\s*500/i, 'Unsourced statistic.'],
  [/GPT-4o|OpenAI/i, 'Wrong AI provider. The code calls Google Gemini — this misnames your data processor in user-facing copy.', /src[\\/](app|components)[\\/]/],
  [/demandGrowth\s*:/, 'Fabricated per-role growth figure. Removed from rolesData.ts in phase 8.'],
  [/avgAtsScore\s*:/, 'Implies a measured average that was never computed.'],
];

function checkContent(files) {
  for (const file of files) {
    const raw = readFileSync(file, 'utf-8');
    // Strip comments so explanatory notes don't trip the check. Trailing
    // comments count too — "x: number; // OpenAI tokens" was being read as
    // live code and reported as a wrong-provider claim.
    const code = stripComments(raw);
    for (const [pattern, why, scope] of BANNED) {
      if (scope && !scope.test(file)) continue;
      if (pattern.test(code)) {
        err('content', `${relative(ROOT, file)} contains ${pattern}`, why);
      }
    }
  }
}

// ── 8. Statistic-shaped claims in prose ─────────────────────────────────────
// Reported as warnings, not errors: a number in prose may be perfectly fine if
// it is sourced, or if it is an example bullet demonstrating a quantified
// achievement. This flags them for a human to check rather than blocking.
const STAT_SHAPES = [
  /industry data shows/i,
  /studies show/i,
  /research shows/i,
  /statistics show/i,
  /\b\d+(\.\d+)?\s*[x×]\s*more likely\b/i,
  /\bappears in \d{1,3}%\b/i,
  /\(\d{1,3}% of market\)/i,
];

function checkProseStats(files) {
  for (const file of files) {
    const code = stripComments(readFileSync(file, 'utf-8'));
    for (const pattern of STAT_SHAPES) {
      const hit = code.match(pattern);
      if (!hit) continue;
      const context = code.slice(Math.max(0, hit.index - 60), hit.index + 90).replace(/\s+/g, ' ');
      warn(
        'content',
        `${relative(ROOT, file)}: statistic-shaped claim — "…${context.trim()}…"`,
        'Source it with a citation and date, or remove it. FAQ answers become FAQPage structured data, so an unsourced number there is published as machine-readable markup.',
      );
    }
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────
console.log('\n  ATS Scanner Pro — integration check');
console.log('  ' + '─'.repeat(58));

if (!existsSync(SRC)) {
  console.error('\n  No src/ directory. Run this from the project root.\n');
  process.exit(1);
}

const files = walk(SRC);
console.log(`  ${files.length} source files\n`);

checkTsconfig();
checkImports(files);
checkDeletions();
checkTailwind();
checkRequired();
checkEnv();
checkContent(files);
checkProseStats(files);

// ── Report, grouped, most actionable first ──────────────────────────────────
const AREA_ORDER = ['config', 'imports', 'tailwind', 'files', 'cleanup', 'content', 'env'];
const AREA_TITLE = {
  config: 'Configuration',
  imports: 'Unresolved imports — these break the build',
  tailwind: 'Tailwind v4 migration',
  files: 'Missing files',
  cleanup: 'Files that should be deleted',
  content: 'Content that must not ship',
  env: 'Environment variables',
};

for (const area of AREA_ORDER) {
  const list = problems.filter((p) => p.area === area);
  if (list.length === 0) continue;

  console.log(`  ${AREA_TITLE[area]}`);
  for (const p of list) {
    console.log(`    ${p.level === 'ERROR' ? '✗' : '!'} ${p.msg}`);
    if (p.hint) console.log(`        ${p.hint}`);
  }
  console.log('');
}

console.log('  ' + '─'.repeat(58));
console.log(`  ${errors} errors · ${warnings} warnings\n`);

if (errors > 0) {
  console.log('  Fix the errors above, then run this again before npm run build.\n');
  process.exit(1);
}
if (warnings > 0) {
  console.log('  No blocking errors. Warnings are things that fail quietly.\n');
  process.exit(0);
}
console.log('  Clean. Try npm run build.\n');

#!/usr/bin/env node
// scripts/seo-check.mjs
//
// Automated SEO + content quality gate. Your brief asked for checks that catch
// missing/duplicate titles, missing canonicals, noindex pages in the sitemap,
// broken internal links, and placeholder text before it reaches production.
// This is that gate. No dependencies — plain Node 18+.
//
//   npm run build && npm start          # in one terminal
//   node scripts/seo-check.mjs          # in another
//   node scripts/seo-check.mjs https://atsscannerpro.com
//
// Exits 1 if any ERROR is found, so it can gate a deploy:
//   "predeploy": "next build && node scripts/seo-check.mjs"
//
// It fetches the sitemap, crawls every listed URL, and reports per-page. It is
// deliberately strict about the things that are cheap to fix and expensive to
// discover six months later in Search Console.

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

const LIMITS = {
  titleMin: 15,
  titleMax: 60,   // ~600px; longer gets truncated in results
  descMin: 70,
  descMax: 160,
};

// Text that must never reach production.
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /YOUR_[A-Z_]+/,
  /\[(?:GOVERNING LAW|JURISDICTION|LEGAL ENTITY NAME|REGISTERED BUSINESS ADDRESS|SUPPORT EMAIL|RAZORPAY KEY ID|REFUND PERIOD)/i,
  /undefined|NaN/,
];

// Statistics we removed for being unsourced. If one reappears, something
// regressed or was pasted back in.
const UNSOURCED_CLAIMS = [
  /75\s*%\s*of\s*resumes/i,
  /3\.5\s*[x×]\s*more/i,
  /95\s*%\s*(of\s*)?fortune\s*500/i,
  /23\s*%\s*higher/i,
];

const results = [];
let errors = 0;
let warnings = 0;

const err = (url, msg) => { results.push({ level: 'ERROR', url, msg }); errors++; };
const warn = (url, msg) => { results.push({ level: 'WARN', url, msg }); warnings++; };

// ── Tiny HTML helpers (regex is fine here: we control the markup) ───────────
const pick = (html, re) => (html.match(re) || [])[1]?.trim();

const getTitle = (h) => pick(h, /<title[^>]*>([\s\S]*?)<\/title>/i);
const getDesc = (h) =>
  pick(h, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ??
  pick(h, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
const getCanonical = (h) => pick(h, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
const getRobots = (h) => pick(h, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
const getOgImage = (h) => pick(h, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);

function getH1s(html) {
  return [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);
}

function getInternalLinks(html) {
  return [...html.matchAll(/<a[^>]+href=["']([^"'#?]+)["']/gi)]
    .map((m) => m[1])
    .filter((h) => h.startsWith('/') && !h.startsWith('//'));
}

function textContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getImagesMissingAlt(html) {
  return [...html.matchAll(/<img\b[^>]*>/gi)]
    .map((m) => m[0])
    .filter((tag) => !/\balt\s*=/.test(tag)).length;
}

// ── Crawl ───────────────────────────────────────────────────────────────────
async function fetchSitemapUrls() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();

  if (xml.includes('<sitemapindex')) {
    throw new Error('sitemap index files are not handled by this script yet');
  }
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function checkPage(url) {
  let res, html;
  try {
    res = await fetch(url, { redirect: 'manual' });
  } catch (e) {
    err(url, `request failed: ${e.message}`);
    return null;
  }

  if (res.status >= 300 && res.status < 400) {
    err(url, `sitemap URL redirects (${res.status} -> ${res.headers.get('location')}). Sitemaps must list final URLs.`);
    return null;
  }
  if (!res.ok) {
    err(url, `returned ${res.status}`);
    return null;
  }

  html = await res.text();

  // Title
  const title = getTitle(html);
  if (!title) err(url, 'missing <title>');
  else if (title.length < LIMITS.titleMin) warn(url, `title very short (${title.length} chars)`);
  else if (title.length > LIMITS.titleMax) warn(url, `title ${title.length} chars — will be truncated in results`);

  // Description
  const desc = getDesc(html);
  if (!desc) err(url, 'missing meta description');
  else if (desc.length < LIMITS.descMin) warn(url, `description short (${desc.length} chars)`);
  else if (desc.length > LIMITS.descMax) warn(url, `description ${desc.length} chars — will be truncated`);

  // Canonical
  const canonical = getCanonical(html);
  if (!canonical) err(url, 'missing canonical');
  else if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
    warn(url, `canonical points elsewhere: ${canonical}`);
  }

  // noindex must never appear in the sitemap
  const robots = getRobots(html);
  if (robots && /noindex/i.test(robots)) {
    err(url, 'page is noindex but listed in sitemap.xml — contradictory signal');
  }

  // Headings
  const h1s = getH1s(html);
  if (h1s.length === 0) err(url, 'no <h1>');
  else if (h1s.length > 1) warn(url, `${h1s.length} <h1> elements`);

  // OG image
  if (!getOgImage(html)) warn(url, 'no og:image — social shares render blank');

  // Content volume: the AdSense low-value-content signal
  const words = textContent(html).split(' ').filter(Boolean).length;
  if (words < 250) err(url, `only ~${words} words of text — thin content risk for AdSense review`);
  else if (words < 450) warn(url, `~${words} words — light for an indexable page`);

  // Images without alt
  const noAlt = getImagesMissingAlt(html);
  if (noAlt > 0) warn(url, `${noAlt} <img> without alt`);

  // Placeholders and unsourced claims
  for (const p of PLACEHOLDER_PATTERNS) {
    if (p.test(html)) err(url, `placeholder text present: ${p}`);
  }
  for (const p of UNSOURCED_CLAIMS) {
    if (p.test(html)) err(url, `unsourced statistic present: ${p} — source it or remove it`);
  }

  return { url, title, desc, links: getInternalLinks(html), words };
}

async function main() {
  console.log(`\nSEO check against ${BASE}\n${'─'.repeat(60)}`);

  let urls;
  try {
    urls = await fetchSitemapUrls();
  } catch (e) {
    console.error(`\n  Could not read the sitemap: ${e.message}`);
    console.error('  Is the server running? Try: npm run build && npm start\n');
    process.exit(1);
  }
  console.log(`  ${urls.length} URLs in sitemap.xml\n`);

  const pages = [];
  for (const url of urls) {
    const page = await checkPage(url);
    if (page) pages.push(page);
  }

  // Duplicate titles / descriptions across the site
  for (const [field, label] of [['title', 'title'], ['desc', 'description']]) {
    const seen = new Map();
    for (const p of pages) {
      if (!p[field]) continue;
      const list = seen.get(p[field]) ?? [];
      list.push(p.url);
      seen.set(p[field], list);
    }
    for (const [value, list] of seen) {
      if (list.length > 1) {
        err(list[0], `duplicate ${label} shared by ${list.length} pages: "${value.slice(0, 55)}…"`);
      }
    }
  }

  // Internal links that 404
  const linkTargets = new Set(pages.flatMap((p) => p.links));
  const checked = new Map();
  for (const path of linkTargets) {
    const target = `${BASE}${path}`;
    if (checked.has(target)) continue;
    try {
      const r = await fetch(target, { method: 'HEAD' });
      checked.set(target, r.status);
      if (r.status >= 400) err(target, `internal link returns ${r.status}`);
    } catch {
      err(target, 'internal link unreachable');
    }
  }

  // Orphans: indexable pages nothing links to
  const linked = new Set([...linkTargets].map((p) => `${BASE}${p}`.replace(/\/$/, '')));
  for (const p of pages) {
    const norm = p.url.replace(/\/$/, '');
    if (norm !== BASE && !linked.has(norm)) {
      warn(p.url, 'orphan — in sitemap but no internal link points to it');
    }
  }

  // ── Report ───────────────────────────────────────────────────────────────
  const byUrl = new Map();
  for (const r of results) {
    const list = byUrl.get(r.url) ?? [];
    list.push(r);
    byUrl.set(r.url, list);
  }

  for (const [url, list] of byUrl) {
    console.log(`  ${url.replace(BASE, '') || '/'}`);
    for (const r of list) {
      console.log(`    ${r.level === 'ERROR' ? '✗' : '!'} ${r.msg}`);
    }
    console.log('');
  }

  console.log('─'.repeat(60));
  console.log(`  ${pages.length} pages · ${errors} errors · ${warnings} warnings\n`);

  if (errors > 0) {
    console.log('  Errors block deployment. Fix them or adjust this script if a rule is wrong.\n');
    process.exit(1);
  }
  console.log('  No blocking issues.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

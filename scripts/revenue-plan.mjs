#!/usr/bin/env node
// scripts/revenue-plan.mjs — the "$3,500/month" feedback loop.
//
// Run it monthly with real numbers from AdSense (Reports → Countries, last 28
// days) and it tells you how far you are from the goal and which lever moves
// it most. Nothing here can guarantee revenue: RPM is set by Google's auction.
//
//   node scripts/revenue-plan.mjs                       # uses the planning defaults below
//   node scripts/revenue-plan.mjs us=40000:14 uk=8000:9 in=60000:0.8 other=20000:2
//        └ geo=pageviews:pageRPM(USD), from AdSense → Reports → Countries

const GOAL = 3500;

// Planning defaults (USD page RPM). Careers content typically sits around these
// ranges for display ads; replace with YOUR measured RPM as soon as you have it.
const DEFAULT = {
  us: { pv: 0, rpm: 12 },
  uk: { pv: 0, rpm: 8 },
  ca_au: { pv: 0, rpm: 8 },
  in: { pv: 0, rpm: 0.9 },
  other: { pv: 0, rpm: 2 },
};

const geos = structuredClone(DEFAULT);
for (const arg of process.argv.slice(2)) {
  const [k, v] = arg.split('=');
  const [pv, rpm] = v.split(':').map(Number);
  geos[k] = { pv: pv || 0, rpm: Number.isFinite(rpm) ? rpm : geos[k]?.rpm ?? 2 };
}

const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });
let total = 0;
let pvTotal = 0;
console.log('\nGeo       pageviews   page RPM   revenue');
for (const [k, g] of Object.entries(geos)) {
  const rev = (g.pv / 1000) * g.rpm;
  total += rev;
  pvTotal += g.pv;
  console.log(`${k.padEnd(9)} ${fmt(g.pv).padStart(9)}   $${g.rpm.toFixed(2).padStart(6)}   $${fmt(rev)}`);
}
console.log(`\nProjected: $${fmt(total)} / month from ${fmt(pvTotal)} pageviews (goal $${fmt(GOAL)})`);

const gap = GOAL - total;
if (gap <= 0) {
  console.log('Goal met. Protect it: keep content updated and Core Web Vitals green.\n');
  process.exit(0);
}
console.log(`Gap: $${fmt(gap)} / month\n\nTo close the gap with ONE lever (everything else unchanged):`);
for (const k of ['us', 'uk', 'in']) {
  const g = geos[k];
  if (g.rpm > 0) console.log(`  +${fmt((gap / g.rpm) * 1000)} more ${k.toUpperCase()} pageviews / month`);
}
if (pvTotal > 0) {
  const blended = (total / pvTotal) * 1000;
  console.log(`  or raise blended RPM from $${blended.toFixed(2)} to $${((GOAL / pvTotal) * 1000).toFixed(2)} (more tier-1 traffic, more pages per visit)`);
}
console.log(`
Levers that work (and don't break policy):
  1. More US/UK traffic: write guides for US/UK-specific searches (federal resume, UK CV format, cover letters).
  2. More pages per visit: link every scan report to the matching role guide; every guide to two more.
  3. Better ad viewability: keep in-article units near the content people read; never add units next to buttons.
  4. Seasonality: January and September job-search peaks — publish new guides 4–6 weeks before.
Never: click your own ads, ask anyone to click, buy traffic, or add pop-ups. Any of these can close the AdSense account.
`);

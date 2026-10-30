'use client';

import Link from 'next/link';
import { useState } from 'react';
import { WEIGHTS } from '@/lib/scan/analyze';
import type { Finding, KeywordResult, ScanReport } from '@/lib/scan/types';

const BAND_TEXT: Record<ScanReport['band'], { label: string; line: string }> = {
  strong: { label: 'Strong match', line: 'You cover most of what the posting asks for and the file reads cleanly.' },
  good: { label: 'Good match', line: 'A few important terms are missing or weakly placed. One focused edit should lift this.' },
  fair: { label: 'Fair match', line: 'Several required terms are missing, or the formatting is costing you. Start with the list below.' },
  weak: { label: 'Weak match', line: 'This resume isn\'t tailored to the posting yet — or the role is a stretch. Check the required terms first.' },
};

const PARTS: { key: keyof ScanReport['breakdown']; label: string }[] = [
  { key: 'keywords', label: 'Keywords' },
  { key: 'parsing', label: 'Parsing' },
  { key: 'impact', label: 'Bullet impact' },
  { key: 'title', label: 'Job title' },
  { key: 'sections', label: 'Sections' },
];

export default function Report({
  report,
  previous,
  ignored,
  onToggleIgnore,
  onReset,
}: {
  report: ScanReport;
  previous: number | null;
  ignored: string[];
  onToggleIgnore: (name: string) => void;
  onReset: () => void;
}) {
  const band = BAND_TEXT[report.band];
  const delta = previous === null ? null : report.score - previous;
  const groups: { title: string; note: string; items: KeywordResult[] }[] = [
    { title: 'Required by the posting', note: 'Listed under requirements, or repeated throughout. These matter most.', items: report.keywords.filter((k) => k.importance === 'required') },
    { title: 'Nice to have', note: 'Under "preferred" or "bonus". They break ties.', items: report.keywords.filter((k) => k.importance === 'preferred') },
    { title: 'Mentioned in the duties', note: 'Part of the day-to-day work described.', items: report.keywords.filter((k) => k.importance === 'mentioned') },
  ].filter((g) => g.items.length);

  return (
    <section aria-labelledby="report-title" className="rise mt-10 overflow-hidden rounded-2xl border border-rule bg-white">
      {/* Score */}
      <div className="grid gap-8 border-b border-rule p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
        <div className="flex items-end gap-4">
          <p className="leading-none">
            <span className="text-[5.5rem] font-extrabold tracking-[-0.05em] tabular-nums">{report.score}</span>
            <span className="ml-1 text-xl font-semibold text-graphite">/100</span>
          </p>
          {delta !== null && delta !== 0 && (
            <span className={`mb-4 rounded-full px-2.5 py-1 text-sm font-bold ${delta > 0 ? 'bg-moss/10 text-moss' : 'bg-redpen/10 text-redpen'}`}>
              {delta > 0 ? '+' : ''}
              {delta} since last scan
            </span>
          )}
        </div>
        <div>
          <h2 id="report-title" className="h-card text-[1.5rem]">{band.label}</h2>
          <p className="mt-1 text-ink-2">{band.line}</p>
          <dl className="mt-5 grid gap-2.5">
            {PARTS.map((p) => {
              const got = report.breakdown[p.key];
              const max = WEIGHTS[p.key];
              return (
                <div key={p.key} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-[0.92rem]">
                  <dt className="text-ink-2">{p.label}</dt>
                  <dd className="h-2 overflow-hidden rounded-full bg-desk" aria-hidden="true">
                    <div className="h-full rounded-full bg-ink transition-[width] duration-700" style={{ width: `${(got / max) * 100}%` }} />
                  </dd>
                  <dd className="text-right tabular-nums text-graphite">
                    {got}/{max}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
        {/* Fixes */}
        <div className="border-b border-rule p-6 sm:p-8 lg:border-r lg:border-b-0">
          <h3 className="h-card">What to fix first</h3>
          {report.fixes.length ? (
            <ol className="mt-4 space-y-4">
              {report.fixes.map((f, i) => (
                <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-2">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
                  <span className="text-[0.98rem] leading-relaxed">{f}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-ink-2">Nothing important stands out. Read the top third of the page once more as the recruiter would, then send it.</p>
          )}
          <p className="small muted mt-6">
            Only add skills you actually have. Recruiters ask about everything on the page.
          </p>
        </div>

        {/* Keywords */}
        <div className="p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="h-card">Keywords</h3>
            <span className="small muted">{report.keywordMatchPct}% found</span>
          </div>
          <p className="small muted mt-1">
            <span className="mark-hit">found</span> <span className="mx-1.5 mark-miss">missing</span>{' '}
            <span className="border-b-2 border-dashed border-graphite">similar wording</span>. Tap a term to leave it out of the score if it isn&apos;t relevant.
          </p>
          {groups.length === 0 && <p className="mt-4 text-ink-2">We couldn&apos;t find specific skills in this posting. Make sure you pasted the requirements section.</p>}
          {groups.map((g) => (
            <div key={g.title} className="mt-5">
              <h4 className="text-[0.95rem] font-bold">{g.title}</h4>
              <p className="small muted">{g.note}</p>
              <ul className="mt-2.5 flex flex-wrap gap-x-2 gap-y-2.5">
                {g.items.map((k) => (
                  <li key={k.name}>
                    <Chip k={k} ignored={ignored.includes(k.name)} onClick={() => onToggleIgnore(k.name)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Formatting + bullets */}
      <div className="grid border-t border-rule lg:grid-cols-[1.15fr_1fr]">
        <div className="border-b border-rule p-6 sm:p-8 lg:border-r lg:border-b-0">
          <h3 className="h-card">Formatting and parsing</h3>
          {report.findings.length ? (
            <ul className="mt-4 space-y-4">
              {report.findings.map((f) => (
                <FindingRow key={f.code} f={f} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-ink-2">No formatting problems found. The text came out in a sensible order with your contact details and standard headings.</p>
          )}
          {report.layout.format === 'paste' && (
            <p className="small muted mt-5">You pasted text, so layout checks (columns, tables, images) were skipped. Upload the file to include them.</p>
          )}
        </div>
        <div className="p-6 sm:p-8">
          <h3 className="h-card">Your bullets</h3>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <Stat label="Bullets found" value={report.resume.bullets} />
            <Stat label="With a number" value={`${report.resume.quantifiedBullets}`} sub={pct(report.resume.quantifiedBullets, report.resume.bullets)} />
            <Stat label="Start with an action verb" value={`${report.resume.actionVerbBullets}`} sub={pct(report.resume.actionVerbBullets, report.resume.bullets)} />
            <Stat label="Words" value={report.resume.words} />
          </dl>
          {report.resume.weakOpeners.length > 0 && (
            <p className="mt-5 text-[0.95rem]">
              Weak openers: {report.resume.weakOpeners.map((w) => <span key={w} className="mark-miss mr-2">{w}</span>)}
            </p>
          )}
          <p className="small mt-5">
            <Link href="/guides/quantify-resume-bullets">How to add numbers to bullets</Link>
          </p>
          {report.jd.title && (
            <p className="small mt-5 text-ink-2">
              Job title in the posting: <strong>{report.jd.title}</strong>.{' '}
              {report.resume.titleMatch === 'exact' ? 'Your resume uses it.' : report.resume.titleMatch === 'close' ? 'Your resume uses a close version.' : 'Your resume doesn\'t use it.'}
            </p>
          )}
        </div>
      </div>

      <Actions report={report} onReset={onReset} />
    </section>
  );
}

function pct(a: number, b: number) {
  return b ? `${Math.round((a / b) * 100)}%` : undefined;
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg bg-desk/60 p-3">
      <dt className="small muted">{label}</dt>
      <dd className="mt-0.5 text-xl font-bold tabular-nums">
        {value}
        {sub && <span className="ml-1.5 text-sm font-semibold text-graphite">{sub}</span>}
      </dd>
    </div>
  );
}

function Chip({ k, ignored, onClick }: { k: KeywordResult; ignored: boolean; onClick: () => void }) {
  const base = 'rounded-md px-1.5 py-0.5 text-[0.95rem] transition-opacity';
  const look = ignored
    ? 'line-through text-graphite/70'
    : k.status === 'matched'
      ? 'mark-hit font-semibold'
      : k.status === 'partial'
        ? 'border-b-2 border-dashed border-graphite'
        : 'mark-miss font-semibold text-ink';
  const title = ignored
    ? 'Ignored — tap to count it again'
    : k.status === 'matched'
      ? `Found ${k.resumeCount}×${k.matchedAs ? ` as "${k.matchedAs}"` : ''}${k.onlyInSkills ? ' — only in your skills list' : ''}`
      : k.status === 'partial'
        ? 'Similar words found — use the posting\'s exact phrase'
        : `Not found. The posting mentions it ${k.count}×`;
  return (
    <button type="button" onClick={onClick} className={`${base} ${look}`} title={title} aria-pressed={ignored}>
      {k.name}
      {k.onlyInSkills && !ignored && <sup className="ml-0.5 text-[0.65rem] font-bold text-graphite">skills only</sup>}
      <span className="sr-only">. {title}</span>
    </button>
  );
}

function FindingRow({ f }: { f: Finding }) {
  const color = f.severity === 'critical' ? 'bg-redpen' : f.severity === 'warning' ? 'bg-[#d58a00]' : 'bg-graphite/60';
  const label = f.severity === 'critical' ? 'Fix before applying' : f.severity === 'warning' ? 'Worth fixing' : 'Minor';
  return (
    <li className="grid grid-cols-[0.75rem_1fr] gap-3">
      <span className={`mt-2 h-2.5 w-2.5 rounded-full ${color}`} aria-hidden="true" />
      <div>
        <p className="font-semibold">
          {f.title} <span className="small font-normal text-graphite">— {label}{f.confidence === 'heuristic' ? ', likely' : ''}</span>
        </p>
        <p className="small mt-0.5 text-ink-2">{f.detail}</p>
        <p className="small mt-1"><strong>Fix:</strong> {f.fix}</p>
      </div>
    </li>
  );
}

function toText(r: ScanReport) {
  const rows = [
    `ATS Scanner Pro report — ${new Date(r.createdAt).toLocaleString()}`,
    `Score: ${r.score}/100 (${BAND_TEXT[r.band].label})`,
    `Keywords ${r.breakdown.keywords}/45 · Parsing ${r.breakdown.parsing}/20 · Impact ${r.breakdown.impact}/15 · Title ${r.breakdown.title}/10 · Sections ${r.breakdown.sections}/10`,
    '',
    'What to fix first:',
    ...r.fixes.map((f, i) => `${i + 1}. ${f}`),
    '',
    'Keywords:',
    ...r.keywords.map((k) => `- [${k.status}] ${k.name} (${k.importance})${k.onlyInSkills ? ' — skills list only' : ''}`),
    '',
    'Formatting:',
    ...(r.findings.length ? r.findings.map((f) => `- ${f.title}: ${f.fix}`) : ['- No problems found']),
    '',
    'Score is ATS Scanner Pro\'s own estimate — https://atsscannerpro.com/methodology',
  ];
  return rows.join('\n');
}

function Actions({ report, onReset }: { report: ScanReport; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="no-print flex flex-wrap items-center gap-3 border-t border-rule bg-desk/40 p-5 sm:px-8">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(toText(report));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard blocked */
          }
        }}
      >
        {copied ? 'Copied' : 'Copy report'}
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          const blob = new Blob([toText(report)], { type: 'text/plain' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `ats-report-${report.score}.txt`;
          a.click();
          URL.revokeObjectURL(a.href);
        }}
      >
        Download report
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
        Print
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
        Edit and check again
      </button>
      <p className="small muted w-full sm:ml-auto sm:w-auto">
        This score is our own estimate. <Link href="/methodology">See exactly how it&apos;s calculated</Link>.
      </p>
    </div>
  );
}

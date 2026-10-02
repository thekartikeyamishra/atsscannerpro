'use client';

// A11Y: the tabs were plain <button>s in a <div> — no tablist semantics, no
// aria-selected, no arrow-key navigation. A screen reader announced five
// unrelated buttons and gave no indication which panel was showing. This is now
// a real tab widget following the WAI-ARIA pattern.

import { useRef, useState } from 'react';
import type { ScanResult } from '@/types';

interface Props {
  result: ScanResult;
}

const TABS = ['Keywords', 'Missing', 'Improvements', 'Strengths', 'Formatting'] as const;
type Tab = typeof TABS[number];

export default function ResultsPanel({ result }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Keywords');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Left/Right wrap around the set; Home/End jump to the ends.
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    let next: number | null = null;

    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;

    e.preventDefault();
    setActiveTab(TABS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <p className="text-sm text-slate-400 leading-relaxed">{result.summary}</p>

      {/* Tabs */}
      <div role="tablist" aria-label="Scan result sections" className="flex gap-1 flex-wrap">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            // Roving tabindex: one Tab stop for the whole set, arrows move
            // between tabs. Five separate tab stops made keyboard users page
            // through every tab to reach the content below.
            tabIndex={activeTab === tab ? 0 : -1}
            ref={el => { tabRefs.current[i] = el; }}
            onKeyDown={e => onTabKeyDown(e, i)}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
      >
        {activeTab === 'Keywords' && result.matchedKeywords.map((kw, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 bg-emerald-500/8 rounded-xl border border-emerald-500/15">
            <span className="text-sm text-emerald-300 font-medium">{kw.keyword}</span>
            <span className="text-xs text-slate-500 capitalize">{kw.importance}</span>
          </div>
        ))}

        {activeTab === 'Missing' && result.missingKeywords.map((kw, i) => (
          <div key={i} className="p-2.5 bg-red-500/8 rounded-xl border border-red-500/15">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-red-300 font-medium">{kw.keyword}</span>
              <span className="text-xs text-slate-500 capitalize">{kw.importance}</span>
            </div>
            <p className="text-xs text-slate-500">{kw.suggestion}</p>
          </div>
        ))}

        {activeTab === 'Improvements' && result.improvements.map((tip, i) => (
          <div key={i} className="flex gap-2.5 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <span className="text-blue-400 font-bold text-xs shrink-0 mt-0.5">{i + 1}.</span>
            <p className="text-sm text-slate-300">{tip}</p>
          </div>
        ))}

        {activeTab === 'Strengths' && result.strengths.map((s, i) => (
          <div key={i} className="flex gap-2 p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
            <span className="text-emerald-400 text-sm shrink-0">✓</span>
            <p className="text-sm text-slate-300">{s}</p>
          </div>
        ))}

        {activeTab === 'Formatting' && (() => {
          const findings = result.parseReport?.findings ?? [];

          if (findings.length === 0) {
            return (
              <p className="text-sm text-emerald-400 p-2.5">
                ✓ No formatting problems found. The document extracted cleanly.
              </p>
            );
          }

          const TONE = {
            critical: 'bg-red-500/8 border-red-500/20 text-red-300',
            warning:  'bg-yellow-500/8 border-yellow-500/20 text-yellow-300',
            info:     'bg-white/[0.03] border-white/[0.07] text-slate-400',
          } as const;

          // Worst first — a user reads two or three of these, so the ordering
          // is doing most of the work.
          const order = { critical: 0, warning: 1, info: 2 } as const;
          const sorted = [...findings].sort((a, b) => order[a.severity] - order[b.severity]);

          return sorted.map(f => (
            <div key={f.code} className={`p-3.5 rounded-xl border ${TONE[f.severity]}`}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h4 className="text-sm font-semibold text-white">{f.title}</h4>
                {/* Confidence is shown because these are not all equal. A
                    'measured' finding was observed in the extracted text; a
                    'heuristic' one is a rule of thumb, and saying so is the
                    difference between a useful tool and a confident one. */}
                <span className="text-[10px] uppercase tracking-wider text-slate-600 shrink-0">
                  {f.confidence}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">{f.detail}</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="text-slate-500">Fix: </span>{f.fix}
              </p>
              {f.evidence && (
                <p className="mt-2 text-[11px] font-mono text-slate-600 truncate">
                  {f.evidence}
                </p>
              )}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
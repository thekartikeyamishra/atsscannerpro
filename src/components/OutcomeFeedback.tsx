'use client';
// src/components/OutcomeFeedback.tsx
//
// Asks, once, what actually happened after a scan. This is the collection point
// for the only dataset a competitor cannot copy and a model cannot generate:
// real application outcomes tied to real scores. See lib/marketIntel.ts.
//
// DESIGN CONSTRAINTS, deliberately:
//  • Never blocks or gates anything. The user already has their full result.
//  • Four taps, no free text. Free text invites PII and does not aggregate.
//  • Says plainly why we're asking. "Help us improve" is a dark pattern when
//    the real answer is "we are building a dataset".
//  • Dismissable, and never re-asks in the same session.
//
// It renders only when the user returns to a result — asking "did you hear
// back?" seconds after a scan is nonsense, so mount it behind a real revisit
// (see APPLY-4.md) rather than immediately after the first scan.

import { useState } from 'react';

const OPTIONS = [
  { value: 'callback', label: 'Heard back', hint: 'Recruiter or interview request' },
  { value: 'rejected', label: 'Rejected', hint: 'Explicit no' },
  { value: 'no_response', label: 'No response', hint: 'Silence so far' },
  { value: 'not_applied', label: "Didn't apply", hint: 'Changed my mind' },
] as const;

interface Props {
  /** The scanId returned by /api/scan. Without it there is nothing to join to. */
  scanId: string;
  className?: string;
}

export default function OutcomeFeedback({ scanId, className = '' }: Props) {
  const [state, setState] = useState<'asking' | 'sending' | 'done' | 'dismissed'>('asking');

  if (state === 'dismissed') return null;

  if (state === 'done') {
    return (
      <div className={`glass-card rounded-xl p-4 text-center ${className}`} role="status">
        <p className="text-sm text-slate-400">
          Thank you — that genuinely helps. We publish what we learn on{' '}
          <a href="/insights" className="text-blue-400 hover:text-blue-300 transition-colors">
            our insights page
          </a>
          .
        </p>
      </div>
    );
  }

  const submit = async (outcome: string) => {
    setState('sending');
    try {
      await fetch('/api/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId, outcome }),
      });
    } catch {
      // An optional contribution should never show the user an error.
    }
    setState('done');
  };

  return (
    <div className={`glass-card rounded-xl p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h3 className="font-semibold text-white text-sm">Did this application go anywhere?</h3>
        <button
          type="button"
          onClick={() => setState('dismissed')}
          aria-label="Dismiss this question"
          className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Say what the data is for. Anything vaguer would be a dark pattern. */}
      <p className="text-xs text-slate-500 leading-relaxed mb-4">
        Nobody in this industry knows whether resume scores actually predict callbacks, because
        nobody measures it. We are trying to. Your answer is stored with the scan only — no name,
        no company, no job title.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={state === 'sending'}
            onClick={() => submit(opt.value)}
            className="text-left p-3 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.14] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="block text-sm font-medium text-white">{opt.label}</span>
            <span className="block text-[11px] text-slate-500 mt-0.5">{opt.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
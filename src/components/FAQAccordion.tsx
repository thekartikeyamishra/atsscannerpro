'use client';
// src/components/FAQAccordion.tsx
// WHY: <details>/<summary> elements cause React hydration errors because browsers
// restore their "open" state from session history before React can hydrate,
// creating a DOM mismatch. This pure-React accordion is always consistent.
// A11Y FIX: the button now actually has the id that the answer panel's
// aria-labelledby points to.

import { useState } from 'react';

export interface FAQItem {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

function FAQEntry({ q, a, index }: FAQItem & { index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-answer-${index}`;
  const buttonId = `faq-btn-${index}`;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        id={buttonId}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset transition-colors hover:bg-white/[0.03]"
      >
        <span className="font-semibold text-white text-sm pr-4 leading-snug">{q}</span>
        <svg
          className={[
            'w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Animated answer panel */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        // grid-rows 0fr -> 1fr animates to the content's true height.
        // The previous max-h-96 clipped any answer over 384px with no scroll,
        // so longer answers were unreadable and their text was hidden from the
        // rendered page that Google indexes.
        className={[
          'grid transition-all duration-300 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-white/[0.06]">
            <p className="text-sm text-slate-400 leading-relaxed pt-4">{a}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
  return (
    <div className={`space-y-3 ${className}`} role="list">
      {items.map((item, i) => (
        <div key={i} role="listitem">
          <FAQEntry q={item.q} a={item.a} index={i} />
        </div>
      ))}
    </div>
  );
}
// src/app/contact/page.tsx
// This file already used the correct path alias, so imports are unchanged.
// SITE_URL now comes from lib/seo instead of a duplicated string literal.

import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Report a bug, suggest a feature, or ask about partnerships and privacy. We aim to respond within 48 hours.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: 'Contact — ATS Scanner Pro',
    description: 'Report a bug, suggest a feature, or ask about partnerships.',
    url: `${SITE_URL}/contact`,
    type: 'website',
  },
};

const CHANNELS = [
  {
    label: 'Email',
    value: 'workmailkartikeya@gmail.com',
    href: 'mailto:workmailkartikeya@gmail.com',
    note: 'Best for anything detailed. Reply within 48h.',
    external: false,
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/thekartikeyamishra',
    href: 'https://linkedin.com/in/thekartikeyamishra',
    note: 'Professional enquiries and partnerships.',
    external: true,
  },
  {
    label: 'X (Twitter)',
    value: '@kartikeyahere',
    href: 'https://x.com/kartikeyahere',
    note: 'Quick feedback and feature requests.',
    external: true,
  },
];

const TOPICS = [
  'Bug reports — include your browser, OS, and what you were scanning',
  'Feature requests and new role guides',
  'An unsourced claim you spotted on the site — we want to know',
  'Partnership and advertising enquiries',
  'Privacy or data-handling questions',
  'Security disclosures (see the Security page)',
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-xl mx-auto">
          <div className="mb-10">
            <span className="badge mb-4 inline-flex">Contact</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white mb-4">
              Get in touch
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Feedback, a bug, or a collaboration. I typically respond within 48 hours.
            </p>
          </div>

          <div className="space-y-3 mb-10">
            {CHANNELS.map((c) => (
              <a
                key={c.href}
                href={c.href}
                target={c.external ? '_blank' : undefined}
                rel={c.external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-4 glass-card rounded-xl hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-600 mb-0.5 uppercase tracking-wide font-medium">
                    {c.label}
                  </div>
                  <div className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                    {c.value}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{c.note}</div>
                </div>
                <svg
                  className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-bold font-syne text-white mb-4 text-lg">What to write about</h2>
            <ul className="space-y-2.5" role="list">
              {TOPICS.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true">
                    —
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-600 mt-6 text-center">
            This is a solo project. For urgent issues, email is fastest.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
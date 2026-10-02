// src/app/about/page.tsx
//
// CORRECTIONS APPLIED:
//  • Imports were '@/src/components/…', which resolves to src/src/… and broke
//    the build. Now '@/components/…'.
//  • Named Google Gemini 2.5 Flash as the data processor.
//  • "Your personal identity is never part of the AI prompt" softened to what
//    the implementation can actually support. Regex redaction is best-effort.

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchemaMarkup from '@/components/SchemaMarkup';
import { InContentAd } from '@/components/AdUnit';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About — Built by Kartikeya Mishra',
  description:
    'ATS Scanner Pro is built by Kartikeya Mishra, an AI engineer and indie developer from India. The tech behind it, the privacy approach, and why it exists.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About — ATS Scanner Pro',
    description:
      'The tech behind ATS Scanner Pro, the privacy approach, and why it exists.',
    url: `${SITE_URL}/about`,
    type: 'profile',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'ATS Scanner Pro' }],
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kartikeya Mishra',
  jobTitle: 'AI Engineer & Indie Developer',
  url: 'https://linkedin.com/in/thekartikeyamishra',
  sameAs: ['https://linkedin.com/in/thekartikeyamishra', 'https://x.com/kartikeyahere'],
  knowsAbout: [
    'Artificial Intelligence',
    'Machine Learning',
    'Applicant Tracking Systems',
    'Resume Optimization',
    'Next.js',
  ],
};

const TECH_STACK = [
  {
    name: 'Next.js 16',
    desc: 'App Router with React Server Components. Role guides are statically generated at build time.',
  },
  {
    name: 'Google Gemini 2.5 Flash',
    desc: 'Structured JSON output via a response schema, so results are consistent without parse retries. Falls back to gemini-2.5-flash-lite under load.',
  },
  {
    name: 'Deterministic parse checks',
    desc: 'Formatting analysis runs in plain code before any AI call — no tokens, instant, and identical on every run for the same document.',
  },
  {
    name: 'pdf.js + mammoth',
    desc: 'PDF, DOCX, DOC, TXT and RTF are parsed in memory. Files are never written to disk.',
  },
  {
    name: 'Server-side PII stripper',
    desc: 'Removes email, phone, addresses, PAN, profile URLs, and the candidate name from the resume header before anything reaches the AI.',
  },
  {
    name: 'Upstash Redis',
    desc: 'Result caching keyed by a SHA-256 hash of stripped text, plus rate limiting shared across servers.',
  },
];

const LINKS = [
  {
    href: 'https://linkedin.com/in/thekartikeyamishra',
    label: 'LinkedIn',
    bg: 'bg-blue-600/20 border-blue-500/30 text-blue-300',
  },
  {
    href: 'https://x.com/kartikeyahere',
    label: '@kartikeyahere',
    bg: 'bg-slate-700/60 border-slate-600/40 text-slate-300',
  },
  {
    href: 'mailto:workmailkartikeya@gmail.com',
    label: 'Email',
    bg: 'bg-emerald-600/15 border-emerald-500/25 text-emerald-300',
  },
];

export default function AboutPage() {
  return (
    <>
      <SchemaMarkup schemas={[personSchema]} />
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <span className="badge mb-4 inline-flex">About</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white leading-tight mb-4">
              ATS Scanner Pro
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              A free, privacy-first resume checker built to show job seekers what a job posting asks
              for that their resume doesn&apos;t say — and what might stop it being read properly.
            </p>
          </div>

          <div className="glass-card-elevated rounded-2xl p-6 mb-10 flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center font-black text-white text-2xl font-syne shrink-0 shadow-lg shadow-blue-900/40"
              aria-hidden="true"
            >
              K
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-xl font-syne">Kartikeya Mishra</h2>
              <p className="text-blue-400 text-sm font-medium mb-3">
                AI Engineer · Indie Developer · India
              </p>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                I build AI-powered tools for real problems, across machine learning, full-stack
                development, and product design. ATS Scanner Pro came from watching capable people
                get filtered out by automated systems before a human ever read their resume.
              </p>
              <div className="flex flex-wrap gap-2">
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-opacity hover:opacity-80 ${l.bg}`}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <InContentAd />

          <section className="mb-10 mt-8" aria-labelledby="stack-h">
            <h2 id="stack-h" className="text-xl font-bold font-syne text-white mb-5">
              How it&apos;s built
            </h2>
            <div className="space-y-3">
              {TECH_STACK.map((tech) => (
                <div key={tech.name} className="glass-card rounded-xl p-4">
                  <h3 className="font-semibold text-white text-sm mb-1">{tech.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10" aria-labelledby="privacy-h">
            <h2 id="privacy-h" className="text-xl font-bold font-syne text-white mb-4">
              Privacy by design
            </h2>
            <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
              <p>
                Before any text reaches Google&apos;s Gemini API, a server-side stripper removes
                email addresses, phone numbers, LinkedIn and GitHub URLs, physical addresses,
                PAN numbers, and the candidate name where it appears in the resume
                header. The same removal runs on the job description you paste, which often carries
                a recruiter&apos;s contact details.
              </p>
              <p>
                {/* Deliberately not "your identity is never sent". Regex redaction
                    cannot guarantee that, and claiming it would be the kind of
                    unverifiable promise this project exists to avoid. */}
                <strong className="text-white">
                  Automated redaction is thorough but not perfect
                </strong>{' '}
                — it cannot guarantee that every identifier in every document format is caught.
              </p>
              <p>
                We log only anonymised telemetry: score, grade, role category, and which keywords
                were commonly missing. No resume text, no contact details, and no file is ever
                persisted.
              </p>
              <p>
                Full detail is in our{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/security" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Security
                </Link>{' '}
                pages.
              </p>
            </div>
          </section>

          <section className="mb-10" aria-labelledby="why-h">
            <h2 id="why-h" className="text-xl font-bold font-syne text-white mb-4">
              Why it exists
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Most resume advice is assertion. This tool tries to be specific instead: which terms
              in this posting are missing from your resume, and what about this document might not
              extract cleanly. Where we can&apos;t measure something, we say so — see{' '}
              <Link
                href="/methodology"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                how the score works
              </Link>
              .
            </p>
          </section>

          <div className="glass-card rounded-2xl p-6 text-center border border-blue-500/20 bg-blue-500/5">
            <h2 className="font-bold text-white mb-2 font-syne">Feedback or a partnership idea?</h2>
            <p className="text-slate-400 text-sm mb-4">I read every message.</p>
            <Link
              href="/contact"
              className="btn-primary inline-flex px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
// src/app/methodology/page.tsx
//
// WHY THIS PAGE EXISTS
// Three problems it solves at once:
//
//  1. AdSense low-value content. The site is a tool plus role pages. This is a
//     substantive page that only this site can write, because it describes this
//     site's own system.
//  2. E-E-A-T. "Show your methodology" is the standard answer to "why should
//     anyone trust your score?" — and you cannot honestly show a methodology
//     while the product claims a precision it does not have.
//  3. It is the page that lets you delete unsourced statistics elsewhere
//     without losing credibility, because it replaces borrowed authority with
//     your own transparency.
//
// EVERY claim here is checkable against the code. The grade bands come from
// SYSTEM_PROMPT in lib/gemini.ts; the parsing behaviour from lib/fileParser.ts;
// the PII list from lib/piiStripper.ts. If you change those files, change this
// page — a methodology page that has drifted from the implementation is worse
// than none at all.

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchemaMarkup from '@/components/SchemaMarkup';
import { SITE_URL, buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'How Our ATS Score Works — Methodology',
  description:
    'Exactly how ATS Scanner Pro calculates your score: what we measure, what the grade bands mean, what the score cannot tell you, and how your data is handled.',
  alternates: { canonical: `${SITE_URL}/methodology` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'How Our ATS Score Works — Methodology',
    description:
      'What ATS Scanner Pro measures, what the grades mean, and the limits of any ATS score.',
    url: `${SITE_URL}/methodology`,
    type: 'article',
  },
};

const GRADES = [
  { grade: 'A+', range: '90–100', meaning: 'Very strong alignment. Most required terms present, clear structure.' },
  { grade: 'A',  range: '80–89',  meaning: 'Strong. A few secondary terms missing.' },
  { grade: 'B+', range: '70–79',  meaning: 'Good. Some important terms absent or only implied.' },
  { grade: 'B',  range: '60–69',  meaning: 'Reasonable. Noticeable gaps against the posting.' },
  { grade: 'C+', range: '50–59',  meaning: 'Mixed. Several critical terms missing.' },
  { grade: 'C',  range: '40–49',  meaning: 'Weak alignment with this specific posting.' },
  { grade: 'D',  range: '30–39',  meaning: 'Substantial gaps in coverage or structure.' },
  { grade: 'F',  range: '0–29',   meaning: 'Little overlap with the posting, or text extraction largely failed.' },
];

const PIPELINE = [
  {
    n: '01',
    title: 'Text extraction',
    body: 'Your file is read in memory. PDFs go through pdf.js, DOCX through mammoth, plain text and RTF directly. We read the text layer only — we do not run OCR, so a scanned or photographed resume has no text to extract and will fail rather than return a misleading score.',
  },
  {
    n: '02',
    title: 'Personal information removal',
    body: 'Before anything leaves our server we strip email addresses, phone numbers, LinkedIn/GitHub/social URLs, other personal URLs, postal addresses, Aadhaar and PAN numbers, passport-format identifiers, and the candidate name where it appears in the resume header. The same stripping runs on the job description, which often carries a recruiter\u2019s contact details.',
  },
  {
    n: '03',
    title: 'Structural checks',
    body: 'We detect which standard sections are present (experience, skills, education, summary, certifications, projects), estimate length, and look for quantified achievements. This part is deterministic — the same document always produces the same result.',
  },
  {
    n: '04',
    title: 'Language model comparison',
    body: 'The stripped resume and job description are sent to Google Gemini 2.5 Flash, with gemini-2.5-flash-lite as a fallback under load. A response schema constrains the output to a fixed structure. The model identifies matched terms, missing terms, and semantic equivalents — for example recognising that "people management" and "team leadership" describe the same thing.',
  },
  {
    n: '05',
    title: 'Score and grade',
    body: 'The model returns a 0–100 score weighing keyword coverage, section structure, experience relevance, and formatting risk. We validate the value, clamp it to range, and derive the letter grade from the fixed bands below.',
  },
];

const LIMITS = [
  'There is no single ATS. Workday, Greenhouse, Taleo, Lever and the rest parse differently and rank differently. No external tool can compute "your real ATS score", and any product claiming to is describing its own heuristic, as we are describing ours.',
  'Most applicant tracking systems do not actually auto-reject on a keyword score. They parse, store and let a recruiter search and filter. Poor parsing hurts because it makes you hard to find, not because a machine rejects you.',
  'The score measures alignment between two documents. It cannot judge whether you are a good candidate, and a high score on a job you are unsuited for is not a useful signal.',
  'A language model makes judgement calls. Run the same resume twice and the wording of suggestions may differ slightly, though the score is stable because generation temperature is set low.',
  'We do not know which ATS your target employer uses, so formatting warnings describe general parsing risk, not certainties about a specific system.',
];

export default function MethodologyPage() {
  const schemas = [
    buildArticleSchema({
      headline: 'How the ATS Scanner Pro score works',
      description:
        'The full methodology behind our ATS score: extraction, PII removal, structural checks, model comparison, grade bands, and stated limitations.',
      path: '/methodology',
    }),
    buildBreadcrumbSchema([
      { name: 'Home', path: '' },
      { name: 'Methodology', path: '/methodology' },
    ]),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <span className="badge mb-4 inline-flex">Methodology</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white leading-tight mb-4">
              How our score works
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              A score you can&apos;t interrogate isn&apos;t worth much. This page describes exactly
              what happens to your resume, how the number is produced, and — just as
              importantly — what it can&apos;t tell you.
            </p>
          </div>

          <section className="mb-12" aria-labelledby="pipeline-heading">
            <h2 id="pipeline-heading" className="text-xl font-bold font-syne text-white mb-5">
              What happens when you scan
            </h2>
            <div className="space-y-3">
              {PIPELINE.map(step => (
                <div key={step.n} className="glass-card rounded-xl p-5 flex gap-4">
                  <span className="text-xs font-mono text-blue-400 shrink-0 pt-0.5">{step.n}</span>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1.5">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12" aria-labelledby="grades-heading">
            <h2 id="grades-heading" className="text-xl font-bold font-syne text-white mb-3">
              What each grade means
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Bands are fixed, so the same score always produces the same grade.
            </p>
            <div className="space-y-1.5">
              {GRADES.map(g => (
                <div
                  key={g.grade}
                  className="flex items-start gap-4 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]"
                >
                  <span className="font-black font-syne text-white text-sm w-8 shrink-0">{g.grade}</span>
                  <span className="text-xs text-slate-500 font-mono w-16 shrink-0 pt-0.5">{g.range}</span>
                  <span className="text-sm text-slate-400 leading-relaxed">{g.meaning}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12" aria-labelledby="limits-heading">
            <h2 id="limits-heading" className="text-xl font-bold font-syne text-white mb-3">
              What this score cannot tell you
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              This section matters more than the one above it.
            </p>
            <ul className="space-y-3" role="list">
              {LIMITS.map(limit => (
                <li key={limit} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                  <span className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true">—</span>
                  {limit}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12" aria-labelledby="claims-heading">
            <h2 id="claims-heading" className="text-xl font-bold font-syne text-white mb-3">
              On statistics
            </h2>
            <div className="text-sm text-slate-400 leading-relaxed space-y-3">
              <p>
                You will see figures repeated across this industry — that some fixed percentage of
                resumes are auto-rejected, or that an optimised resume multiplies your interview
                rate. We previously repeated a few of them ourselves. When we went looking for the
                primary research behind them, we could not find it.
              </p>
              <p>
                So we removed them. We would rather tell you how our own system works than borrow
                authority from numbers we cannot source. Where we publish a statistic in future it
                will carry a citation, a date, and a description of the sample.
              </p>
              <p>
                If you find a claim anywhere on this site that isn&apos;t sourced, please{' '}
                <Link href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">
                  tell us
                </Link>{' '}
                and we will correct or remove it.
              </p>
            </div>
          </section>

          <section className="mb-10" aria-labelledby="data-heading">
            <h2 id="data-heading" className="text-xl font-bold font-syne text-white mb-3">
              What we keep
            </h2>
            <div className="text-sm text-slate-400 leading-relaxed space-y-3">
              <p>
                Your file is never written to disk. Text is extracted in memory and discarded when
                the request ends. We retain anonymised telemetry — score, grade, role category,
                which sections were detected, and which keywords were commonly missing — with no
                resume text and no contact details attached.
              </p>
              <p>
                Results are cached for 24 hours against a SHA-256 hash of the stripped text, so
                rescanning an unchanged document returns instantly without a second model call.
                The hash is one-way: your resume cannot be reconstructed from it.
              </p>
              <p>
                Automated redaction is thorough but not perfect. It cannot guarantee that every
                identifier in every document format is caught. Full detail is in our{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>

          <div className="glass-card rounded-2xl p-6 text-center border border-blue-500/20 bg-blue-500/5">
            <h2 className="font-bold text-white mb-2 font-syne">Now that you know how it works</h2>
            <p className="text-slate-400 text-sm mb-4">
              Scan your resume against a real posting and see the breakdown.
            </p>
            <Link href="/#scanner" className="btn-primary inline-flex px-5 py-2.5 rounded-xl text-sm font-bold">
              Scan my resume
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
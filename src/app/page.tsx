// src/app/page.tsx — Homepage
//
// What this version does:
// 1. Integrates the AppDownloadBanner to capture mobile waitlist intent.
// 2. Implements grounded methodology rather than unsourced statistics.
// 3. Mounts ScanHistory to establish a return-loop for users.
// 4. Integrates the InContentAd unit for high-RPM editorial monetization.

import type { Metadata } from 'next';
import Link from 'next/link';
import ATSScanner from '@/components/ATSScanner';
import ScanHistory from '@/components/ScanHistory';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import SchemaMarkup from '@/components/SchemaMarkup';
import { InContentAd } from '@/components/AdUnit';
import AppDownloadBanner from '@/components/AppDownloadBanner';
import { getAllRoles, getRoleBySlug } from '@/lib/rolesData';
import { SITE_URL, buildWebSiteSchema, buildSoftwareAppSchema, buildFAQSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker — Compare Your Resume to Any Job',
  description:
    'Upload your resume, paste a job description, and see which keywords match, which are missing, and what may stop it parsing correctly. Free, no sign-up, nothing stored.',
  alternates: { canonical: SITE_URL },
};

const STEPS = [
  {
    n: '01',
    title: 'Upload your resume',
    body: 'PDF, DOCX, DOC, TXT or RTF. It is read in memory and never written to disk.',
  },
  {
    n: '02',
    title: 'Paste the job description',
    body: 'The real posting you are applying to. Matching is per-job — a generic scan tells you very little.',
  },
  {
    n: '03',
    title: 'Read what to fix first',
    body: 'Matched and missing keywords, parsing risks, and prioritised suggestions. Roughly 10–20 seconds.',
  },
];

const ANALYSED = [
  {
    title: 'Keyword coverage',
    body: 'Exact matches, semantic equivalents ("people management" ≈ "team leadership"), and terms the posting emphasises that your resume never mentions.',
  },
  {
    title: 'Parsing risks',
    body: 'Multi-column layouts, tables, contact details stranded in a page header, encoding damage, and image-only PDFs with no text layer. These checks are deterministic — same document, same findings, every time.',
  },
  {
    title: 'Structure',
    body: 'Whether standard sections are detectable, whether employment dates are in a readable format, and whether achievements carry numbers.',
  },
  {
    title: 'Priority',
    body: 'An ordered list, because knowing there are eleven problems is not useful without knowing which two matter.',
  },
];

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes, with no sign-up and no scan limit beyond basic rate limiting to prevent abuse. The site is supported by advertising.',
  },
  {
    q: 'Do you store my resume?',
    a: 'No. The file is read into memory, text is extracted, and it is discarded when the request finishes. Nothing is written to disk or to a database. If you choose to save a result link, only the analysis is stored — your score and suggestions — never the resume text or the job description.',
  },
  {
    q: 'What is sent to the AI?',
    a: 'Professional content only. Before anything leaves our server we remove email addresses, phone numbers, profile URLs, postal addresses, national ID numbers, and your name where it appears in the resume header. The same removal runs on the job description you paste.',
  },
  {
    q: 'Is this the same score a real ATS would give me?',
    a: 'No, and no tool can give you that. There is no single applicant tracking system — Workday, Greenhouse, Taleo and the rest parse and rank differently. Our score is our own heuristic, and we publish exactly how it is calculated on our methodology page.',
  },
  {
    q: 'Will a high score get me an interview?',
    a: 'We cannot promise that, and we would be suspicious of anyone who does. A good score means your resume is machine-readable and aligned with the posting. It says nothing about the other applicants, the hiring manager, or whether the role was already filled internally.',
  },
  {
    q: 'Should I add keywords I do not actually have?',
    a: 'No. Add a term only if you genuinely have the experience. A resume that gets you into an interview you cannot substantiate has not helped you.',
  },
  {
    q: 'What file formats work best?',
    a: 'A PDF exported directly from a word processor is the most reliable, followed by DOCX. Avoid scans, screenshots, and PDFs exported from design tools with text converted to outlines — those have no text layer to read.',
  },
];

type Props = { searchParams: Promise<{ role?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const { role: roleParam } = await searchParams;

  const initialRole = roleParam && getRoleBySlug(roleParam) ? roleParam : '';

  const roles = getAllRoles();
  const featured = roles.slice(0, 12);

  const schemas = [
    buildWebSiteSchema(),
    buildSoftwareAppSchema(),
    buildFAQSchema(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <Header />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="pt-28 pb-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="badge mb-5 inline-flex">Free · No sign-up · Nothing stored</span>
            <h1 className="text-4xl sm:text-5xl font-black font-syne text-white leading-[1.1] mb-5">
              See what a job posting asks for that your resume doesn&apos;t say
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
              Upload your resume and paste the job description. You&apos;ll get the keywords that
              match, the ones that are missing, and the formatting that could stop it being read
              properly.
            </p>
          </div>
        </section>

        {/* ── The tool ──────────────────────────────────────────────── */}
        <section id="scanner" className="px-4 pb-14 scroll-mt-20">
          <ATSScanner initialRole={initialRole} />
        </section>

        <section className="px-4 pb-14">
          <div className="max-w-4xl mx-auto">
            <ScanHistory />
          </div>
        </section>

        {/* ── Mobile CTA Integration ────────────────────────────────── */}
        <section className="px-4 pb-14">
          <div className="max-w-4xl mx-auto">
            <AppDownloadBanner />
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────── */}
        <section className="px-4 py-14 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold font-syne text-white mb-8">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {STEPS.map((step) => (
                <div key={step.n} className="glass-card rounded-xl p-5">
                  <span className="text-xs font-mono text-blue-400">{step.n}</span>
                  <h3 className="font-semibold text-white text-sm mt-2 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What gets analysed ────────────────────────────────────── */}
        <section className="px-4 py-14 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold font-syne text-white mb-3">What we look at</h2>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-xl">
              Four things, in the order they tend to matter.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {ANALYSED.map((item) => (
                <div key={item.title} className="glass-card rounded-xl p-5">
                  <h3 className="font-semibold text-white text-sm mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust ─────────────────────────────────────────────────── */}
        <section className="px-4 py-14 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold font-syne text-white mb-3">
              What happens to your resume
            </h2>
            <div className="text-slate-400 leading-relaxed space-y-3 max-w-xl mb-6">
              <p>
                It is read into memory, the text is extracted, and the file is discarded when the
                request ends. There is no temporary directory and no storage bucket — nothing to
                leak later.
              </p>
              <p>
                Before any text reaches the AI, we remove contact details, profile URLs, national
                ID numbers, and your name where it appears in the header. Automated redaction is
                thorough but not perfect, and we say so rather than promising otherwise.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/security" className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold">
                How we handle data
              </Link>
              <Link href="/methodology" className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold">
                How the score works
              </Link>
            </div>
          </div>
        </section>

        {/* ── Ad Placement ──────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4">
          <InContentAd />
        </div>

        {/* ── Role guides ───────────────────────────────────────────── */}
        <section className="px-4 py-14 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold font-syne text-white mb-3">Guides by role</h2>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-xl">
              The terms that appear most in postings for a given role, and how to structure a
              resume for it.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {featured.map((role) => (
                <Link
                  key={role.slug}
                  href={`/role/${role.slug}`}
                  className="text-sm px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] transition-colors"
                >
                  {role.title}
                </Link>
              ))}
            </div>
            <Link
              href="/roles"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              All {roles.length} role guides →
            </Link>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section className="px-4 py-14 border-t border-white/[0.06]">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold font-syne text-white mb-8">Common questions</h2>
            <FAQAccordion items={FAQS} />
          </div>
        </section>

        {/* ── Close ─────────────────────────────────────────────────── */}
        <section className="px-4 py-16 border-t border-white/[0.06]">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold font-syne text-white mb-3">
              Check it before you send it
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Takes under a minute. No account, and nothing kept.
            </p>
            <Link href="#scanner" className="btn-primary inline-flex px-6 py-3 rounded-xl font-bold">
              Scan my resume
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
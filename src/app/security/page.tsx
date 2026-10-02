// src/app/security/page.tsx
//
// WHY THIS PAGE EXISTS
// You ask people to upload a resume — a document with their employment history,
// education, and (before stripping) their contact details. "How do you handle
// it?" is the reasonable first question, and answering it concretely is a
// genuine differentiator against competitors who say "bank-level security" and
// stop there.
//
// EVERY control described here is implemented in the code as of this writing:
//   • in-memory parsing        → lib/fileParser.ts (no disk writes)
//   • PII removal              → lib/piiStripper.ts
//   • upload validation        → lib/security.ts
//   • rate limiting            → lib/rateLimiter.ts
//   • cache hashing            → lib/cache.ts
//   • injection separation     → lib/gemini.ts
//   • database access          → firestore.rules
//
// NOTHING here claims a certification, an audit, or a compliance status. Do not
// add SOC 2, ISO 27001, or "GDPR compliant" to this page. Those are attestations
// with specific meanings, and claiming one you do not hold is both a legal
// exposure and exactly the kind of thing that destroys the trust this page is
// meant to build. If you obtain one, say so with the date and the auditor.

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchemaMarkup from '@/components/SchemaMarkup';
import { SITE_URL, buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Security — How We Handle Your Resume',
  description:
    'What happens to your resume file, what we remove before AI analysis, how uploads are validated, and what we deliberately do not claim.',
  alternates: { canonical: `${SITE_URL}/security` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Security — How We Handle Your Resume',
    description: 'Concrete detail on file handling, PII removal, and upload validation.',
    url: `${SITE_URL}/security`,
    type: 'article',
  },
};

const CONTROLS = [
  {
    title: 'Your file is never written to disk',
    body: 'The upload is read into memory, text is extracted, and the buffer is released when the request ends. There is no temporary directory, no object storage bucket, and no database column holding resume content. Nothing to leak later, and nothing for us to hand over.',
  },
  {
    title: 'Uploads are validated by content, not by filename',
    body: 'We check the file\u2019s actual magic bytes rather than trusting its extension, so a renamed executable is not treated as a PDF. Size is capped at 10MB and a 500-byte floor rejects empty files. Text is sanitised of null bytes and control characters before anything else touches it.',
  },
  {
    title: 'Personal information is removed before AI analysis',
    body: 'Email addresses, phone numbers, LinkedIn/GitHub/social URLs, other personal URLs, postal addresses, PAN numbers, passport-format identifiers, and the candidate name in the resume header are stripped server-side. We explicitly redact Indian national identification numbers from processing. The same stripping runs on the job description you paste, which often contains a recruiter\u2019s direct contact details.',
  },
  {
    title: 'Document text is treated as data, never as instructions',
    body: 'A resume or job posting could contain text addressed to the AI model \u2014 asking it to ignore its rules or inflate a score. Our instructions travel in a separate channel from your documents, and each document is fenced with a delimiter generated fresh for that request, so text written beforehand cannot forge a boundary.',
  },
  {
    title: 'Cache keys are one-way hashes',
    body: 'Results are cached for 24 hours against a SHA-256 hash of the already-stripped text. The hash cannot be reversed into your resume. An unchanged rescan returns from cache without a second model call.',
  },
  {
    title: 'Rate limiting is shared across servers',
    body: 'Scan limits are enforced against shared storage rather than a single server\u2019s memory, so they cannot be bypassed by sending requests in parallel. This protects service availability and keeps automated abuse from running up AI costs.',
  },
  {
    title: 'The analytics database is closed to browsers',
    body: 'Telemetry is written only by our server using administrative credentials. Database rules deny all direct client access, so nothing can be read or modified from a browser.',
  },
  {
    title: 'Secrets stay on the server',
    body: 'API keys and service credentials are held in server-side environment variables and are never included in the JavaScript sent to your browser.',
  },
];

const NOT_CLAIMED = [
  'We do not hold SOC 2, ISO 27001, or any other security certification. If that changes we will name the auditor and the date here.',
  'We do not claim to be "GDPR compliant" or "DPDP compliant" as a badge. Those are ongoing obligations, not certificates. Our Privacy Policy describes what we actually do with data and what rights you have.',
  'Automated redaction is thorough but not perfect. It cannot guarantee every identifier in every document format is caught \u2014 an unusual layout or an embedded image containing text may not be handled.',
  'We are not a penetration-tested enterprise platform. This is an independently built tool, and this page describes real controls rather than an assurance programme.',
];

export default function SecurityPage() {
  const schemas = [
    buildArticleSchema({
      headline: 'Security at ATS Scanner Pro',
      description:
        'How resume uploads are validated, parsed, stripped of personal information, and analysed \u2014 and what we deliberately do not claim.',
      path: '/security',
    }),
    buildBreadcrumbSchema([
      { name: 'Home', path: '' },
      { name: 'Security', path: '/security' },
    ]),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <span className="badge mb-4 inline-flex">Security</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white leading-tight mb-4">
              How we handle your resume
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              You&apos;re uploading a document with your employment history on it. Here is exactly
              what happens to it, described specifically enough that you can hold us to it.
            </p>
          </div>

          <section className="mb-12" aria-labelledby="controls-heading">
            <h2 id="controls-heading" className="text-xl font-bold font-syne text-white mb-5">
              What we do
            </h2>
            <div className="space-y-3">
              {CONTROLS.map(control => (
                <div key={control.title} className="glass-card rounded-xl p-5">
                  <h3 className="font-semibold text-white text-sm mb-1.5">{control.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{control.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12" aria-labelledby="notclaimed-heading">
            <h2 id="notclaimed-heading" className="text-xl font-bold font-syne text-white mb-3">
              What we don&apos;t claim
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Security pages usually list only strengths. These are the limits.
            </p>
            <ul className="space-y-3" role="list">
              {NOT_CLAIMED.map(item => (
                <li key={item} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                  <span className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10" aria-labelledby="report-heading">
            <h2 id="report-heading" className="text-xl font-bold font-syne text-white mb-3">
              Reporting a vulnerability
            </h2>
            <div className="text-sm text-slate-400 leading-relaxed space-y-3">
              <p>
                If you find a security issue, email{' '}
                <a
                  href="mailto:workmailkartikeya@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  workmailkartikeya@gmail.com
                </a>{' '}
                with enough detail to reproduce it. We aim to acknowledge within 48 hours.
              </p>
              <p>
                Please give us a reasonable window to fix an issue before disclosing it publicly.
                We don&apos;t run a paid bug bounty, but we will credit you here if you&apos;d like.
              </p>
              <p>
                Please don&apos;t run automated scanners against the live service — it degrades
                availability for people trying to use the tool, and our rate limiting will block
                you anyway.
              </p>
            </div>
          </section>

          <div className="glass-card rounded-2xl p-6 border border-white/[0.08]">
            <p className="text-sm text-slate-400 leading-relaxed">
              Related:{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                Privacy Policy
              </Link>{' '}
              covers what data we retain and your rights over it.{' '}
              <Link href="/methodology" className="text-blue-400 hover:text-blue-300 transition-colors">
                Methodology
              </Link>{' '}
              explains how the score itself is produced.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
// src/app/privacy/page.tsx — DPDP Act 2023 / GDPR-aware privacy policy
//
// CORRECTIONS APPLIED:
//  • Named Google Gemini as the processor.
//  • "Your personal identity is never part of the AI prompt" softened to what
//    the implementation supports.
//  • Added the saved-result-links disclosure.
//
// NOT LEGAL ADVICE. This is a developer-written draft. Have it reviewed.

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/lib/seo';

// Static string — toLocaleDateString() renders differently on Node and in the
// browser (ICU differences), which causes a hydration mismatch.
const LAST_UPDATED = 'September 8, 2026';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What ATS Scanner Pro collects, what it removes before AI analysis, what it never stores, and your rights under the DPDP Act 2023 and GDPR.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mb-8 scroll-mt-24">
      <h2 id={`${id}-h`} className="text-xl font-bold font-syne text-white mb-3">
        {title}
      </h2>
      <div className="text-sm text-slate-400 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

const PII_TYPES = [
  'Email addresses',
  'Phone numbers, including +91 and international formats',
  'LinkedIn, GitHub and other profile URLs',
  'Physical and postal addresses',
  'Aadhaar numbers',
  'PAN and passport-format identifiers',
  'Your name, where it appears in the resume header',
];

const COLLECTED = [
  {
    label: 'Resume file',
    desc: 'Received by our server, read into memory, text extracted, then discarded when the request ends. It is never written to disk or to any database.',
  },
  {
    label: 'Job description',
    desc: 'Used only to compute the match. Stripped of personal information (recruiter contact details are common) and not retained after the request.',
  },
  {
    label: 'Anonymised telemetry',
    desc: 'Score, letter grade, role category, which sections were detected, and which keywords were commonly missing. No resume text, no identifiers.',
  },
  {
    label: 'Saved result links',
    desc: 'When a scan completes we store the analysis — your score, matched and missing keywords, and suggestions — behind a random link so you can return to it. This contains no resume text, no job description, and no contact details. Links expire 30 days after the scan, and anyone holding a link can delete it immediately from the result page.',
  },
  {
    label: 'Application outcomes',
    desc: 'If you choose to tell us what happened to an application, we store a coarse outcome against the scan id and nothing else — no employer, no job title, no identifier that links it back to you.',
  },
  {
    label: 'IP address',
    desc: 'Used for rate limiting. Held transiently and not stored in any database.',
  },
];

const THIRD_PARTIES = [
  {
    name: 'Google Gemini API',
    desc: "PII-stripped text is sent to Google's Gemini 2.5 Flash model for analysis, with gemini-2.5-flash-lite as a fallback. Google's API terms apply. Data-use terms differ between the paid API and free AI Studio tiers — review the terms for the tier this service runs on.",
  },
  {
    name: 'Firebase / Google Cloud',
    desc: 'Anonymised telemetry is stored in Firestore. No resume text, no personal data. Database rules deny all direct browser access.',
  },
  {
    name: 'Upstash Redis',
    desc: 'Caches analysis results for up to 30 days against a one-way SHA-256 hash. The hash cannot be reversed into your resume.',
  },
  {
    name: 'Google AdSense',
    desc: 'We display ads to keep the service free. AdSense may set cookies. Opt out at adssettings.google.com.',
  },
  {
    name: 'Vercel',
    desc: 'Hosting. Access logs (IP, URL, timestamp) may be collected under their data processing terms.',
  },
];

const RETENTION = [
  ['Resume file and extracted text', 'Never persisted — discarded when the request ends'],
  ['Job description', 'Never persisted'],
  ['Saved result links', 'Expire 30 days after the scan; deletable at any time'],
  ['Anonymised telemetry', 'Retained for aggregate analysis'],
  ['Cached results', 'Auto-expire after 30 days'],
  ['Rate-limit records', 'Transient'],
];

export default function PrivacyPage() {
  return (
    <>
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <span className="badge mb-4 inline-flex">Legal</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-600">Last updated: {LAST_UPDATED}</p>
          </div>

          <Section id="s1" title="1. Overview">
            <p>
              ATS Scanner Pro is committed to collecting as little as possible. This policy explains
              what is collected when you use the service, how it is processed, and your rights
              under India&apos;s Digital Personal Data Protection Act 2023 and the GDPR.
            </p>
            <p>
              <strong className="text-white">The short version:</strong> your resume is never
              stored. Personal information is removed before any AI processes your text. We keep
              only what is needed to run and improve the product.
            </p>
          </Section>

          <Section id="s2" title="2. What we collect">
            <div className="space-y-3">
              {COLLECTED.map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]"
                >
                  <strong className="text-white text-sm">{item.label}:</strong>
                  <span className="text-sm text-slate-400 ml-1">{item.desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="s3" title="3. What is removed before AI analysis">
            <p>Before any text is sent to Google&apos;s Gemini API, our server removes:</p>
            <ul className="mt-2 space-y-1.5 pl-4">
              {PII_TYPES.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              The text that is sent contains professional content: skills, work experience,
              education and certifications.
            </p>
            <p>
              <strong className="text-white">
                Automated redaction is thorough but not perfect.
              </strong>{' '}
              It cannot guarantee that every identifier in every document format is caught — an
              unusual layout, or text inside an image, may not be handled.
            </p>
          </Section>

          <Section id="s4" title="4. Third parties">
            <div className="space-y-3">
              {THIRD_PARTIES.map((tp) => (
                <div key={tp.name} className="p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <strong className="text-white text-sm">{tp.name}:</strong>
                  <p className="text-slate-400 text-sm mt-1">{tp.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="s5" title="5. Your rights">
            <p>
              Under the DPDP Act 2023 and, where applicable, the GDPR, you have the right to access
              information about how your data is processed, to seek correction or erasure, to
              complain to a supervisory authority, and to nominate someone to act on your behalf.
            </p>
            <p>
              Because we do not store resumes or contact details, there is usually no personal data
              to retrieve or erase. The exception is a saved result link, which you can delete
              yourself from the result page at any time.
            </p>
            <p>
              To exercise any of these rights, email{' '}
              <a
                href="mailto:workmailkartikeya@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                workmailkartikeya@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section id="s6" title="6. Cookies">
            <p>
              ATS Scanner Pro sets no first-party cookies. Scan history is stored in your own
              browser&apos;s local storage and is never sent to us — clearing site data removes it.
              Google AdSense may set third-party cookies; you can opt out via{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Google&apos;s Ad Settings
              </a>
              .
            </p>
          </Section>

          <Section id="s7" title="7. Retention">
            <div className="space-y-2">
              {RETENTION.map(([label, val]) => (
                <div
                  key={label}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]"
                >
                  <span className="text-white text-xs font-medium">{label}</span>
                  <span className="text-slate-500 text-xs">{val}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="s8" title="8. Contact">
            <p>Questions about this policy or how data is handled:</p>
            <div className="mt-3 p-4 glass-card rounded-xl">
              <p className="text-white font-semibold mb-1">Kartikeya Mishra</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:workmailkartikeya@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  workmailkartikeya@gmail.com
                </a>
              </p>
              <p className="mt-1 text-slate-500 text-xs">Response within 48 hours on business days.</p>
            </div>
          </Section>

          <div className="pt-4 border-t border-white/[0.06]">
            <Link href="/security" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              See also: how we handle your resume →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
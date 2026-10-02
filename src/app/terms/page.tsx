// src/app/terms/page.tsx
//
// WHAT CHANGED AND WHY
// The old page was three short paragraphs on a light background (bg-slate-50)
// with no Header and no Footer — visually a different website, and a dead end
// with no navigation. It was linked from the scanner's consent checkbox, so it
// was the page users landed on at the exact moment they were asked to agree to
// something, and it appeared in no sitemap.
//
// IMPORTANT — READ BEFORE PUBLISHING
// This is a DRAFT written by a developer, not a lawyer. It is structured and
// substantially more complete than what it replaces, but sections 9 and 10
// contain placeholders you must fill in, and the whole document should be
// reviewed by qualified counsel before you rely on it — particularly before
// you take payments, which changes your obligations considerably.

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms governing your use of ATS Scanner Pro, including acceptable use, what our analysis does and does not guarantee, and limitation of liability.',
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

// Static string — toLocaleDateString() renders differently on Node and in the
// browser (ICU locale data differs), which causes a hydration mismatch.
const LAST_UPDATED = 'September 7, 2026';

// ⚠️ Replace before publishing. Do not invent these — an incorrect governing-law
// clause is worse than an obviously unfinished one.
const GOVERNING_LAW = '[GOVERNING LAW — e.g. the laws of India]';
const JURISDICTION = '[JURISDICTION — e.g. the courts of Bengaluru, Karnataka]';
const LEGAL_ENTITY = '[LEGAL ENTITY NAME — or "Kartikeya Mishra, sole proprietor"]';

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mb-8 scroll-mt-24">
      <h2 id={`${id}-heading`} className="text-xl font-bold font-syne text-white mb-3">
        {title}
      </h2>
      <div className="text-sm text-slate-400 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <>
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <span className="badge mb-4 inline-flex">Legal</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white mb-2">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-600">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="glass-card rounded-xl p-5 mb-10 border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Draft.</strong> These terms are being finalised and
              have not yet been reviewed by legal counsel. Sections 9 and 10 contain placeholders.
              Remove this notice once the document is complete.
            </p>
          </div>

          <Section id="section-1" title="1. Agreement">
            <p>
              By using ATS Scanner Pro (&quot;the service&quot;) you agree to these terms. If you do
              not agree, do not use the service. The service is operated by {LEGAL_ENTITY}.
            </p>
            <p>
              We may update these terms. Material changes will be reflected in the &quot;last
              updated&quot; date above. Continuing to use the service after a change means you
              accept the revised terms.
            </p>
          </Section>

          <Section id="section-2" title="2. What the service does">
            <p>
              You upload a resume and paste a job description. We extract the text, remove personal
              information, and use an AI model to compare the two documents. You receive a score,
              a list of matched and missing keywords, and suggested improvements.
            </p>
            <p>
              The service is currently free and requires no account. We may introduce paid features
              in future; if we do, this document will be updated before you are asked to pay
              anything.
            </p>
          </Section>

          <Section id="section-3" title="3. What we do not promise">
            <p>
              <strong className="text-white">
                We do not guarantee interviews, employment, or that any specific applicant tracking
                system will accept, rank, or parse your resume in a particular way.
              </strong>
            </p>
            <p>
              Our score is our own heuristic. It is not an official score from any applicant
              tracking system, and no such official score exists to compare it against. Different
              systems parse and rank differently. Our{' '}
              <Link href="/methodology" className="text-blue-400 hover:text-blue-300 transition-colors">
                methodology page
              </Link>{' '}
              sets out exactly what we measure and what the score cannot tell you.
            </p>
            <p>
              Analysis is generated by an AI model and may contain errors or omissions. Treat the
              output as one input to your own judgement, not as professional career advice.
            </p>
          </Section>

          <Section id="section-4" title="4. Acceptable use">
            <p>You agree not to:</p>
            <ul className="mt-2 space-y-1.5 pl-4">
              {[
                'Upload files containing malware, or files crafted to exploit our parsing pipeline',
                'Attempt to circumvent rate limits, or automate access at a scale that degrades the service',
                'Upload another person\u2019s resume without their knowledge and consent',
                'Attempt to extract, reverse-engineer, or manipulate the underlying AI prompts or models',
                'Resell, rebrand, or redistribute the analysis as your own product',
                'Use the service for anything unlawful',
              ].map(rule => (
                <li key={rule} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 mt-1.5" aria-hidden="true" />
                  {rule}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              We may rate-limit or block access where we detect abuse, without notice.
            </p>
          </Section>

          <Section id="section-5" title="5. Your content">
            <p>
              You keep all rights to your resume. You grant us only the narrow permission needed to
              process it for the scan you requested — extracting text, removing personal
              information, and sending the remainder to our AI provider for analysis.
            </p>
            <p>
              We do not store your resume file or its text, and we do not use your resume to train
              any model. What we retain is anonymised telemetry, described in our{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              You are responsible for having the right to upload what you upload, and for the
              accuracy of what your resume claims.
            </p>
          </Section>

          <Section id="section-6" title="6. Third-party services">
            <p>
              The service depends on third parties, including Google (AI analysis and advertising),
              Vercel (hosting), and Upstash (caching). Their terms and privacy practices apply to
              the data they process. We are not responsible for their availability or conduct.
            </p>
            <p>Advertisements are served by Google AdSense. We do not control which ads appear.</p>
          </Section>

          <Section id="section-7" title="7. Availability">
            <p>
              The service is provided &quot;as is&quot; and &quot;as available&quot;, without
              warranties of any kind, express or implied. We do not promise uptime, and we may
              change, suspend, or discontinue any part of it at any time.
            </p>
            <p>
              This is an independently operated project. There is no service level agreement and no
              guaranteed support response.
            </p>
          </Section>

          <Section id="section-8" title="8. Limitation of liability">
            <p>
              To the maximum extent permitted by law, {LEGAL_ENTITY} is not liable for any
              indirect, incidental, special, consequential, or punitive damages, or for lost
              opportunities, lost employment, or lost income arising from your use of — or
              inability to use — the service.
            </p>
            <p>
              Nothing in these terms excludes liability that cannot lawfully be excluded. Some
              jurisdictions do not allow certain exclusions, in which case those exclusions do not
              apply to you.
            </p>
          </Section>

          <Section id="section-9" title="9. Governing law">
            <p>
              These terms are governed by {GOVERNING_LAW}. Disputes are subject to the exclusive
              jurisdiction of {JURISDICTION}.
            </p>
            <p className="text-slate-500">
              Placeholder — must be completed before these terms are relied upon.
            </p>
          </Section>

          <Section id="section-10" title="10. Contact">
            <p>Questions about these terms:</p>
            <div className="mt-3 p-4 glass-card rounded-xl">
              <p className="text-white font-semibold mb-1">{LEGAL_ENTITY}</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:workmailkartikeya@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  workmailkartikeya@gmail.com
                </a>
              </p>
              <p className="mt-1 text-slate-500 text-xs">
                We aim to respond within 48 hours on business days.
              </p>
            </div>
          </Section>

          <div className="pt-4 border-t border-white/[0.06]">
            <Link
              href="/"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to ATS Scanner Pro
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// src/app/insights/page.tsx
//
// Publishes what the aggregate data actually shows — and, until there is
// enough of it, says so plainly.
//
// This page is the visible half of moats #2 and #3. It is also the one page on
// the site that a competitor cannot produce by prompting a model, because its
// content is derived from operating history rather than from knowledge.
//
// ── THE RULE ───────────────────────────────────────────────────────────────
// Below MIN_SAMPLE, this page renders an honest empty state. It does not
// render a placeholder number, an illustrative example, or a "coming soon"
// that implies data exists. Your brief is explicit on this, and it is also
// simply correct: a thin statistic published confidently would destroy the
// credibility the dataset is being built to earn.
//
// Revalidates hourly — aggregates do not need to be live, and a cached page
// keeps Firestore reads off the critical path.

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchemaMarkup from '@/components/SchemaMarkup';
import { SITE_URL, buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { getScoreCalibration, MIN_SAMPLE } from '@/lib/marketIntel';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Insights — What We Measure',
  description:
    'Aggregate findings from resume scans: whether our score predicts callbacks, and what job descriptions actually ask for. Published only when the sample is large enough to mean something.',
  alternates: { canonical: `${SITE_URL}/insights` },
  robots: { index: true, follow: true },
};

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export default async function InsightsPage() {
  const calibration = await getScoreCalibration();

  const schemas = [
    buildArticleSchema({
      headline: 'ATS Scanner Pro insights: what the data shows',
      description:
        'Aggregate, anonymised findings from resume scans, published with sample sizes and dates.',
      path: '/insights',
    }),
    buildBreadcrumbSchema([
      { name: 'Home', path: '' },
      { name: 'Insights', path: '/insights' },
    ]),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <span className="badge mb-4 inline-flex">Insights</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white leading-tight mb-4">
              What the data actually shows
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Resume advice is mostly assertion. We would rather publish measurements — including
              when the measurement is inconvenient, and including when we don&apos;t have enough
              of it yet to say anything.
            </p>
          </div>

          {/* ── Calibration ────────────────────────────────────────────── */}
          <section className="mb-12" aria-labelledby="calibration-heading">
            <h2 id="calibration-heading" className="text-xl font-bold font-syne text-white mb-3">
              Does our score predict a callback?
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Every ATS tool gives you a number. As far as we can tell, none of them publish
              whether that number relates to what happens next. We ask users what came of their
              application and compare it against the score we gave them.
            </p>

            {calibration.status === 'ok' && (
              <>
                <div className="space-y-1.5 mb-4">
                  {calibration.bands.map((band) => (
                    <div
                      key={band.scoreRange}
                      className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]"
                    >
                      <span className="font-mono text-xs text-slate-400 w-16 shrink-0">
                        {band.scoreRange}
                      </span>
                      <span className="text-sm text-white font-semibold w-16 shrink-0">
                        {band.callbackRate === null ? '—' : pct(band.callbackRate)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {band.callbackRate === null
                          ? `only ${band.sampleSize} responses in this band — not enough to report`
                          : `reported a callback · n=${band.sampleSize}`}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Based on {calibration.totalOutcomes} self-reported outcomes as of{' '}
                  {calibration.asOf}. Self-reported data is subject to response bias: people who
                  hear back may be likelier to tell us. These figures describe the people who
                  answered, not all applicants, and they are not a controlled study.
                </p>
              </>
            )}

            {calibration.status === 'insufficient' && (
              <div className="glass-card rounded-xl p-5 border border-white/[0.08]">
                <p className="text-sm text-slate-300 leading-relaxed mb-2">
                  <strong className="text-white">Not enough data yet.</strong> We have{' '}
                  {calibration.totalOutcomes} reported outcomes and want at least{' '}
                  {calibration.needed} before publishing a rate.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We could show you the number we have. We&apos;re not going to, because at this
                  sample size it would be noise presented as a finding — and that is precisely the
                  habit this page exists to break.
                </p>
              </div>
            )}

            {calibration.status === 'unavailable' && (
              <div className="glass-card rounded-xl p-5 border border-white/[0.08]">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Outcome data is not available right now. Check back shortly.
                </p>
              </div>
            )}
          </section>

          {/* ── Method ─────────────────────────────────────────────────── */}
          <section className="mb-12" aria-labelledby="method-heading">
            <h2 id="method-heading" className="text-xl font-bold font-syne text-white mb-3">
              How these numbers are produced
            </h2>
            <div className="text-sm text-slate-400 leading-relaxed space-y-3">
              <p>
                After a scan we store the score, grade, role category, which sections were
                detected, and which keywords were missing. No resume text, no contact details, no
                identifier that links a scan to a person.
              </p>
              <p>
                If a user later tells us what happened to that application, we store the outcome
                against the scan id and nothing else. There is deliberately no way to work back
                from an outcome to an individual.
              </p>
              <p>
                Nothing is published below {MIN_SAMPLE} data points, and no individual band is
                reported below 30. Where a figure is missing you will see a dash and the reason,
                rather than an estimate.
              </p>
              <p>
                Full detail of the scoring itself is on our{' '}
                <Link
                  href="/methodology"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  methodology page
                </Link>
                .
              </p>
            </div>
          </section>

          {/* ── Limits ─────────────────────────────────────────────────── */}
          <section className="mb-10" aria-labelledby="limits-heading">
            <h2 id="limits-heading" className="text-xl font-bold font-syne text-white mb-3">
              What this can&apos;t tell you
            </h2>
            <ul className="space-y-3" role="list">
              {[
                'Outcomes are self-reported and voluntary. That is a biased sample, and no amount of volume fixes the bias — it only narrows the error bars around a skewed estimate.',
                'Correlation between score and callback would not prove the score caused it. People who scan their resume are already people who tailor their applications.',
                'We see one scan, not the rest of an application: the cover letter, the referral, the timing, whether the role was already filled.',
                'If the data ends up showing our score does not predict callbacks, we will publish that. Being the only people holding the evidence is the point, not being flattered by it.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                  <span className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true">
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="glass-card rounded-2xl p-6 text-center border border-blue-500/20 bg-blue-500/5">
            <h2 className="font-bold text-white mb-2 font-syne">Contribute a data point</h2>
            <p className="text-slate-400 text-sm mb-4">
              Scan a resume, apply, then come back and tell us what happened. That is the whole
              dataset.
            </p>
            <Link
              href="/#scanner"
              className="btn-primary inline-flex px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Scan my resume
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
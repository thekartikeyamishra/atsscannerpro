// src/app/r/[token]/page.tsx
// A saved scan result, revisitable by URL.
//
// ── WHY THIS PAGE MATTERS MORE THAN IT LOOKS ───────────────────────────────
//
// It is the return trigger. Phase 4 built outcome capture and then flagged that
// it could not be mounted anywhere sensible: asking "did you hear back?" ten
// seconds after a scan is nonsense, and without accounts there was no moment
// when a user came BACK to a result.
//
// This is that moment. A user who opens their result link a week after applying
// is exactly the person who knows what happened — so OutcomeFeedback renders
// here, and only here, gated on the result being at least a day old.
//
// It is also the distribution surface: a result someone can send to a friend or
// a mentor is a link into the product that costs nothing to produce.
//
// ── INDEXING ───────────────────────────────────────────────────────────────
// noindex, and it must stay that way. These pages are semi-private, unique per
// user, and would be textbook thin duplicate content at scale — the exact
// pattern that puts an AdSense account at risk. They are deliberately absent
// from sitemap.ts.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScoreDial from '@/components/ScoreDial';
import ResultsPanel from '@/components/ResultsPanel';
import OutcomeFeedback from '@/components/OutcomeFeedback';
import ResultLinkActions from '@/components/ResultLinkActions';
import { loadResult, isValidToken } from '@/lib/resultStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your scan result',
  // Never indexed. See the note above.
  robots: { index: false, follow: false, nocache: true },
};

type Props = { params: Promise<{ token: string }> };

/** Days since the scan — used to decide whether asking about the outcome
 *  makes any sense yet. */
function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.floor((Date.now() - then) / 86400000);
}

export default async function ResultPage({ params }: Props) {
  const { token } = await params;
  if (!isValidToken(token)) notFound();

  const stored = await loadResult(token);
  if (!stored) notFound();

  const { result, roleSlug, createdAt } = stored;
  const age = daysSince(createdAt);

  return (
    <>
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <span className="badge mb-4 inline-flex">Saved result</span>
            <h1 className="text-2xl sm:text-3xl font-black font-syne text-white mb-2">
              Your ATS scan
            </h1>
            <p className="text-sm text-slate-500">
              Scanned {age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`}
              {roleSlug ? ` · ${roleSlug.replace(/-/g, ' ')}` : ''} · link expires 30 days after
              the scan
            </p>
          </div>

          <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 mb-6">
            <div className="flex justify-center mb-8">
              <ScoreDial score={result.score} grade={result.grade} size="md" />
            </div>
            <ResultsPanel result={result} />
          </div>

          {/*
            Only ask about the outcome once enough time has passed for there to
            BE an outcome. Asking the same day guarantees "no response" answers
            that mean nothing and would poison the calibration dataset.
          */}
          {age >= 1 && result.scanId && (
            <OutcomeFeedback scanId={result.scanId} className="mb-6" />
          )}

          <ResultLinkActions token={token} className="mb-6" />

          <div className="glass-card rounded-2xl p-6 text-center border border-blue-500/20 bg-blue-500/5">
            <h2 className="font-bold text-white mb-2 font-syne">Made some edits?</h2>
            <p className="text-slate-400 text-sm mb-4">
              Rescan against the same job description and we&apos;ll show you what changed.
            </p>
            <Link
              href="/#scanner"
              className="btn-primary inline-flex px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Rescan my resume
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
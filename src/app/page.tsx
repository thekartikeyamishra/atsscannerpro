import type { Metadata } from 'next';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import AppButtons from '@/components/AppButtons';
import Faq from '@/components/Faq';
import HeroSheet from '@/components/HeroSheet';
import InviteForm from '@/components/InviteForm';
import JsonLd from '@/components/JsonLd';
import Scanner from '@/components/scanner/Scanner';
import { ADSENSE, SITE } from '@/config/site';
import { GUIDES } from '@/content/guides';
import { ROLES } from '@/content/roles';
import { graph, pageMeta, webAppSchema } from '@/lib/seo';

export const metadata: Metadata = {
  ...pageMeta({
    title: 'Free ATS Resume Checker — Compare Your Resume to Any Job',
    description: SITE.description,
    path: '/',
  }),
  title: { absolute: 'Free ATS Resume Checker: Compare Your Resume to Any Job' },
};

const FAQS = [
  { q: 'Is ATS Scanner Pro really free?', a: 'Yes. There are no scan limits, no sign-up and no paid tier for the web scanner. The site is supported by a small number of clearly labelled ads on some pages.' },
  { q: 'Is my resume uploaded anywhere?', a: 'No. Your file is opened and analysed by code running in your own browser tab. It isn\'t sent to our servers or to any AI service, and nothing is kept after you close the page except, if your browser allows it, your last score for each job description so we can show progress.' },
  { q: 'How accurate is the score?', a: 'It\'s our own estimate, built from the same signals most applicant tracking systems rely on: the posting\'s important terms, clean parsing, standard sections and clear results. Employers\' systems are configured differently and none publish their formulas, so treat the score as a guide and the list of missing terms as the useful part. The full formula is on our methodology page.' },
  { q: 'Will this guarantee me an interview?', a: 'No tool can. A better-matched, cleanly formatted resume is more likely to appear in a recruiter\'s search and to be read, but hiring decisions depend on your experience, the other applicants and the team.' },
  { q: 'Should I add every missing keyword?', a: 'Only the ones that are true. Recruiters and interviewers ask about what\'s on the page, and adding skills you don\'t have tends to come out quickly. Use the list to spot things you have done but didn\'t name.' },
  { q: 'Which file types work?', a: 'PDF, DOCX and TXT, up to 8 MB. You can also paste plain text. Scanned PDFs and old .doc files can\'t be read — and many applicant tracking systems struggle with them too.' },
  { q: 'Does it work for jobs outside tech?', a: 'Yes. The keyword list covers engineering, data, product, design, marketing, sales, finance, HR, operations, healthcare and education, and the scanner also picks up tool names and repeated phrases it hasn\'t seen before.' },
];

export default function Home() {
  return (
    <>
      <JsonLd data={graph(webAppSchema())} />

      {/* Hero */}
      <section className="wrap grid items-center gap-12 pt-12 pb-16 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="rise">
          <h1 className="display">Find the words your resume is missing.</h1>
          <p className="lede mt-6">
            Paste a job post and add your resume. In seconds you&apos;ll see which skills the employer asks for that you never mention, what could break when an
            applicant tracking system reads your file, and what to fix first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#scanner" className="btn btn-ink">Check my resume</Link>
            <Link href="/methodology" className="btn btn-ghost">How we score</Link>
          </div>
          <ul className="mt-8 grid gap-2 text-[0.98rem] text-ink-2 sm:grid-cols-3 sm:gap-4">
            {['Free, with no scan limits', 'No account needed', 'Your file stays on your device'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Tick />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <HeroSheet />
      </section>

      {/* Scanner */}
      <section id="scanner" aria-labelledby="scanner-title" className="scroll-mt-20 border-y border-rule bg-[#e6eaf0] py-14 sm:py-16">
        <div className="wrap">
          <div className="mb-8 max-w-2xl">
            <h2 id="scanner-title" className="h-section">Check your resume against a job</h2>
            <p className="mt-3 text-ink-2">
              Works with any role and any country. Everything happens in this browser tab: we never see your resume or the job description.
            </p>
          </div>
          <Scanner />
        </div>
      </section>

      {/* What it checks */}
      <section className="wrap py-20" aria-labelledby="checks-title">
        <h2 id="checks-title" className="h-section max-w-2xl">What the scan looks at</h2>
        <dl className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {[
            { t: 'Keywords, weighted the way the posting weighs them', d: 'Skills under "requirements" count three times as much as nice-to-haves. We recognise common alternatives — k8s for Kubernetes, CI/CD for continuous integration — and flag terms that only appear in your skills list but never in your experience.' },
            { t: 'What an ATS will actually extract', d: 'For PDFs we measure how many lines sit side by side in columns. For Word files we count tables and images. We check for contact details in the body, standard headings, readable dates and broken characters.' },
            { t: 'Whether your bullets show results', d: 'We count how many bullets include a number and how many open with a strong verb, and point out openers like "responsible for" that hide what you did.' },
            { t: 'The job title and the basics', d: 'Whether your resume uses the title from the posting, how many years of experience it asks for, and whether you have the sections recruiters expect.' },
          ].map((x) => (
            <div key={x.t} className="border-t-2 border-ink pt-5">
              <dt className="h-card">{x.t}</dt>
              <dd className="mt-2 text-ink-2">{x.d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 max-w-2xl text-ink-2">
          Every weight is published on the <Link href="/methodology">methodology page</Link>. If a check is a strong signal rather than a measurement, the report says so.
        </p>
      </section>

      {/* Why in-browser */}
      <section className="wrap pb-20" aria-labelledby="private-title">
        <div className="sheet grid gap-8 p-8 sm:p-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <h2 id="private-title" className="h-section">Your resume has your phone number on it. It shouldn&apos;t need to leave your laptop.</h2>
          <div className="space-y-4 text-ink-2">
            <p>
              Most resume checkers upload your file to their servers, and many send it to an AI service. We built ATS Scanner Pro to do the whole analysis in your
              browser instead. If you open your browser&apos;s developer tools and watch the network tab while you scan, you&apos;ll see that nothing is sent.
            </p>
            <p>
              That also means there&apos;s no cost to us per scan, which is why we don&apos;t need to limit how many you run. Scan every application you send.
            </p>
          </div>
        </div>
      </section>

      <div className="wrap">
        <AdSlot slot={ADSENSE.slots.homeMid} />
      </div>

      {/* Guides */}
      <section className="wrap py-16" aria-labelledby="guides-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="guides-title" className="h-section">Guides that answer the next question</h2>
          <Link href="/guides" className="font-semibold">All guides</Link>
        </div>
        <ul className="mt-8 divide-y divide-rule border-y border-rule">
          {GUIDES.slice(0, 6).map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="group grid gap-1 py-5 no-underline md:grid-cols-[1fr_1.4fr] md:gap-8">
                <span className="text-[1.15rem] font-bold text-ink group-hover:underline">{g.short}</span>
                <span className="text-ink-2">{g.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Roles */}
      <section className="wrap py-10" aria-labelledby="roles-title">
        <h2 id="roles-title" className="h-section">Keyword guides by role</h2>
        <p className="mt-3 max-w-2xl text-ink-2">What recruiters search for, example bullets, and the mistakes we see most for each job.</p>
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {ROLES.map((r) => (
            <li key={r.slug}>
              <Link href={`/role/${r.slug}`} className="font-medium">{r.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      {/* App */}
      <section id="app" className="wrap scroll-mt-20 py-20" aria-labelledby="app-title">
        <div className="grid gap-10 rounded-2xl bg-ink p-8 text-white sm:p-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="app-title" className="h-section text-white">The mobile app is invite-only for now</h2>
            <p className="mt-4 text-[1.05rem] text-white/80">
              We&apos;re building ATS Scanner Pro for Android and iPhone: scan a job post the moment you see it, keep every tailored version of your resume in one
              place, and track where you&apos;ve applied. We&apos;re opening it in small batches so we can fix things quickly with the first users.
            </p>
            <div className="mt-8 [&_.btn-ghost]:text-ink">
              <AppButtons />
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 text-ink sm:p-7">
            <h3 className="h-card mb-4">Request an invite</h3>
            <InviteForm source="home" />
          </div>
        </div>
      </section>

      <div className="wrap-narrow pb-8">
        <Faq items={FAQS} />
      </div>
    </>
  );
}

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <rect x="1" y="5" width="18" height="10" rx="3" fill="#FFE14D" />
      <path d="M6 10.2l2.6 2.4L14 7.6" stroke="#14213D" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

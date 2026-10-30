import Link from 'next/link';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="wrap-narrow py-24">
      <p className="pen text-xl">← nothing here</p>
      <h1 className="h-section mt-3">We couldn&apos;t find that page.</h1>
      <p className="mt-4 text-ink-2">It may have moved. These are the pages people usually want:</p>
      <ul className="mt-6 space-y-2">
        <li><Link href="/#scanner">Check a resume against a job</Link></li>
        <li><Link href="/guides">Resume and ATS guides</Link></li>
        <li><Link href="/roles">Keyword guides by role</Link></li>
      </ul>
    </div>
  );
}

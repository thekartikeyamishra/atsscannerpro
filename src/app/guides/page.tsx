import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { GUIDES, readingMinutes } from '@/content/guides';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Resume and ATS Guides',
  description: 'Practical, plain-English guides to applicant tracking systems: finding keywords, formatting, PDF vs DOCX, ATS scores and tailoring a resume fast.',
  path: '/guides',
});

export default function GuidesIndex() {
  return (
    <div className="wrap-narrow py-12">
      <Breadcrumbs items={[{ name: 'Guides', path: '/guides' }]} />
      <h1 className="display mt-6 text-[clamp(2.2rem,5vw,3.4rem)]">Resume and ATS guides</h1>
      <p className="lede mt-4">
        Written to answer one question each, properly. No listicles, no invented statistics — and every guide links to the scanner so you can check your own resume as you read.
      </p>
      <ul className="mt-10 divide-y divide-rule border-y border-rule">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="group block py-6 no-underline">
              <h2 className="text-[1.3rem] font-bold leading-snug text-ink group-hover:underline">{g.title}</h2>
              <p className="mt-1.5 text-ink-2">{g.description}</p>
              <p className="small muted mt-2">{readingMinutes(g.body)} min read</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

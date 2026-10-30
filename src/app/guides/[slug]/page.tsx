import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import { ADSENSE, SITE } from '@/config/site';
import { GUIDES, getGuide, readingMinutes } from '@/content/guides';
import { headingsOf, renderMarkdown } from '@/lib/markdown';
import { articleSchema, graph, pageMeta } from '@/lib/seo';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return pageMeta({ title: g.short, description: g.description, path: `/guides/${g.slug}`, type: 'article', published: g.published, updated: g.updated });
}

const fmt = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const toc = headingsOf(g.body);
  const related = g.related.map(getGuide).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const path = `/guides/${g.slug}`;

  return (
    <article className="wrap py-12">
      <JsonLd data={graph(articleSchema({ title: g.title, description: g.description, path, published: g.published, updated: g.updated, section: 'Guides' }))} />
      <div className="mx-auto max-w-[64rem]"><div className="max-w-[46rem]">
        <Breadcrumbs items={[{ name: 'Guides', path: '/guides' }, { name: g.short, path }]} />
        <h1 className="mt-6 text-[clamp(2rem,4.6vw,3.1rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-balance">{g.title}</h1>
        <p className="lede mt-4">{g.description}</p>
        <p className="small muted mt-5">
          By <Link href="/about">{SITE.author.name}</Link>. Updated <time dateTime={g.updated}>{fmt(g.updated)}</time>. {readingMinutes(g.body)} min read.
        </p>
      </div></div>

      <div className="mx-auto mt-10 grid max-w-[64rem] gap-12 lg:grid-cols-[1fr_14rem]">
        <div className="prose-guide w-full">{renderMarkdown(g.body)}</div>
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24 small">
            <p className="mb-3 font-bold">On this page</p>
            <ul className="space-y-2 border-l border-rule pl-4">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-ink-2 no-underline hover:underline">{h.text}</a>
                </li>
              ))}
            </ul>
            <Link href="/#scanner" className="btn btn-ink btn-sm mt-6 w-full">Check my resume</Link>
          </nav>
        </aside>
      </div>

      <div className="mx-auto mt-14 max-w-[64rem]"><div className="max-w-[46rem]">
        <div className="sheet flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">See how your resume does against a real job post.</p>
          <Link href="/#scanner" className="btn btn-ink btn-sm">Check my resume</Link>
        </div>

        <div className="mt-14">
          <Faq items={g.faqs} title="Common questions" />
        </div>

        <AdSlot slot={ADSENSE.slots.endOfArticle} />

        {related.length > 0 && (
          <section className="mt-14" aria-labelledby="related-title">
            <h2 id="related-title" className="h-card text-[1.35rem]">Read next</h2>
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/guides/${r.slug}`} className="block py-4 font-semibold">{r.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div></div>
    </article>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import { ADSENSE, SITE } from '@/config/site';
import { ROLES, getRole } from '@/content/roles';
import { articleSchema, graph, pageMeta } from '@/lib/seo';

export function generateStaticParams() {
  return ROLES.map((r) => ({ slug: r.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = getRole((await params).slug);
  if (!r) return {};
  return pageMeta({ title: `${r.title} Resume Keywords`, description: r.summary, path: `/role/${r.slug}`, type: 'article', published: '2026-10-30', updated: SITE.contentReviewed });
}

export default async function RolePage({ params }: { params: Promise<{ slug: string }> }) {
  const r = getRole((await params).slug);
  if (!r) notFound();
  const path = `/role/${r.slug}`;
  const related = r.related.map(getRole).filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <article className="wrap py-12">
      <JsonLd data={graph(articleSchema({ title: `${r.title} resume keywords and examples`, description: r.summary, path, published: '2026-10-30', updated: SITE.contentReviewed, section: 'Role guides' }))} />
      <div className="max-w-[46rem]">
        <Breadcrumbs items={[{ name: 'Role guides', path: '/roles' }, { name: r.title, path }]} />
        <h1 className="mt-6 text-[clamp(2rem,4.6vw,3.1rem)] font-extrabold leading-[1.08] tracking-[-0.03em]">{r.title} resume keywords and examples</h1>
        <div className="mt-5 space-y-4 text-[1.1rem] leading-relaxed text-ink-2">
          {r.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="small muted mt-5">
          By <Link href="/about">{SITE.author.name}</Link>. Reviewed {new Date(SITE.contentReviewed).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}.
        </p>
      </div>

      <section className="mt-14" aria-labelledby="clusters">
        <h2 id="clusters" className="h-section">What recruiters search for</h2>
        <p className="mt-3 max-w-2xl text-ink-2">
          {`Grouped the way ${r.title.toLowerCase()} postings usually ask for them.`} Use the posting&apos;s exact spelling, and only list what you&apos;ve actually used.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {r.clusters.map((c) => (
            <div key={c.name} className="panel p-6">
              <h3 className="h-card">{c.name}</h3>
              <p className="small mt-1 text-ink-2">{c.note}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {c.terms.map((t) => (
                  <li key={t} className="rounded-md bg-desk px-2 py-1 text-[0.92rem] font-medium">{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 max-w-[52rem]" aria-labelledby="bullets">
        <h2 id="bullets" className="h-section">Bullets: before and after</h2>
        <p className="mt-3 text-ink-2">Illustrative examples — the numbers are made up to show the shape of a strong bullet. Use your own.</p>
        <ul className="mt-8 space-y-6">
          {r.bullets.map((b, i) => (
            <li key={i} className="sheet p-6">
              <p className="text-graphite"><span className="mark-miss">{b.weak}</span></p>
              <p className="mt-3 text-[1.05rem] font-medium">{b.strong}</p>
              <p className="small mt-3 text-ink-2"><span className="pen not-italic">Why it works:</span> {b.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="max-w-[46rem]">
        <AdSlot slot={ADSENSE.slots.inArticle} format="fluid" layout="in-article" />
      </div>

      <section className="mt-14 max-w-[46rem]" aria-labelledby="mistakes">
        <h2 id="mistakes" className="h-section">{`Mistakes we see on ${r.title.toLowerCase()} resumes`}</h2>
        <dl className="mt-6 space-y-6">
          {r.mistakes.map((m) => (
            <div key={m.title}>
              <dt className="h-card">{m.title}</dt>
              <dd className="mt-1.5 text-ink-2">{m.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14 grid max-w-[52rem] gap-10 md:grid-cols-2" aria-label="Titles and certifications">
        <div>
          <h2 className="h-card text-[1.3rem]">Job titles to search and mirror</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-2">
            {r.titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="h-card text-[1.3rem]">Certifications worth listing</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-2">
            {r.certifications.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="small muted mt-2">Only if you hold them. Write the official name in full.</p>
        </div>
      </section>

      <div className="mt-14 max-w-[46rem]">
        <div className="sheet flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">{`Have a ${r.title.toLowerCase()} posting open? Check your resume against it.`}</p>
          <Link href="/#scanner" className="btn btn-ink btn-sm">Check my resume</Link>
        </div>
        <div className="mt-14">
          <Faq items={r.faqs} title="Common questions" />
        </div>
        <AdSlot slot={ADSENSE.slots.endOfArticle} />
        <section className="mt-12" aria-labelledby="related-roles">
          <h2 id="related-roles" className="h-card text-[1.3rem]">Related roles</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {related.map((x) => (
              <li key={x.slug}>
                <Link href={`/role/${x.slug}`} className="font-semibold">{x.title}</Link>
              </li>
            ))}
            <li>
              <Link href="/guides/find-resume-keywords">How to find keywords in any posting</Link>
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}

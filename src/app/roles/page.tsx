import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ROLES } from '@/content/roles';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Resume Keywords by Job Role',
  description: `Resume keyword guides for ${ROLES.length} roles: what recruiters search for, example bullets and common mistakes for engineers, analysts, PMs and more.`,
  path: '/roles',
});

const ORDER = ['Engineering', 'Data', 'Product & Project', 'Design', 'Business'] as const;

export default function RolesIndex() {
  return (
    <div className="wrap py-12">
      <Breadcrumbs items={[{ name: 'Role guides', path: '/roles' }]} />
      <h1 className="display mt-6 max-w-3xl text-[clamp(2.2rem,5vw,3.4rem)]">Resume keywords by job role</h1>
      <p className="lede mt-4">
        Each guide covers the terms recruiters search for in that role, how strong bullets read, and the mistakes we see most. Use them alongside a real job post — the
        posting always wins.
      </p>
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {ORDER.map((cat) => {
          const list = ROLES.filter((r) => r.category === cat);
          if (!list.length) return null;
          return (
            <section key={cat} aria-labelledby={`cat-${cat}`}>
              <h2 id={`cat-${cat}`} className="h-card border-b-2 border-ink pb-2 text-[1.3rem]">{cat}</h2>
              <ul className="mt-2 divide-y divide-rule">
                {list.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/role/${r.slug}`} className="group block py-4 no-underline">
                      <span className="font-bold text-ink group-hover:underline">{r.title}</span>
                      <span className="mt-1 block text-[0.95rem] text-ink-2">{r.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

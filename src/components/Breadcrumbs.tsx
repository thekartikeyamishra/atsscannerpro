import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbSchema } from '@/lib/seo';

export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: 'Home', path: '/' }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="small muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-1.5">
              {i < all.length - 1 ? (
                <>
                  <Link href={it.path} className="text-graphite">{it.name}</Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : (
                <span aria-current="page" className="text-ink-2">{it.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={{ '@context': 'https://schema.org', ...breadcrumbSchema(all) }} />
    </>
  );
}

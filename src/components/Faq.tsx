import JsonLd from './JsonLd';
import { faqSchema } from '@/lib/seo';

export default function Faq({ items, title = 'Questions', withSchema = true }: { items: { q: string; a: string }[]; title?: string; withSchema?: boolean }) {
  return (
    <section aria-labelledby="faq-title" className="faq">
      <h2 id="faq-title" className="h-section">{title}</h2>
      <div className="mt-6 divide-y divide-rule border-y border-rule">
        {items.map((f) => (
          <details key={f.q} className="group py-1">
            <summary className="flex items-start justify-between gap-6 py-4 text-[1.08rem] font-semibold">
              <span>{f.q}</span>
              <span className="chev mt-0.5 text-2xl leading-none text-graphite" aria-hidden="true">+</span>
            </summary>
            <p className="max-w-[65ch] pb-5 text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
      {withSchema && <JsonLd data={{ '@context': 'https://schema.org', ...faqSchema(items) }} />}
    </section>
  );
}

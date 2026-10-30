import Link from 'next/link';
import { SITE } from '@/config/site';
import { GUIDES } from '@/content/guides';
import { ROLES } from '@/content/roles';
import Logo from './Logo';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-rule bg-white">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="small muted mt-3 max-w-xs">
            A free resume checker that runs in your browser. Built and maintained by{' '}
            <Link href="/about">{SITE.author.name}</Link> in {SITE.location}.
          </p>
          <p className="small mt-3">
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          </p>
        </div>
        <FooterCol title="Product" links={[
          { href: '/#scanner', label: 'Resume scanner' },
          { href: '/methodology', label: 'How we score' },
          { href: '/app', label: 'Mobile app (invite list)' },
          { href: '/about', label: 'About' },
          { href: '/contact', label: 'Contact' },
        ]} />
        <FooterCol title="Guides" links={GUIDES.slice(0, 6).map((g) => ({ href: `/guides/${g.slug}`, label: g.short }))} more={{ href: '/guides', label: 'All guides' }} />
        <FooterCol title="Role guides" links={ROLES.slice(0, 6).map((r) => ({ href: `/role/${r.slug}`, label: r.title }))} more={{ href: '/roles', label: `All ${ROLES.length} roles` }} />
      </div>
      <div className="border-t border-rule">
        <div className="wrap flex flex-col gap-3 py-6 small muted md:flex-row md:items-center md:justify-between">
          <p>© {year} {SITE.name}. Scores are our own estimate, not a prediction from any employer&apos;s system.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/about#editorial-policy">Editorial policy</Link></li>
            <li><a href={SITE.social.linkedin} rel="noopener noreferrer me" target="_blank">LinkedIn</a></li>
            <li><a href={SITE.social.x} rel="noopener noreferrer me" target="_blank">X</a></li>
          </ul>
        </div>
        <p className="wrap pb-6 text-xs muted">
          Workday, Greenhouse, Lever, iCIMS, Taleo and other product names are trademarks of their owners. ATS Scanner Pro is independent and not affiliated with them.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, more }: { title: string; links: { href: string; label: string }[]; more?: { href: string; label: string } }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-3 text-[0.95rem] font-bold">{title}</h2>
      <ul className="space-y-2 small">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-ink-2 no-underline hover:underline">{l.label}</Link>
          </li>
        ))}
        {more && (
          <li>
            <Link href={more.href} className="font-semibold">{more.label}</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

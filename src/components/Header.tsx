import Link from 'next/link';
import Logo from './Logo';

const NAV = [
  { href: '/#scanner', label: 'Scanner' },
  { href: '/guides', label: 'Guides' },
  { href: '/roles', label: 'Role guides' },
  { href: '/methodology', label: 'How we score' },
  { href: '/app', label: 'Mobile app' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule/70 bg-desk/85 backdrop-blur-md supports-[backdrop-filter]:bg-desk/70">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" className="no-underline" aria-label="ATS Scanner Pro home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="rounded-md px-3 py-2 text-[0.95rem] font-medium text-ink-2 no-underline hover:bg-white hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/#scanner" className="btn btn-ink btn-sm hidden sm:inline-flex">
            Check my resume
          </Link>
          <details className="relative md:hidden">
            <summary className="btn btn-ghost btn-sm list-none [&::-webkit-details-marker]:hidden" aria-label="Open menu">
              Menu
            </summary>
            <nav aria-label="Mobile" className="absolute right-0 mt-2 w-60 rounded-xl border border-rule bg-white p-2 shadow-xl">
              <ul>
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="block rounded-md px-3 py-2.5 text-ink no-underline hover:bg-desk">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

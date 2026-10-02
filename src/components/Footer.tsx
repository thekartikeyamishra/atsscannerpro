// components/Footer.tsx — Server component, no 'use client' needed

import Link from 'next/link';
import { getAllRoles } from '@/lib/rolesData';
import { CURRENT_YEAR } from '@/lib/seo';

const SITE = 'https://atsscannerpro.com';

const TOOL_LINKS = [
  { href: '/#scanner', label: 'Resume Scanner' },
  { href: '/roles',    label: 'Role Guides' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
  { href: '/privacy',  label: 'Privacy Policy' },
  // /terms existed as a route and was linked from the scanner's consent
  // checkbox, but appeared in no navigation and no sitemap. A consent link to
  // an unreachable page is exactly what a policy reviewer flags.
  { href: '/terms',    label: 'Terms of Service' },
  { href: '/methodology', label: 'How Scoring Works' },
  { href: '/security',    label: 'Security' },
  { href: '/insights',    label: 'Insights' },
];

const SOCIAL_LINKS = [
  {
    href:  'https://x.com/@KartikeyahereX',
    label: '@KartikeyahereX on X',
    icon:  (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    href:  'https://linkedin.com/in/thekartikeyamishra',
    label: 'LinkedIn',
    icon:  (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    href:  'mailto:workmailkartikeya@gmail.com',
    label: 'Email',
    icon:  (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const allRoles = getAllRoles();
  const year = CURRENT_YEAR; // Static — avoids new Date() SSR/CSR mismatch

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#040B1A]" role="contentinfo">
      {/* Glow accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-96"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(29,110,230,0.4), transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h8M2 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="13" cy="12" r="2.5" fill="#F59E0B"/>
                </svg>
              </div>
              <span className="font-syne font-extrabold text-white text-[1.05rem]">
                ATS Scanner <span className="text-brand-gold">Pro</span>
              </span>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              AI-powered ATS resume scanner. Free, private, no sign-up.
              Built by an engineer for job seekers.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.12] hover:border-white/[0.15] transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Tool links */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product</h3>
            <ul className="space-y-2.5">
              {TOOL_LINKS.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-500 hover:text-white transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Role guides — col 1 */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Role Guides</h3>
            <ul className="space-y-2.5">
              {allRoles.slice(0, 8).map(r => (
                <li key={r.slug}>
                  <Link
                    href={`/role/${r.slug}`}
                    className="text-sm text-slate-500 hover:text-white transition-colors duration-150"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Role guides — col 2 */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">More Roles</h3>
            <ul className="space-y-2.5">
              {allRoles.slice(8, 17).map(r => (
                <li key={r.slug}>
                  <Link
                    href={`/role/${r.slug}`}
                    className="text-sm text-slate-500 hover:text-white transition-colors duration-150"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © {year} ATS Scanner Pro · Built by{' '}
            <a
              href="https://linkedin.com/in/thekartikeyamishra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors"
            >
              Kartikeya Mishra
            </a>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            PII stripped before AI · No resume stored
          </div>
          <p className="text-xs text-slate-600">
            <a href={SITE} className="hover:text-slate-400 transition-colors">atsscannerpro.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
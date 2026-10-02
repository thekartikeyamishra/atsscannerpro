'use client';
// components/Header.tsx
// HYDRATION FIX: Initial state (scrolled=false, mobileOpen=false) is identical
// on server and client. All window/document access is inside useEffect only.
// No conditional rendering based on browser APIs during initial render.

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/#scanner', label: 'Scanner' },
  { href: '/roles',    label: 'Guides'  },
  { href: '/about',    label: 'About'   },
  { href: '/contact',  label: 'Contact' },
] as const;

export default function Header() {
  // Both start as false — same on server AND client (no hydration mismatch)
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleScroll = useCallback(() => {
    // window access is ONLY inside useEffect callback — never during render
    setScrolled(window.scrollY > 20);
  }, []);

  // Scroll listener
  useEffect(() => {
    const timer = setTimeout(() => setScrolled(window.scrollY > 20), 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', handleScroll); };
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    const timer = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Lock body scroll when mobile menu open (document access in useEffect only)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = mobileOpen ? 'hidden' : '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [mobileOpen]);

  // Close menu on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const isActivePath = (href: string) => {
    const base = href.split('#')[0];
    return base && pathname === base;
  };

  return (
    <>
      <header
        role="banner"
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-navy-900/90 backdrop-blur-xl border-b border-white/6 shadow-lg shadow-black/30'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="ATS Scanner Pro — Home"
            >
              <div className="relative w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:shadow-blue-600/50 transition-shadow duration-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 4h12M2 8h8M2 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="13" cy="12" r="2.5" fill="#F59E0B" />
                </svg>
              </div>
              <span className="font-syne font-extrabold text-white text-[1.05rem] leading-none">
                ATS Scanner{' '}
                <span className="text-brand-gold">Pro</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActivePath(link.href)
                      ? 'text-white bg-white/8'
                      : 'text-slate-400 hover:text-white hover:bg-white/5',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/#scanner" className="btn-primary px-4 py-2 rounded-xl text-sm">
                Scan Free →
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-white/6 transition-colors"
            >
              <span className={['block w-5 h-[1.5px] bg-white rounded transition-all duration-300 origin-center', mobileOpen ? 'rotate-45 translate-y-1.25' : ''].join(' ')} />
              <span className={['block w-5 h-[1.5px] bg-white rounded transition-all duration-300', mobileOpen ? 'opacity-0 scale-x-0' : ''].join(' ')} />
              <span className={['block w-5 h-[1.5px] bg-white rounded transition-all duration-300 origin-center', mobileOpen ? '-rotate-45 -translate-y-1.25' : ''].join(' ')} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        id="mobile-nav"
        // `inert` (not aria-hidden) — aria-hidden left the links focusable, so
        // keyboard users tabbed into an invisible menu. inert removes the whole
        // subtree from focus order, hit-testing and the a11y tree at once.
        inert={!mobileOpen ? true : undefined}
        className={[
          'fixed inset-0 z-40 md:hidden transition-all duration-300',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={[
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-hidden="true"
        />

        {/* Side panel */}
        <nav
          className={[
            'absolute top-0 right-0 h-full w-[75vw] max-w-xs bg-navy-800 border-l border-white/8',
            'flex flex-col pt-20 pb-8 px-6 gap-2 shadow-2xl',
            'transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all',
                isActivePath(link.href)
                  ? 'text-white bg-white/8'
                  : 'text-slate-300 hover:text-white hover:bg-white/6',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-auto pt-6 border-t border-white/6">
            <Link
              href="/#scanner"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center"
            >
              Scan My Resume Free
            </Link>
            <p className="text-xs text-slate-600 text-center mt-3">No sign-up · Free forever</p>
          </div>
        </nav>
      </div>
    </>
  );
}
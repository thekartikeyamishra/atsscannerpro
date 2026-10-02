import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllRoles } from '@/lib/rolesData';

export const metadata: Metadata = {
  title: '404 — Page Not Found | ATS Scanner Pro',
  description: 'The page you are looking for does not exist. Try our free AI resume scanner instead.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const popularRoles = getAllRoles().slice(0, 6);

  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-lg mx-auto text-center">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-blue-500/8 blur-3xl" />
            </div>
            <div className="relative text-8xl sm:text-9xl font-black font-syne text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl animate-bounce-subtle">🔍</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-syne text-white mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-400 text-base mb-8 leading-relaxed">
            The page you&apos;re looking for has moved or doesn&apos;t exist.
            But your <span className="text-white font-medium">next job opportunity</span> is just one resume scan away.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/#scanner"
              className="btn-primary px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Scan My Resume Free
            </Link>
            <Link
              href="/"
              className="btn-secondary px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
          </div>

          {/* Popular role links */}
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-4">
              Popular ATS Guides
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {popularRoles.map(role => (
                <Link
                  key={role.slug}
                  href={`/role/${role.slug}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                >
                  {role.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
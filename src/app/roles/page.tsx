// src/app/roles/page.tsx — index of every role guide
//
// ── WHY THIS PAGE EXISTS ───────────────────────────────────────────────────
//
// There was no hub. The homepage linked 12 roles, the footer linked 17, and any
// role beyond that was reachable only from a sitemap entry — an orphan in
// practice, however many exist in rolesData.ts. `npm run seo:check` flags
// orphans for exactly this reason: a page nothing links to gets crawled rarely
// and ranks accordingly.
//
// Grouping by category also does something the flat lists could not: it makes
// the breadth of coverage legible in one screen, which is the thing that turns
// a visitor who came for one role into someone who bookmarks the site.

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchemaMarkup from '@/components/SchemaMarkup';
import { getAllRoles } from '@/lib/rolesData';
import { SITE_URL, buildBreadcrumbSchema } from '@/lib/seo';
import type { Role } from '@/types';

export const metadata: Metadata = {
  title: 'Resume Guides by Role',
  description:
    'ATS keyword and resume-structure guides for every role we cover, grouped by field. Find yours, then check your resume against a real job posting.',
  alternates: { canonical: `${SITE_URL}/roles` },
  robots: { index: true, follow: true },
};

export default function RolesIndexPage() {
  const roles = getAllRoles();

  // Group by category, preserving the order categories first appear in the
  // data rather than imposing an alphabetical order the author did not choose.
  const grouped = roles.reduce<Record<string, Role[]>>((acc, role) => {
    (acc[role.category] ??= []).push(role);
    return acc;
  }, {});

  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Home', path: '' },
      { name: 'Role guides', path: '/roles' },
    ]),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-slate-600">
              <li>
                <Link href="/" className="hover:text-slate-400 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-slate-400">Role guides</li>
            </ol>
          </nav>

          <header className="mb-10">
            <span className="badge mb-4 inline-flex">{roles.length} guides</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white leading-tight mb-4">
              Resume guides by role
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              The terms that appear most in postings for a given role, how to structure the resume,
              and what tends to go wrong. Then check your own against a real posting.
            </p>
          </header>

          <div className="space-y-10">
            {Object.entries(grouped).map(([category, list]) => (
              <section key={category} aria-labelledby={`cat-${category.replace(/\W+/g, '-')}`}>
                <h2
                  id={`cat-${category.replace(/\W+/g, '-')}`}
                  className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4"
                >
                  {category}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {list.map((role) => (
                    <Link
                      key={role.slug}
                      href={`/role/${role.slug}`}
                      className="glass-card rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors group"
                    >
                      <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-blue-300 transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {role.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6 text-center border border-blue-500/20 bg-blue-500/5 mt-12">
            <h2 className="font-bold text-white mb-2 font-syne">Don&apos;t see your role?</h2>
            <p className="text-slate-400 text-sm mb-4">
              The scanner works for any job description, whether or not we have a guide for it.
            </p>
            <Link
              href="/#scanner"
              className="btn-primary inline-flex px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Scan my resume
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
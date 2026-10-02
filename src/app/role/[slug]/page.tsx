// src/app/role/[slug]/page.tsx — Role guide
//
// ── THE PROBLEM THIS PAGE HAS TO SOLVE ─────────────────────────────────────
//
// Your external audit's central worry was that role pages are one template with
// the nouns swapped, which is what Google calls scaled content abuse and what
// AdSense calls low-value content. That worry is legitimate and a rewrite alone
// does not fix it — this IS still a template. What changes the outcome is where
// the substance comes from:
//
//   • Per-role data is genuinely deep: 15 keywords each carrying an importance
//     weight, critical vs soft skills, certifications, tools, and 3+ written
//     FAQs. That is real differentiation between pages, not synonym swapping.
//
//   • Sections are CONDITIONAL. A role with no certifications renders no
//     certifications section, rather than an empty heading padded to look full.
//
//   • The market-data block surfaces what postings for THIS role actually asked
//     for, from your own telemetry — content no competitor can copy and no model
//     can generate. It renders only above the sample threshold.
//
// ── WHAT IS DELIBERATELY NOT DISPLAYED ─────────────────────────────────────
// rolesData.ts contains two fields presented as measurements that are not:
//
//   demandGrowth: "+28% YoY"  — no source, no methodology, no date. Removed.
//   avgAtsScore: 55           — implies a measured average across real scans.
//                               You now have the pipeline to measure that for
//                               real (lib/marketIntel.ts). Until the sample is
//                               large enough, showing a hardcoded number would
//                               be inventing data. Removed.
//
// Salary ranges are shown but explicitly labelled as indicative public ranges
// rather than survey data, because that is what they are.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import SchemaMarkup from '@/components/SchemaMarkup';
import { InContentAd } from '@/components/AdUnit';
import {
  getRoleBySlug,
  getAllSlugs,
  getRelatedRoles,
  getDemandLabel,
} from '@/lib/rolesData';
import { getRoleInsight } from '@/lib/marketIntel';
import { SITE_URL, buildArticleSchema, buildBreadcrumbSchema, buildFAQSchema } from '@/lib/seo';
import type { RoleKeyword } from '@/types';

// Static generation for every role: these are the SEO surface and should be
// prerendered, not rendered per request.
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Revalidate daily so the market-data block picks up new aggregates without a
// redeploy. The rest of the page is static data.
export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) return { title: 'Role not found' };

  // Unique, descriptive, and not keyword-stuffed. The seo-check script fails
  // the build on duplicate titles across pages.
  const title = `${role.title} Resume: ATS Keywords & Structure`;
  const description = `What ${role.title} job postings ask for most, how to structure the resume, and the terms that matter. Then check your own resume against a real posting, free.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/role/${role.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/role/${role.slug}`,
      type: 'article',
    },
  };
}

const IMPORTANCE_STYLE: Record<RoleKeyword['importance'], string> = {
  critical: 'bg-red-500/10 border-red-500/25 text-red-300',
  high: 'bg-blue-500/10 border-blue-500/25 text-blue-300',
  medium: 'bg-white/[0.05] border-white/[0.09] text-slate-400',
};

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mb-11 scroll-mt-24">
      <h2 id={`${id}-h`} className="text-xl font-bold font-syne text-white mb-3">
        {title}
      </h2>
      {intro && <p className="text-sm text-slate-400 leading-relaxed mb-5">{intro}</p>}
      {children}
    </section>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="text-sm px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-300"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default async function RolePage({ params }: Props) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) notFound();

  const related = getRelatedRoles(role.slug, 4);
  const critical = role.topKeywords.filter((k) => k.importance === 'critical');

  // Moat 3 surfacing point. Returns 'insufficient' until the sample is large
  // enough — the block simply does not render rather than showing a placeholder.
  const insight = await getRoleInsight(role.slug, 90);

  const schemas = [
    buildArticleSchema({
      headline: `${role.title} resume: ATS keywords and structure`,
      description: role.description,
      path: `/role/${role.slug}`,
    }),
    buildBreadcrumbSchema([
      { name: 'Home', path: '' },
      { name: role.title, path: `/role/${role.slug}` },
    ]),
    // Only rendered if the role actually has FAQs visible on the page —
    // FAQ schema that does not match visible content is a structured-data
    // violation, not a shortcut.
    role.faqs.length > 0 ? buildFAQSchema(role.faqs) : null,
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb — matches the BreadcrumbList schema above */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-slate-600">
              <li>
                <Link href="/" className="hover:text-slate-400 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-slate-400">{role.title}</li>
            </ol>
          </nav>

          <header className="mb-10">
            <span className="badge mb-4 inline-flex">{role.category}</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white leading-tight mb-4">
              {role.title} resume: keywords and structure
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">{role.description}</p>
          </header>

          {/* ── Keywords: the reason people land here ──────────────── */}
          <Section
            id="keywords"
            title="Terms that matter most"
            intro={`Weighted by how often ${role.title} postings treat them as a requirement rather than a nice-to-have. Add a term only if you genuinely have the experience — a resume that wins an interview you cannot substantiate has not helped you.`}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {role.topKeywords.map((kw) => (
                <span
                  key={kw.keyword}
                  className={`text-sm px-3 py-1.5 rounded-lg border ${IMPORTANCE_STYLE[kw.importance]}`}
                >
                  {kw.keyword}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600">
              Red = usually a hard requirement · Blue = frequently required · Grey = commonly listed
            </p>
          </Section>

          {/* ── Live market data (Moat 3). Renders only above threshold ─ */}
          {insight.status === 'ok' && insight.data.topMissingKeywords.length > 0 && (
            <Section
              id="market"
              title="What candidates are actually missing"
              intro={`From ${insight.data.sampleSize} scans against ${role.title} postings between ${insight.data.windowStart} and ${insight.data.windowEnd}. These are the terms the job descriptions asked for that resumes most often did not contain.`}
            >
              <div className="space-y-1.5">
                {insight.data.topMissingKeywords.slice(0, 10).map((kw) => (
                  <div
                    key={kw.keyword}
                    className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]"
                  >
                    <span className="text-sm text-white flex-1 capitalize">{kw.keyword}</span>
                    <span className="text-xs text-slate-500 shrink-0">
                      missing from {Math.round(kw.share * 100)}% of scans
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Measured from our own anonymised scan data, not an industry estimate. It describes
                people who used this tool, which is not a random sample of applicants.
              </p>
            </Section>
          )}

          <Section
            id="skills"
            title="Core skills"
            intro="The first group is what postings tend to treat as non-negotiable. The second is what interviewers probe once you are past the screen."
          >
            <h3 className="text-sm font-semibold text-white mb-2.5">Technical</h3>
            <div className="mb-5">
              <Pills items={role.criticalSkills} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2.5">Working style</h3>
            <Pills items={role.softSkills} />
          </Section>

          {role.commonTools.length > 0 && (
            <Section
              id="tools"
              title="Tools worth naming"
              intro="Naming the specific tool matters: a parser matches the string, so “Jira” and “ticket tracking” are not the same term to it."
            >
              <Pills items={role.commonTools} />
            </Section>
          )}

          {role.certifications.length > 0 && (
            <Section
              id="certifications"
              title="Certifications that appear in postings"
              intro="Worth listing if you hold them. Not worth pursuing solely to satisfy a keyword match."
            >
              <Pills items={role.certifications} />
            </Section>
          )}

          {/* ── Structure: genuinely useful, role-specific ──────────── */}
          <Section
            id="structure"
            title="How to structure it"
            intro={`A layout that parses cleanly and puts the ${role.title} signal where a reader looks first.`}
          >
            <ol className="space-y-3">
              {[
                {
                  h: 'Contact details, in the body',
                  b: 'Name, email, phone, city. In the document body — not the page header, which frequently does not extract.',
                },
                {
                  h: 'A short summary',
                  b: `Two or three lines naming the role you want and your strongest ${critical[0]?.keyword ?? 'core'} experience. This is the one place a keyword and a claim sit together.`,
                },
                {
                  h: 'Experience, newest first',
                  b: 'Company, title, and a plain date range like "Mar 2021 – Present". Bullets that lead with a verb and end with a number wherever one honestly exists.',
                },
                {
                  h: 'Skills, as plain text',
                  b: `A simple list — not a grid, not a table, not rating bars. Include the specific terms above that you genuinely have${critical.length ? `, starting with ${critical.slice(0, 3).map((k) => k.keyword).join(', ')}` : ''}.`,
                },
                {
                  h: 'Education and certifications',
                  b: 'Degree, institution, year. Certifications with the issuing body.',
                },
              ].map((item, i) => (
                <li key={item.h} className="flex gap-4 p-4 glass-card rounded-xl">
                  <span className="text-xs font-mono text-blue-400 shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{item.h}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section
            id="mistakes"
            title="What tends to go wrong"
            intro="In rough order of how much damage each one does."
          >
            <ul className="space-y-3" role="list">
              {[
                'A two-column layout with skills in a sidebar. It reads well to a person and can interleave badly when extracted.',
                'One resume sent to every posting. Keyword relevance is per-job; a generic resume is generically mediocre against all of them.',
                'Contact details in the page header or footer, where they often do not extract at all.',
                'Achievements with no numbers. "Improved performance" and "cut p95 latency from 800ms to 210ms" are the same claim, but only one is checkable.',
                'Keyword lists pasted at the bottom, or hidden in white text. Modern systems handle this poorly for you and a human reader will notice.',
                'A PDF exported from a design tool with text converted to outlines. There is no text layer, so there is nothing to read.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                  <span className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true">
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {/* Ad placed after substantial content, never above it. */}
          <InContentAd />

          {/* ── Context, honestly caveated ─────────────────────────── */}
          <Section id="context" title="Market context">
            <div className="glass-card rounded-xl p-5">
              <div className="flex flex-wrap gap-x-8 gap-y-3 mb-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Demand</p>
                  <p className="text-sm text-white font-semibold">
                    {getDemandLabel(role.demandTrend)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">
                    India (indicative)
                  </p>
                  <p className="text-sm text-white font-semibold">{role.salaryRange.india}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">
                    Global (indicative)
                  </p>
                  <p className="text-sm text-white font-semibold">{role.salaryRange.global}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Indicative ranges compiled from public job postings, not salary survey data. They
                vary widely by city, company size, and seniority — treat them as a rough band, not
                a benchmark.
              </p>
            </div>
          </Section>

          {role.faqs.length > 0 && (
            <Section id="faq" title="Questions">
              <FAQAccordion items={role.faqs.map((f) => ({ q: f.question, a: f.answer }))} />
            </Section>
          )}

          {/* ── Convert ───────────────────────────────────────────── */}
          <div className="glass-card rounded-2xl p-6 text-center border border-blue-500/20 bg-blue-500/5 mb-11">
            <h2 className="font-bold text-white mb-2 font-syne">
              Check your resume against a real posting
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              A list of keywords only goes so far. See which of these your resume actually contains.
            </p>
            <Link
              href={`/?role=${role.slug}#scanner`}
              className="btn-primary inline-flex px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Scan for {role.title}
            </Link>
          </div>

          {related.length > 0 && (
            <Section id="related" title="Related roles">
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/role/${r.slug}`}
                    className="text-sm px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    {r.title}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          <p className="text-xs text-slate-600 leading-relaxed pt-4 border-t border-white/[0.06]">
            Keyword weightings reflect patterns in job postings for this role. They are guidance,
            not a guarantee about any particular employer&apos;s system — see{' '}
            <Link href="/methodology" className="text-blue-400 hover:text-blue-300 transition-colors">
              how our scoring works
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
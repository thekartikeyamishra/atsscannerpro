// src/lib/seo.ts
// Centralized SEO + Schema.org (JSON-LD) factory for E-E-A-T.
// Single source of truth for site identity, author attribution,
// and every structured-data block used across the site.

export const SITE_URL = 'https://atsscannerpro.com';
export const SITE_NAME = 'ATS Scanner Pro';
export const CURRENT_YEAR = 2025; // Static — never new Date() (hydration + crawl stability)
export const BUILD_DATE = '2025-05-11'; // Bump on major content revisions only
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const LOGO_URL = `${SITE_URL}/icon-512.png`;

// ── E-E-A-T: explicit author identity ───────────────────────────────────────
export const AUTHOR = {
  '@type': 'Person',
  name: 'Kartikeya Mishra',
  url: 'https://linkedin.com/in/thekartikeyamishra',
  sameAs: [
    'https://linkedin.com/in/thekartikeyamishra',
    'https://x.com/kartikeyahere',
  ],
} as const;

export const PUBLISHER = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: LOGO_URL },
} as const;

// ── Site-wide schemas (use once, in the root layout / home page) ────────────
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Free AI-powered ATS resume scanner. Get an instant ATS compatibility score, missing keywords, and role-specific resume guides.',
    publisher: PUBLISHER,
  };
}

export function buildSoftwareAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: AUTHOR,
  };
}

// ── Per-page schema builders ────────────────────────────────────────────────
export interface ArticleSchemaInput {
  headline: string;
  description: string;
  path: string; // e.g. /role/ai-engineer
  datePublished?: string;
  dateModified?: string;
  image?: string;
}

export function buildArticleSchema(input: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished ?? '2025-01-01',
    dateModified: input.dateModified ?? BUILD_DATE,
    author: AUTHOR,
    publisher: PUBLISHER,
    mainEntityOfPage: `${SITE_URL}${input.path}`,
    image: input.image ?? OG_IMAGE,
  };
}

export interface FAQInput {
  question: string;
  answer: string;
}

export function buildFAQSchema(faqs: FAQInput[]) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export interface Crumb {
  name: string;
  path: string; // '' for home, '/role/x' for deeper pages
}

export function buildBreadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

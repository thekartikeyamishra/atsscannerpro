// src/lib/seo.ts
// Metadata and JSON-LD helpers. Structured data only ever describes what is
// visibly on the page — no ratings, review counts or user numbers we can't show.

import type { Metadata } from 'next';
import { SITE } from '@/config/site';

export const abs = (path = '/') => new URL(path, SITE.url).toString();

export function pageMeta({
  title,
  description,
  path,
  type = 'website',
  published,
  updated,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  published?: string;
  updated?: string;
  noindex?: boolean;
}): Metadata {
  const url = abs(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      ...(type === 'article'
        ? { publishedTime: published, modifiedTime: updated, authors: [SITE.author.name] }
        : { images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE.name }] }),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
const AUTHOR_ID = `${SITE.url}/about#author`;

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: abs('/icon-512x512.png'),
    email: SITE.contactEmail,
    founder: { '@id': AUTHOR_ID },
    sameAs: [SITE.social.linkedin, SITE.social.x],
  };
}

export function authorSchema() {
  return {
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: SITE.author.name,
    url: abs('/about'),
    sameAs: [SITE.author.url],
  };
}

export function websiteSchema() {
  return { '@type': 'WebSite', '@id': SITE_ID, url: SITE.url, name: SITE.name, publisher: { '@id': ORG_ID }, inLanguage: 'en' };
}

export function webAppSchema() {
  return {
    '@type': 'WebApplication',
    '@id': `${SITE.url}/#app`,
    name: SITE.name,
    url: SITE.url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any (runs in a web browser)',
    browserRequirements: 'Requires a modern browser with JavaScript enabled',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: SITE.description,
    featureList: [
      'Compare a resume with a job description',
      'Required and nice-to-have keyword detection',
      'Alias matching (for example k8s and Kubernetes)',
      'Formatting checks for columns, tables, images and contact details',
      'Bullet impact analysis',
      'Runs in the browser; files are not uploaded',
    ],
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function articleSchema(a: { title: string; description: string; path: string; published: string; updated: string; section?: string }) {
  return {
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: abs(a.path),
    url: abs(a.path),
    datePublished: a.published,
    dateModified: a.updated,
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    image: abs(`${a.path}/opengraph-image`),
    articleSection: a.section,
    inLanguage: 'en',
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

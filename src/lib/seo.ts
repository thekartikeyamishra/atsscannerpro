// src/lib/seo.ts
// Centralized Schema.org factory for Next.js JSON-LD generation.
// Provides deterministic, highly-structured microdata to improve search engine visibility.

export const CURRENT_YEAR = new Date().getFullYear();
export const SITE_URL = 'https://atsscannerpro.com';
export const SITE_NAME = 'ATS Scanner Pro';

/**
 * Base Organization schema for the website entity.
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-powered ATS resume scanner. Free, private, no sign-up.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/roles?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * SoftwareApplication schema specifically for the ATS scanner tool.
 * Tells Google this is a web application, not just a static page.
 */
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ATS Scanner Pro Engine',
    url: `${SITE_URL}/#scanner`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Free, client-side ATS resume scanner that checks for formatting, keywords, and layout compatibility.',
    featureList: [
      'Instant Resume Scoring',
      'Formatting and Layout Checks',
      'Client-side PII stripping',
      'Keyword gap analysis'
    ]
  };
}

/**
 * Generates an FAQPage schema from an array of Q&A pairs.
 * Crucial for winning rich snippets in Google Search results.
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates BreadcrumbList schema for deep pages (like Role Guides).
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/rolesData';
import { SITE_URL, BUILD_DATE } from '@/lib/seo';

// /public/sitemap.xml and /public/sitemap.xsl must be DELETED. A static file in
// /public takes precedence over a metadata route of the same path, so the
// hand-written sitemap.xml was shadowing this generator and your role pages
// were never being submitted.
//
// BUILD_DATE is static rather than new Date(): a lastModified that changes on
// every crawl tells Google the content changed every time, which burns crawl
// budget and muddies freshness signals.

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                  lastModified: BUILD_DATE, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/methodology`, lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/roles`,       lastModified: BUILD_DATE, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/insights`,    lastModified: BUILD_DATE, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/security`,    lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`,       lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`,     lastModified: BUILD_DATE, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/privacy`,     lastModified: BUILD_DATE, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms`,       lastModified: BUILD_DATE, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/refund`,      lastModified: BUILD_DATE, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  const rolePages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/role/${slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...rolePages];
}
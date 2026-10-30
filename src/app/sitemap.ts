import type { MetadataRoute } from 'next';
import { SITE } from '@/config/site';
import { GUIDES } from '@/content/guides';
import { ROLES } from '@/content/roles';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE.url}${p}`;
  const reviewed = new Date(SITE.contentReviewed);
  return [
    { url: u('/'), lastModified: reviewed, changeFrequency: 'weekly', priority: 1 },
    { url: u('/guides'), lastModified: reviewed, changeFrequency: 'weekly', priority: 0.8 },
    ...GUIDES.map((g) => ({ url: u(`/guides/${g.slug}`), lastModified: new Date(g.updated), changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: u('/roles'), lastModified: reviewed, changeFrequency: 'monthly', priority: 0.7 },
    ...ROLES.map((r) => ({ url: u(`/role/${r.slug}`), lastModified: reviewed, changeFrequency: 'monthly' as const, priority: 0.7 })),
    { url: u('/methodology'), lastModified: reviewed, changeFrequency: 'monthly', priority: 0.6 },
    { url: u('/app'), lastModified: reviewed, changeFrequency: 'monthly', priority: 0.5 },
    { url: u('/about'), lastModified: reviewed, changeFrequency: 'yearly', priority: 0.4 },
    { url: u('/contact'), lastModified: reviewed, changeFrequency: 'yearly', priority: 0.3 },
    { url: u('/privacy'), lastModified: reviewed, changeFrequency: 'yearly', priority: 0.2 },
    { url: u('/terms'), lastModified: reviewed, changeFrequency: 'yearly', priority: 0.2 },
  ];
}

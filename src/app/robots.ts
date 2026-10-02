import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// NOTE: /public/robots.txt must be DELETED — it shadows this route entirely.
// Having both means edits here silently do nothing.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Only build artefacts and the API. Never block CSS/JS: Google needs to
        // render the page to see the content.
        disallow: ['/api/', '/_next/'],
      },
      // AdSense crawlers need full access to classify pages for ad targeting.
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: 'AdsBot-Google', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
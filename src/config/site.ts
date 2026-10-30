// src/config/site.ts
// One place for everything you will want to change without touching components.

export const SITE = {
  name: 'ATS Scanner Pro',
  shortName: 'ATS Scanner',
  url: 'https://atsscannerpro.com',
  tagline: 'Free ATS resume checker that runs in your browser',
  description:
    'Compare your resume with any job description. See missing keywords, formatting that breaks ATS parsing, and what to fix first. Free, unlimited and private.',
  locale: 'en_US',
  author: {
    name: 'Kartikeya Mishra',
    url: 'https://linkedin.com/in/thekartikeyamishra',
  },
  contactEmail: 'workmailkartikeya@gmail.com',
  location: 'Lucknow, India',
  social: {
    linkedin: 'https://linkedin.com/in/thekartikeyamishra',
    x: 'https://x.com/KartikeyahereX',
  },
  /** Bump when content is meaningfully reviewed; used for sitemap lastmod. */
  contentReviewed: '2026-10-30',
} as const;

/**
 * Mobile app store links.
 * Leave as null while the apps are unreleased: the buttons show "Coming soon"
 * and open the invite list. Paste the real listing URL and redeploy, and the
 * button links straight to the store. Env vars override these at build time.
 */
export const APP_LINKS = {
  playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL || null,
  appStore: process.env.NEXT_PUBLIC_APP_STORE_URL || null,
} as const;

/** Google AdSense. Ad slot IDs come from AdSense → Ads → By ad unit. */
export const ADSENSE = {
  client: 'ca-pub-4557897331416844',
  slots: {
    inArticle: process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE || '',
    endOfArticle: process.env.NEXT_PUBLIC_AD_SLOT_END_OF_ARTICLE || '',
    homeMid: process.env.NEXT_PUBLIC_AD_SLOT_HOME || '',
  },
} as const;

export const SEARCH_CONSOLE_TOKEN = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';
export const BING_TOKEN = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '';

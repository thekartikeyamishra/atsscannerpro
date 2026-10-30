import type { MetadataRoute } from 'next';
import { SITE } from '@/config/site';

// Search engines and AI assistants are welcome: being cited by them is how
// people find a free tool. Only the API is off-limits.
const AI_AGENTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'CCBot', 'meta-externalagent', 'Amazonbot', 'cohere-ai', 'MistralAI-User'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: AI_AGENTS, allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

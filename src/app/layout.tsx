import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import JsonLd from '@/components/JsonLd';
import { ADSENSE, BING_TOKEN, SEARCH_CONSOLE_TOKEN, SITE } from '@/config/site';
import { authorSchema, graph, organizationSchema, websiteSchema } from '@/lib/seo';
import './globals.css';

// Self-hosted (SIL Open Font License): no request to a third-party font CDN.
const grotesk = localFont({ src: '../fonts/schibsted-grotesk-var.woff2', variable: '--font-grotesk', display: 'swap', weight: '400 900' });
const news = localFont({
  src: [
    { path: '../fonts/newsreader-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/newsreader-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/newsreader-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-news',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `Free ATS Resume Checker — ${SITE.name}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author.name, url: SITE.author.url }],
  creator: SITE.author.name,
  publisher: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  verification: {
    ...(SEARCH_CONSOLE_TOKEN ? { google: SEARCH_CONSOLE_TOKEN } : {}),
    ...(BING_TOKEN ? { other: { 'msvalidate.01': BING_TOKEN } } : {}),
  },
  other: { 'google-adsense-account': ADSENSE.client },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icon-192x192.png', type: 'image/png', sizes: '192x192' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#eef1f5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${news.variable}`}>
      <head>
        {/* AdSense: async, so it never blocks rendering. Placed in <head> as Google's verification expects. */}
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE.client}`} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM summary" />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <JsonLd data={graph(organizationSchema(), websiteSchema(), authorSchema())} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

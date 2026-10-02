// src/app/layout.tsx — Root layout
//
// WHAT CHANGED AND WHY
//
// 1. REMOVED the fabricated AggregateRating from the SoftwareApplication schema.
//    Google's structured-data policy treats invented review markup as spam and
//    it is a common cause of a manual action against rich results — which would
//    also put the AdSense application at risk.
//
// 2. Fonts now load through next/font/google instead of raw <link> tags. Fonts
//    are self-hosted at build time, which removes two render-blocking
//    round-trips to fonts.googleapis.com and eliminates the layout shift that
//    was hurting CLS.
//
// 3. AdSense loads via next/script (afterInteractive) rather than a raw <script>
//    in <head>. A synchronous head script blocks the main thread before LCP.
//
// 4. Added Google Search Console verification and the explicit AdSense account 
//    meta tag to the metadata object to ensure compliance and ownership verification.
//
// 5. Service worker registration is deferred off the critical path for PWA support.

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Syne, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const SITE_URL = 'https://atsscannerpro.com';
const SITE_NAME = 'ATS Scanner Pro';
// Fallback directly to your provided AdSense ID if the env var is missing during build
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-4557897331416844';

// ── Fonts (self-hosted at build time) ───────────────────────────────────────
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne-loaded',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ATS Scanner Pro — Free AI Resume Checker, Instant ATS Score',
    template: '%s | ATS Scanner Pro',
  },
  description:
    'Check your resume against any job description in seconds. Our AI-powered ATS scanner identifies missing keywords, semantic matches, and gives your resume a precise score. Free, private, no sign-up.',
  keywords: [
    'ATS resume checker',
    'ATS scanner free',
    'resume keyword checker',
    'resume ATS score',
    'applicant tracking system checker',
    'resume scanner AI',
    'resume optimization tool',
    'ATS resume parser',
    'free resume checker online',
    'resume score checker',
  ],
  authors: [{ name: 'Kartikeya Mishra', url: 'https://linkedin.com/in/thekartikeyamishra' }],
  creator: 'Kartikeya Mishra',
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'ATS Scanner Pro — Free AI Resume Checker',
    description:
      'Instantly check how your resume scores against any job description. AI-powered, private, free.',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATS Scanner Pro — Free AI Resume Checker',
    description: 'Get your ATS score instantly. AI-powered, private, no sign-up required.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@kartikeyahere',
  },
  alternates: { canonical: SITE_URL },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192x192.png',
  },
  // ── Search Console & AdSense Verification ─────────────────────────────────
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN',
  },
  other: {
    'google-adsense-account': ADSENSE_CLIENT,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#040B1A',
};

// ── Structured data ─────────────────────────────────────────────────────────
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'AI-powered ATS resume scanner. Upload your resume, paste the job description, get your score instantly.',
  url: SITE_URL,
  author: {
    '@type': 'Person',
    name: 'Kartikeya Mishra',
    url: 'https://linkedin.com/in/thekartikeyamishra',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512x512.png`,
  sameAs: ['https://x.com/kartikeyahere', 'https://linkedin.com/in/thekartikeyamishra'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'workmailkartikeya@gmail.com',
    contactType: 'customer support',
  },
};

const jsonLd = (schema: object) => JSON.stringify(schema).replace(/</g, '\\u003c');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${syne.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(softwareAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }}
        />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
      </head>

      <body className="antialiased bg-navy-900 text-white min-h-screen font-jakarta overflow-x-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:shadow-lg"
        >
          Skip to content
        </a>

        <main id="main">{children}</main>

        {/* ── AdSense Script ────────────────────────────────────────────────── */}
        {ADSENSE_CLIENT && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        )}

        {/* ── PWA Service Worker Registration ──────────────────────────────── */}
        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`}
        </Script>
      </body>
    </html>
  );
}
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // SAMEORIGIN stops other sites framing ours; AdSense ads are iframes *inside* our page, so they are unaffected.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  serverExternalPackages: ['firebase-admin'],
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/ads.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      { source: '/vendor/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/:file(icon-192x192.png|icon-512x512.png|apple-touch-icon.png|favicon.ico)', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    ];
  },
  async redirects() {
    return [
      // Old URLs from the previous version of the site — keep link equity.
      { source: '/role/ui-designer', destination: '/role/ux-designer', permanent: true },
      { source: '/role/product-designer', destination: '/role/ux-designer', permanent: true },
      { source: '/security', destination: '/privacy', permanent: true },
      { source: '/refund', destination: '/terms', permanent: true },
      { source: '/insights', destination: '/guides', permanent: true },
      { source: '/r/:token*', destination: '/#scanner', permanent: false },
      { source: '/scanner', destination: '/#scanner', permanent: true },
      { source: '/blog/:slug*', destination: '/guides', permanent: true },
    ];
  },
};

export default nextConfig;

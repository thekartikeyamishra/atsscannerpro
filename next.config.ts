import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 15+ standard for native/Node-only packages.
  // Tells Turbopack/Webpack NOT to bundle these for the server build —
  // they are required at runtime from node_modules instead.
  // pdfjs-dist legacy build is included because its .mjs entry breaks
  // when Turbopack tries to statically bundle it.
  serverExternalPackages: ["pdf-parse", "mammoth", "pdfjs-dist"],

  // Production hygiene
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Security headers on every route (AdSense-compatible — no frame-ancestors
        // restriction that would block Google's ad iframes from rendering)
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // ads.txt must be fetchable and cacheable for AdSense verification
        source: "/ads.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;

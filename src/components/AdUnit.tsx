'use client';
// src/components/AdUnit.tsx — the ONLY ad component in the project.
//
// WHAT CHANGED AND WHY
//
// 1. src/components/ui/AdBanner.tsx is deleted. Two components both pushed to
//    window.adsbygoogle with different guard logic; AdBanner was also being
//    handed the literal string "YOUR_IN_ARTICLE_SLOT_ID" as a slot, which is an
//    invalid unit that AdSense simply fails to fill.
//
// 2. The publisher ID and all six slot IDs were hardcoded, and every slot was
//    the SAME id (6467467898). Reusing one unit everywhere still serves ads,
//    but it collapses all placements into one reporting line, so you cannot
//    tell which placement earns and which merely costs you engagement. Slots
//    now come from env vars, one per placement.
//
// 3. A placement with no configured slot now renders NOTHING rather than an
//    <ins> with an empty data-ad-slot. An empty slot attribute produces console
//    errors and an unfilled reserved box on every page.
//
// 4. StickyBottomAd is removed from this file's exports by default — see the
//    note at the bottom. On a single-tool mobile page, a persistent anchor ad
//    plus a banner plus an in-content unit is the ad-density pattern that draws
//    AdSense policy attention, and it overlaps the scan CTA on short viewports.

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? '';

export const AD_SLOTS = {
  BANNER_TOP: process.env.NEXT_PUBLIC_AD_SLOT_BANNER_TOP ?? '',
  IN_CONTENT: process.env.NEXT_PUBLIC_AD_SLOT_IN_CONTENT ?? '',
  SIDEBAR: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR ?? '',
  RESULTS: process.env.NEXT_PUBLIC_AD_SLOT_RESULTS ?? '',
} as const;

type AdFormat = 'auto' | 'horizontal' | 'rectangle' | 'vertical';

interface AdUnitProps {
  slot: string;
  format?: AdFormat;
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
  label?: boolean;
}

function AdUnit({
  slot,
  format = 'auto',
  className = '',
  style,
  responsive = true,
  label = true,
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    // Render-time guard is in the early return below; this guard is for React
    // Strict Mode double-invocation in development.
    if (pushed.current || !slot || !PUB_ID) return;
    pushed.current = true;

    const timer = setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch {
        // Ad blocker or policy issue — never surface to the user.
      }
    }, 300); // keeps the ad request off the LCP critical path

    return () => clearTimeout(timer);
  }, [slot]);

  // No slot configured, or no publisher ID: render nothing at all.
  if (!slot || !PUB_ID) return null;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <p className="text-[9px] text-slate-600 text-center mb-1 uppercase tracking-[0.2em] select-none pointer-events-none">
          Sponsored
        </p>
      )}
      {/*
        suppressHydrationWarning: the AdSense script mutates this element
        (adding style/width/height) before React hydrates.
        The explicit minHeight on each placement below reserves space so the
        layout does not shift when the ad fills — this is what keeps CLS at 0.
      */}
      <ins
        suppressHydrationWarning
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        aria-label="Advertisement"
      />
    </div>
  );
}

// ── Placements ──────────────────────────────────────────────────────────────

export function BannerAd({ className }: { className?: string }) {
  return (
    <div className={`w-full flex justify-center py-2 ${className ?? ''}`}>
      <div className="w-full max-w-3xl">
        <AdUnit slot={AD_SLOTS.BANNER_TOP} format="horizontal" style={{ minHeight: 90 }} />
      </div>
    </div>
  );
}

/** For article/guide pages that carry real editorial content. */
export function InContentAd({ className }: { className?: string }) {
  return (
    <div className={`my-6 flex justify-center ${className ?? ''}`}>
      <div className="w-full max-w-md">
        <AdUnit slot={AD_SLOTS.IN_CONTENT} format="rectangle" style={{ minHeight: 250 }} />
      </div>
    </div>
  );
}

export function SidebarAd({ className }: { className?: string }) {
  return (
    <div className={className ?? ''}>
      <AdUnit slot={AD_SLOTS.SIDEBAR} format="vertical" style={{ minHeight: 400 }} />
    </div>
  );
}

/**
 * Shown after a completed scan, where the user has a real result to read.
 * Keep this BELOW the score and the top recommendations, never between the
 * score and the actions the user needs to take.
 */
export function ResultsAd({ className }: { className?: string }) {
  return (
    <div className={className ?? ''}>
      <AdUnit slot={AD_SLOTS.RESULTS} format="auto" style={{ minHeight: 90 }} label={false} />
    </div>
  );
}

// StickyBottomAd intentionally not exported.
//
// If you decide you need an anchor unit, use AdSense's own Anchor ad from the
// Auto ads panel rather than a hand-rolled fixed div: Google's own unit handles
// the dismissal and viewport rules that its policies require. A custom fixed
// overlay on a tool page is the exact shape of "ads that interfere with site
// navigation or content" in the Publisher Policies.

export default AdUnit;

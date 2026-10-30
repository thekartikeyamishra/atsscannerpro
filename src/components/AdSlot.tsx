'use client';

// One ad unit. Renders nothing until you set its slot ID (AdSense → Ads → By
// ad unit), so there are never empty boxes on the page. Space is reserved to
// avoid layout shift, and units are labelled "Advertisement" so they can't be
// mistaken for site content or buttons (AdSense placement policy).

import { useEffect, useRef } from 'react';
import { ADSENSE } from '@/config/site';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({
  slot,
  format = 'auto',
  layout,
  minHeight = 280,
}: {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  layout?: 'in-article';
  minHeight?: number;
}) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!slot || !ref.current || ref.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blockers throw here; the page works without ads */
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <aside className="ad-slot" aria-label="Advertisement" style={{ minHeight: minHeight + 22 }}>
      <span className="ad-label">Advertisement</span>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: layout === 'in-article' ? 'center' : undefined, minHeight }}
        data-ad-client={ADSENSE.client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </aside>
  );
}

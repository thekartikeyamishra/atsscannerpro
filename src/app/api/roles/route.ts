// src/app/api/roles/route.ts — public list of role guides
//
// PHASE 8: demandGrowth and avgAtsScore removed from the payload. Both were
// fabricated statistics (see the header of lib/rolesData.ts). This endpoint was
// republishing them as structured data, which is the worst place for an
// unsourced number to live — it invites other people to cite it.

import { NextResponse } from 'next/server';
import { getAllRoles } from '@/lib/rolesData';
import { SITE_URL, BUILD_DATE } from '@/lib/seo';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

export async function GET() {
  const roles = getAllRoles().map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    // Qualitative label, not a measurement — safe to publish.
    demandTrend: r.demandTrend,
    topKeywords: r.topKeywords.slice(0, 5).map((k) => k.keyword),
    url: `${SITE_URL}/role/${r.slug}`,
  }));

  return NextResponse.json(
    {
      roles,
      count: roles.length,
      // Static build date, not new Date(): with force-static the timestamp is
      // frozen at build anyway, so a "live" one would just be misleading.
      updatedAt: BUILD_DATE,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    },
  );
}
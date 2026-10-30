import { GUIDES, getGuide } from '@/content/guides';
import { OG_SIZE, ogCard } from '@/lib/og/card';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'ATS Scanner Pro guide';
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  return ogCard({ title: g?.title ?? 'Resume guide', kicker: 'Guide' });
}

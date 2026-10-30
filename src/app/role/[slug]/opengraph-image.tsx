import { ROLES, getRole } from '@/content/roles';
import { OG_SIZE, ogCard } from '@/lib/og/card';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Role resume keyword guide';
export function generateStaticParams() {
  return ROLES.map((r) => ({ slug: r.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const r = getRole((await params).slug);
  return ogCard({ title: `${r?.title ?? 'Role'} resume keywords and examples`, kicker: 'Role guide' });
}

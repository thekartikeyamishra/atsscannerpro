import { OG_SIZE, ogCard } from '@/lib/og/card';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'ATS Scanner Pro — find the words your resume is missing';

export default function Image() {
  return ogCard({ title: 'Find the words your resume is missing.', kicker: 'Free ATS resume checker' });
}

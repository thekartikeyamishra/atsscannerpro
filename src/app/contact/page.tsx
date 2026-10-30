import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage from '@/components/DocPage';
import { SITE } from '@/config/site';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Contact',
  description: 'Contact ATS Scanner Pro: report a scanning problem, suggest a keyword, request data deletion, or ask a question.',
  path: '/contact',
});

const subject = (s: string) => `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(s)}`;

export default function Contact() {
  return (
    <DocPage title="Contact" path="/contact" lede="One inbox, read by the person who builds the site. Expect a reply within three working days.">
      <p>
        Email: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
      </p>
      <h2 id="topics">Choose a topic</h2>
      <ul>
        <li><a href={subject('Scanner got it wrong')}>The scanner got something wrong</a> — paste the job description and describe what you expected. Please remove personal details from any resume text you share.</li>
        <li><a href={subject('Keyword suggestion')}>Suggest a skill or tool</a> the keyword list is missing, with the role it belongs to.</li>
        <li><a href={subject('Delete my invite-list data')}>Delete my invite-list email</a> — send it from the address you signed up with. We remove it within 7 days.</li>
        <li><a href={subject('Correction to a guide')}>Report an error in a guide</a>.</li>
        <li><a href={subject('Privacy or data request')}>Privacy and data requests</a> (access, correction, erasure, grievance).</li>
      </ul>
      <h2 id="not-here">What we can&apos;t help with</h2>
      <p>
        We can&apos;t review individual resumes by email, contact employers on your behalf, or tell you the internal settings of a company&apos;s ATS. For most questions, the{' '}
        <Link href="/guides">guides</Link> and <Link href="/methodology">methodology</Link> are the fastest answer.
      </p>
      <p className="small muted">Operated by {SITE.author.name}, {SITE.location}.</p>
    </DocPage>
  );
}

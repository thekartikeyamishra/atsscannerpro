import type { Metadata } from 'next';
import Link from 'next/link';
import AppButtons from '@/components/AppButtons';
import Breadcrumbs from '@/components/Breadcrumbs';
import InviteForm from '@/components/InviteForm';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Mobile App for Android and iPhone',
  description: 'The ATS Scanner Pro mobile app is in an invite-only preview. Request an invite for Android or iPhone and get early access when your batch opens.',
  path: '/app',
});

const PLANNED = [
  { t: 'Scan a job post from your phone', d: 'Share a posting from LinkedIn or a job board straight into the app and see your match before you apply.' },
  { t: 'Keep every tailored version', d: 'Save each version of your resume against the job it was written for, so you know exactly what you sent.' },
  { t: 'Track applications', d: 'A simple list of where you applied, when, and with which resume — and a nudge to follow up.' },
];

export default function AppPage() {
  return (
    <div className="wrap py-12">
      <Breadcrumbs items={[{ name: 'Mobile app', path: '/app' }]} />
      <div className="mt-6 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <h1 className="display text-[clamp(2.2rem,5vw,3.6rem)]">ATS Scanner Pro, on your phone</h1>
          <p className="lede mt-5">
            The mobile app is invite-only while we build it with a small group of early users. Join the list and we&apos;ll email you when your batch opens.
          </p>
          <div className="mt-8">
            <AppButtons />
          </div>
          <h2 className="h-card mt-12 text-[1.3rem]">What we&apos;re building</h2>
          <dl className="mt-4 space-y-5">
            {PLANNED.map((p) => (
              <div key={p.t} className="border-l-2 border-marker pl-4">
                <dt className="font-bold">{p.t}</dt>
                <dd className="mt-1 text-ink-2">{p.d}</dd>
              </div>
            ))}
          </dl>
          <p className="small muted mt-6">Planned features may change before release. The web scanner stays free.</p>
        </div>
        <div className="sheet h-fit p-6 sm:p-8">
          <h2 className="h-card mb-5 text-[1.3rem]">Request an invite</h2>
          <InviteForm source="app-page" />
          <p className="small muted mt-6">
            Need to check a resume today? The <Link href="/#scanner">web scanner</Link> works on any phone browser.
          </p>
        </div>
      </div>
    </div>
  );
}

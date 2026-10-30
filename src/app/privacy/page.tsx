import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage from '@/components/DocPage';
import { SITE } from '@/config/site';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Privacy Policy',
  description: 'How ATS Scanner Pro handles your data: resumes are analysed in your browser and never uploaded; what the invite list stores; cookies and Google AdSense.',
  path: '/privacy',
});

export default function Privacy() {
  return (
    <DocPage title="Privacy policy" path="/privacy" updated="2026-10-30" lede="The short version: we never receive your resume. The only personal data we store is an email address if you join the app invite list.">
      <h2 id="who">Who is responsible</h2>
      <p>
        This site, {SITE.url.replace('https://', '')}, is operated by {SITE.author.name}, {SITE.location} (&quot;we&quot;). For any privacy question or request — including as
        the grievance contact under India&apos;s Digital Personal Data Protection Act, 2023 — email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2 id="scanner">Resumes and job descriptions</h2>
      <p>
        When you use the scanner, your resume file and the job description you paste are read and analysed by code running in your own browser. They are <strong>not</strong>{' '}
        sent to our servers, not sent to any AI service, and not stored by us. We can&apos;t see them.
      </p>
      <p>
        To show whether your score improved, your browser saves a small record in its local storage: a short code derived from the job description and your last score for it
        (no text from either document). It stays on your device. You can remove it at any time by clearing this site&apos;s data in your browser settings.
      </p>

      <h2 id="invite-list">The mobile app invite list</h2>
      <p>If you request an invite, we store:</p>
      <ul>
        <li>your email address;</li>
        <li>which phone you use (Android, iPhone or both) and, if you choose, the role you&apos;re applying for;</li>
        <li>when you gave consent and which page you signed up from.</li>
      </ul>
      <p>
        We use this only to send you your invite and essential messages about the app&apos;s launch. We don&apos;t sell it, share it for marketing, or add you to a newsletter.
        The legal basis is your consent (GDPR Article 6(1)(a); DPDP Act section 6). The data is stored in Google Cloud Firestore. We keep it until the app has launched
        publicly and your invite has been sent, then for at most 12 months, unless you ask us to delete it sooner.
      </p>
      <p>
        You can withdraw consent, or ask to access, correct or delete your data, by emailing us from the address you signed up with. We act on requests within 7 days. If you
        are in the EU/UK you can also complain to your data protection authority; in India, to the Data Protection Board once it is operational.
      </p>
      <p>The invite list is not intended for anyone under 18.</p>

      <h2 id="ads">Advertising and cookies</h2>
      <p>
        We show ads from Google AdSense on some pages. Google and its partners use cookies and similar technologies to serve ads, limit how often you see them, measure
        performance and, where allowed, personalise them based on your visits to this and other websites.
      </p>
      <ul>
        <li>
          Learn how Google uses information from sites that use its services:{' '}
          <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">policies.google.com/technologies/partner-sites</a>.
        </li>
        <li>
          Turn off personalised ads from Google at <a href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">adssettings.google.com</a>, and from many
          other vendors at <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">aboutads.info/choices</a>.
        </li>
        <li>
          Visitors in the European Economic Area, the UK and Switzerland see a consent message from a Google-certified consent platform before any non-essential cookies are
          used, and can change their choice at any time from the link in that message. Visitors in US states with privacy laws can opt out of the sale or sharing of personal
          information through the same messaging where it applies.
        </li>
      </ul>
      <p>We don&apos;t use any other analytics or tracking cookies.</p>

      <h2 id="hosting">Hosting and server logs</h2>
      <p>
        The site is hosted on Vercel. Like any web host, it processes technical data such as IP address, browser type and the page requested, to deliver pages and protect
        against abuse. We don&apos;t combine this with anything else. When you join the invite list, your IP address is used briefly, in hashed form, to stop automated
        signups, and is not stored with your email.
      </p>

      <h2 id="transfers">International transfers</h2>
      <p>
        Our providers (Google, Vercel) may process data outside your country, including in the United States, under their standard contractual safeguards.
      </p>

      <h2 id="changes">Changes</h2>
      <p>
        If we change how we handle data, we&apos;ll update this page and the date at the top. If a change affects the invite list, we&apos;ll email the people on it first.
      </p>
      <p>
        See also our <Link href="/terms">terms of use</Link>.
      </p>
    </DocPage>
  );
}

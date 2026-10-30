import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage from '@/components/DocPage';
import { SITE } from '@/config/site';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'About ATS Scanner Pro',
  description: 'Who builds ATS Scanner Pro, why it runs in your browser, how we write our guides, and how the site is funded.',
  path: '/about',
});

export default function About() {
  return (
    <DocPage title="About ATS Scanner Pro" path="/about" updated="2026-10-30" lede="A free, private resume checker and a set of honest guides, built by one developer who got tired of resume tools that upload your data and paywall the results.">
      <h2 id="author">Who builds it</h2>
      <p>
        ATS Scanner Pro is built and maintained by <a href={SITE.author.url} rel="noopener noreferrer me" target="_blank">{SITE.author.name}</a>, an independent full-stack developer
        based in {SITE.location}. I write the scanner code, the keyword list and the guides. There&apos;s no venture funding and no sales team.
      </p>

      <h2 id="why">Why it exists</h2>
      <p>
        Job seekers apply to dozens of roles, and every application deserves a quick check against the posting. Most checkers cap free scans, ask you to create an account,
        and upload your resume — a document with your name, phone number, email and work history — to their servers. That&apos;s a poor trade for a keyword comparison that a
        browser can do on its own.
      </p>
      <p>So ATS Scanner Pro makes three promises:</p>
      <ul>
        <li><strong>Unlimited and free.</strong> The scanner costs us nothing per scan because it runs on your device.</li>
        <li><strong>Private by design.</strong> Your resume never leaves your browser.</li>
        <li><strong>No mystery numbers.</strong> The scoring formula is <Link href="/methodology">published in full</Link>.</li>
      </ul>

      <h2 id="editorial-policy">Editorial policy</h2>
      <p>Our guides and role pages follow a few rules:</p>
      <ul>
        <li><strong>No invented statistics.</strong> If we can&apos;t point to a credible source for a number, we don&apos;t use it. That rules out several figures that circulate widely in resume advice.</li>
        <li><strong>Examples are labelled.</strong> Example bullets use made-up figures to show the shape of a good line, and say so.</li>
        <li><strong>Honesty over keyword stuffing.</strong> We never advise adding skills you don&apos;t have or hiding text in your resume.</li>
        <li><strong>No paid placements.</strong> We don&apos;t accept payment to recommend products. Ads are shown by Google AdSense, labelled &quot;Advertisement&quot;, and are not endorsements.</li>
        <li><strong>Reviewed and dated.</strong> Each guide shows when it was last updated. When advice changes, we revise the page rather than publish a new one.</li>
        <li><strong>Corrections.</strong> If something is wrong, <Link href="/contact">tell us</Link> and we&apos;ll fix it and update the date.</li>
      </ul>

      <h2 id="funding">How the site is funded</h2>
      <p>
        The website is supported by a small number of ads from Google AdSense, placed away from the scanner&apos;s controls so they don&apos;t get in the way. The upcoming mobile
        app is in an invite-only preview; we&apos;ll be clear about any pricing before anyone is asked to pay for anything.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> or use the <Link href="/contact">contact page</Link>. I read everything.
      </p>
    </DocPage>
  );
}

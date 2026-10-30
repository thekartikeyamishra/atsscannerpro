import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage from '@/components/DocPage';
import { SITE } from '@/config/site';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'Terms of Use',
  description: 'The terms for using ATS Scanner Pro: a free informational tool with no guarantee of interviews or employment, provided as is.',
  path: '/terms',
});

export default function Terms() {
  return (
    <DocPage title="Terms of use" path="/terms" updated="2026-10-30" lede="Plain-language terms for a free tool. By using the site you agree to them.">
      <h2 id="service">What the service is</h2>
      <p>
        ATS Scanner Pro (&quot;the site&quot;) is a free tool that compares the text of a resume with a job description and offers suggestions, plus articles about resumes
        and applicant tracking systems. It is operated by {SITE.author.name}, {SITE.location}. There is no charge for using the website.
      </p>

      <h2 id="no-guarantee">No guarantee of results</h2>
      <p>
        Scores and suggestions are our own automated estimate and general information, not professional career, legal or financial advice. They are not produced by, and
        do not predict the output of, any employer&apos;s hiring software. Using the site does not guarantee that you will be shortlisted, interviewed or hired, and you are
        responsible for the content of the resumes you send.
      </p>

      <h2 id="honesty">Use it honestly</h2>
      <p>
        Only add skills, experience and qualifications that are true. You agree not to use the site to create misleading applications, to scrape or overload it, to
        attempt to break its security, or to break any law.
      </p>

      <h2 id="your-content">Your content</h2>
      <p>
        Files and text you analyse stay in your browser and remain yours. We don&apos;t receive or claim any rights to them. See the <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2 id="our-content">Our content</h2>
      <p>
        The site&apos;s text, code, design and keyword list are protected by copyright. You may quote short passages with a link back. You may not republish whole guides or
        copy the tool. Product names mentioned (for example Workday, Greenhouse, Lever, Microsoft Word, Google Docs) belong to their owners; we are not affiliated with them.
      </p>

      <h2 id="ads">Advertising and links</h2>
      <p>
        Ads are provided by Google AdSense and are labelled. We don&apos;t control or endorse advertisers. Links to other websites are provided for convenience; we aren&apos;t
        responsible for their content.
      </p>

      <h2 id="app">Mobile app invite list</h2>
      <p>
        Joining the invite list doesn&apos;t create a contract or an obligation for either side. Features, timing and any pricing of the app may change, and will be stated
        clearly before you are asked to pay for anything.
      </p>

      <h2 id="liability">As-is and liability</h2>
      <p>
        The site is provided &quot;as is&quot; without warranties of any kind. To the extent the law allows, we are not liable for any indirect or consequential loss, or for
        decisions made based on the site. Nothing in these terms limits rights you have under consumer protection law that can&apos;t be excluded.
      </p>

      <h2 id="law">Governing law</h2>
      <p>These terms are governed by the laws of India, without affecting any mandatory consumer rights in your country of residence.</p>

      <h2 id="contact">Changes and contact</h2>
      <p>
        We may update these terms and will change the date above when we do. Questions: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>
    </DocPage>
  );
}

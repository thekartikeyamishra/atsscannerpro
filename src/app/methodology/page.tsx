import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage from '@/components/DocPage';
import { LEXICON } from '@/lib/scan/lexicon';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'How We Score Your Resume',
  description: 'The exact formula behind the ATS Scanner Pro score: keyword weights, parsing penalties, section and impact points, and what the score can\'t tell you.',
  path: '/methodology',
});

export default function Methodology() {
  return (
    <DocPage
      title="How we score your resume"
      path="/methodology"
      updated="2026-10-30"
      lede="Every weight, every penalty, and the limits of the number. If you change your resume and the score moves, you should be able to work out why."
    >
      <h2 id="what-it-is">What the score is — and isn&apos;t</h2>
      <p>
        The ATS Scanner Pro score is our own estimate of how well a resume&apos;s text matches one job description and how cleanly the file is likely to parse. It is not the
        score any employer&apos;s applicant tracking system would give you. Those systems are built by different vendors, configured by each employer, and their formulas aren&apos;t
        public. Many don&apos;t produce a score at all.
      </p>
      <p>
        What the score is good for: comparing versions of your resume against the <strong>same</strong> posting. What it isn&apos;t good for: comparing with scores from other
        tools, or predicting whether you&apos;ll get an interview.
      </p>

      <h2 id="formula">The formula (100 points)</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th scope="col">Part</th><th scope="col">Points</th><th scope="col">How it&apos;s calculated</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Keywords</th><td>45</td><td>Weighted share of the posting&apos;s terms found in your resume (details below).</td></tr>
            <tr><th scope="row">Parsing</th><td>20</td><td>Start at 20. Subtract 10 per critical finding, 4 per warning, 1 per minor note. Never below 0.</td></tr>
            <tr><th scope="row">Bullet impact</th><td>15</td><td>Up to 9 for the share of bullets containing a number (full marks at 50%), up to 6 for the share opening with an action verb (full marks at 70%).</td></tr>
            <tr><th scope="row">Job title</th><td>10</td><td>10 if the posting&apos;s title appears in your resume, 6 for a close version (most of its words), 0 if absent. 7 when we can&apos;t find a title in the posting.</td></tr>
            <tr><th scope="row">Sections</th><td>10</td><td>Contact details 3, Experience 3, Education 2, Skills 2.</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="keywords">How keywords are found and weighted</h2>
      <p>
        We split the job description into its sections and decide how strongly each term is asked for:
      </p>
      <ul>
        <li><strong>Required</strong> (weight 3): in a requirements or qualifications section, on a line with words like &quot;must&quot;, &quot;required&quot; or &quot;X+ years&quot;, or mentioned three or more times anywhere.</li>
        <li><strong>Nice to have</strong> (weight 1.5): under &quot;preferred&quot;, &quot;bonus&quot;, &quot;a plus&quot; or similar.</li>
        <li><strong>Mentioned</strong> (weight 1): in the duties or introduction.</li>
        <li>Benefits, salary and company boilerplate are ignored.</li>
      </ul>
      <p>
        Terms come from a curated list of {LEXICON.length} skills, tools, methods and certifications across engineering, data, product, design, marketing, sales, finance,
        HR, operations, healthcare and education. Each entry includes the common alternatives — &quot;k8s&quot; counts for Kubernetes, &quot;RESTful&quot; for REST APIs,
        &quot;Search Engine Optimization&quot; for SEO. Words that are also ordinary English (Go, R, Excel, Swift) only count when capitalised and not at the start of a
        sentence. We also pick up capitalised product names and repeated two-word phrases the list doesn&apos;t know.
      </p>
      <p>Then, for each term:</p>
      <ul>
        <li><strong>Found</strong> earns full credit — or 85% if it only appears in your skills list and never in a sentence or bullet.</li>
        <li><strong>Similar wording</strong> (every word of a multi-word term is present in another form, such as &quot;managed stakeholders&quot; for &quot;stakeholder management&quot;) earns half credit.</li>
        <li><strong>Missing</strong> earns nothing.</li>
        <li>Soft skills such as &quot;communication&quot; count at half weight, because recruiters rarely search for them.</li>
      </ul>
      <p>
        You can tap any term in the report to leave it out of the score — useful when the scanner picks up a word that isn&apos;t really a requirement.
      </p>

      <h2 id="parsing">Parsing checks</h2>
      <p>These come from the file itself, not from guesses:</p>
      <ul>
        <li><strong>Critical:</strong> almost no extractable text (scanned or image-based file); broken characters from unembedded fonts.</li>
        <li><strong>Warnings:</strong> more than 25% of lines sitting side by side with another block (columns, measured from PDF text positions); tables (DOCX); no email; no standard Experience heading; few or no dates; fewer than 180 words; a key term repeated more than eight times.</li>
        <li><strong>Minor:</strong> images; no phone; no Education or Skills heading; paragraphs instead of bullets; page numbers; icons used as labels; a generic file name; very long resumes.</li>
      </ul>
      <p>Each finding in the report is marked as measured or likely, so you know how much weight to give it.</p>

      <h2 id="bands">Score bands</h2>
      <ul>
        <li><strong>80–100, strong:</strong> most required terms covered, clean file.</li>
        <li><strong>65–79, good:</strong> a few important gaps.</li>
        <li><strong>50–64, fair:</strong> several required terms missing or a formatting problem.</li>
        <li><strong>Below 50, weak:</strong> not yet tailored, or a stretch role.</li>
      </ul>

      <h2 id="privacy">Where this runs</h2>
      <p>
        All of the above runs in your browser. Your resume and the job description aren&apos;t sent to us or to an AI model. The code that does it is the same for everyone;
        there is no hidden premium scoring. Read more in the <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2 id="limits">Known limits</h2>
      <ul>
        <li>Unusual layouts can still extract in an odd order that we don&apos;t detect.</li>
        <li>Content in Word headers, footers and text boxes isn&apos;t read — which is also true of many ATS parsers.</li>
        <li>We match words, not meaning. If you describe a skill in completely different language, we&apos;ll mark it missing; so will a keyword search.</li>
        <li>We don&apos;t judge whether your experience is good — only whether it&apos;s visible.</li>
      </ul>
      <p>
        Found a case where the scanner gets it wrong? <Link href="/contact">Tell us</Link> — real examples are how the keyword list and checks improve.
      </p>
    </DocPage>
  );
}

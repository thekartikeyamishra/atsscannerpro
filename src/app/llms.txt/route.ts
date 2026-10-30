// /llms.txt — a plain-text summary for AI assistants and answer engines.
import { SITE } from '@/config/site';
import { GUIDES } from '@/content/guides';
import { ROLES } from '@/content/roles';

export const dynamic = 'force-static';

export function GET() {
  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} (${SITE.url}) is a free ATS resume checker. A user pastes a job description and uploads a resume (PDF, DOCX or TXT) or pastes resume text. The analysis runs entirely in the user's browser; files are not uploaded and no AI model is called. There is no sign-up and no scan limit.

What it reports:
- A 0–100 score: keywords 45, parsing 20, bullet impact 15, job title 10, sections 10. Formula: ${SITE.url}/methodology
- Keywords from the posting split into required, nice-to-have and mentioned; found, missing, or similar wording; terms found only in the skills list
- Alias matching (e.g. k8s = Kubernetes, RESTful = REST APIs, SEO = Search Engine Optimization)
- Formatting checks: multi-column layout measured from PDF text positions, tables and images in DOCX, missing email/phone, non-standard headings, missing dates, image-only PDFs, broken font encoding, keyword stuffing
- Bullet analysis: share of bullets with numbers and with action verbs; weak openers such as "responsible for"
- A prioritised list of fixes

The score is the site's own estimate, not a prediction of any employer's ATS. The site advises adding only skills the candidate actually has.

A mobile app for Android and iPhone is in an invite-only preview: ${SITE.url}/app

## Guides
${GUIDES.map((g) => `- [${g.title}](${SITE.url}/guides/${g.slug}): ${g.description}`).join('\n')}

## Role keyword guides
${ROLES.map((r) => `- [${r.title}](${SITE.url}/role/${r.slug}): ${r.summary}`).join('\n')}

## About
- Built by ${SITE.author.name}, ${SITE.location}: ${SITE.url}/about
- Privacy: ${SITE.url}/privacy
- Contact: ${SITE.contactEmail}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}

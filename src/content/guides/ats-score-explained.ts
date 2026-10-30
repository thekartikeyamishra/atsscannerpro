import type { Guide } from './index';

const guide: Guide = {
  slug: 'ats-score-explained',
  title: 'What an "ATS score" means — and what a good one looks like',
  short: 'ATS scores explained',
  description: 'Why every resume checker gives a different ATS score, what the number can and can\'t tell you, and why chasing 100% usually makes a resume worse.',
  published: '2026-10-30',
  updated: '2026-10-30',
  related: ['how-ats-reads-your-resume', 'find-resume-keywords', 'tailor-resume-in-15-minutes'],
  faqs: [
    { q: 'What is a good ATS score?', a: 'On our scale, 65–79 means a solid match and 80+ a strong one. Other tools use different formulas, so compare scores only within the same tool and for the same job description.' },
    { q: 'Why do different resume checkers give different scores?', a: 'Each tool decides for itself which terms count, how to weight them, and what else to include (formatting, length, verbs). There is no industry-standard ATS score, and employers\' own systems are configured differently again.' },
    { q: 'Will a high score guarantee an interview?', a: 'No. A score measures how well your resume\'s text matches a posting and how cleanly it parses. Interviews depend on your actual experience, the applicant pool, timing and the hiring team.' },
  ],
  body: `
Paste the same resume into three online checkers and you'll get three different scores. That isn't because two of them are broken. It's because there is no such thing as a universal ATS score — and understanding why helps you use any score sensibly.

## There's no standard number

Applicant tracking systems are made by dozens of vendors. Some show recruiters a match percentage; many don't rank candidates at all. Those that do calculate it in their own way, and employers configure them differently. No outside tool can see that calculation.

So every "ATS score" from a resume checker — ours included — is the checker's own estimate built from signals that matter across most systems: whether the posting's important terms appear in your resume, whether the file parses cleanly, and whether the content is easy to scan.

## How our score is built

We publish the full formula on our [methodology page](/methodology). In short, out of 100:

| Part | Points | What it measures |
|---|---|---|
| Keywords | 45 | Required terms count three times as much as nice-to-haves; terms only in your skills list get slightly less credit |
| Job title | 10 | Whether the posting's title, or a close version, appears |
| Parsing | 20 | Points lost for columns, tables, missing contact details and similar problems |
| Sections | 10 | Contact details, Experience, Education, Skills |
| Impact | 15 | Share of bullets with numbers and strong opening verbs |

The breakdown matters more than the total. A 70 made of perfect formatting and weak keywords needs completely different work from a 70 with great keywords and a broken two-column layout.

{{ad}}

## What the bands mean

- **80 and above — strong.** You cover most required terms and the file is clean. Further gains are small; spend your time on the cover letter or a referral.
- **65 to 79 — good.** A few important terms are missing or weakly placed. One focused edit usually moves you up.
- **50 to 64 — fair.** You're probably missing several required skills or have a formatting problem. Fix the top items in the list we give you.
- **Below 50 — weak.** Either the role is a stretch, or the resume isn't tailored at all. Check whether the job is the right fit before rewriting.

## Why chasing 100% backfires

A perfect score usually means you've copied the posting's language wholesale. That causes three problems:

1. **The human read.** After the search, a person opens your file. A resume that mirrors the posting word for word looks generic and, at worst, dishonest.
2. **Claims you can't support.** Adding skills you don't have to raise a number is the fastest way to fail a phone screen.
3. **Diminishing returns.** Going from 82 to 95 rarely changes whether you appear in a recruiter's search. Going from 55 to 75 often does.

## A better way to use any score

- Compare scores only for the same job description and the same tool.
- Use the list of missing terms, not the number, to decide what to change.
- Rescan after each round of edits to confirm the change landed. Our scanner shows the difference from your last scan of the same posting.
- Stop when the remaining gaps are things you genuinely don't have.
`,
};
export default guide;

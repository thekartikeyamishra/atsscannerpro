import type { Guide } from './index';

const guide: Guide = {
  slug: 'find-resume-keywords',
  title: 'How to find the right resume keywords in a job description',
  short: 'Finding resume keywords',
  description: 'A step-by-step method for pulling the keywords that matter out of any job posting, deciding which to use, and placing them so they read naturally.',
  published: '2026-10-30',
  updated: '2026-10-30',
  related: ['tailor-resume-in-15-minutes', 'how-ats-reads-your-resume', 'quantify-resume-bullets'],
  faqs: [
    { q: 'How many keywords should a resume have?', a: 'There\'s no magic number. Aim to cover the posting\'s required skills that are true for you, plus a few preferred ones. Each important term usually needs one or two natural mentions, not ten.' },
    { q: 'Should I copy the job description into my resume?', a: 'No. Copying phrases you can\'t back up will be obvious in the interview, and pasting the posting (visibly or in hidden text) reads as dishonest to the recruiter who opens your file.' },
    { q: 'Do soft skills count as keywords?', a: 'They help a little, but recruiters rarely search for "communication" or "teamwork". Spend your effort on hard skills, tools, titles and certifications, and show soft skills through results.' },
  ],
  body: `
Every job posting tells you what the recruiter will search for. The trick is separating the words that matter from the filler that every posting contains — "fast-paced environment", "team player", "passionate". This method takes about five minutes per posting and works for any role.

## Step 1: Read the posting in its sections

Most postings have the same structure: an introduction, responsibilities, requirements, and nice-to-haves. Each section carries different weight.

- **Requirements** (sometimes "What you'll need", "Qualifications", "About you") are what recruiters filter on. Treat every hard skill here as important.
- **Nice-to-haves** ("Preferred", "Bonus", "A plus") break ties between similar candidates.
- **Responsibilities** describe the day-to-day work. Tools named here are usually expected even if they're not repeated in requirements.
- **Benefits and company description** rarely contain keywords worth matching. Skip them.

## Step 2: Highlight four kinds of terms

Go through the requirements and responsibilities and mark:

1. **Hard skills and tools** — Python, Salesforce, Google Ads, AutoCAD, financial modelling.
2. **Job titles** — the title of the posting, and any titles mentioned ("reporting to the Head of Growth", "experience as a Business Analyst").
3. **Certifications and licences** — PMP, CPA, RN, AWS Certified.
4. **Domain words** — the industry or product type: B2B SaaS, payments, clinical trials, e-commerce.

Ignore adjectives and generic phrases. "Strong" and "excellent" aren't keywords; the noun after them is.

## Step 3: Count repetition

A term mentioned three times matters more than one mentioned once. If "stakeholder management" appears in the summary, the responsibilities and the requirements, it is probably one of the recruiter's first search terms.

{{ad}}

## Step 4: Match the posting's spelling

Recruiters type what's in front of them, and many systems match literally. If the posting says "Search Engine Optimization (SEO)", use both forms at least once. If it says "JavaScript", don't only write "JS". Watch for:

| Posting says | You might have written | Fix |
|---|---|---|
| Project Management | Managed projects | Use "project management" once in a bullet or summary |
| Bachelor's degree | B.S. | Write "Bachelor of Science (B.S.)" |
| Customer Success Manager | Client Partner | Add the posting's title in your headline if it fits |
| Microsoft Excel | Spreadsheets | Name the tool |

## Step 5: Place each keyword where it does the most work

The best place for a keyword is inside a bullet that shows you using it. A recruiter searching "SQL" finds you; a recruiter reading the bullet believes you.

- **Headline and summary:** the target job title and your two or three strongest matching skills.
- **Experience bullets:** the tools and methods you used, each with a result.
- **Skills section:** a compact list that repeats key tools in the posting's spelling. This is a backup, not the main event.

A term that appears only in your skills list is weaker than one that appears in a bullet too. Our scanner marks those separately so you can see which ones to strengthen.

## Step 6: Leave out what isn't true

You will rarely match 100% of a posting, and you don't need to. Postings are wish lists, and recruiters regularly interview people who meet most of the requirements. Adding a skill you don't have might get you past a search, but it will come out in the first technical conversation — and it can follow you if a company keeps your application on file.

If you're missing something important that you could learn quickly, the honest move is to learn the basics and mention a real project, course or use.

## Doing this faster

Paste the posting and your resume into our [free ATS scanner](/#scanner). It separates required from nice-to-have terms, recognises common aliases (k8s and Kubernetes, CI/CD and continuous integration), tells you which terms are missing and which only appear in your skills list, and runs entirely in your browser.
`,
};
export default guide;

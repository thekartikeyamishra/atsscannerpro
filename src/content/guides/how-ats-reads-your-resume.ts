import type { Guide } from './index';

const guide: Guide = {
  slug: 'how-ats-reads-your-resume',
  title: 'How an ATS actually reads your resume (and what it does with it)',
  short: 'How an ATS reads your resume',
  description: 'What applicant tracking systems really do with your resume: parsing, search, knockout questions and ranking — and which myths to stop worrying about.',
  published: '2026-10-30',
  updated: '2026-10-30',
  related: ['find-resume-keywords', 'ats-friendly-resume-format', 'ats-score-explained'],
  faqs: [
    { q: 'Does an ATS automatically reject resumes?', a: 'Rarely on its own. Most automatic rejections come from knockout questions in the application form (work authorisation, location, a required licence). Resumes are more often filtered by recruiter searches, so a resume that is missing key terms simply doesn\'t show up.' },
    { q: 'Which ATS do most companies use?', a: 'Large employers commonly use Workday, Oracle Taleo, SAP SuccessFactors or iCIMS. Startups and tech companies often use Greenhouse, Lever or Ashby. Each parses resumes a little differently, which is why simple formatting is the safe choice.' },
    { q: 'Can an ATS read a PDF?', a: 'Modern systems read text-based PDFs well. Problems come from scanned PDFs, text turned into outlines, unusual fonts and multi-column layouts — not from the PDF format itself.' },
  ],
  body: `
An applicant tracking system (ATS) is the software a company uses to receive applications, store them, move candidates through stages and search its candidate database. It is closer to a recruiting CRM than to a robot judge. Understanding what it actually does takes most of the mystery — and most of the anxiety — out of applying.

## What happens in the first few seconds

When you submit a resume, the system does three things almost immediately.

1. **It extracts the text.** Your PDF or DOCX is converted to plain text. Anything that isn't real text — a scanned page, a logo, a skill-rating bar, words inside an image — is lost here.
2. **It parses the text into fields.** A parser tries to find your name, email, phone, job titles, employers, dates, education and skills, and fill in a structured candidate profile. Many application forms then ask you to confirm or correct those fields.
3. **It stores the original file and the extracted text.** Recruiters can open your file, but they search the extracted text and the parsed fields.

If the extraction or parsing goes wrong, everything downstream suffers: your job titles may be blank, your dates misread, your skills section merged into a job description. That is the real reason formatting matters.

## How recruiters actually find you

Most recruiters don't read every resume that arrives for a popular role. They use the ATS like a search engine. A typical search looks like a short list of exact terms — "Python AND SQL AND Tableau" — sometimes combined with filters such as location, years of experience or a past job title.

Your resume shows up only if those words are in it. A resume that says "built dashboards in a BI tool" won't appear in a search for "Tableau", even if Tableau is what you used. This is why the most useful thing you can do is make sure the important terms from the posting appear in your resume, spelled the way the posting spells them — but only where they are true.

Some systems also rank applicants by how closely their resume matches the job description. Each vendor calculates this differently, and companies configure it differently, so no outside tool can reproduce an employer's exact number. The direction is consistent, though: clear titles, the right skill names and readable formatting help everywhere.

{{ad}}

## Knockout questions do the hard filtering

The automatic "rejected within minutes" emails people blame on resume parsing usually come from the application form, not the resume. Employers add screening questions such as:

- Are you legally authorised to work in this country?
- Will you now or in the future require sponsorship?
- Do you have a valid nursing licence in this state?
- Are you willing to work on-site in this city?

A "wrong" answer can trigger an automatic rejection regardless of how strong the resume is. Answer them honestly — misstatements tend to surface at offer stage — and if you are repeatedly rejected instantly, look at your answers to these questions first.

## What the ATS does not do

A few persistent myths are worth retiring:

- **"75% of resumes are rejected by robots."** This figure has circulated for years without a credible published source. Volume is the real problem: popular postings attract hundreds of applicants, and recruiters only have time to look at the ones that appear at the top of searches.
- **"White text full of keywords beats the system."** Hidden text shows up in the extracted text that recruiters read, and it looks dishonest. Several systems now flag it.
- **"You need a special ATS template."** You need a simple one: one column, standard headings, real text. Any word processor can produce that.
- **"The ATS scores your writing quality."** Systems match terms and parse fields. People judge the writing — which is why a resume stuffed with keywords can pass a search and still fail the six-second human read that follows.

## What this means for your resume

Write for two readers at once. The first is the search box, which needs the exact skill names, job titles and certifications from the posting. The second is the recruiter, who needs to understand in seconds what you did and how well. In practice:

- Use standard section headings: Summary, Experience, Education, Skills.
- Keep a single-column layout with your contact details in the body, not in the header.
- Put the posting's job title in your headline if it honestly describes you.
- Name tools and methods inside bullets that show results, and again in a short skills list.
- Give every role clear dates.

## A quick way to check

You can see what an ATS is likely to extract by copying all the text from your PDF and pasting it into a plain text editor. If the order is jumbled, sections run together or words are missing, a parser will struggle too. Our [free scanner](/#scanner) does this automatically and also compares the extracted text with a job description, so you can see which terms you're missing before you apply.
`,
};
export default guide;

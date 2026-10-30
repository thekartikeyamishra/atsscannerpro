import type { Guide } from './index';

const guide: Guide = {
  slug: 'ats-friendly-resume-format',
  title: 'ATS-friendly resume format: a checklist that works in any editor',
  short: 'ATS-friendly resume format',
  description: 'The layout, headings, fonts, dates and file settings that parse cleanly in applicant tracking systems — with what to avoid and why.',
  published: '2026-10-30',
  updated: '2026-10-30',
  related: ['pdf-or-docx', 'how-ats-reads-your-resume', 'resume-india-us-uk'],
  faqs: [
    { q: 'Are two-column resumes bad for ATS?', a: 'They are the most common cause of scrambled parsing. Some systems handle them; many read straight across the page and mix your sidebar into your job history. One column is the safe choice.' },
    { q: 'Can I use colour on an ATS resume?', a: 'Yes. Colour in headings or a thin accent line doesn\'t affect parsing. Just keep the text dark enough to read when printed in black and white.' },
    { q: 'What font is best for ATS?', a: 'Any standard, embedded font: Calibri, Arial, Helvetica, Georgia, Garamond, Cambria, Lato or Source Sans. Avoid decorative fonts and text converted to outlines.' },
  ],
  body: `
"ATS-friendly" sounds like a special format, but it really means one thing: when software turns your file into plain text, everything comes out in the right order with nothing missing. Here's what that takes.

## Layout

- **One column.** The single biggest improvement for most resumes. Sidebars and two-column designs are read left-to-right by many parsers, so "Skills: Python" from the sidebar ends up glued to a sentence in your job history.
- **No tables or text boxes for structure.** Tables can be read cell by cell, out of order. Text boxes are skipped entirely by some systems. If you want dates on the right, use a right-aligned tab stop.
- **Contact details in the body.** Many parsers ignore headers and footers. Put your name, email, phone, city and LinkedIn as plain lines at the top of the page.
- **No images, icons or skill bars.** None of them are text. A five-dot "Python" rating communicates nothing to software and very little to a person.

## Headings

Use the boring names. Parsers look for familiar headings to decide where each section starts.

| Use | Avoid |
|---|---|
| Summary or Profile | About Me, Who I Am |
| Experience or Work Experience | My Journey, Where I've Been |
| Education | Learning |
| Skills | Toolbox, What I Bring |
| Certifications, Projects | Badges, Things I Made |

{{ad}}

## Each job entry

Give every role the same structure so the parser can recognise the pattern:

> **Job title**, Company — City
> Mar 2022 – Present
> • Bullet that starts with a verb and ends with a result

- Write dates the same way everywhere. "Mar 2022 – Present" and "03/2022 – Present" both work; mixing them doesn't.
- Put the job title and company on their own line rather than inside a sentence.
- Use simple bullet characters (•, –). Exotic symbols sometimes extract as junk.

## Fonts and text

- Use a standard font between 10 and 12 pt for body text.
- Don't use ligature-heavy display fonts or text effects.
- Don't put important words in images, WordArt or SmartArt.
- Avoid hidden text. It ends up in the extracted text that recruiters read.

## Length

One page is the norm with less than about eight years of experience; two pages is fine beyond that. The ATS reads every page, so length matters more for the human reader than for the software. Keep your most relevant work on page one.

## File

- Save as a text-based PDF exported from Word, Google Docs or Pages, or as a DOCX — follow the application's instructions if it states a preference. See [PDF or DOCX?](/guides/pdf-or-docx) for the details.
- Name the file "Firstname-Lastname-Resume.pdf".
- Never upload a scan or a photo of a printed resume.

## Check before you send

Open your PDF, select all text, copy and paste into a plain text editor. Read it top to bottom. If anything is out of order, merged or missing, a parser will see the same. Or drop the file into our [scanner](/#scanner): it reports multi-column layouts, tables, images, missing contact details and unusual headings, and shows how many lines it detected sitting side by side.
`,
};
export default guide;

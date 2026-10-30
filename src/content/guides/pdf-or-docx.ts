import type { Guide } from './index';

const guide: Guide = {
  slug: 'pdf-or-docx',
  title: 'PDF or DOCX: which resume file should you upload?',
  short: 'PDF or DOCX?',
  description: 'When to send your resume as a PDF and when as a Word file, how to export a PDF that parses cleanly, and the file problems that break applications.',
  published: '2026-10-30',
  updated: '2026-10-30',
  related: ['ats-friendly-resume-format', 'how-ats-reads-your-resume', 'resume-india-us-uk'],
  faqs: [
    { q: 'Is PDF or Word better for ATS?', a: 'For most modern systems, a text-based PDF and a DOCX both parse well. Follow the application\'s instructions if it asks for one; otherwise a clean PDF keeps your layout intact for the human reader.' },
    { q: 'How do I know if my PDF is text-based?', a: 'Open it and try to select a single word. If you can highlight individual words and copy them, it\'s text-based. If the whole page selects as one block, or nothing selects, it\'s an image.' },
    { q: 'Can I upload a Canva resume?', a: 'You can, but check it first. Some design-tool exports turn text into shapes or split it into fragments. Copy-paste the PDF text into a plain editor; if it\'s jumbled, rebuild the resume in a word processor.' },
  ],
  body: `
The short answer: **follow the instructions on the application**. If there are none, a text-based PDF exported from a word processor is a good default. The longer answer explains why, and what actually goes wrong.

## Why the format matters less than people think

Applicant tracking systems convert whatever you upload into plain text before anyone searches it. Modern systems handle both PDF and DOCX well. Problems almost always come from *how* the file was made, not which format it is.

## When PDF is the better choice

- **The layout stays exactly as you designed it.** Fonts, spacing and line breaks look the same on the recruiter's screen as on yours.
- **It can't be accidentally edited.**
- **It's what most recruiters expect** when no format is specified.

The catch is that a PDF can hold text in ways that are hard to extract: scanned images, text converted to outlines, or characters stored with unusual font encodings.

## When DOCX is the better choice

- **The application or recruiter asks for Word.** Some agencies edit resumes into their own template, and some older systems parse Word more reliably.
- **You're applying through a portal that reports trouble reading your PDF.**

DOCX has its own pitfalls: text boxes, tables and content in headers or footers are often lost or reordered.

{{ad}}

## How to export a clean PDF

| Editor | Do this | Avoid this |
|---|---|---|
| Microsoft Word | File → Save As → PDF (or Export → Create PDF) | "Print to PDF" through a printer driver that rasterises text |
| Google Docs | File → Download → PDF document | Screenshots or "print to image" |
| Pages | File → Export To → PDF | Exporting with "Image quality: Best" as an image |
| Canva and design tools | Use a single-column template, export as "PDF Standard" and check the text | Text effects, curved text, text inside shapes |
| LaTeX | Compile with a standard font package (e.g. Latin Modern, TeX Gyre) | Fonts without a Unicode mapping, which extract as gibberish |

## Five file problems that break applications

1. **A scanned resume.** No text at all — the system sees a blank page.
2. **A password-protected PDF.** Many systems can't open it.
3. **A huge file.** Embedded photos can push a resume over upload limits (often 2–5 MB). A text resume should be well under 1 MB.
4. **An old .doc file.** Save as .docx; some parsers no longer support the 1997–2003 format.
5. **A generic file name.** "Resume_final_v3 (2).pdf" isn't a parsing problem, but it's the first thing a recruiter sees. Use "Firstname-Lastname-Resume.pdf".

## Test before you apply

Drop your file into our [scanner](/#scanner). It reads PDFs and DOCX files in your browser, tells you if the file has almost no extractable text, spots tables, images and side-by-side columns, and shows the text a parser would see.
`,
};
export default guide;

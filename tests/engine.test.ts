import { describe, expect, it } from 'vitest';
import { analyze } from '../src/lib/scan/analyze';
import { analyzeJobDescription } from '../src/lib/scan/extract';
import { normalize, countForm, countCased } from '../src/lib/scan/text';
import { SAMPLE_JOB, SAMPLE_RESUME } from '../src/lib/scan/samples';
import pdfPkg from 'pdfjs-dist/package.json';
import { readFileSync } from 'node:fs';

describe('text', () => {
  it('normalises separators the same way on both sides', () => {
    expect(countForm(normalize('We use CI/CD daily.'), normalize('ci/cd').trim())).toBe(1);
    expect(countForm(normalize('Built with Node.js.'), normalize('node.js').trim())).toBe(1);
    expect(countForm(normalize('cross-functional teams'), normalize('cross functional').trim())).toBe(1);
  });
  it('ignores sentence-initial everyday words for cased skills', () => {
    expect(countCased('Go above and beyond.', 'Go')).toBe(0);
    expect(countCased('Languages: Go, Python', 'Go')).toBe(1);
    expect(countCased('We excel at shipping', 'Excel')).toBe(0);
  });
});

describe('job description', () => {
  const jd = analyzeJobDescription(SAMPLE_JOB);
  const by = (n: string) => jd.keywords.find((k) => k.name === n);
  it('finds title, years, required and preferred terms', () => {
    expect(jd.title).toBe('Senior Frontend Engineer');
    expect(jd.yearsRequired).toBe(5);
    expect(by('React')?.importance).toBe('required');
    expect(by('Next.js')?.importance).toBe('required');
    expect(by('AWS')?.importance).toBe('preferred');
    expect(jd.keywords.some((k) => /storybook/i.test(k.name))).toBe(true);
  });
  it('does not treat benefits text as requirements', () => {
    expect(jd.keywords.some((k) => /health insurance/i.test(k.name))).toBe(false);
  });
});

describe('analyze', () => {
  const r = analyze({ resumeText: SAMPLE_RESUME, jobText: SAMPLE_JOB, layout: { format: 'paste' } });
  const st = (n: string) => r.keywords.find((k) => k.name === n)?.status;
  it('matches aliases and flags gaps', () => {
    expect(st('React')).toBe('matched');
    expect(st('REST APIs')).toBe('matched'); // "RESTful"
    expect(st('Next.js')).toBe('missing');
    expect(st('GraphQL')).toBe('missing');
    expect(r.keywords.find((k) => k.name === 'TypeScript')?.onlyInSkills).toBe(true);
  });
  it('scores in range with a breakdown that adds up', () => {
    const b = r.breakdown;
    expect(Math.abs(b.keywords + b.title + b.parsing + b.sections + b.impact - r.score)).toBeLessThanOrEqual(2);
    expect(r.score).toBeGreaterThan(30);
    expect(r.score).toBeLessThan(90);
    expect(r.resume.weakOpeners).toContain('responsible for');
    expect(r.resume.titleMatch).toBe('close');
    expect(r.fixes.length).toBeGreaterThan(2);
  });
  it('flags image-only resumes as critical', () => {
    const x = analyze({ resumeText: 'Jane', jobText: SAMPLE_JOB, layout: { format: 'pdf', charsPerPage: 4 } });
    expect(x.findings[0].code).toBe('IMAGE_ONLY');
  });
});

describe('build wiring', () => {
  it('pdf worker version constant matches installed pdfjs-dist', () => {
    const src = readFileSync('src/lib/scan/readFile.ts', 'utf8');
    expect(src).toContain(`PDF_VERSION = '${pdfPkg.version}'`);
  });
});

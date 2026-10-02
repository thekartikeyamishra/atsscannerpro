// tests/atsParseChecks.test.ts
//
// These checks are the "measured, not generated" moat. That claim only holds
// if the findings are actually reproducible, so determinism is tested here
// explicitly rather than assumed.

import { describe, it, expect } from 'vitest';
import { runParseChecks } from '../src/lib/atsParseChecks';

const codes = (text: string, fmt = 'pdf' as const) =>
  runParseChecks(text, fmt).findings.map((f) => f.code);

// A plausible single-column resume that should trip almost nothing.
const CLEAN = [
  'Kartikeya Mishra',
  'kartikeya@example.com | +91 98765 43210 | Bengaluru',
  '',
  'SUMMARY',
  'Backend engineer with six years building payment systems at scale.',
  '',
  'EXPERIENCE',
  'Senior Engineer, Acme Payments — Mar 2021 - Present',
  '• Cut p95 checkout latency from 800ms to 210ms across 12 services.',
  '• Led migration of 340 endpoints to a new auth layer with zero downtime.',
  '• Reduced infrastructure spend by 28% while traffic grew 4x.',
  '',
  'Engineer, Fintech Co — Jun 2018 - Feb 2021',
  '• Built a reconciliation pipeline processing 250000 transactions daily.',
  '• Mentored four junior engineers through their first production launches.',
  '• Designed an idempotency layer that eliminated duplicate settlement events.',
  '• Introduced contract testing across seven upstream service integrations.',
  '',
  'Engineer, Retail Systems — Aug 2016 - May 2018',
  '• Rebuilt the inventory sync job, cutting nightly runtime from 6 hours to 40 minutes.',
  '• Added observability to a legacy stack, reducing mean time to detection by 65%.',
  '• Wrote the migration plan that moved 90 stores onto the new pricing engine.',
  '',
  'SKILLS',
  'Python, PostgreSQL, Kafka, Docker, Kubernetes, AWS, Terraform',
  '',
  'EDUCATION',
  'B.Tech Computer Science, VIT — 2018',
].join('\n');

describe('runParseChecks — detects real problems', () => {
  it('flags a document with almost no extractable text', () => {
    expect(codes('Kartikeya Mishra. Engineer.')).toContain('LOW_TEXT_YIELD');
  });

  it('flags a missing email', () => {
    const noEmail = CLEAN.replace('kartikeya@example.com | ', '');
    expect(codes(noEmail)).toContain('NO_EMAIL_FOUND');
  });

  it('flags contact details that are present but not near the top', () => {
    const buried = ['EXPERIENCE', ...Array(40).fill('Did work at a company for a while.'),
                    'Contact: kartikeya@example.com'].join('\n');
    expect(codes(buried)).toContain('CONTACT_NOT_AT_TOP');
  });

  it('flags a short-line pattern consistent with a multi-column layout', () => {
    const twoCol = Array(60).fill('Python\nAWS\nDocker').join('\n');
    expect(codes(twoCol)).toContain('SHORT_LINE_RUNS');
  });

  it('flags encoding damage', () => {
    expect(codes(CLEAN + '\nSkills: Python\uFFFD\uFFFD')).toContain('ENCODING_ARTIFACTS');
  });

  it('flags a table-like layout', () => {
    const table = Array(8)
      .fill('Python      Advanced      5 years')
      .join('\n');
    expect(codes(CLEAN + '\n' + table)).toContain('TABULAR_LAYOUT');
  });

  it('flags a resume with no date ranges', () => {
    const noDates = CLEAN.replace('Mar 2021 - Present', '').replace('Jun 2018 - Feb 2021', '');
    expect(codes(noDates)).toContain('NO_DATE_RANGES');
  });

  it('flags legacy .doc', () => {
    expect(runParseChecks(CLEAN, 'doc').findings.map((f) => f.code)).toContain('LEGACY_DOC');
  });
});

describe('runParseChecks — does not cry wolf on a clean resume', () => {
  it('raises no critical findings', () => {
    const critical = runParseChecks(CLEAN, 'pdf').findings.filter((f) => f.severity === 'critical');
    expect(critical).toEqual([]);
  });

  it('does not flag standard headings as missing', () => {
    expect(codes(CLEAN)).not.toContain('NONSTANDARD_HEADINGS');
  });

  it('does not flag quantified achievements as absent', () => {
    expect(codes(CLEAN)).not.toContain('FEW_QUANTIFIED');
  });

  it('scores a clean resume highly', () => {
    expect(runParseChecks(CLEAN, 'pdf').parseScore).toBeGreaterThanOrEqual(85);
  });
});

describe('runParseChecks — determinism', () => {
  it('returns identical findings and score across runs', () => {
    const a = runParseChecks(CLEAN, 'pdf');
    const b = runParseChecks(CLEAN, 'pdf');
    expect(a.parseScore).toBe(b.parseScore);
    expect(a.findings.map((f) => f.code)).toEqual(b.findings.map((f) => f.code));
  });

  it('every finding carries a fix the user can act on', () => {
    for (const f of runParseChecks('short', 'unknown').findings) {
      expect(f.fix.length, `${f.code} has no actionable fix`).toBeGreaterThan(10);
      expect(['measured', 'likely', 'heuristic']).toContain(f.confidence);
    }
  });

  it('never throws on degenerate input', () => {
    for (const input of ['', '\n\n\n', '\u0000\u0000', 'x'.repeat(200000)]) {
      expect(() => runParseChecks(input, 'txt')).not.toThrow();
    }
  });
});

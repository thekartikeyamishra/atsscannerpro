// tests/piiStripper.test.ts
//
// ── WHY THIS FILE MATTERS MORE THAN ANY OTHER TEST ─────────────────────────
//
// Every privacy claim on the site rests on this one module. /privacy says
// contact details are removed before anything reaches Google. /security says
// the same. The homepage says it. If a regex here regresses, that claim becomes
// false and NOTHING ELSE BREAKS — no error, no failing build, no alert. The
// scan still returns a score. You would find out from a user, or not at all.
//
// A silent correctness failure with a legal consequence is exactly the shape of
// bug that needs tests, and there were none.
//
// The second group of tests is the one people forget: OVER-redaction. The
// original stripper redacted every six-digit number as a PIN code, which
// destroyed "processed 250000 records" — the achievement metric the product
// exists to measure. Stripping too much is a product bug, not a safe default.

import { describe, it, expect } from 'vitest';
import { stripPII, stripPIIWithReport } from '../src/lib/piiStripper';

describe('stripPII — removes what it promises to remove', () => {
  it('removes email addresses', () => {
    const out = stripPII('Contact me at priya.sharma@example.co.in for details.');
    expect(out).not.toContain('priya.sharma@example.co.in');
    expect(out).toContain('[EMAIL]');
  });

  it('removes Indian mobile numbers in common formats', () => {
    for (const phone of ['+91 98765 43210', '+91-98765-43210', '098765 43210']) {
      const out = stripPII(`Reach me on ${phone} any time.`);
      expect(out, `failed for: ${phone}`).not.toMatch(/98765/);
    }
  });

  it('removes US phone numbers', () => {
    const out = stripPII('Call (415) 555-0123 or 415-555-0123.');
    expect(out).not.toContain('555-0123');
  });

  it('removes LinkedIn and GitHub URLs, with or without a scheme', () => {
    const out = stripPII(
      'https://linkedin.com/in/kartikeya-mishra and github.com/thekartikeyamishra',
    );
    expect(out).not.toContain('kartikeya-mishra');
    expect(out).not.toContain('thekartikeyamishra');
  });

  it('removes Aadhaar numbers before the phone rule can consume them', () => {
    // Regression test for a real ordering bug: the phone rule used to match the
    // 12 digits first, so the Aadhaar rule could never fire and the number was
    // labelled [PHONE] instead. Either way it was redacted, but the telemetry
    // was wrong and the ordering was fragile.
    const { text, redactions } = stripPIIWithReport('Aadhaar: 4321 8765 2109');
    expect(text).toContain('[AADHAAR]');
    expect(redactions.AADHAAR).toBe(1);
  });

  it('removes PAN numbers', () => {
    expect(stripPII('PAN ABCDE1234F')).toContain('[PAN]');
  });

  it('removes the candidate name from the resume header', () => {
    const resume = ['Kartikeya Mishra', 'Bengaluru, India', '', 'SUMMARY', 'Engineer.'].join('\n');
    const out = stripPII(resume);
    expect(out).toContain('[CANDIDATE_NAME]');
    expect(out).not.toContain('Kartikeya Mishra');
  });

  it('strips a job description as thoroughly as a resume', () => {
    // JDs routinely carry a recruiter's direct contact details. This was the
    // gap phase 2 closed: the JD used to reach the model unstripped.
    const jd = 'Questions? Email hiring@acme.com or call +91 99887 76655.';
    const out = stripPII(jd);
    expect(out).not.toContain('hiring@acme.com');
    expect(out).not.toContain('99887');
  });
});

describe('stripPII — does NOT destroy the content being scored', () => {
  it('keeps large numbers used as achievement metrics', () => {
    // The old rule redacted every 6-digit number as a PIN code, silently
    // deleting the strongest signal on a resume.
    const out = stripPII('Processed 250000 records and cut costs by 340000 rupees.');
    expect(out).toContain('250000');
    expect(out).toContain('340000');
  });

  it('keeps percentages and short metrics', () => {
    const out = stripPII('Reduced p95 latency by 42% and grew signups 3x.');
    expect(out).toContain('42%');
    expect(out).toContain('3x');
  });

  it('keeps years and date ranges', () => {
    const out = stripPII('Senior Engineer, 2021 - 2024');
    expect(out).toContain('2021');
    expect(out).toContain('2024');
  });

  it('keeps technology names that look like identifiers', () => {
    const out = stripPII('Worked with Python 3.11, Node 20, PostgreSQL 15, and Java 17.');
    for (const term of ['Python', 'Node', 'PostgreSQL', 'Java']) {
      expect(out).toContain(term);
    }
  });

  it('does not mistake a section heading for a candidate name', () => {
    const resume = ['PROFESSIONAL SUMMARY', 'Senior Engineer', 'Built things.'].join('\n');
    expect(stripPII(resume)).not.toContain('[CANDIDATE_NAME]');
  });

  it('does not treat a job title as a name', () => {
    const resume = ['Senior Software Engineer', 'Bengaluru', 'SKILLS'].join('\n');
    expect(stripPII(resume)).not.toContain('[CANDIDATE_NAME]');
  });
});

describe('stripPII — reporting', () => {
  it('counts redactions by category without leaking the values', () => {
    const { redactions } = stripPIIWithReport('a@b.com, c@d.com, PAN ABCDE1234F');
    expect(redactions.EMAIL).toBe(2);
    expect(redactions.PAN).toBe(1);
    // The report is logged as telemetry, so it must contain counts only.
    expect(JSON.stringify(redactions)).not.toContain('a@b.com');
  });

  it('handles empty and whitespace input without throwing', () => {
    expect(stripPII('')).toBe('');
    expect(stripPII('   \n\n  ')).toBe('');
  });

  it('is idempotent — stripping twice changes nothing further', () => {
    const once = stripPII('Email me at test@example.com or +91 98765 43210.');
    expect(stripPII(once)).toBe(once);
  });
});

describe('stripPII — resistant to pathological input', () => {
  it('handles a long unbroken token in well under a second', () => {
    // Regression guard for a real ReDoS. The unbounded email regex took ~11s on
    // a 100k-character token and ~50s at 200k, against a 60s function timeout —
    // a denial of service triggered by uploading a file. PDFs with embedded
    // images sometimes extract exactly like this, so it was reachable without
    // anyone attacking on purpose.
    const started = Date.now();
    stripPII('x'.repeat(200_000));
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('handles a long run of digits quickly', () => {
    const started = Date.now();
    stripPII('9'.repeat(100_000));
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('handles many email-like fragments without blowing up', () => {
    const started = Date.now();
    stripPII('a@b.co '.repeat(20_000));
    expect(Date.now() - started).toBeLessThan(1000);
  });
});

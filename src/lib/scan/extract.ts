// src/lib/scan/extract.ts
// Reads a job description and works out which terms a recruiter is most
// likely to search for, and how strongly the posting asks for each one.

import { JD_NOISE, LEXICON } from './lexicon';
import type { Importance, JdKeyword } from './types';
import { countCased, countForm, lines, normalize } from './text';

const REQUIRED_HEAD = /(requirement|qualification|must[- ]have|what you(?:'ll)? (?:need|bring)|you (?:will )?have|who you are|about you|minimum|essential|skills|experience needed|what we(?:'re| are) looking for|your profile|eligibility)/i;
const PREFERRED_HEAD = /(preferred|nice[- ]to[- ]have|bonus|desir|good[- ]to[- ]have|plus|ideally|extra credit|advantage)/i;
const DUTY_HEAD = /(responsibilit|what you(?:'ll)? do|the role|duties|day[- ]to[- ]day|your impact|in this role|job description|key tasks)/i;
const OTHER_HEAD = /(benefits|perks|what we offer|compensation|salary|about (?:us|the company)|equal opportunity|how to apply|location|our culture|why join)/i;

const PREFERRED_LINE = /(preferred|nice to have|is a plus|a plus|bonus|desirable|good to have|advantageous|ideally|familiarity with)/i;
const REQUIRED_LINE = /(required|must|minimum|essential|strong (?:experience|knowledge|proficiency)|proficien|expert|hands[- ]on|deep (?:experience|knowledge)|\d+\+? years)/i;

const ROLE_NOUNS = /(engineer|developer|manager|analyst|designer|scientist|specialist|consultant|coordinator|director|lead|associate|executive|officer|administrator|architect|nurse|teacher|accountant|representative|intern|programmer|strategist|writer|editor|recruiter|technician|assistant|head of|vp|president|owner|advisor|planner|tester|researcher)/i;

const RANK: Record<Importance, number> = { required: 3, preferred: 2, mentioned: 1 };

function isHeading(line: string): boolean {
  const raw = line.trim();
  const t = raw.replace(/[:\-–—]+$/, '').trim();
  if (!t || t.length > 60 || /^[•●▪\-–*]/.test(raw)) return false;
  const words = t.split(/\s+/).length;
  if (words > 7) return false;
  if (/:$/.test(raw)) return true;
  if (t === t.toUpperCase() && /[A-Z]/.test(t)) return true;
  return words <= 5 && !/[.,;]/.test(t) && [REQUIRED_HEAD, PREFERRED_HEAD, DUTY_HEAD, OTHER_HEAD].some((re) => anchored(re).test(t));
}

const LEAD = String.raw`^(?:(?:the|our|your|key|core|basic|minimum|preferred|additional|job|role|what)\s+)?`;
const anchoredCache = new Map<RegExp, RegExp>();
function anchored(re: RegExp): RegExp {
  let a = anchoredCache.get(re);
  if (!a) {
    a = new RegExp(LEAD + re.source, 'i');
    anchoredCache.set(re, a);
  }
  return a;
}

interface Section {
  importance: Importance | 'other';
  lines: string[];
}

function sectionize(jd: string): Section[] {
  const out: Section[] = [{ importance: 'mentioned', lines: [] }];
  for (const raw of lines(jd)) {
    const line = raw.trim();
    if (!line) continue;
    if (isHeading(line)) {
      // check preferred before required: "Preferred qualifications" matches both
      const imp: Section['importance'] = PREFERRED_HEAD.test(line)
        ? 'preferred'
        : OTHER_HEAD.test(line)
          ? 'other'
          : REQUIRED_HEAD.test(line)
            ? 'required'
            : DUTY_HEAD.test(line)
              ? 'mentioned'
              : out[out.length - 1].importance;
      out.push({ importance: imp, lines: [] });
      continue;
    }
    out[out.length - 1].lines.push(line);
  }
  return out;
}

function lineImportance(sectionImp: Section['importance'], line: string): Importance | null {
  if (sectionImp === 'other') return null;
  if (PREFERRED_LINE.test(line)) return 'preferred';
  if (REQUIRED_LINE.test(line)) return 'required';
  return sectionImp;
}

export interface JdAnalysis {
  keywords: JdKeyword[];
  title: string | null;
  yearsRequired: number | null;
  degree: string | null;
  wordCount: number;
}

export function extractTitle(jd: string): string | null {
  const all = lines(jd).map((l) => l.trim()).filter(Boolean);
  for (const l of all.slice(0, 12)) {
    const m = l.match(/^(?:job title|position|role|title)\s*[:\-–]\s*(.{3,70})$/i);
    if (m) return m[1].trim();
  }
  for (const l of all.slice(0, 4)) {
    const clean = l.replace(/\s*[\(\[].*?[\)\]]\s*/g, ' ').replace(/[|–—-].*$/, '').trim();
    if (clean.split(/\s+/).length <= 7 && ROLE_NOUNS.test(clean) && !/[.!?]$/.test(clean)) return clean;
  }
  const m = jd.match(/(?:hiring|looking for|seeking|join us as)\s+(?:an?|our)\s+((?:[A-Z][\w+#/.-]*\s?){1,5})/);
  if (m && ROLE_NOUNS.test(m[1])) return m[1].trim();
  return null;
}

function extractCompany(jd: string): string | null {
  const first = lines(jd).map((l) => l.trim()).find(Boolean) || '';
  const m = first.match(/(?:\s[-–—|@]\s|\sat\s)(.{2,50})$/);
  const fromFirst = m ? m[1].replace(/\b(pvt|private|ltd|limited|inc|llc|corp|gmbh)\.?\b/gi, '').trim() : null;
  if (fromFirst) return fromFirst;
  const j = jd.match(/\b(?:Join|About|At)\s+([A-Z][\w&]+(?:\s[A-Z][\w&]+){0,2})/);
  return j ? j[1] : null;
}

function extractYears(jd: string): number | null {
  const found: number[] = [];
  const re = /(\d{1,2})\s*(?:\+|plus)?\s*(?:(?:-|–|to)\s*\d{1,2}\s*)?(?:years?|yrs?)(?:'|’)?\s+(?:of\s+)?(?:[a-z/&-]+\s+){0,4}?(?:experience|exp)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(jd)) !== null) {
    const n = parseInt(m[1], 10);
    if (n > 0 && n < 30) found.push(n);
  }
  return found.length ? Math.max(...found) : null;
}

function extractDegree(jd: string): string | null {
  const m = jd.match(/\b(ph\.?d|doctorate|master'?s|mba|m\.?tech|m\.?s\.?c?|bachelor'?s|b\.?tech|b\.?e\.|b\.?s\.?c?|undergraduate degree|degree)\b/i);
  if (!m) return null;
  const v = m[1].toLowerCase();
  if (v.startsWith('ph') || v === 'doctorate') return 'PhD';
  if (v.startsWith('master') || v === 'mba' || v.startsWith('m.') || v.startsWith('mt') || v.startsWith('ms')) return "Master's degree";
  return "Bachelor's degree";
}

const LEX_FORMS = LEXICON.map((e) => ({ entry: e, forms: Array.from(new Set(e.aliases.map((a) => normalize(a).trim()))).filter(Boolean) }));
const ALL_LEX_WORDS = new Set(LEX_FORMS.flatMap((f) => f.forms.flatMap((x) => x.split(' '))));

const STOP_CAPS = new Set(
  'We You Our The This That They It Is In On At As An A And Or Of For To With Your Their About Join Apply Who What Why How Where When Benefits Location Remote Hybrid Full Part Time Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December Inc LLC Ltd Pvt Limited Corp Company Team Role Job Position Salary India USA UK US Canada Europe Asia London Bangalore Bengaluru Mumbai Delhi Hyderabad Pune Chennai Noida Gurgaon Gurugram New York San Francisco Seattle Austin Remote EEO Equal Opportunity Employer Please Must Strong Experience Required Preferred Qualifications Responsibilities Requirements Bonus Plus Nice Have Ability Excellent Knowledge Proven Bachelor Master Degree Years'.split(' '),
);

/** Capitalised terms and repeated phrases the curated list does not know about. */
function mineExtra(sections: Section[], known: Set<string>, title: string | null, company: string | null): JdKeyword[] {
  const titleWords = new Set((title || '').toLowerCase().split(/\s+/));
  const knownList = Array.from(known).filter((k) => k.includes(' ')).map((k) => ` ${k} `);
  const blocked = new Set<string>();
  if (company) {
    const c = normalize(company).trim();
    blocked.add(c);
    c.split(' ').forEach((w) => blocked.add(w));
  }
  const counts = new Map<string, { display: string; count: number; imp: Importance }>();

  const bump = (key: string, display: string, imp: Importance) => {
    const cur = counts.get(key);
    if (cur) {
      cur.count++;
      if (RANK[imp] > RANK[cur.imp]) cur.imp = imp;
    } else counts.set(key, { display, count: 1, imp });
  };

  for (const sec of sections) {
    if (sec.importance === 'other') continue;
    for (const line of sec.lines) {
      const imp = lineImportance(sec.importance, line);
      if (!imp) continue;
      // Capitalised product names / proper nouns not at the start of a sentence.
      const capRe = /(?<=[a-z,;(]\s|\s\(|,\s|\/)([A-Z][a-zA-Z0-9]+(?:[A-Z][a-z0-9]+)*(?:\s[A-Z][a-zA-Z0-9]+){0,2})/g;
      let m: RegExpExecArray | null;
      while ((m = capRe.exec(line)) !== null) {
        const end = m.index + m[0].length;
        if (/^[.\-]?[a-zA-Z0-9]/.test(line.slice(end, end + 2))) continue; // part of "Next.js", "Vue-based"
        const disp = m[1].trim();
        const first = disp.split(' ')[0];
        if (STOP_CAPS.has(first) || STOP_CAPS.has(disp) || disp.length < 3) continue;
        const key = normalize(disp).trim();
        if (known.has(key) || blocked.has(key) || key.split(' ').every((w) => JD_NOISE.has(w) || titleWords.has(w))) continue;
        if (knownList.some((k) => k.includes(` ${key} `) || ` ${key} `.includes(` ${k} `))) continue;
        if (key.split(' ').some((w) => ALL_LEX_WORDS.has(w) && known.has(w))) continue;
        bump(key, disp, imp);
      }
      // Repeated lowercase two-word phrases ("unit economics", "customer journey").
      // Only words written in lowercase in the posting, so company names don't sneak in.
      const toks = line
        .split(/[^A-Za-z'&]+/)
        .filter(Boolean)
        .map((w) => (/^[a-z]/.test(w) ? w.toLowerCase() : '|'));
      for (let i = 0; i < toks.length - 1; i++) {
        const a = toks[i];
        const b = toks[i + 1];
        if (a === '|' || b === '|' || a.length < 3 || b.length < 3 || JD_NOISE.has(a) || JD_NOISE.has(b)) continue;
        const key = `${a} ${b}`;
        if (known.has(key) || titleWords.has(a) || titleWords.has(b)) continue;
        if (knownList.some((k) => k.includes(` ${key} `))) continue;
        bump(key, key, imp);
      }
    }
  }

  return Array.from(counts.entries())
    .filter(([, v]) => {
      const isCapitalised = /[A-Z]/.test(v.display);
      return isCapitalised ? v.imp !== 'mentioned' || v.count >= 2 : v.count >= 2;
    })
    .sort((x, y) => RANK[y[1].imp] - RANK[x[1].imp] || y[1].count - x[1].count)
    .slice(0, 8)
    .map(([key, v]) => ({ name: v.display, kind: 'phrase' as const, importance: v.imp, count: v.count, forms: [key] }));
}

export function analyzeJobDescription(jd: string): JdAnalysis {
  const sections = sectionize(jd);
  const title = extractTitle(jd);
  const found = new Map<string, JdKeyword>();

  for (const sec of sections) {
    for (const line of sec.lines) {
      const imp = lineImportance(sec.importance, line);
      if (!imp) continue;
      const norm = normalize(line);
      for (const { entry, forms } of LEX_FORMS) {
        let n = 0;
        for (const f of forms) n += countForm(norm, f);
        if (entry.cased) for (const w of entry.cased) n += countCased(line, w);
        if (!n) continue;
        const cur = found.get(entry.name);
        if (cur) {
          cur.count += n;
          if (RANK[imp] > RANK[cur.importance]) cur.importance = imp;
        } else {
          found.set(entry.name, { name: entry.name, kind: entry.kind, importance: imp, count: n, forms, cased: entry.cased });
        }
      }
    }
  }

  // A skill mentioned three or more times is effectively required, wherever it sits.
  for (const k of found.values()) if (k.count >= 3 && k.importance === 'mentioned') k.importance = 'required';

  // "Applicant Tracking Systems" only counts when the posting is for HR/recruiting work.
  const ats = found.get('Applicant Tracking Systems');
  if (ats && !/recruit|talent|hr\b|human resources|people ops/i.test(jd)) found.delete('Applicant Tracking Systems');

  const known = new Set<string>();
  for (const k of found.values()) k.forms.forEach((f) => known.add(f));
  for (const { forms } of LEX_FORMS) forms.forEach((f) => known.add(f));
  const extra = mineExtra(sections, known, title, extractCompany(jd));

  const keywords = [...found.values(), ...extra].sort(
    (a, b) => RANK[b.importance] - RANK[a.importance] || (a.kind === 'soft' ? 1 : 0) - (b.kind === 'soft' ? 1 : 0) || b.count - a.count,
  );

  return {
    keywords: keywords.slice(0, 40),
    title,
    yearsRequired: extractYears(jd),
    degree: extractDegree(jd),
    wordCount: (jd.match(/\S+/g) || []).length,
  };
}

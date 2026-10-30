// src/lib/scan/analyze.ts
// Compares a resume with a job description and produces the report shown on
// screen. Every number here is documented on /methodology — if you change a
// weight, change that page in the same commit.

import { ACTION_VERBS, JD_NOISE, WEAK_OPENERS } from './lexicon';
import { analyzeJobDescription } from './extract';
import { runParseChecks } from './parseChecks';
import type { Importance, KeywordResult, LayoutSignals, ScanReport } from './types';
import { countCased, countForm, isBulletLine, lines, normalize, stem, stripBullet, wordCount } from './text';

export const WEIGHTS = { keywords: 45, title: 10, parsing: 20, sections: 10, impact: 15 } as const;
const IMPORTANCE_WEIGHT: Record<Importance, number> = { required: 3, preferred: 1.5, mentioned: 1 };

const TAIL = String.raw`(\s*(&|and|\/)\s*[a-z]+(\s[a-z]+)?)?\s*$`;
const H = (body: string) => new RegExp(`^${body}${TAIL}`, 'i');
const HEADINGS = {
  summary: H(String.raw`(professional\s+|career\s+)?(summary|profile|objective|about me|overview)`),
  experience: H(String.raw`(professional\s+|work\s+|relevant\s+|employment\s+|career\s+)?(experience|employment(\s+history)?|work history|career history|history|internships?)`),
  education: H(String.raw`(education|academics?|academic background|qualifications|educational (background|qualifications))`),
  skills: H(String.raw`((technical|core|key|professional|relevant)\s+)?(skills|competencies|technologies|tech stack|tools|expertise|skill set|skillset)`),
  other: H(String.raw`((key|selected|personal|academic|side)\s+)?(projects?|certifications?|licen[cs]es|awards|achievements|accomplishments|publications|volunteer(ing)?|languages|interests|activities|courses|coursework|training|references|leadership|honors|honours)`),
};

type SectionName = 'summary' | 'experience' | 'education' | 'skills' | 'other' | 'top';

function headingOf(line: string): SectionName | null {
  if (isBulletLine(line)) return null;
  const t = line.replace(/[:\-–—|]+$/, '').trim();
  if (!t || t.split(/\s+/).length > 5 || t.length > 45) return null;
  for (const [k, re] of Object.entries(HEADINGS)) if (re.test(t)) return k as SectionName;
  return null;
}

interface ResumeLine {
  text: string;
  section: SectionName;
}

function splitResume(resume: string): ResumeLine[] {
  let section: SectionName = 'top';
  const out: ResumeLine[] = [];
  for (const raw of lines(resume)) {
    const text = raw.trim();
    if (!text) continue;
    const h = headingOf(text);
    if (h) {
      section = h;
      continue;
    }
    out.push({ text, section });
  }
  return out;
}

const QUANT =
  /([$₹£€]\s?\d)|(\d+(\.\d+)?\s?(%|percent|x\b|k\b|m\b|mm\b|bn\b|million|billion|crore|cr\b|lakhs?|hours?|hrs|days|weeks|months|people|users|customers|clients|members|engineers|reports|projects|accounts|countries|markets|stores|students|patients|leads|deals|tickets|sites|ms\b|seconds))|(\b\d{2,}\b)/i;

function isQuantified(line: string): boolean {
  const withoutDates = line
    .replace(/\b(19|20)\d{2}\b/g, ' ')
    .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d{0,4}/gi, ' ')
    .replace(/\b\d{1,2}\/\d{2,4}\b/g, ' ');
  return QUANT.test(withoutDates);
}

function firstWord(line: string): string {
  return (stripBullet(line).split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z]/g, '');
}

function titleMatch(resumeNorm: string, title: string | null): ScanReport['resume']['titleMatch'] {
  if (!title) return 'unknown';
  const t = normalize(title.replace(/\b(senior|sr|junior|jr|lead|principal|staff|ii|iii|iv|i)\b\.?/gi, ' ')).trim();
  if (!t) return 'unknown';
  if (countForm(resumeNorm, t) > 0) return 'exact';
  const words = t.split(' ').filter((w) => !JD_NOISE.has(w) && w.length > 1);
  if (!words.length) return 'unknown';
  const hits = words.filter((w) => countForm(resumeNorm, w) > 0 || countForm(resumeNorm, stem(w)) > 0).length;
  return hits / words.length >= 0.5 ? 'close' : 'none';
}

export interface AnalyzeInput {
  resumeText: string;
  jobText: string;
  layout: LayoutSignals;
  fileName?: string;
  /** Keyword names the user marked as not relevant; excluded from scoring. */
  ignored?: string[];
}

export function analyze({ resumeText, jobText, layout, fileName, ignored = [] }: AnalyzeInput): ScanReport {
  const jd = analyzeJobDescription(jobText);
  const resumeLines = splitResume(resumeText);
  const resumeNorm = normalize(resumeText);
  const skillsNorm = normalize(resumeLines.filter((l) => l.section === 'skills').map((l) => l.text).join('\n'));
  const resumeStems = new Set(resumeNorm.trim().split(' ').map(stem));

  // ── Keywords ───────────────────────────────────────────────────────────
  const keywords: KeywordResult[] = jd.keywords.map((k) => {
    let resumeCount = 0;
    let inSkills = 0;
    let matchedAs: string | undefined;
    for (const f of k.forms) {
      const n = countForm(resumeNorm, f);
      if (n) {
        resumeCount += n;
        inSkills += countForm(skillsNorm, f);
        if (!matchedAs) matchedAs = f;
      }
    }
    if (k.cased) {
      for (const w of k.cased) {
        const n = countCased(resumeText, w);
        if (n) {
          resumeCount += n;
          if (!matchedAs) matchedAs = w;
        }
      }
    }
    let status: KeywordResult['status'] = resumeCount > 0 ? 'matched' : 'missing';
    if (status === 'missing') {
      // Multi-word term where most of the words are present: "managed stakeholders" vs "stakeholder management".
      const best = k.forms
        .filter((f) => f.includes(' '))
        .map((f) => {
          const parts = f.split(' ').filter((w) => w.length > 2 && !JD_NOISE.has(w) && w !== '/');
          if (parts.length < 2) return 0;
          return parts.filter((w) => resumeStems.has(stem(w))).length / parts.length;
        })
        .reduce((a, b) => Math.max(a, b), 0);
      if (best >= 1) status = 'partial';
    }
    const displayMatch = matchedAs && matchedAs !== normalize(k.name).trim() ? matchedAs : undefined;
    return { ...k, status, resumeCount, onlyInSkills: resumeCount > 0 && inSkills >= resumeCount, matchedAs: displayMatch };
  });

  const scored = keywords.filter((k) => !ignored.includes(k.name));
  let wSum = 0;
  let wGot = 0;
  for (const k of scored) {
    const w = IMPORTANCE_WEIGHT[k.importance] * (k.kind === 'soft' ? 0.5 : 1);
    const credit = k.status === 'matched' ? (k.onlyInSkills ? 0.85 : 1) : k.status === 'partial' ? 0.5 : 0;
    wSum += w;
    wGot += w * credit;
  }
  const keywordRatio = wSum ? wGot / wSum : 0;
  const keywordMatchPct = Math.round(
    (scored.filter((k) => k.status === 'matched').length / Math.max(1, scored.length)) * 100,
  );

  // ── Sections and bullets ───────────────────────────────────────────────
  const has = (s: SectionName) => resumeLines.some((l) => l.section === s);
  const hasContact = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText) || /(\+?\d[\d\s().-]{8,}\d)/.test(resumeText);
  const sections = {
    contact: hasContact,
    summary: has('summary'),
    experience: has('experience'),
    education: has('education'),
    skills: has('skills'),
  };

  const bodyLines = resumeLines.filter((l) => l.section === 'experience' || (l.section === 'other' && isBulletLine(l.text)) || (!sections.experience && l.section === 'top'));
  const bullets = bodyLines
    .map((l) => l.text)
    .filter((t) => {
      const wc = wordCount(t);
      return (isBulletLine(t) && wc >= 4) || (wc >= 8 && wc <= 70 && /[a-z]/.test(t));
    });
  const quantified = bullets.filter(isQuantified).length;
  const actionVerb = bullets.filter((b) => {
    const lower = stripBullet(b).toLowerCase();
    if (WEAK_OPENERS.some((w) => lower.startsWith(w))) return false;
    const w = firstWord(b);
    return ACTION_VERBS.has(w) || (w.length > 5 && w.endsWith('ed'));
  }).length;
  const weakOpeners = Array.from(
    new Set(
      bullets
        .map((b) => stripBullet(b).toLowerCase())
        .map((b) => WEAK_OPENERS.find((w) => b.startsWith(w)))
        .filter((x): x is string => Boolean(x)),
    ),
  );
  const overused = keywords.filter((k) => k.resumeCount > 8).map((k) => k.name);

  const words = wordCount(resumeText);
  const tMatch = titleMatch(resumeNorm, jd.title);

  // ── Parse checks ───────────────────────────────────────────────────────
  const findings = runParseChecks({ text: resumeText, layout, fileName, sections, words, bullets: bullets.length, overused });

  // ── Score ──────────────────────────────────────────────────────────────
  const kwPts = scored.length ? WEIGHTS.keywords * keywordRatio : WEIGHTS.keywords * 0.5;
  const titlePts = tMatch === 'exact' ? 10 : tMatch === 'close' ? 6 : tMatch === 'unknown' ? 7 : 0;
  const penalty = findings.reduce((p, f) => p + (f.severity === 'critical' ? 10 : f.severity === 'warning' ? 4 : 1), 0);
  const parsePts = Math.max(0, WEIGHTS.parsing - penalty);
  const sectionPts = (sections.contact ? 3 : 0) + (sections.experience ? 3 : 0) + (sections.education ? 2 : 0) + (sections.skills ? 2 : 0);
  const q = bullets.length ? quantified / bullets.length : 0;
  const a = bullets.length ? actionVerb / bullets.length : 0;
  const impactPts = bullets.length ? 9 * Math.min(1, q / 0.5) + 6 * Math.min(1, a / 0.7) : 0;

  const breakdown = {
    keywords: Math.round(kwPts),
    title: titlePts,
    parsing: Math.round(parsePts),
    sections: sectionPts,
    impact: Math.round(impactPts),
  };
  const score = Math.max(0, Math.min(100, Math.round(kwPts + titlePts + parsePts + sectionPts + impactPts)));
  const band = score >= 80 ? 'strong' : score >= 65 ? 'good' : score >= 50 ? 'fair' : 'weak';

  // ── Prioritised fixes ──────────────────────────────────────────────────
  const fixes: string[] = [];
  findings.filter((f) => f.severity === 'critical').forEach((f) => fixes.push(f.fix));
  const missingRequired = scored.filter((k) => k.status === 'missing' && k.importance === 'required' && k.kind !== 'soft');
  if (missingRequired.length) {
    const names = missingRequired.slice(0, 5).map((k) => k.name);
    fixes.push(
      `The posting asks for ${listify(names)} and your resume doesn't mention ${names.length > 1 ? 'them' : 'it'}. Where you genuinely have the skill, name it in a bullet that shows where you used it.`,
    );
  }
  if (tMatch === 'none' && jd.title) {
    fixes.push(`Your resume never uses the job title "${jd.title}". If it fairly describes your work, put it in your headline or summary — recruiters often search by title first.`);
  }
  const partials = scored.filter((k) => k.status === 'partial');
  if (partials.length) {
    fixes.push(`You describe ${listify(partials.slice(0, 3).map((k) => `"${k.name}"`))} in different words. Use the posting's exact phrase at least once so a keyword search finds it.`);
  }
  const skillsOnly = scored.filter((k) => k.onlyInSkills && k.importance === 'required' && k.kind === 'hard');
  if (skillsOnly.length) {
    fixes.push(`${listify(skillsOnly.slice(0, 3).map((k) => k.name))} only appear${skillsOnly.length === 1 ? 's' : ''} in your skills list. Add a bullet that shows the work you did with ${skillsOnly.length === 1 ? 'it' : 'them'}.`);
  }
  if (bullets.length && q < 0.35) {
    fixes.push(`${quantified} of ${bullets.length} bullets include a number. Add scale or results — team size, users, revenue, time saved, % change — to at least half of them.`);
  }
  if (weakOpeners.length) {
    fixes.push(`Replace openers like "${weakOpeners[0]}" with what you did: "Led", "Built", "Reduced", "Shipped".`);
  }
  if (jd.yearsRequired) {
    fixes.push(`The posting mentions ${jd.yearsRequired}+ years of experience. Make your dates easy to read (e.g. "Mar 2021 – Present") so the total is obvious.`);
  }
  findings.filter((f) => f.severity === 'warning').forEach((f) => fixes.push(f.fix));
  const missingPreferred = scored.filter((k) => k.status === 'missing' && k.importance === 'preferred' && k.kind !== 'soft');
  if (missingPreferred.length) {
    fixes.push(`Nice-to-haves you don't mention: ${listify(missingPreferred.slice(0, 4).map((k) => k.name))}. Add them only if they're true — they can break a tie between similar candidates.`);
  }

  return {
    score,
    band,
    breakdown,
    keywordMatchPct,
    keywords,
    findings,
    jd: { title: jd.title, yearsRequired: jd.yearsRequired, degree: jd.degree },
    resume: {
      words,
      bullets: bullets.length,
      quantifiedBullets: quantified,
      actionVerbBullets: actionVerb,
      weakOpeners,
      sections,
      titleMatch: tMatch,
      overused,
    },
    fixes: Array.from(new Set(fixes)).slice(0, 8),
    layout,
    createdAt: Date.now(),
  };
}

function listify(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

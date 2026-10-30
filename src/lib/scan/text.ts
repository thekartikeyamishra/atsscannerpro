// src/lib/scan/text.ts
// Text normalisation shared by the job-description and resume passes. Both
// sides go through the same function, so "CI/CD", "ci / cd" and "CI-CD" meet
// in the middle.

const BULLET_CHARS = /^[\s•●○◦▪▫■□‣⁃∙·\-–—*>✓✔➢➤►▶]+/;

export function normalize(input: string): string {
  const lowered = input
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\//g, ' / ')
    .replace(/[‐-―−]/g, ' ')
    .replace(/(\w)-(\w)/g, '$1 $2')
    .replace(/[^a-z0-9+#.&' /]/g, ' ');
  const tokens = lowered
    .split(/\s+/)
    .map((t) => t.replace(/^'+|'+$/g, '').replace(/\.+$/g, '').replace(/^\.(?=\.)/, ''))
    .map((t) => (t.endsWith("'s") ? t.slice(0, -2) : t))
    .filter((t) => t.length > 0 && t !== '.' && t !== "'");
  return ` ${tokens.join(' ')} `;
}

/** Count whole-phrase occurrences of an already-normalised form. */
export function countForm(normText: string, form: string): number {
  const needle = ` ${form.trim()} `;
  if (needle.length <= 2) return 0;
  let n = 0;
  let i = normText.indexOf(needle);
  while (i !== -1) {
    n++;
    i = normText.indexOf(needle, i + needle.length - 1);
  }
  return n;
}

const SENTENCE_START = /(^|[.!?:•\n]\s*)$/;

/** Count case-sensitive occurrences, ignoring sentence-initial ordinary words ("Go ahead"). */
export function countCased(raw: string, word: string): number {
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![A-Za-z0-9])${esc}(?![A-Za-z0-9+#&])`, 'g');
  let n = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const before = raw.slice(Math.max(0, m.index - 3), m.index);
    const after = raw.slice(m.index + word.length, m.index + word.length + 12);
    const startsSentence = SENTENCE_START.test(before) || m.index === 0;
    const nextIsLowerWord = /^\s+[a-z]{2,}/.test(after);
    if (startsSentence && nextIsLowerWord) continue;
    n++;
  }
  return n;
}

export function stripBullet(line: string): string {
  return line.replace(BULLET_CHARS, '').trim();
}

export function isBulletLine(line: string): boolean {
  return /^\s*[•●○◦▪▫■□‣⁃∙·\-–—*>✓✔➢➤►▶]\s*\S/.test(line);
}

export function wordCount(text: string): number {
  return (text.match(/[A-Za-z0-9][A-Za-z0-9'+#.&-]*/g) || []).length;
}

/** Very small stemmer used only for "partial" phrase matches. */
export function stem(word: string): string {
  let w = word.toLowerCase();
  for (const suf of ['ments', 'ment', 'ings', 'ing', 'ers', 'er', 'ed', 'es', 's']) {
    if (w.length > suf.length + 3 && w.endsWith(suf)) {
      w = w.slice(0, -suf.length);
      break;
    }
  }
  return w.length > 4 && w.endsWith('e') ? w.slice(0, -1) : w;
}

export function lines(text: string): string[] {
  return text.replace(/\r\n?/g, '\n').split('\n');
}

/** Short stable fingerprint, used to compare rescans of the same posting. */
export function fingerprint(text: string): string {
  const s = normalize(text);
  let h1 = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(36);
}

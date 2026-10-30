// src/lib/markdown.tsx
// A deliberately small Markdown renderer for our own guide content: headings,
// paragraphs, lists, block quotes, tables, bold, italics and links. Output is
// React elements, so nothing is injected as raw HTML.

import Link from 'next/link';
import type { ReactNode } from 'react';
import AdSlot from '@/components/AdSlot';
import { ADSENSE } from '@/config/site';

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function inline(text: string, key = 'i'): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${key}-${n++}`;
    if (tok.startsWith('**')) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('[')) {
      const [, label, href] = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      out.push(
        href.startsWith('/') ? (
          <Link key={k} href={href}>
            {label}
          </Link>
        ) : (
          <a key={k} href={href} rel="noopener noreferrer" target="_blank">
            {label}
          </a>
        ),
      );
    } else out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export interface Heading {
  id: string;
  text: string;
}

export function headingsOf(md: string): Heading[] {
  return md
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => ({ text: l.slice(3).trim(), id: slugify(l.slice(3)) }));
}

export function renderMarkdown(md: string): ReactNode[] {
  const lines = md.trim().split('\n');
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const k = () => `b${key++}`;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    if (t === '{{ad}}') {
      out.push(<AdSlot key={k()} slot={ADSENSE.slots.inArticle} format="fluid" layout="in-article" />);
      i++;
      continue;
    }
    if (t.startsWith('### ')) {
      out.push(<h3 key={k()}>{inline(t.slice(4))}</h3>);
      i++;
      continue;
    }
    if (t.startsWith('## ')) {
      const text = t.slice(3);
      out.push(
        <h2 key={k()} id={slugify(text)}>
          {inline(text)}
        </h2>,
      );
      i++;
      continue;
    }
    if (t.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      const id = k();
      out.push(
        <div className="table-wrap" key={id}>
          <table>
            <thead>
              <tr>
                {head.map((c, j) => (
                  <th key={j} scope="col">
                    {inline(c, `${id}h${j}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{inline(c, `${id}${ri}${j}`)}</th> : <td key={j}>{inline(c, `${id}${ri}${j}`)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (t.startsWith('> ')) {
      const block: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        block.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const id = k();
      out.push(
        <blockquote key={id}>
          {block.map((b, j) => (
            <p key={j}>{inline(b, `${id}${j}`)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }
    if (/^(- |\d+\. )/.test(t)) {
      const ordered = /^\d+\. /.test(t);
      const items: string[] = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^(- |\d+\. )/, ''));
        i++;
      }
      const id = k();
      const lis = items.map((it, j) => <li key={j}>{inline(it, `${id}${j}`)}</li>);
      out.push(ordered ? <ol key={id}>{lis}</ol> : <ul key={id}>{lis}</ul>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||>|- |\d+\. |\{\{)/.test(lines[i].trim())) {
      para.push(lines[i].trim());
      i++;
    }
    const id = k();
    out.push(<p key={id}>{inline(para.join(' '), id)}</p>);
  }
  return out;
}

export function plainText(md: string) {
  return md
    .replace(/\{\{ad\}\}/g, '')
    .replace(/\*\*|\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[#>|-]+\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

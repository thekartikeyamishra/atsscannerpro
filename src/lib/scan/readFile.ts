// src/lib/scan/readFile.ts
// Browser-only. Turns a PDF, DOCX or TXT file into plain text plus layout
// signals. Nothing is uploaded: the file is read with the File API and parsed
// in this tab. The heavy parsers load only when someone picks a file.

import type { LayoutSignals } from './types';

export const MAX_BYTES = 8 * 1024 * 1024;
const PDF_VERSION = '5.7.284';

export class ReadError extends Error {}

export interface ReadResult {
  text: string;
  layout: LayoutSignals;
}

function sniff(buf: Uint8Array): 'pdf' | 'zip' | 'doc' | 'unknown' {
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'pdf';
  if (buf[0] === 0x50 && buf[1] === 0x4b) return 'zip';
  if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0) return 'doc';
  return 'unknown';
}

export async function readResumeFile(file: File): Promise<ReadResult> {
  if (file.size > MAX_BYTES) throw new ReadError('That file is over 8 MB. Export a lighter version (images removed) and try again.');
  if (file.size === 0) throw new ReadError('That file is empty.');
  const buf = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(buf);
  const name = file.name.toLowerCase();

  if (kind === 'pdf') return readPdf(buf);
  if (kind === 'zip' && name.endsWith('.docx')) return readDocx(buf);
  if (kind === 'doc') throw new ReadError('Old .doc files can\'t be read in the browser. Open it in Word or Google Docs and save as .docx or PDF.');
  if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) {
    return { text: new TextDecoder().decode(buf), layout: { format: 'txt' } };
  }
  throw new ReadError('Use a PDF, DOCX or TXT file — or paste your resume text instead.');
}

async function readPdf(buf: Uint8Array): Promise<ReadResult> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `/vendor/pdf.worker-${PDF_VERSION}.min.mjs`;
  let doc;
  try {
    doc = await pdfjs.getDocument({ data: buf, disableFontFace: true }).promise;
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (/password/i.test(msg)) throw new ReadError('This PDF is password-protected. Remove the password and export again — an ATS can\'t open it either.');
    throw new ReadError('We couldn\'t open this PDF. Try exporting it again from your editor.');
  }

  const pageTexts: string[] = [];
  let lineCount = 0;
  let sideBySide = 0;
  const pages = Math.min(doc.numPages, 6);

  for (let p = 1; p <= pages; p++) {
    const page = await doc.getPage(p);
    const width = page.getViewport({ scale: 1 }).width;
    const content = await page.getTextContent();
    type Item = { str: string; x: number; y: number; w: number };
    const items: Item[] = [];
    for (const it of content.items) {
      if (!('str' in it) || !it.str.trim()) continue;
      items.push({ str: it.str, x: it.transform[4], y: Math.round(it.transform[5]), w: it.width });
    }
    // Group into visual lines by y (2pt tolerance).
    const rows = new Map<number, Item[]>();
    for (const it of items) {
      const key = [...rows.keys()].find((k) => Math.abs(k - it.y) <= 2) ?? it.y;
      if (!rows.has(key)) rows.set(key, []);
      rows.get(key)!.push(it);
    }
    const sortedRows = [...rows.entries()].sort((a, b) => b[0] - a[0]);
    const out: string[] = [];
    for (const [, row] of sortedRows) {
      row.sort((a, b) => a.x - b.x);
      let line = '';
      let prevEnd: number | null = null;
      let bigGap = false;
      for (const it of row) {
        if (prevEnd !== null) {
          const gap = it.x - prevEnd;
          if (gap > width * 0.12) bigGap = true;
          line += gap > 1.5 ? ' ' : '';
        }
        line += it.str;
        prevEnd = it.x + it.w;
      }
      lineCount++;
      // A wide gap between two substantial text runs = side-by-side columns.
      if (bigGap && row.length >= 2 && line.trim().split(/\s+/).length >= 4) sideBySide++;
      out.push(line);
    }
    pageTexts.push(out.join('\n'));
  }

  const text = pageTexts.join('\n\n');
  return {
    text,
    layout: {
      format: 'pdf',
      pages: doc.numPages,
      columnShare: lineCount ? sideBySide / lineCount : 0,
      charsPerPage: text.replace(/\s/g, '').length / Math.max(1, pages),
    },
  };
}

async function readDocx(buf: Uint8Array): Promise<ReadResult> {
  // UMD build: works in the browser without Node polyfills.
  const mod = (await import('mammoth/mammoth.browser.min.js')) as unknown as {
    default?: MammothApi;
  } & MammothApi;
  const mammoth: MammothApi = mod.default ?? mod;
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  try {
    const [raw, html] = await Promise.all([
      mammoth.extractRawText({ arrayBuffer }),
      mammoth.convertToHtml({ arrayBuffer }),
    ]);
    const tables = (html.value.match(/<table/g) || []).length;
    const images = (html.value.match(/<img/g) || []).length;
    // Turn list items into bullet lines so bullet analysis works the same as for PDFs.
    const listed = html.value
      .replace(/<li>/g, '\n• ')
      .replace(/<\/(p|h\d|li|tr)>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<td>/g, '  ')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return {
      text: listed.trim().length >= raw.value.trim().length * 0.8 ? listed : raw.value,
      layout: { format: 'docx', tables, images },
    };
  } catch {
    throw new ReadError('We couldn\'t read this DOCX. Open it in Word or Google Docs, save a fresh copy, and try again.');
  }
}

interface MammothApi {
  extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
  convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { analyze } from '@/lib/scan/analyze';
import { SAMPLE_JOB, SAMPLE_RESUME } from '@/lib/scan/samples';
import { fingerprint } from '@/lib/scan/text';
import type { LayoutSignals, ScanReport } from '@/lib/scan/types';
import Report from './Report';

type Mode = 'upload' | 'paste';
const HISTORY_KEY = 'atssp:scores:v1';

function readHistory(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  } catch {
    return {};
  }
}
function writeHistory(fp: string, score: number) {
  try {
    const h = readHistory();
    h[fp] = score;
    const keys = Object.keys(h);
    if (keys.length > 50) delete h[keys[0]];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    /* storage unavailable — the delta just won't show */
  }
}

export default function Scanner() {
  const [job, setJob] = useState('');
  const [mode, setMode] = useState<Mode>('upload');
  const [resumeText, setResumeText] = useState('');
  const [pasted, setPasted] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutSignals>({ format: 'paste' });
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [previous, setPrevious] = useState<number | null>(null);
  const [ignored, setIgnored] = useState<string[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const activeResume = mode === 'paste' ? pasted : resumeText;
  const activeLayout: LayoutSignals = mode === 'paste' ? { format: 'paste' } : layout;
  const jobWords = (job.match(/\S+/g) || []).length;
  const resumeWords = (activeResume.match(/\S+/g) || []).length;
  const ready = jobWords >= 40 && resumeWords >= 30 && !reading;

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setReading(true);
    setFileName(file.name);
    try {
      const { readResumeFile } = await import('@/lib/scan/readFile');
      const res = await readResumeFile(file);
      setResumeText(res.text);
      setLayout(res.layout);
    } catch (e) {
      setResumeText('');
      setFileName(null);
      setError(e instanceof Error ? e.message : 'We couldn\'t read that file.');
    } finally {
      setReading(false);
    }
  }, []);

  const run = useCallback(
    (ignoreList: string[] = ignored) => {
      setError(null);
      const r = analyze({
        resumeText: activeResume,
        jobText: job,
        layout: activeLayout,
        fileName: mode === 'upload' ? fileName ?? undefined : undefined,
        ignored: ignoreList,
      });
      const fp = fingerprint(job);
      const prev = readHistory()[fp];
      setPrevious(typeof prev === 'number' && prev !== r.score ? prev : null);
      writeHistory(fp, r.score);
      setReport(r);
      return r;
    },
    [activeResume, job, activeLayout, mode, fileName, ignored],
  );

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ready) {
      setError(
        jobWords < 40
          ? 'Paste the full job description — at least 40 words — so we can tell required skills from nice-to-haves.'
          : resumeWords < 30
            ? mode === 'upload'
              ? 'Add your resume: drop a PDF or DOCX, or switch to "Paste text".'
              : 'Paste your full resume text (at least 30 words).'
            : 'Still reading your file…',
      );
      return;
    }
    setIgnored([]);
    run([]);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function toggleIgnore(name: string) {
    const next = ignored.includes(name) ? ignored.filter((n) => n !== name) : [...ignored, name];
    setIgnored(next);
    run(next);
  }

  function loadSample() {
    setJob(SAMPLE_JOB);
    setMode('paste');
    setPasted(SAMPLE_RESUME);
    setError(null);
  }

  // ⌘/Ctrl + Enter submits from either textarea.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const el = document.activeElement;
        if (el && el.closest('#scanner-form')) submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div>
      <form id="scanner-form" onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-2">
        {/* Job description */}
        <div className="panel p-5 sm:p-6">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label htmlFor="jd" className="field-label mb-0">Job description</label>
            <span className={`small ${jobWords >= 40 ? 'text-moss' : 'muted'}`}>{jobWords} words</span>
          </div>
          <p className="small muted mb-3">Paste the whole posting, including requirements and nice-to-haves.</p>
          <textarea
            id="jd"
            className="textarea"
            value={job}
            onChange={(e) => setJob(e.target.value.slice(0, 20000))}
            placeholder={'Senior Data Analyst\n\nRequirements\n- 3+ years with SQL and Power BI\n…'}
            spellCheck={false}
          />
        </div>

        {/* Resume */}
        <div className="panel flex flex-col p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="field-label mb-0" id="resume-label">Your resume</span>
            <div role="tablist" aria-labelledby="resume-label" className="inline-flex rounded-lg bg-desk p-1 small">
              {(['upload', 'paste'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`rounded-md px-3 py-1.5 font-semibold transition-colors ${mode === m ? 'bg-white text-ink shadow-sm' : 'text-graphite hover:text-ink'}`}
                >
                  {m === 'upload' ? 'Upload file' : 'Paste text'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'upload' ? (
            <label
              htmlFor="resume-file"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className={`flex min-h-[15rem] flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                dragging ? 'border-pencil bg-pencil/5' : fileName ? 'border-moss/50 bg-moss/5' : 'border-rule hover:border-ink-2'
              }`}
            >
              <input
                ref={fileInput}
                id="resume-file"
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />
              {reading ? (
                <div className="w-full max-w-xs space-y-2" aria-live="polite">
                  <div className="skeleton h-3 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                  <p className="small muted pt-2">Reading {fileName} on your device…</p>
                </div>
              ) : fileName && resumeText ? (
                <>
                  <FileIcon />
                  <p className="mt-3 font-semibold break-all">{fileName}</p>
                  <p className="small muted mt-1">
                    {resumeWords} words read{layout.pages ? ` from ${layout.pages} page${layout.pages > 1 ? 's' : ''}` : ''}. Click to choose a different file.
                  </p>
                </>
              ) : (
                <>
                  <FileIcon />
                  <p className="mt-3 font-semibold">Drop your resume here, or click to choose</p>
                  <p className="small muted mt-1">PDF, DOCX or TXT, up to 8 MB. It&apos;s read in this tab and never uploaded.</p>
                </>
              )}
            </label>
          ) : (
            <>
              <label htmlFor="resume-text" className="sr-only">Resume text</label>
              <textarea
                id="resume-text"
                className="textarea flex-1"
                value={pasted}
                onChange={(e) => setPasted(e.target.value.slice(0, 30000))}
                placeholder="Paste the full text of your resume"
                spellCheck={false}
              />
              <p className="small muted mt-2">Pasted text skips layout checks (columns, tables). Upload the file to include them.</p>
            </>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:col-span-2">
          <button type="submit" className="btn btn-ink" disabled={reading} aria-disabled={!ready}>
            Check my match
          </button>
          <button type="button" className="btn btn-ghost" onClick={loadSample}>
            Try a sample
          </button>
          <span className="small muted sm:ml-2">Unlimited and free.<span className="hidden md:inline"> Press Ctrl + Enter to run.</span></span>
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-redpen/30 bg-redpen/5 px-4 py-3 text-[0.95rem] text-redpen lg:col-span-2">
            {error}
          </p>
        )}
      </form>

      <div ref={resultsRef} aria-live="polite" className="scroll-mt-24">
        {report && (
          <Report
            report={report}
            previous={previous}
            ignored={ignored}
            onToggleIgnore={toggleIgnore}
            onReset={() => {
              setReport(null);
              document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="8" y="4" width="24" height="32" rx="3" fill="#fff" stroke="#14213D" strokeWidth="2" />
      <rect x="12" y="11" width="16" height="4" rx="1.2" fill="#FFE14D" />
      <path d="M13 13h14M13 20h11M13 26h13" stroke="#14213D" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

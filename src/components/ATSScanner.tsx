'use client';

import { useState, useEffect, useRef } from 'react';
import FileUpload from './FileUpload';
import ScoreDial from './ScoreDial';
import ResultsPanel from './ResultsPanel';
import { ResultsAd } from './AdUnit';
import ResultLinkActions from './ResultLinkActions';
import { saveScanToHistory } from '@/lib/scanHistory';
import type { ScanResult, ParseFinding } from '@/types/index';
import { getAllRoles } from '@/lib/rolesData';

const LOADING_TIPS = [
  '🔑 Mirror the exact wording of the job description — parsers match strings, not intent.',
  '📋 Single-column layouts extract most reliably. Multi-column text can interleave.',
  '🎯 Tailor each resume to the specific posting. Keyword relevance is per-job.',
  '✅ Spell out acronyms at least once: "Machine Learning (ML)" matches both forms.',
  '📝 Standard headings — Experience, Skills, Education — are the easiest to detect.',
  '⚡ Lead bullets with a verb: "Led", "Built", "Reduced", "Grew", "Shipped".',
  '📎 Text in headers, footers, images, and text boxes is often dropped entirely.',
  '📐 Our score weights keyword coverage, section structure, and formatting risk.',
  '🔢 Numbers make achievements checkable: "cut build time 40%" beats "improved builds".',
  '💾 Export as PDF from a word processor, not a scan or screenshot — scans have no text layer.',
];

const STAGES = {
  IDLE:      { pct: 0,   label: '' },
  SENDING:   { pct: 12,  label: 'Uploading your resume…' },
  ANALYSING: { pct: 35,  label: 'Reading the document and comparing it to the job description…' },
  DONE:      { pct: 100, label: 'Done' },
} as const;

type StageKey = keyof typeof STAGES;

const CONFETTI_PARTICLES = [
  { left: 5,  dur: 960,  rot: -22, w: 5, h: 7 },
  { left: 11, dur: 1050, rot: 15,  w: 7, h: 5 },
  { left: 17, dur: 920,  rot: -8,  w: 4, h: 8 },
  { left: 23, dur: 1100, rot: 28,  w: 8, h: 4 },
  { left: 29, dur: 980,  rot: -30, w: 6, h: 6 },
  { left: 35, dur: 1030, rot: 10,  w: 5, h: 7 },
  { left: 41, dur: 950,  rot: -18, w: 7, h: 5 },
  { left: 47, dur: 1080, rot: 25,  w: 4, h: 8 },
  { left: 53, dur: 970,  rot: -12, w: 8, h: 4 },
  { left: 59, dur: 1020, rot: 20,  w: 6, h: 6 },
  { left: 65, dur: 940,  rot: -28, w: 5, h: 7 },
  { left: 71, dur: 1060, rot: 8,   w: 7, h: 5 },
  { left: 77, dur: 990,  rot: -15, w: 4, h: 8 },
  { left: 83, dur: 1010, rot: 22,  w: 8, h: 4 },
  { left: 89, dur: 960,  rot: -5,  w: 6, h: 6 },
  { left: 95, dur: 1040, rot: 18,  w: 5, h: 7 },
];

const CONFETTI_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316'];

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
      {CONFETTI_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left:              `${p.left}%`,
            top:               '8%',
            background:        CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay:    `${i * 70}ms`,
            animationDuration: `${p.dur}ms`,
            transform:         `rotate(${p.rot}deg)`,
            width:             `${p.w}px`,
            height:            `${p.h}px`,
          }}
        />
      ))}
    </div>
  );
}

function ScoreMessage({ score }: { score: number }) {
  const cfg =
    score >= 80 ? { msg: '🎉 Excellent match! High interview probability.', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' }
    : score >= 60 ? { msg: '📈 Good match. A few targeted improvements will boost you significantly.', cls: 'bg-blue-500/10 text-blue-300 border-blue-500/20' }
    : score >= 40 ? { msg: '⚠️ Moderate match. Meaningful changes needed to compete.', cls: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' }
    : { msg: '🔴 Weak match. Significant restructuring recommended before applying.', cls: 'bg-red-500/10 text-red-300 border-red-500/20' };

  return (
    <div className={`p-3 rounded-xl text-sm font-medium text-center border ${cfg.cls}`}>
      {cfg.msg}
    </div>
  );
}

interface ATSScannerProps {
  initialRole?: string;
}

export default function ATSScanner({ initialRole = '' }: ATSScannerProps) {
  const [file, setFile]               = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selectedRole, setSelectedRole]     = useState(initialRole);
  const [result, setResult]           = useState<ScanResult | null>(null);
  const [scanToken, setScanToken]     = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [progress, setProgress]       = useState(0);
  const [stage, setStage]             = useState<StageKey>('IDLE');
  const [tipIndex, setTipIndex]       = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [retryAfter, setRetryAfter]   = useState<number | null>(null);
  const [degradedReport, setDegradedReport] = useState<ParseFinding[] | null>(null);

  const availableRoles = getAllRoles();
  const canScan = !!file && jobDescription.trim().length >= 50 && !loading;
  const jdLength = jobDescription.length;

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setTipIndex(i => (i + 1) % LOADING_TIPS.length), 3200);
    return () => clearInterval(t);
  }, [loading]);

  const handleScanRef = useRef<(() => void) | null>(null);

  const handleScan = async () => {
    if (!canScan) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setScanToken(null);
    setProgress(0);
    setRetryAfter(null);
    setShowConfetti(false);

    if ('vibrate' in navigator) navigator.vibrate([40, 20, 40]);

    setStage('SENDING');
    setProgress(STAGES.SENDING.pct);

    const crawl = setInterval(() => {
      setProgress(p => (p < 90 ? p + 0.6 : p));
    }, 400);
    const progressInterval = crawl;

    setStage('ANALYSING');
    setProgress(p => Math.max(p, STAGES.ANALYSING.pct));

    try {
      const fd = new FormData();
      fd.append('file', file!);
      fd.append('jobDescription', jobDescription);
      if (selectedRole) fd.append('role', selectedRole);

      const res = await fetch('/api/scan', { method: 'POST', body: fd });
      const resData = await res.json();
      
      const token = resData.token || resData.resultToken || null;
      const data = (resData.result ? resData.result : resData) as ScanResult & {
        error?: string;
        retryAfter?: number;
        degraded?: boolean;
      };

      if (!res.ok && resData.degraded && data.formattingFindings) {
        setDegradedReport(data.formattingFindings);
        setError(data.error ?? 'Keyword analysis is unavailable right now.');
        if (typeof data.retryAfter === 'number') setRetryAfter(data.retryAfter);
        return;
      }

      if (!res.ok) {
        if (res.status === 429) setRetryAfter(data.retryAfter ?? 60);
        throw new Error(data.error ?? 'Scan failed. Please try again.');
      }

      clearInterval(progressInterval);
      setStage('DONE');
      setProgress(100);
      await new Promise(r => setTimeout(r, 350));

      if (token) {
        setScanToken(token);
        saveScanToHistory({
          token,
          score: data.score,
          grade: data.grade,
          roleTitle: data.roleTitle || selectedRole || 'Unknown Role',
        });
      }

      setResult(data);

      if (data.score >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2200);
      }

      if ('vibrate' in navigator) {
        navigator.vibrate(data.score >= 80 ? [60, 30, 60, 30, 100] : 80);
      }
    } catch (e: unknown) {
      clearInterval(progressInterval);
      setStage('IDLE');
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleScanRef.current = canScan ? handleScan : null;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleScanRef.current?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); 

  const reset = () => {
    setFile(null);
    setJobDescription('');
    setSelectedRole('');
    setResult(null);
    setScanToken(null);
    setDegradedReport(null);
    setError(null);
    setProgress(0);
    setStage('IDLE');
    setShowConfetti(false);
    setRetryAfter(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass-card-elevated rounded-3xl overflow-hidden relative">
        {showConfetti && <Confetti />}

        <div className="px-6 pt-6 pb-0 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold font-syne text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/25 flex items-center justify-center text-base shrink-0" aria-hidden="true">
                🎯
              </span>
              ATS Resume Scanner
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 ml-[2.625rem]">
              Results in ~10–20 seconds
            </p>
          </div>
          {result && (
            <button
              onClick={reset}
              className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg shrink-0"
              aria-label="Start new scan"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New scan
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {!result ? (
            <>
              <FileUpload
                onFileSelect={setFile}
                selectedFile={file}
                disabled={loading}
              />

              <div>
                <label htmlFor="role-select" className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Target Role
                  <span className="ml-1 normal-case font-normal text-slate-600">(optional — improves accuracy)</span>
                </label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  disabled={loading}
                  className="input-field w-full"
                >
                  <option value="">Select your target role for tailored analysis…</option>
                  {availableRoles.map(r => (
                    <option key={r.slug} value={r.slug}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="jd-input" className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Job Description
                  <span className="ml-1 text-red-400/80" aria-label="required">*</span>
                </label>
                <textarea
                  id="jd-input"
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  disabled={loading}
                  placeholder="Paste the complete job description here — requirements, responsibilities, and qualifications. The more complete, the more accurate your ATS score…"
                  rows={7}
                  aria-describedby="jd-hint"
                  className="input-field w-full resize-none leading-relaxed"
                />
                <div className="flex justify-between mt-1.5" id="jd-hint">
                  <span className="text-xs text-slate-600">
                    {jdLength < 50
                      ? `${50 - jdLength} more characters needed`
                      : '✓ Good — paste more for better accuracy'}
                  </span>
                  <span className={`text-xs font-mono transition-colors ${
                    jdLength >= 50 ? 'text-emerald-500' : jdLength > 20 ? 'text-yellow-500' : 'text-slate-600'
                  }`}>
                    {jdLength.toString()} / 10,000
                  </span>
                </div>
              </div>

              {retryAfter !== null && (
                <div className="flex items-start gap-2.5 p-3.5 bg-yellow-500/8 border border-yellow-500/20 rounded-xl animate-fade-in" role="alert">
                  <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 001 1h3a1 1 0 100-2h-2V6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-yellow-300">
                    Rate limit reached. Please wait ~{Math.ceil(retryAfter / 60)} minute(s) before scanning again.
                    You get 8 free scans per 10 minutes.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-500/8 border border-red-500/20 rounded-xl animate-fade-in" role="alert">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {degradedReport && degradedReport.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Formatting check
                    </h3>
                    <span className="text-[11px] text-slate-600">Keyword analysis unavailable</span>
                  </div>
                  {degradedReport.slice(0, 6).map(f => (
                    <div
                      key={f.code}
                      className="p-3 rounded-xl border border-white/[0.07] bg-white/[0.03]"
                    >
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <h4 className="text-sm font-medium text-white">{f.title}</h4>
                        <span className="text-[10px] uppercase tracking-wider text-slate-600 shrink-0">
                          {f.confidence}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-slate-500">Fix: </span>{f.fix}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleScan}
                disabled={!canScan}
                aria-label={canScan ? 'Scan resume against job description' : 'Upload a resume and enter a job description to scan'}
                className={`btn-primary w-full py-4 rounded-2xl gap-2.5 text-base ${canScan && !loading ? 'animate-pulse-glow' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing with AI…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Scan Resume Free
                    <span className="text-xs font-normal opacity-60 hidden sm:inline">· ⌘Enter</span>
                  </>
                )}
              </button>

              {loading && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{STAGES[stage].label || 'Working…'}</span>
                      <span className="text-slate-500 font-mono">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/5 border border-blue-500/12 rounded-xl">
                    <p className="text-xs text-slate-400 leading-relaxed">{LOADING_TIPS[tipIndex]}</p>
                  </div>
                </div>
              )}

              {!loading && (
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 justify-center pt-1">
                  {['No sign-up', 'PII never stored', 'Free forever', '~10s results'].map(t => (
                    <span key={t} className="flex items-center gap-1 text-[11px] text-slate-600">
                      <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <div className="shrink-0">
                  <ScoreDial score={result.score} grade={result.grade} animated size="md" />
                </div>
                <div className="flex-1 w-full space-y-3 min-w-0">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Matched',  val: result.foundKeywords?.length || 0,  color: '#10B981', bg: 'rgba(16,185,129,0.08)'  },
                      { label: 'Missing',  val: result.missingKeywords?.length || 0,  color: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
                      { label: 'Warnings', val: result.formattingFindings?.length || 0,      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
                    ].map(stat => (
                      <div
                        key={stat.label}
                        className="rounded-xl p-3 text-center border border-white/[0.05]"
                        style={{ background: stat.bg }}
                      >
                        <div className="text-2xl font-black font-syne" style={{ color: stat.color }}>
                          {stat.val}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <ScoreMessage score={result.score} />
                </div>
              </div>

              <ResultsAd />
              <ResultsPanel result={result} />
              
              {scanToken && <ResultLinkActions token={scanToken} />}

              <div className="text-center pt-1">
                <p className="text-xs text-slate-600 mb-2">
                  Updated your resume? Re-scan to track your improvement.
                </p>
                <button
                  onClick={reset}
                  className="btn-secondary px-5 py-2 rounded-xl text-sm"
                >
                  ↑ Scan again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
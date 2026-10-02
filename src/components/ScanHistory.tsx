'use client';
// src/components/ScanHistory.tsx
// Past scans from this browser, with score movement over time.
//
// Reads localStorage only — see lib/scanHistory.ts for why this is local rather
// than account-backed. Renders nothing until mounted, so server and first client
// render produce identical HTML and there is no hydration mismatch.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/scanHistory';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // Explicit locale + UTC: toLocaleDateString() with no arguments renders
  // differently on the server and in the browser.
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export default function ScanHistory({ className = '' }: { className?: string }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  // null = not yet mounted. Matches the server render exactly.
  if (entries === null || entries.length === 0) return null;

  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-bold text-white font-syne">Your recent scans</h2>
        <button
          type="button"
          onClick={() => {
            clearHistory();
            setEntries([]);
          }}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          Clear
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Stored in this browser only — never sent to us, and gone if you clear site data.
      </p>

      <ol className="space-y-2" role="list">
        {entries.slice(0, 8).map((entry, i) => {
          // Compare against the next OLDER scan of the same job description.
          const older = entries.slice(i + 1).find((e) => e.jdKey === entry.jdKey);
          const delta = older ? entry.score - older.score : null;

          const row = (
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
              <span className="font-black font-syne text-white text-sm w-8 shrink-0">
                {entry.score}
              </span>
              <span className="text-xs text-slate-500 w-14 shrink-0">{entry.grade}</span>

              {delta !== null && delta !== 0 ? (
                <span
                  className={`text-xs font-semibold shrink-0 ${
                    delta > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {delta > 0 ? '+' : ''}
                  {delta}
                </span>
              ) : (
                <span className="text-xs text-slate-700 shrink-0">—</span>
              )}

              <span className="text-xs text-slate-500 truncate flex-1">
                {entry.roleSlug ? entry.roleSlug.replace(/-/g, ' ') : 'No role selected'}
              </span>
              <span className="text-xs text-slate-600 shrink-0">{formatDate(entry.scannedAt)}</span>
            </div>
          );

          return (
            <li key={`${entry.scannedAt}-${i}`}>
              {entry.token ? (
                <Link href={`/r/${entry.token}`} className="block">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
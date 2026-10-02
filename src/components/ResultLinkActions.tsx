'use client';
// src/components/ResultLinkActions.tsx
// Copy or permanently revoke a saved result link.
//
// The revoke control is not optional. Anything that persists user output needs
// a working delete, and "email us to request removal" is not one. Because the
// token is the only credential, whoever holds the link can revoke it — which is
// the correct trade: the alternative is no delete at all.

import { useState } from 'react';

export default function ResultLinkActions({
  token,
  className = '',
}: {
  token: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied permission). The URL is
      // in the address bar either way, so this is not worth an error state.
    }
  };

  const revoke = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/result/${token}`, { method: 'DELETE' });
      setDeleted(true);
    } catch {
      setDeleting(false);
    }
  };

  if (deleted) {
    return (
      <div className={`glass-card rounded-xl p-4 ${className}`} role="status">
        <p className="text-sm text-slate-400">
          This result has been deleted. The link no longer works.
        </p>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-xl p-5 ${className}`}>
      <h3 className="font-semibold text-white text-sm mb-1">This link</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-4">
        Anyone with this URL can view the analysis. It holds no resume text and no contact
        details — only the score and suggestions. It expires 30 days after the scan.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-red-400 bg-white/[0.04] border border-white/[0.07] hover:border-red-500/30 transition-colors"
          >
            Delete this result
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={revoke}
              disabled={deleting}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-red-300 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
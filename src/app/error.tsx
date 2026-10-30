'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap-narrow py-24">
      <h1 className="h-section">This page hit an error.</h1>
      <p className="mt-4 text-ink-2">Reload to try again. If you were mid-scan, your resume was never uploaded, so nothing was lost on our side.</p>
      <button type="button" onClick={reset} className="btn btn-ink mt-6">Reload the page</button>
    </div>
  );
}

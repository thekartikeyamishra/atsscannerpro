'use client';
// src/app/error.tsx — route-level error boundary
//
// There was no error.tsx anywhere in the app. An unhandled render error showed
// Next's default error screen: unstyled, off-brand, and with no way back into
// the product.
//
// NO ADS ON THIS PAGE. Google's publisher policies prohibit ads on pages with
// no publisher content, and an error screen is the canonical example.

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the digest, never the message: an error string can contain fragments
    // of whatever was being processed, which here means resume text.
    console.error('[error boundary]', error.digest ?? 'no digest');
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl font-bold font-syne text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-400 leading-relaxed mb-8">
          This one is on us, not on your resume. Nothing you uploaded was stored, and trying again
          usually works.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="btn-primary px-6 py-3 rounded-xl font-bold"
          >
            Try again
          </button>
          <Link href="/" className="btn-secondary px-6 py-3 rounded-xl font-bold">
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-slate-600 font-mono">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
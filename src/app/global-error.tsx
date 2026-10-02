'use client';
// src/app/global-error.tsx — catches failures in the root layout itself.
//
// This one must render its own <html> and <body>, because if the root layout
// threw, there is no layout wrapping it. It also cannot rely on globals.css
// having loaded, so the styling here is inline on purpose.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: '#040B1A',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
          textAlign: 'center',
        }}
      >
        <div style={{ padding: '2rem', maxWidth: 420 }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
          <p style={{ color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            The page failed to load. Nothing you uploaded was stored.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#1D6EE6',
              color: '#fff',
              border: 0,
              padding: '0.75rem 1.5rem',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ color: '#475569', fontSize: 12, marginTop: '2rem' }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
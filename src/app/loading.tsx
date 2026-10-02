// src/app/loading.tsx — Route transition loading skeleton
// Shown by Next.js App Router during page navigation

export default function Loading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-label="Loading page">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#040B1A]/90 border-b border-white/[0.06] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="skeleton h-8 w-40 rounded-lg" />
          <div className="hidden sm:flex items-center gap-6">
            {[80, 60, 64].map((w, i) => (
              <div key={i} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="pt-32 pb-16 px-4 max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <div className="skeleton h-5 w-48 rounded-full mx-auto" />
          <div className="skeleton h-12 w-3/4 rounded-xl mx-auto" />
          <div className="skeleton h-12 w-1/2 rounded-xl mx-auto" />
          <div className="skeleton h-5 w-2/3 rounded-lg mx-auto" />
          <div className="skeleton h-5 w-1/2 rounded-lg mx-auto" />
        </div>

        {/* Scanner card skeleton */}
        <div className="glass-card-elevated rounded-3xl p-6 sm:p-8">
          <div className="skeleton h-6 w-48 rounded-lg mb-2" />
          <div className="skeleton h-4 w-64 rounded mb-8" />

          {/* File upload zone skeleton */}
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 mb-5 flex flex-col items-center gap-3">
            <div className="skeleton w-14 h-14 rounded-2xl" />
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-48 rounded" />
          </div>

          {/* Select skeleton */}
          <div className="skeleton h-12 w-full rounded-xl mb-5" />

          {/* Textarea skeleton */}
          <div className="skeleton h-32 w-full rounded-xl mb-5" />

          {/* Button skeleton */}
          <div className="skeleton h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
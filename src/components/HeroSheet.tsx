'use client';

// The hero: a resume being marked up. Move the pointer over it and the scan
// line follows, highlighting terms the posting asks for and pencilling in the
// ones it can't find. On touch screens it sweeps once by itself.

import { useEffect, useRef, useState } from 'react';

type Seg = string | { t: string; hit: true };
const LINES: { segs: Seg[]; size?: 'name' | 'head' | 'meta'; note?: string }[] = [
  { segs: ['Priya Raman'], size: 'name' },
  { segs: [{ t: 'Frontend Engineer', hit: true }, ', Bengaluru'], size: 'meta' },
  { segs: ['Experience'], size: 'head' },
  { segs: ['Built the checkout in ', { t: 'React', hit: true }, ' and ', { t: 'TypeScript', hit: true }, ' for 1.2M shoppers'] },
  { segs: ['Cut bundle size 38% with route-level ', { t: 'code splitting', hit: true }], note: 'Next.js?' },
  { segs: ['Led a ', { t: 'WCAG 2.1', hit: true }, ' accessibility fix across checkout'] },
  { segs: ['Raised ', { t: 'Jest', hit: true }, ' coverage from 41% to 78%'], note: 'GraphQL?' },
  { segs: ['Skills'], size: 'head' },
  { segs: [{ t: 'React', hit: true }, ', ', { t: 'TypeScript', hit: true }, ', CSS, ', { t: 'Git', hit: true }, ', Figma'], note: 'CI/CD?' },
];

export default function HeroSheet() {
  const box = useRef<HTMLDivElement>(null);
  const [frac, setFrac] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(rm);
    if (rm) {
      setFrac(1.1);
      return;
    }
    // Sweep once on load so touch users (and everyone) see what it does.
    let raf = 0;
    const start = performance.now();
    const dur = 2600;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setFrac((f) => Math.max(f, p * 1.08));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const t = setTimeout(() => (raf = requestAnimationFrame(step)), 500);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, []);

  function onMove(e: React.PointerEvent) {
    if (reduced || e.pointerType !== 'mouse' || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    setFrac(Math.max(0, Math.min(1.08, fy)));
    setTilt({ x: (0.5 - fy) * 6, y: (fx - 0.5) * 8 });
  }

  const n = LINES.length;
  const beamTop = `${Math.min(100, Math.max(0, frac * 100))}%`;

  return (
    <div className="relative [perspective:1200px]" aria-hidden="true">
      <div
        ref={box}
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        className="hero-sheet sheet relative mx-auto w-full max-w-[30rem] select-none px-7 pt-7 pb-9 sm:px-9"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotate(-1.2deg)` }}
      >
        <div className="relative">
          {LINES.map((l, i) => {
            const on = frac > (i + 0.6) / n;
            const cls =
              l.size === 'name'
                ? 'text-[1.45rem] font-extrabold tracking-tight'
                : l.size === 'head'
                  ? 'mt-4 border-b border-rule pb-1 text-[0.8rem] font-bold text-graphite'
                  : l.size === 'meta'
                    ? 'text-[0.9rem] text-graphite mb-1'
                    : 'text-[0.92rem] leading-snug mt-2 pl-3 relative before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-graphite';
            return (
              <div key={i} className={`relative ${cls}`}>
                {l.segs.map((s, j) =>
                  typeof s === 'string' ? (
                    <span key={j}>{s}</span>
                  ) : (
                    <span key={j} className={`hl ${on ? 'on' : ''}`} style={{ transitionDelay: `${j * 60}ms` }}>
                      {s.t}
                    </span>
                  ),
                )}
                {l.note && (
                  <span className={`miss-note pen absolute -right-3 top-0 hidden translate-x-full whitespace-nowrap text-[1rem] sm:block ${on ? 'on' : ''}`}>
                    <span className="mr-1 inline-block">←</span>missing {l.note.replace('?', '')}
                  </span>
                )}
              </div>
            );
          })}
          <div className="scan-beam" style={{ top: beamTop, opacity: frac > 0 && frac < 1.05 ? 1 : 0 }} />
        </div>
      </div>
      <div className="mx-auto mt-5 flex max-w-[30rem] flex-wrap gap-x-5 gap-y-2 px-2 text-[0.85rem] text-graphite">
        <span className="inline-flex items-center gap-2"><span className="mark-hit">React</span> in the posting and your resume</span>
        <span className="inline-flex items-center gap-2"><span className="mark-miss">Next.js</span> asked for, not found</span>
      </div>
    </div>
  );
}

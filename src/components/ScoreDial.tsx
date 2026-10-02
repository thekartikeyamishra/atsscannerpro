'use client';
// components/ScoreDial.tsx
// HYDRATION FIX: useCountUp starts at 0 on both server and client.
// animated=true → count up after mount. animated=false → show final value immediately.
// No Math.random() or Date calls during render.

import { useEffect, useRef, useState } from 'react';
import type { ScanResult } from '@/types';

interface ScoreDialProps {
  score:     number;
  grade:     ScanResult['grade'];
  animated?: boolean;
  size?:     'sm' | 'md' | 'lg';
}

const GRADE_CONFIG: Record<string, { color: string; glow: string }> = {
  'A+': { color: '#10B981', glow: 'rgba(16,185,129,0.45)' },
  'A':  { color: '#10B981', glow: 'rgba(16,185,129,0.4)'  },
  'B+': { color: '#3B82F6', glow: 'rgba(59,130,246,0.45)' },
  'B':  { color: '#3B82F6', glow: 'rgba(59,130,246,0.4)'  },
  'C+': { color: '#F59E0B', glow: 'rgba(245,158,11,0.45)' },
  'C':  { color: '#F59E0B', glow: 'rgba(245,158,11,0.4)'  },
  'D':  { color: '#EF4444', glow: 'rgba(239,68,68,0.4)'   },
  'F':  { color: '#DC2626', glow: 'rgba(220,38,38,0.35)'  },
};

const SIZE_CONFIG = {
  sm: { size: 120, r: 46, stroke: 8,  cx: 60,  cy: 60,  fontSize: 20, sub: 10 },
  md: { size: 176, r: 68, stroke: 10, cx: 88,  cy: 88,  fontSize: 28, sub: 13 },
  lg: { size: 220, r: 88, stroke: 12, cx: 110, cy: 110, fontSize: 36, sub: 15 },
};

function useCountUp(target: number, duration: number, enabled: boolean): number {
  // HYDRATION FIX: always start at 0 — same on server and client
  const [current, setCurrent] = useState(0);
  const rafId     = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCurrent(target);
      return;
    }

    startTime.current = null;
    if (rafId.current) cancelAnimationFrame(rafId.current);

    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const elapsed  = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafId.current = requestAnimationFrame(animate);
    };

    // Small delay so the user sees the animation clearly
    const delay = setTimeout(() => {
      rafId.current = requestAnimationFrame(animate);
    }, 150);

    return () => {
      clearTimeout(delay);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration, enabled]);

  return current;
}

export default function ScoreDial({ score, grade, animated = false, size = 'md' }: ScoreDialProps) {
  const cfg         = SIZE_CONFIG[size];
  const config      = GRADE_CONFIG[grade] ?? GRADE_CONFIG['C'];
  const circumference = 2 * Math.PI * cfg.r;
  const displayScore  = useCountUp(score, 1400, animated);
  // HYDRATION FIX: glow appears after mount (client-only)
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    if (!animated) return;
    const t = setTimeout(() => setShowGlow(true), 1200);
    return () => clearTimeout(t);
  }, [animated]);

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative" style={{ width: cfg.size, height: cfg.size }}>
        {/* Glow ring — client only (no SSR) */}
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none"
            style={{ boxShadow: `0 0 40px ${config.glow}, 0 0 70px ${config.glow}50` }}
            aria-hidden="true"
          />
        )}

        <svg
          viewBox={`0 0 ${cfg.size} ${cfg.size}`}
          width={cfg.size}
          height={cfg.size}
          aria-label={`ATS Score: ${score} out of 100, Grade: ${grade}`}
          role="img"
        >
          <defs>
            <linearGradient id={`dial-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={config.color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={config.color} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={cfg.cx} cy={cfg.cy} r={cfg.r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={cfg.stroke}
          />

          {/* Tick marks at 0, 20, 40, 60, 80 */}
          {[0, 20, 40, 60, 80].map(mark => {
            const angle  = ((mark / 100) * 360 - 90) * (Math.PI / 180);
            const outerR = cfg.r + cfg.stroke / 2 + 2;
            const innerR = cfg.r - cfg.stroke / 2 - 2;
            return (
              <line
                key={mark}
                x1={cfg.cx + innerR * Math.cos(angle)}
                y1={cfg.cy + innerR * Math.sin(angle)}
                x2={cfg.cx + outerR * Math.cos(angle)}
                y2={cfg.cy + outerR * Math.sin(angle)}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Score arc */}
          <circle
            cx={cfg.cx} cy={cfg.cy} r={cfg.r}
            fill="none"
            stroke={`url(#dial-grad-${size})`}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${cfg.cx} ${cfg.cy})`}
            style={{
              transition: animated ? 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              filter:     `drop-shadow(0 0 6px ${config.color}80)`,
            }}
          />

          {/* Score number */}
          <text
            x={cfg.cx}
            y={cfg.cy - cfg.sub * 0.4}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={config.color}
            fontSize={cfg.fontSize}
            fontWeight="900"
            fontFamily="'Syne', sans-serif"
          >
            {displayScore}
          </text>

          {/* /100 label */}
          <text
            x={cfg.cx}
            y={cfg.cy + cfg.fontSize * 0.65}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize={cfg.sub}
            fontWeight="600"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            /100
          </text>
        </svg>
      </div>

      {/* Grade badge */}
      <div
        className="px-4 py-1.5 rounded-full font-black text-sm tracking-wider transition-all duration-700"
        style={{
          background:  `${config.color}18`,
          color:       config.color,
          border:      `1px solid ${config.color}30`,
          boxShadow:   showGlow ? `0 0 12px ${config.glow}` : 'none',
        }}
      >
        Grade: {grade}
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import Link from 'next/link';

interface AppDownloadBannerProps {
  className?: string;
}

export default function AppDownloadBanner({ className = '' }: AppDownloadBannerProps) {
  return (
    <section 
      className={`glass-card-elevated relative overflow-hidden rounded-3xl p-8 sm:p-12 ${className}`}
      aria-labelledby="download-app-heading"
    >
      {/* Background glow effects */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left min-w-0">
          <span className="badge mb-4 inline-flex">Mobile App</span>
          <h2 
            id="download-app-heading" 
            className="text-2xl sm:text-3xl font-black font-syne text-white mb-3"
          >
            Optimize your resume anywhere
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
            Get instant ATS parsing, offline keyword checks, and real-time formatting feedback 
            on your phone. Join the invite-only waitlist for early access.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
          {/* App Store Button */}
          <Link
            href="#waitlist"
            className="flex items-center justify-center sm:justify-start gap-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-xl px-5 py-3 text-left group"
            aria-label="Join waitlist for iOS App Store"
          >
            <svg 
              className="w-7 h-7 text-white group-hover:scale-105 transition-transform" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16.365 14.364c-.021 3.23 2.853 4.331 2.883 4.343-.024.077-.453 1.545-1.5 3.078-1.026 1.5-2.093 2.996-3.766 3.026-1.644.027-2.181-.983-4.062-.983-1.88 0-2.474.954-4.032 1.01-1.616.056-2.856-1.619-3.896-3.118-2.115-3.04-3.743-8.583-1.583-12.33 1.07-1.855 2.992-3.043 5.1-3.072 1.616-.027 3.123 1.096 4.09 1.096.969 0 2.793-1.341 4.743-1.144 1.002.042 3.824.404 5.632 3.05-1.52.936-2.613 2.656-2.609 4.044zm-2.825-8.473c.84-.997 1.408-2.383 1.254-3.763-1.187.047-2.628.793-3.498 1.802-.693.793-1.325 2.213-1.143 3.567 1.332.102 2.705-.624 3.387-1.606z"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Waitlist for</span>
              <span className="text-sm font-semibold text-white leading-tight">App Store</span>
            </div>
          </Link>

          {/* Google Play Button */}
          <Link
            href="#waitlist"
            className="flex items-center justify-center sm:justify-start gap-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-xl px-5 py-3 text-left group"
            aria-label="Join waitlist for Google Play"
          >
            <svg 
              className="w-7 h-7 group-hover:scale-105 transition-transform" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path fill="#4ADE80" d="M3.1 1.5c-.3.3-.5.8-.5 1.4v18.2c0 .6.2 1.1.5 1.4l.1.1 10.3-10.2v-.4L3.2 1.4l-.1.1z"/>
              <path fill="#60A5FA" d="M13.5 12.4l3.4 3.4 4-2.3c1.1-.6 1.1-1.6 0-2.3l-4-2.3-3.4 3.5z"/>
              <path fill="#F87171" d="M13.5 11.6l-10.4-10c-.4-.4-1-.5-1.6-.2l12 10.2z"/>
              <path fill="#FBBF24" d="M13.5 12.4l-12 10.2c.6.3 1.2.2 1.6-.2l10.4-10z"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Waitlist for</span>
              <span className="text-sm font-semibold text-white leading-tight">Google Play</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
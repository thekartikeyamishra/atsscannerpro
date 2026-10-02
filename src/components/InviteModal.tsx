'use client';

import React, { useState, useEffect } from 'react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Platform = 'ios' | 'android' | 'both';
type Status = 'idle' | 'loading' | 'success' | 'error';

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState<Platform>('ios');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Prevent background scrolling when open, and handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Reset state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStatus('idle');
        setEmail('');
        setErrorMessage('');
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, platform, source: 'vip_invite_modal' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join waitlist. Please try again.');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md glass-card-elevated rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-900/20 transform animate-fade-in scale-100 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" aria-hidden="true" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black font-syne text-white mb-2">You&apos;re on the list!</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Thanks for joining the VIP waitlist. We&apos;ll email you an exclusive invite link as soon as the mobile app is ready for early access.
            </p>
            <button
              onClick={onClose}
              className="btn-secondary w-full py-3 rounded-xl text-sm font-semibold"
            >
              Close window
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            <span className="badge mb-4 inline-flex">Early Access</span>
            <h2 id="modal-title" className="text-2xl font-black font-syne text-white mb-2">
              Join the VIP Waitlist
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Get ATS Scanner Pro on your phone. Offline keyword checks, on-device parsing, and real-time formatting feedback.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Platform Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Select your platform
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPlatform('ios')}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      platform === 'ios' 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.365 14.364c-.021 3.23 2.853 4.331 2.883 4.343-.024.077-.453 1.545-1.5 3.078-1.026 1.5-2.093 2.996-3.766 3.026-1.644.027-2.181-.983-4.062-.983-1.88 0-2.474.954-4.032 1.01-1.616.056-2.856-1.619-3.896-3.118-2.115-3.04-3.743-8.583-1.583-12.33 1.07-1.855 2.992-3.043 5.1-3.072 1.616-.027 3.123 1.096 4.09 1.096.969 0 2.793-1.341 4.743-1.144 1.002.042 3.824.404 5.632 3.05-1.52.936-2.613 2.656-2.609 4.044zm-2.825-8.473c.84-.997 1.408-2.383 1.254-3.763-1.187.047-2.628.793-3.498 1.802-.693.793-1.325 2.213-1.143 3.567 1.332.102 2.705-.624 3.387-1.606z"/>
                    </svg>
                    <span className="text-xs font-semibold">iOS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('android')}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      platform === 'android' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.1 1.5c-.3.3-.5.8-.5 1.4v18.2c0 .6.2 1.1.5 1.4l.1.1 10.3-10.2v-.4L3.2 1.4l-.1.1z"/>
                      <path d="M13.5 12.4l3.4 3.4 4-2.3c1.1-.6 1.1-1.6 0-2.3l-4-2.3-3.4 3.5z"/>
                      <path d="M13.5 11.6l-10.4-10c-.4-.4-1-.5-1.6-.2l12 10.2z"/>
                      <path d="M13.5 12.4l-12 10.2c.6.3 1.2.2 1.6-.2l10.4-10z"/>
                    </svg>
                    <span className="text-xs font-semibold">Android</span>
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="waitlist-email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Email address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  disabled={status === 'loading'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your best email..."
                  className="input-field w-full h-12"
                />
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-300">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Securing your spot...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </button>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                By joining, you agree to our privacy policy. We will never sell your email or spam you.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useState } from 'react';

type State = 'idle' | 'sending' | 'done' | 'error';

export default function InviteForm({ source = 'web' }: { source?: string }) {
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get('consent')) {
      setState('error');
      setMessage('Tick the box so we can email you about your invite.');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fd.get('email'),
          platform: fd.get('platform'),
          role: fd.get('role'),
          website: fd.get('website'), // honeypot
          consent: true,
          source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again in a minute.');
      setState('done');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (state === 'done') {
    return (
      <div role="status" className="rounded-xl border border-moss/30 bg-moss/5 p-5">
        <p className="font-bold text-moss">You&apos;re on the invite list.</p>
        <p className="mt-1 text-ink-2">We let people in in small batches. When yours opens, we&apos;ll email you a link. One email, no newsletter.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} id="invite" className="scroll-mt-28 space-y-4" noValidate>
      <div>
        <label htmlFor="invite-email" className="field-label">Email</label>
        <input id="invite-email" name="email" type="email" required autoComplete="email" inputMode="email" className="input" placeholder="you@example.com" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="invite-platform" className="field-label">Phone</label>
          <select id="invite-platform" name="platform" className="select input" defaultValue="android">
            <option value="android">Android</option>
            <option value="ios">iPhone</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div>
          <label htmlFor="invite-role" className="field-label">
            Role you&apos;re applying for <span className="font-normal text-graphite">(optional)</span>
          </label>
          <input id="invite-role" name="role" maxLength={60} className="input" placeholder="e.g. Data Analyst" />
        </div>
      </div>
      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="invite-website">Website</label>
        <input id="invite-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-3 text-[0.92rem] text-ink-2">
        <input type="checkbox" name="consent" value="yes" className="mt-1 h-4 w-4 accent-[var(--color-ink)]" />
        <span>
          Email me when my invite is ready. I can ask for my email to be deleted at any time. See the <Link href="/privacy#invite-list">privacy policy</Link>.
        </span>
      </label>
      <button type="submit" className="btn btn-ink w-full sm:w-auto" disabled={state === 'sending'}>
        {state === 'sending' ? 'Joining…' : 'Request an invite'}
      </button>
      {state === 'error' && <p role="alert" className="text-[0.95rem] text-redpen">{message}</p>}
    </form>
  );
}

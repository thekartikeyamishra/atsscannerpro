import { APP_LINKS } from '@/config/site';

// Store buttons. While a link is null the button reads "Coming soon" and jumps
// to the invite form; set NEXT_PUBLIC_PLAY_STORE_URL / NEXT_PUBLIC_APP_STORE_URL
// (or edit config/site.ts) and it links to the store listing instead.
// Official store badges may only be used once a listing exists — swap them in then.

const STORES = [
  { key: 'playStore' as const, store: 'Google Play', device: 'Android' },
  { key: 'appStore' as const, store: 'App Store', device: 'iPhone' },
];

export default function AppButtons({ inviteHref = '#invite' }: { inviteHref?: string }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {STORES.map((s) => {
        const url = APP_LINKS[s.key];
        const inner = (
          <>
            <PhoneGlyph />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[0.72rem] font-medium opacity-80">{url ? 'Get it on' : `Coming soon for ${s.device}`}</span>
              <span className="text-[1.05rem] font-bold">{s.store}</span>
            </span>
          </>
        );
        return (
          <li key={s.key}>
            {url ? (
              <a href={url} className="btn btn-ink h-14 rounded-xl px-5" rel="noopener noreferrer" target="_blank">
                {inner}
              </a>
            ) : (
              <a href={inviteHref} className="btn btn-ghost h-14 rounded-xl bg-white px-5">
                {inner}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function PhoneGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

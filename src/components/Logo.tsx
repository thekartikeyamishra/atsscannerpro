export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="6" y="3" width="20" height="26" rx="2.5" fill="#fff" stroke="#14213D" strokeWidth="2" />
      <rect x="9.5" y="9" width="13" height="3.2" rx="1" fill="#FFE14D" />
      <path d="M10 9.9h12M10 15.5h9M10 20.5h11" stroke="#14213D" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2.5 15.5h27" stroke="#2F54D6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight text-[1.08rem] text-ink">
      <LogoMark />
      <span>
        ATS Scanner <span className="font-semibold text-graphite">Pro</span>
      </span>
    </span>
  );
}

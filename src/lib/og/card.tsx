import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

// Social preview: a sheet of paper on the desk with the page title, and one
// highlighter stroke — the site's signature mark.
export function ogCard({ title, kicker }: { title: string; kicker: string }) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#eef1f5', padding: 56, fontFamily: 'sans-serif' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff', borderRadius: 8, padding: '56px 64px', boxShadow: '0 20px 50px -20px rgba(20,33,61,.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#566177', fontSize: 30 }}>
            <div style={{ width: 22, height: 28, border: '3px solid #14213D', borderRadius: 3, display: 'flex' }} />
            <span style={{ color: '#14213D', fontWeight: 800 }}>ATS Scanner Pro</span>
            <span>{kicker}</span>
          </div>
          <div style={{ display: 'flex', fontSize: title.length > 60 ? 58 : 70, fontWeight: 800, color: '#14213D', lineHeight: 1.08, letterSpacing: -2 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 28, color: '#2a3a5c' }}>
            <span style={{ background: '#FFE14D', padding: '4px 12px', borderRadius: 6, color: '#14213D', fontWeight: 700 }}>Free</span>
            <span>Runs in your browser. No sign-up. No scan limits.</span>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

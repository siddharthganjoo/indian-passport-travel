import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'jugo — cheaper flights abroad for Indian passport holders, visas sorted';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social share card: black, huge type, the jugo wordmark. */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 88px',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <svg width="190" height="87" viewBox="-3 0 92 42" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 15v15.5a6.5 6.5 0 0 1-6.5 6.5" />
          <circle cx="8" cy="4.8" r="4.3" fill="#12b76a" stroke="none" />
          <path d="M21 15v7a7 7 0 0 0 14 0v-7M35 15v14" />
          <circle cx="52" cy="22" r="7" />
          <path d="M59 15v15.5a6.5 6.5 0 0 1-6.5 6.5h-3" />
          <circle cx="76" cy="22" r="7" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 104, fontWeight: 800, letterSpacing: '-4px', lineHeight: 0.95 }}>
          <span>Go further.</span>
          <span>Pay less.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#a1a1aa' }}>
          Cheaper flights abroad on an Indian passport — visas sorted.
        </div>
      </div>
    ),
    { ...size }
  );
}

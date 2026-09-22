import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DesiVisa - Indian Passport Travel & Visa Metasearch';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '60px 80px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#09090b',
              fontWeight: 900,
              fontSize: '24px',
            }}
          >
            ✈
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '1px' }}>
              DESIVISA
            </span>
            <span style={{ fontSize: '14px', color: '#a1a1aa' }}>
              Republic of India Passport Metasearch
            </span>
          </div>
        </div>

        {/* Center Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              ✓ 60+ Visa-Free & eVisa Countries
            </span>
            <span
              style={{
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              ✦ US / Schengen / UK Visa Relaxations
            </span>
          </div>

          <h1
            style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              margin: '8px 0',
            }}
          >
            Where Can Your Indian Passport Take You?
          </h1>

          <p style={{ fontSize: '22px', color: '#d4d4d8', margin: 0 }}>
            Dynamic conditional visa rules, live flight aggregations from DEL, BOM, BLR, and fare trend intelligence.
          </p>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid #27272a',
            paddingTop: '28px',
          }}
        >
          <div style={{ fontSize: '16px', color: '#71717a' }}>
            Starting low fares from ₹8,900 • Direct Flights Available
          </div>
          <div style={{ fontSize: '16px', color: '#a1a1aa', fontWeight: 600 }}>
            indianpassporttravel.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

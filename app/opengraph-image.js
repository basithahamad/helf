import { ImageResponse } from 'next/og';
import { readSite } from '../lib/store';

// The share card. Previously the preview fell back to a stock photograph that
// said nothing about the publication; this renders the masthead itself at the
// 1200x630 every platform asks for.
export const alt = 'The H.E.L.F Review';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const site = await readSite().catch(() => ({}));
  const brand = site.brand || {};
  const name = brand.name || 'The H.E.L.F';
  const nameEm = brand.nameEm || 'Review';
  const tagline = brand.tagline || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: 'linear-gradient(135deg, #2a060d 0%, #560d18 55%, #7d1322 100%)',
          color: '#fff',
          fontFamily: 'serif'
        }}
      >
        {/* Gold rule, echoing the section headings on the site */}
        <div style={{ display: 'flex', width: 120, height: 8, background: '#c8a45e', borderRadius: 4 }} />

        <div style={{ display: 'flex', fontSize: 92, marginTop: 40, lineHeight: 1.05 }}>
          {name}&nbsp;<span style={{ color: '#dfc084', fontStyle: 'italic' }}>{nameEm}</span>
        </div>

        {tagline && (
          <div style={{ display: 'flex', fontSize: 30, marginTop: 28, color: '#e8d3d7', maxWidth: 900 }}>
            {tagline}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            marginTop: 56,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#c8a45e',
            fontFamily: 'sans-serif'
          }}
        >
          thehelfreview.com
        </div>
      </div>
    ),
    size
  );
}

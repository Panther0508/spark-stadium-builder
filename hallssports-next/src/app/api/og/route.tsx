import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/** @jsxImportSource react */

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'HallsSports';
  const subtitle = searchParams.get('subtitle') || 'Live Football, Proudly Futoite';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 50%, #0F0F0F 100%)',
          border: '4px solid #00A859',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative lines */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00A859, #1E40AF, #00A859)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00A859, #1E40AF, #00A859)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Football icon */}
          <div
            style={{
              fontSize: 64,
              marginBottom: 8,
            }}
          >
            ⚽
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              letterSpacing: '0.05em',
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 0 20px rgba(0, 168, 89, 0.5)',
            }}
          >
            {title}
          </div>

          {/* Green accent line */}
          <div
            style={{
              width: 120,
              height: 4,
              background: '#00A859',
              borderRadius: 2,
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              color: '#9CA3AF',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              maxWidth: 500,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            background: 'rgba(0, 168, 89, 0.15)',
            borderRadius: 9999,
            border: '1px solid rgba(0, 168, 89, 0.3)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00A859',
            }}
          />
          <div
            style={{
              fontSize: 12,
              color: '#00A859',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            LIVE
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Togor & Tweed'
  const subtitle = searchParams.get('subtitle') ?? 'Wear the Story'
  const price = searchParams.get('price')
  const image = searchParams.get('image')

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Background product image (if provided) */}
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px 64px',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Brand name */}
          <div
            style={{
              fontSize: 18,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#c8a96e',
              marginBottom: 16,
            }}
          >
            TOGOR &amp; TWEED
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 40 ? 44 : 56,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: price ? 20 : 8,
              maxWidth: 700,
            }}
          >
            {title}
          </div>

          {/* Price or subtitle */}
          {price ? (
            <div style={{ fontSize: 28, color: '#c8a96e', fontWeight: 600 }}>
              {price}
            </div>
          ) : (
            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
              {subtitle}
            </div>
          )}

          {/* Gold line accent */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: '#c8a96e',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}

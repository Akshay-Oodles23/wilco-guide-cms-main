// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import { ImageResponse } from 'next/og'
import { getPayload } from 'payload'
import config from '@payload-config'
import { WILCO_SITE_ID } from '@/lib/site-config'
import type { Category } from '@/payload-types'

export const runtime = 'nodejs'
export const alt = 'WilCo Guide Article'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'articles',
    where: {
      slug: { equals: slug },
      site: { equals: Number(WILCO_SITE_ID) },
    },
    limit: 1,
    depth: 1,
  })

  const article = result.docs[0]
  const category = article ? (typeof article.category === 'object' ? article.category as Category : null) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'linear-gradient(135deg, #3589ff 0%, #2a6ecc 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            W
          </div>
          <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
            WilCo Guide
          </span>
        </div>

        {/* Center: Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {category && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.8)',
                }}
              />
              {category.name}
            </div>
          )}
          <div
            style={{
              fontSize: article && article.title.length > 80 ? '36px' : '44px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {article?.title || 'WilCo Guide — Williamson County News'}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
          wilcoguide.com
        </div>
      </div>
    ),
    { ...size }
  )
}

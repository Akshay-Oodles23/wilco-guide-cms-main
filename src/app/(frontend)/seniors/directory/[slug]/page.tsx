import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getBusinessBySlug,
  getRelatedBusinesses,
} from '@/lib/seniors/getBusinesses'
import { getCategoryBySlug } from '@/lib/seniors/getCategories'
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/lib/seniors/schema'
import { SITE_URL } from '@/lib/site-config'
import { Breadcrumb } from '@/components/seniors/Breadcrumb'
import { SchemaMarkup } from '@/components/seniors/SchemaMarkup'
import { NewsletterCTA } from '@/components/seniors/NewsletterCTA'
import { ReviewsList } from '@/components/seniors/ReviewsList'
import '../../seniors.css'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { getBusinesses } = await import('@/lib/seniors/getBusinesses')
  return getBusinesses().map((b: any) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = getBusinessBySlug(slug)
  if (!business) return {}
  return {
    title: `${business.name} | ${business.city}, TX`,
    description: business.shortDescription || `${business.name} in ${business.city}, TX.`,
    alternates: { canonical: `${SITE_URL}/seniors/directory/${business.slug}` },
  }
}

export default async function SeniorsBusinessPage({ params }: Props) {
  const { slug } = await params
  const business = getBusinessBySlug(slug)
  if (!business) notFound()

  const category = getCategoryBySlug(business.category)
  const related = getRelatedBusinesses(business, 4)

  const fullStars = Math.floor(business.rating || 0)
  const hasHalf = (business.rating || 0) - fullStars >= 0.5
  const starsStr = '★'.repeat(fullStars) + (hasHalf ? '☆' : '') + '☆'.repeat(Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0)))

  const priceActive = business.priceRange || '$$'
  const allPhotos = business.photos || []
  const uniquePhotos = allPhotos.length ? allPhotos.slice(0, 5) : []

  const businessSchema = generateLocalBusinessSchema(business)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Seniors', url: `${SITE_URL}/seniors` },
    { name: category ? category.name : business.category, url: `${SITE_URL}/seniors/${business.category}` },
    { name: business.name, url: `${SITE_URL}/seniors/directory/${business.slug}` },
  ])

  return (
    <>
      <SchemaMarkup schema={businessSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      <Breadcrumb
        items={[
          { label: 'Seniors', href: '/seniors' },
          { label: category ? category.name : business.category, href: `/seniors/${business.category}` },
          { label: business.name },
        ]}
      />
      <div className="profile-page">
        <div className="gallery-section">
          <div className={`gallery-grid${uniquePhotos.length <= 1 ? ' gallery-single' : ''}`}>
            {uniquePhotos.slice(0, 5).map((photo: string, i: number) => (
              <div key={i} className={`gallery-item${i === 0 ? ' gallery-hero' : ''}`}>
                <img src={photo} alt={`${business.name} photo ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="biz-header">
          <div className="biz-header-left">
            <div className="biz-verified">WilCo Seniors Approved</div>
            <h1 className="biz-name">{business.name}</h1>
            <div className="biz-meta">
              <span className="biz-category">{category ? category.name : business.category}</span>
              <span className="biz-price">{priceActive}</span>
              <span className="biz-location">📍 {business.city}, TX</span>
            </div>
            <div className="biz-rating-row">
              <span className="biz-stars">{starsStr}</span>
              <span className="biz-rating-num">{business.rating ?? 'N/A'}</span>
              <span className="biz-rating-count">({business.reviewCount ?? 0} reviews)</span>
            </div>
          </div>
          <div className="biz-header-actions">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="action-btn action-btn-primary">Call</a>
            )}
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="action-btn">Website</a>
            )}
          </div>
        </div>
        <div className="profile-content">
          <div className="profile-main">
            <div className="widget">
              <div className="widget-header"><h2 className="widget-title">About</h2></div>
              <div className="widget-body">
                <div className="about-text">
                  <p>{business.description || 'No description available.'}</p>
                </div>
              </div>
            </div>
            <ReviewsList
              reviews={business.reviews_list || []}
              rating={business.rating}
              reviewCount={business.reviewCount}
            />
          </div>
          <div className="profile-sidebar">
            <div className="widget">
              <div className="widget-header"><h2 className="widget-title">Info</h2></div>
              <div className="widget-body">
                {business.phone && (
                  <div className="info-row">
                    <div className="info-label">Phone</div>
                    <div className="info-value"><a href={`tel:${business.phone}`}>{business.phone}</a></div>
                  </div>
                )}
                {business.website && (
                  <div className="info-row">
                    <div className="info-label">Website</div>
                    <div className="info-value"><a href={business.website} target="_blank" rel="noopener noreferrer">{business.website.replace(/^https?:\/\//, '')}</a></div>
                  </div>
                )}
                {business.address && (
                  <div className="info-row">
                    <div className="info-label">Address</div>
                    <div className="info-value">{business.address}</div>
                  </div>
                )}
              </div>
            </div>
            <NewsletterCTA variant="sidebar" />
            {related.length > 0 && (
              <div className="widget">
                <div className="widget-header"><h2 className="widget-title">You Might Also Like</h2></div>
                <div className="widget-body">
                  {related.slice(0, 3).map((rb: any) => (
                    <Link key={rb.slug} href={`/seniors/directory/${rb.slug}`} className="sidebar-biz-card">
                      <div className="sidebar-biz-img">
                        <img src={rb.photos?.[0] || ''} alt={rb.name} />
                      </div>
                      <div className="sidebar-biz-info">
                        <div className="sidebar-biz-name">{rb.name}</div>
                        <div className="sidebar-biz-detail">{rb.categoryName || rb.category} · {rb.city}</div>
                        <div className="sidebar-biz-stars">★ {rb.rating ?? 'N/A'}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="claim-listing-cta" style={{ marginTop: 32, padding: 24, background: '#f7f8fa', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ marginBottom: 8 }}>Is this your business? Manage your listing and reach more seniors.</p>
          <Link href="/seniors/get-listed" className="seniors-btn-primary">Get Listed on WilCo Seniors →</Link>
        </div>
        {related.length > 0 && (
          <>
            <div className="section-header-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 16px' }}>
              <h2 className="section-title-full">Related in {business.city}</h2>
              <Link href={`/seniors/${business.category}`} className="section-see-all">See all →</Link>
            </div>
            <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {related.map((rb: any) => (
                <Link key={rb.slug} href={`/seniors/directory/${rb.slug}`} className="related-card">
                  <img src={rb.photos?.[0] || ''} alt={rb.name} />
                  <div className="related-overlay" />
                  <div className="related-info">
                    <div className="related-name">{rb.name}</div>
                    <div className="related-detail">{rb.categoryName || rb.category} · {rb.city}</div>
                    <div className="related-stars">★ {rb.rating ?? 'N/A'}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

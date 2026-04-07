import Link from 'next/link'
import Image from 'next/image'

const categoryColors: Record<string, string> = {
  'in-home-care': '#3589ff',
  'memory-care': '#3589ff',
  'primary-care': '#3589ff',
  'physical-therapy': '#3589ff',
  'hearing-vision': '#3589ff',
  'dental': '#3589ff',
  'mental-health': '#3589ff',
  'pharmacy': '#3589ff',
  'hospice': '#3589ff',
  'senior-living': '#eb7b1c',
  'estate-planning': '#8b5cf6',
  'financial-advisors': '#8b5cf6',
  'medicare': '#8b5cf6',
  'elder-law': '#8b5cf6',
  'tax-preparation': '#8b5cf6',
  'reverse-mortgage': '#8b5cf6',
  'pickleball': '#10b981',
  'fitness': '#10b981',
  'golf': '#10b981',
  'swimming': '#10b981',
  'walking': '#10b981',
  'dance': '#10b981',
  'yoga': '#10b981',
  'home-modification': '#f59e0b',
  'lawn-care': '#f59e0b',
  'handyman': '#f59e0b',
  'house-cleaning': '#f59e0b',
  'senior-centers': '#ec4899',
  'volunteer': '#ec4899',
  'religious': '#ec4899',
  'transportation': '#ef4444',
  'restaurants': '#ec4899',
}

export function getCategoryColor(slug: string) {
  return categoryColors[slug] || '#3589ff'
}

function renderStars(rating: number) {
  const full = Math.floor(rating)
  const empty = 5 - full
  return '\u2605'.repeat(full) + '\u2606'.repeat(empty)
}

interface BusinessCardProps {
  business: {
    name: string
    slug: string
    category: string
    city?: string
    rating?: number
    reviewCount?: number
    photos?: string[]
    tags?: string[]
    categoryName?: string
  }
  variant?: 'default' | 'hero'
}

export function BusinessCard({ business, variant = 'default' }: BusinessCardProps) {
  const { name, slug, category, city, rating, reviewCount, photos, tags } = business
  const photoUrl = photos?.length ? photos[0] : null
  const catColor = getCategoryColor(category)
  const catName = business.categoryName || category

  return (
    <Link href={`/seniors/directory/${slug}`} className={`biz-card row-card${variant === 'hero' ? ' hero' : ''}`}>
      <div className="card-media">
        {photoUrl && (
          <img src={photoUrl} alt={name} />
        )}
      </div>
      <div className="card-overlay" />
      {tags && tags.length > 0 && (
        <div className="card-tags">
          {tags.includes('Active Deal') && <span className="tag tag-deal">Active Deal</span>}
          {tags.includes('Hiring') && <span className="tag tag-hiring">Hiring</span>}
          {tags.includes('New') && <span className="tag tag-new">New</span>}
          {tags.includes('Event') && <span className="tag tag-event">Event</span>}
          {tags.includes('Featured') && <span className="tag tag-featured">Featured</span>}
        </div>
      )}
      <div className="card-info">
        <div className="card-name">{name}</div>
        {city && <div className="card-location">{city}</div>}
        <div className="card-bottom-bar">
          {rating != null && (
            <div className="card-rating">
              <span className="stars">{renderStars(rating)}</span>
              {reviewCount != null && <span className="rating-count">({reviewCount})</span>}
            </div>
          )}
          <span className="card-cat-pill" style={{ backgroundColor: catColor }}>
            {catName}
          </span>
        </div>
      </div>
    </Link>
  )
}

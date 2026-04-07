import Link from 'next/link'
import { getCategoryColor } from './BusinessCard'

function renderStars(rating: number) {
  if (!rating) return ''
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.3 ? 1 : 0
  const empty = 5 - full - half
  return '\u2605'.repeat(full) + (half ? '\u2BEA' : '') + '\u2606'.repeat(empty)
}

interface ListingCardProps {
  business: any
}

export function ListingCard({ business }: ListingCardProps) {
  const { name, slug, category, city, rating, reviewCount, photos, shortDescription, tags } = business
  const photoUrl = photos?.length ? photos[0] : null
  const catName = business.categoryName || category
  const initials = name.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  const catColor = getCategoryColor(category)

  return (
    <Link href={`/seniors/directory/${slug}`} className="listing-card">
      <div className="listing-card-photo">
        {photoUrl ? (
          <img src={photoUrl} alt={name} />
        ) : (
          <div className="listing-card-initials" style={{ backgroundColor: catColor }}>
            {initials}
          </div>
        )}
      </div>
      <div className="listing-card-info">
        <h3 className="listing-card-name">{name}</h3>
        <div className="listing-card-meta">{catName} · {city}</div>
        {rating != null && (
          <div className="listing-card-rating">
            <span className="listing-card-stars">{renderStars(rating)}</span>
            <span className="listing-card-rating-num">{rating}</span>
            {reviewCount != null && <span className="listing-card-review-count">({reviewCount} reviews)</span>}
          </div>
        )}
        {shortDescription && <p className="listing-card-desc">{shortDescription}</p>}
        {tags?.length > 0 && (
          <div className="listing-card-tags">
            {tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="listing-card-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

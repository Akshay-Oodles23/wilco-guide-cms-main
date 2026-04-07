'use client'

import { useState } from 'react'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    const parts = dateStr.split(' ')[0]
    if (parts.includes('/')) {
      const [month, day, year] = parts.split('/')
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {}
  return dateStr
}

interface ReviewsListProps {
  reviews: { author?: string; date?: string; rating?: number; text?: string }[]
  rating?: number
  reviewCount?: number
}

export function ReviewsList({ reviews, rating, reviewCount }: ReviewsListProps) {
  const [showAll, setShowAll] = useState(false)

  if (!reviews?.length) return null

  const fullStars = Math.floor(rating || 0)
  const hasHalf = (rating || 0) - fullStars >= 0.5
  const starsStr = '★'.repeat(fullStars) + (hasHalf ? '☆' : '') + '☆'.repeat(Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0)))

  const initialCount = 5
  const displayedReviews = showAll ? reviews : reviews.slice(0, initialCount)
  const hasMore = reviews.length > initialCount

  return (
    <div className="widget">
      <div className="widget-header"><h2 className="widget-title">Reviews</h2></div>
      <div className="widget-body">
        <div className="reviews-summary">
          <div className="reviews-big-num">{rating ?? 'N/A'}</div>
          <div>
            <div className="reviews-stars-big">{starsStr}</div>
            <div className="reviews-count-text">Based on {reviewCount ?? 0} reviews</div>
          </div>
        </div>
        <div className="reviews-list">
          {displayedReviews.map((review, i) => (
            <div key={i} className="review-card">
              <div className="review-header">
                <div className="review-author-info">
                  <div className="review-avatar">
                    {review.author ? review.author.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="review-author">{review.author || 'Anonymous'}</div>
                    <div className="review-date">{formatDate(review.date || '')}</div>
                  </div>
                </div>
                <span className="review-stars">
                  {'★'.repeat(Math.floor(review.rating || 0))}
                  {'☆'.repeat(5 - Math.floor(review.rating || 0))}
                </span>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
          {hasMore && !showAll && (
            <button type="button" className="reviews-view-more" onClick={() => setShowAll(true)}>
              View {reviews.length - initialCount} More Review{reviews.length - initialCount > 1 ? 's' : ''}
            </button>
          )}
          {showAll && hasMore && (
            <button type="button" className="reviews-view-more" onClick={() => setShowAll(false)}>Show Less</button>
          )}
        </div>
      </div>
    </div>
  )
}

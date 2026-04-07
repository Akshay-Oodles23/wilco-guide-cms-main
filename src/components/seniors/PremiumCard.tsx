'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getCategoryColor } from './BusinessCard'

function renderStars(rating: number) {
  const full = Math.floor(rating)
  const empty = 5 - full
  return '\u2605'.repeat(full) + '\u2606'.repeat(empty)
}

interface PremiumCardProps {
  businesses: any[]
  cycleSpeed?: number
}

export function PremiumCard({ businesses, cycleSpeed = 5000 }: PremiumCardProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % businesses.length)
  }, [businesses.length])

  useEffect(() => {
    if (businesses.length <= 1) return
    const interval = setInterval(advance, cycleSpeed)
    return () => clearInterval(interval)
  }, [advance, cycleSpeed, businesses.length])

  if (!businesses?.length) return null

  return (
    <div className="card-premium">
      {businesses.map((biz, index) => {
        const photoUrl = biz.photos?.length ? biz.photos[0] : null
        const catColor = getCategoryColor(biz.category)
        const catName = biz.categoryName || biz.category
        return (
          <Link
            key={biz.slug}
            href={`/seniors/directory/${biz.slug}`}
            className={`card-content-set${index === activeIndex ? ' active' : ''}`}
          >
            <div className="card-media">
              {photoUrl && <img src={photoUrl} alt={biz.name} />}
            </div>
            <div className="card-overlay" />
            {biz.tags?.length > 0 && (
              <div className="card-tags">
                {biz.tags.includes('Active Deal') && <span className="tag tag-deal">Active Deal</span>}
                {biz.tags.includes('Hiring') && <span className="tag tag-hiring">Hiring</span>}
                {biz.tags.includes('New') && <span className="tag tag-new">New</span>}
                {biz.tags.includes('Event') && <span className="tag tag-event">Event</span>}
                {biz.tags.includes('Featured') && <span className="tag tag-featured">Featured</span>}
              </div>
            )}
            <div className="card-info">
              <div className="card-name">{biz.name}</div>
              {biz.city && <div className="card-location">{biz.city}</div>}
              <div className="card-bottom-bar">
                {biz.rating != null && (
                  <div className="card-rating">
                    <span className="stars">{renderStars(biz.rating)}</span>
                    {biz.reviewCount != null && <span className="rating-count">({biz.reviewCount})</span>}
                  </div>
                )}
                <span className="card-cat-pill" style={{ backgroundColor: catColor }}>
                  {catName}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
      {businesses.length > 1 && (
        <div className="auto-scroll-indicator">
          {businesses.map((_, index) => (
            <span key={index} className={`scroll-pip${index === activeIndex ? ' active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  )
}

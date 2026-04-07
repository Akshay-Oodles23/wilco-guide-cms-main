'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

const trendingItems = [
  'Pickleball Courts',
  'Medicare Advisors',
  'In-Home Care',
  'Senior Living',
  'Estate Planning',
  'Physical Therapy',
  'Senior Fitness',
  'Hearing Care',
  'Financial Advisors',
  'Yoga Classes',
  'Golf Courses',
  'Walking Groups',
]

export function TrendingBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })
  }

  function handleChipClick(term: string) {
    router.push(`/seniors/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <div className="trending-bar">
      <div className="trending-label">
        <span className="pulse" />
        Trending
      </div>
      <button type="button" className="trending-scroll-btn" onClick={scrollLeft} aria-label="Scroll left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="trending-items-wrap">
        <div className="trending-items" ref={scrollRef}>
          {trendingItems.map((item) => (
            <span key={item} className="trending-chip" onClick={() => handleChipClick(item)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleChipClick(item)}>
              {item}
            </span>
          ))}
        </div>
      </div>
      <button type="button" className="trending-scroll-btn" onClick={scrollRight} aria-label="Scroll right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}

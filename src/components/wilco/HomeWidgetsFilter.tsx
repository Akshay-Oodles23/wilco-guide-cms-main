'use client'

import { useState } from 'react'
import Link from 'next/link'

interface WidgetBusiness {
  id: number
  name: string
  slug: string
  category: string
  location: string
  image: string | null
  rating: number | null
  type: string
  dealText: string | null
}

export function HomeWidgetsFilter({ businesses }: { businesses: WidgetBusiness[] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  // Determine which businesses match the active filter
  const filtered = businesses.filter((b) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'business') return b.type === 'business' || !b.dealText
    if (activeFilter === 'deal') return !!b.dealText
    if (activeFilter === 'restaurant') {
      const cat = b.category.toLowerCase()
      return cat.includes('food') || cat.includes('restaurant') || cat.includes('dining')
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const page = Math.min(currentPage, totalPages)
  const visible = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // If we have fewer than 4 businesses from CMS, show static placeholders
  const showStatic = businesses.length < 4

  const handleFilter = (filter: string) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleNext = () => {
    setCurrentPage((prev) => (prev >= totalPages ? 1 : prev + 1))
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'business', label: 'Businesses' },
    { key: 'deal', label: 'Deals' },
    { key: 'restaurant', label: 'Restaurants' },
  ]

  return (
    <div className="widgets-area">
      <div className="filter-row">
        <div className="filter-buttons">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`filter-btn${activeFilter === f.key ? ' active' : ''}`}
              onClick={() => handleFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="filter-arrow" onClick={handleNext} title="See more">
          →
        </button>
      </div>
      <div className="widgets-grid">
        {showStatic ? (
          /* Static placeholder cards matching the HTML design */
          <>
            <div className="fw-card">
              <div className="fw-img">
                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80" alt="Rosalie's Italian" />
              </div>
              <div className="fw-body">
                <div className="fw-name">Rosalie&apos;s Italian</div>
                <div className="fw-sub">Restaurant · Cedar Park · ★ 4.8</div>
              </div>
            </div>
            <div className="fw-card deal">
              <div className="fw-img">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80" alt="CrossFit Leander" />
                <div className="fw-badge">20% OFF</div>
              </div>
              <div className="fw-body">
                <div className="fw-name">CrossFit Leander</div>
                <div className="fw-sub">20% Off First Month</div>
              </div>
            </div>
            <div className="fw-card">
              <div className="fw-img">
                <img src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&q=80" alt="Jane's Hair Studio" />
              </div>
              <div className="fw-body">
                <div className="fw-name">Jane&apos;s Hair Studio</div>
                <div className="fw-sub">Salon · Leander · ★ 4.9</div>
              </div>
            </div>
            <div className="fw-card deal">
              <div className="fw-img">
                <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80" alt="Luigi's Pizzeria" />
                <div className="fw-badge">BOGO</div>
              </div>
              <div className="fw-body">
                <div className="fw-name">Luigi&apos;s Pizzeria</div>
                <div className="fw-sub">Buy 1 Entrée Get 1 Free</div>
              </div>
            </div>
          </>
        ) : (
          /* Dynamic cards from CMS */
          visible.map((b) => (
            <Link
              href={`/directory/${b.slug}`}
              key={b.id}
              className={`fw-card${b.dealText ? ' deal' : ''}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="fw-img">
                {b.image ? (
                  <img src={b.image} alt={b.name} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}>
                    {b.name.charAt(0)}
                  </div>
                )}
                {b.dealText && <div className="fw-badge">{b.dealText}</div>}
              </div>
              <div className="fw-body">
                <div className="fw-name">{b.name}</div>
                <div className="fw-sub">
                  {b.category} · {b.location}
                  {b.rating && ` · ★ ${b.rating}`}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

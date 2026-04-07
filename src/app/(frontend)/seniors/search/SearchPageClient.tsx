'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ListingCard } from '@/components/seniors/ListingCard'
import { NewsletterCTA } from '@/components/seniors/NewsletterCTA'
import '../seniors.css'

interface SearchPageClientProps {
  businesses: any[]
  guides: any[]
}

export default function SearchPageClient({ businesses, guides }: SearchPageClientProps) {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState('all')

  const results = useMemo(() => {
    if (!query.trim()) return { businesses: [], guides: [] }
    const q = query.toLowerCase()
    return {
      businesses: businesses.filter(
        (b: any) =>
          b.name.toLowerCase().includes(q) ||
          (b.shortDescription || '').toLowerCase().includes(q) ||
          (b.description || '').toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q)
      ),
      guides: guides.filter(
        (g: any) =>
          g.title?.toLowerCase().includes(q) ||
          (g.excerpt || '').toLowerCase().includes(q)
      ),
    }
  }, [query, businesses, guides])

  const totalCount = results.businesses.length + results.guides.length

  return (
    <div className="search-page" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px 64px' }}>
      <div style={{ padding: '16px 0 24px' }}>
        <input
          type="search"
          placeholder="Search businesses and guides..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', maxWidth: 480, padding: '12px 16px', fontSize: 16, border: '1.5px solid #e8e8ef', borderRadius: 10, outline: 'none' }}
        />
      </div>
      <div className="results-header" style={{ padding: '28px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="results-query" style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700 }}>
          {query ? (
            <>Results for <span style={{ color: '#3589ff' }}>&quot;{query}&quot;</span></>
          ) : (
            'Search the directory'
          )}
        </div>
        {query && <div className="results-count" style={{ fontSize: 14, color: '#8e8ea0' }}>{totalCount} results</div>}
      </div>
      <div className="type-tabs" style={{ display: 'flex', gap: 5, marginBottom: 24, borderBottom: '2px solid #e8e8ef', paddingBottom: 0 }}>
        <button type="button" className={`type-tab${activeTab === 'all' ? ' active' : ''}`} onClick={() => setActiveTab('all')} style={{ padding: '10px 18px', border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: activeTab === 'all' ? '#3589ff' : '#5a5a7a', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 }}>
          All <span className="tab-count">{totalCount}</span>
        </button>
        <button type="button" className={`type-tab${activeTab === 'businesses' ? ' active' : ''}`} onClick={() => setActiveTab('businesses')} style={{ padding: '10px 18px', border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: activeTab === 'businesses' ? '#3589ff' : '#5a5a7a', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 }}>
          Businesses <span className="tab-count">{results.businesses.length}</span>
        </button>
        <button type="button" className={`type-tab${activeTab === 'guides' ? ' active' : ''}`} onClick={() => setActiveTab('guides')} style={{ padding: '10px 18px', border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: activeTab === 'guides' ? '#3589ff' : '#5a5a7a', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 }}>
          Resources <span className="tab-count">{results.guides.length}</span>
        </button>
      </div>
      <div className="results-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28 }}>
        <div className="results-main" style={{ minWidth: 0 }}>
          {(activeTab === 'all' || activeTab === 'businesses') && results.businesses.map((b: any) => (
            <ListingCard key={b.slug} business={b} />
          ))}
          {(activeTab === 'all' || activeTab === 'guides') && results.guides.map((g: any) => (
            <Link key={g.slug} href={`/seniors/guides/${g.slug}`} style={{ display: 'flex', gap: 16, background: '#fff', border: '1.5px solid #e8e8ef', borderRadius: 12, padding: 18, marginBottom: 14, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: 120, height: 90, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <img src={g.heroImage} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: '#5a5a7a', marginBottom: 6 }}>{g.excerpt}</div>
                <div style={{ fontSize: 12, color: '#8e8ea0' }}>{g.publishDate} · {g.readTime}</div>
              </div>
            </Link>
          ))}
          {query && totalCount === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#8e8ea0' }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No results found for &quot;{query}&quot;</p>
              <p style={{ fontSize: 14 }}>Try a different search term or browse our categories.</p>
            </div>
          )}
        </div>
        <div className="sidebar">
          <NewsletterCTA variant="sidebar" />
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { getRelocationHub } from '@/lib/seniors/getRelocation'
import { getRelocationCities } from '@/lib/seniors/getRelocation'
import { SITE_URL } from '@/lib/site-config'
import { Breadcrumb } from '@/components/seniors/Breadcrumb'
import { NewsletterCTA } from '@/components/seniors/NewsletterCTA'
import { CTABanner } from '@/components/seniors/CTABanner'
import '../seniors.css'

export const metadata: Metadata = {
  title: 'Retiring to Williamson County, TX | Your Complete Relocation Guide',
  description: 'Comprehensive guide to retiring in Williamson County, TX. Explore cost of living, healthcare, 55+ communities, tax benefits, and city-by-city comparisons.',
  alternates: { canonical: `${SITE_URL}/seniors/relocating` },
}

export default function RelocatingPage() {
  const hub = getRelocationHub()
  const cities = getRelocationCities()

  return (
    <div className="directory-page">
      <Breadcrumb items={[{ label: 'Seniors', href: '/seniors' }, { label: 'Relocating' }]} />
      <div className="directory-hero">
        <h1 className="directory-hero-title">{hub?.heroHeadline || 'Thinking About Retiring to Williamson County?'}</h1>
        <p className="directory-hero-subtitle">{hub?.heroSubtext || 'Everything you need to know about relocating to one of Texas\'s fastest-growing and most livable counties.'}</p>
      </div>
      {hub?.sections?.length > 0 && (
        <div style={{ marginTop: 40 }}>
          {hub.sections.map((section: any) => (
            <div key={section.id} style={{ marginBottom: 36, padding: 24, background: '#fff', border: '1px solid #e8e8ef', borderRadius: 16 }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{section.icon} {section.title}</h2>
              <div style={{ fontSize: 15, lineHeight: 1.75, color: '#5a5a7a', whiteSpace: 'pre-line' }}>{section.content}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 40, marginBottom: 24 }}>
        <h2 className="content-break-title">Cities in Williamson County</h2>
        <div className="relocation-city-grid">
          {cities.map((city: any) => (
            <Link key={city.slug} href={`/seniors/relocating/${city.slug}`} className="relocation-city-card">
              <h3 className="relocation-city-name">{city.name}</h3>
              {city.highlights?.[0] && <span className="relocation-city-highlight">{city.highlights[0]}</span>}
            </Link>
          ))}
        </div>
      </div>
      <NewsletterCTA variant="inline" />
      <CTABanner />
    </div>
  )
}

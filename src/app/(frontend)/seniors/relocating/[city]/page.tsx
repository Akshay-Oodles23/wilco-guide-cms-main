import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRelocationCity } from '@/lib/seniors/getRelocation'
import { Breadcrumb } from '@/components/seniors/Breadcrumb'
import { NewsletterCTA } from '@/components/seniors/NewsletterCTA'
import { CTABanner } from '@/components/seniors/CTABanner'
import '../../seniors.css'

interface Props {
  params: Promise<{ city: string }>
}

export async function generateStaticParams() {
  const { getRelocationCitySlugs } = await import('@/lib/seniors/getRelocation')
  return getRelocationCitySlugs().map((slug) => ({ city: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const cityData = getRelocationCity(citySlug)
  if (!cityData) return {}
  const name = cityData.name || citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: `Retiring in ${name}, TX | Williamson County Relocation Guide`,
    description: cityData.metaDescription || `Guide to retiring in ${name}, TX. Housing, healthcare, things to do, and more.`,
  }
}

export default async function RelocatingCityPage({ params }: Props) {
  const { city: citySlug } = await params
  const cityData = getRelocationCity(citySlug)
  if (!cityData) notFound()

  const name = cityData.name || citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="directory-page">
      <Breadcrumb
        items={[
          { label: 'Seniors', href: '/seniors' },
          { label: 'Relocating', href: '/seniors/relocating' },
          { label: name },
        ]}
      />
      <div className="directory-hero">
        <h1 className="directory-hero-title">Retiring in {name}, TX</h1>
        {(cityData as any).heroSubtext && <p className="directory-hero-subtitle">{(cityData as any).heroSubtext}</p>}
      </div>
      {cityData.content && (
        <div style={{ marginTop: 40, padding: 24, background: '#fff', border: '1px solid #e8e8ef', borderRadius: 16 }}>
          <div style={{ fontSize: 15, lineHeight: 1.75, color: '#5a5a7a', whiteSpace: 'pre-line' }}>{cityData.content}</div>
        </div>
      )}
      {cityData.highlights?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Highlights</h2>
          <ul style={{ paddingLeft: 20, color: '#5a5a7a', lineHeight: 1.8 }}>
            {cityData.highlights.map((h: string, i: number) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ marginTop: 32, padding: 24, background: '#f0f4ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Senior services in {name}</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#5a5a7a' }}>Browse businesses and resources for seniors in {name}.</p>
        </div>
        <Link href={`/seniors/${citySlug}`} className="seniors-btn-primary">View Directory →</Link>
      </div>
      <NewsletterCTA variant="inline" />
      <CTABanner />
    </div>
  )
}

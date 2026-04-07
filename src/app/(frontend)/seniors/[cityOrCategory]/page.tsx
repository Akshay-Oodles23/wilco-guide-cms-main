import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategories, getCategoryBySlug } from '@/lib/seniors/getCategories'
import { getCityBySlug } from '@/lib/seniors/getCities'
import {
  getBusinesses,
  getBusinessesByCategory,
  getBusinessesByCity,
} from '@/lib/seniors/getBusinesses'
import { getFAQsByCategory } from '@/lib/seniors/getFAQs'
import { generateCollectionPageSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seniors/schema'
import { SITE_URL } from '@/lib/site-config'
import { BusinessCard } from '@/components/seniors/BusinessCard'
import { ListingCard } from '@/components/seniors/ListingCard'
import { FAQSection } from '@/components/seniors/FAQSection'
import { NewsletterCTA } from '@/components/seniors/NewsletterCTA'
import { CTABanner } from '@/components/seniors/CTABanner'
import { Breadcrumb } from '@/components/seniors/Breadcrumb'
import { SchemaMarkup } from '@/components/seniors/SchemaMarkup'
import '../../seniors.css'

interface Props {
  params: Promise<{ cityOrCategory: string }>
}

export async function generateStaticParams() {
  const { getCategories } = await import('@/lib/seniors/getCategories')
  const { getCities } = await import('@/lib/seniors/getCities')
  const categories = getCategories()
  const cities = getCities()
  const { getBusinesses } = await import('@/lib/seniors/getBusinesses')
  const allBusinesses = getBusinesses()
  const categorySlugsWithBusinesses = new Set(allBusinesses.map((b: any) => b.category))
  const nonEmptyCategories = categories.filter((c: any) => categorySlugsWithBusinesses.has(c.slug))
  return [
    ...nonEmptyCategories.map((c: any) => ({ cityOrCategory: c.slug })),
    ...cities.map((c: any) => ({ cityOrCategory: c.slug })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cityOrCategory } = await params
  const category = getCategoryBySlug(cityOrCategory)
  if (category) {
    return {
      title: (category.seoTitle || `${category.name} for Seniors in Williamson County`).replace(/\s*\|\s*WilCo Seniors\s*$/, ''),
      description: category.metaDescription || `Find ${category.name.toLowerCase()} for seniors in Williamson County, TX.`,
      alternates: { canonical: `${SITE_URL}/seniors/${category.slug}` },
    }
  }
  const city = getCityBySlug(cityOrCategory)
  if (city) {
    return {
      title: (city.seoTitle || `Senior Services in ${city.name}, TX`).replace(/\s*\|\s*WilCo Seniors\s*$/, ''),
      description: city.metaDescription || `Find senior services and resources in ${city.name}, TX.`,
      alternates: { canonical: `${SITE_URL}/seniors/${city.slug}` },
    }
  }
  return {}
}

export default async function CityOrCategoryPage({ params }: Props) {
  const { cityOrCategory } = await params
  const category = getCategoryBySlug(cityOrCategory)
  const city = getCityBySlug(cityOrCategory)

  if (category) {
    return <CategoryPageContent category={category} />
  }
  if (city) {
    return <CityPageContent city={city} />
  }
  notFound()
}

function CategoryPageContent({ category }: { category: any }) {
  const businesses = getBusinessesByCategory(category.slug)
  const categories = getCategories()
  const faqs = getFAQsByCategory(category.slug)
  const relatedCategories = (category.relatedCategories || [])
    .map((slug: string) => categories.find((c: any) => c.slug === slug))
    .filter(Boolean)

  const collectionSchema = generateCollectionPageSchema(
    `${category.name} for Seniors in Williamson County`,
    category.metaDescription || '',
    businesses.map((b: any, i: number) => ({ name: b.name, url: `${SITE_URL}/seniors/directory/${b.slug}` }))
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Seniors', url: `${SITE_URL}/seniors` },
    { name: category.name, url: `${SITE_URL}/seniors/${category.slug}` },
  ])
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null

  return (
    <>
      <SchemaMarkup schema={collectionSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      {faqSchema && <SchemaMarkup schema={faqSchema} />}
      <div className="directory-page">
        <Breadcrumb items={[{ label: 'Seniors', href: '/seniors' }, { label: category.name }]} />
        <div className="category-page-header">
          <h1 className="section-title" style={{ marginBottom: 8 }}>{category.name} for Seniors in Williamson County</h1>
          {category.shortDescription && <p className="category-intro">{category.shortDescription}</p>}
        </div>
        <div className="listing-grid">
          {businesses.map((b: any) => (
            <ListingCard key={b.slug} business={b} />
          ))}
        </div>
        {businesses.length === 0 && (
          <p style={{ textAlign: 'center', color: '#8e8ea0', padding: '40px 0' }}>No businesses listed in this category yet.</p>
        )}
        {category.slug === 'senior-living' && (
          <div style={{ marginBottom: 32, padding: 24, background: '#f0f4ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>🏡 Thinking about moving to Williamson County?</h3>
              <p style={{ margin: 0, fontSize: 14, color: '#5a5a7a' }}>Explore our complete relocation guide with 55+ communities and city comparisons.</p>
            </div>
            <Link href="/seniors/relocating" className="seniors-btn-primary">Relocation Guide →</Link>
          </div>
        )}
        <FAQSection faqs={faqs} />
        <NewsletterCTA variant="inline" />
        {relatedCategories.length > 0 && (
          <div className="related-categories">
            <h2 className="section-title" style={{ marginBottom: 16 }}>Related Categories</h2>
            {relatedCategories.map((rc: any) => (
              <Link key={rc.slug} href={`/seniors/${rc.slug}`} className="related-cat-link">
                {rc.icon} {rc.name}
              </Link>
            ))}
          </div>
        )}
        <CTABanner />
      </div>
    </>
  )
}

function CityPageContent({ city }: { city: any }) {
  const businesses = getBusinessesByCity(city.slug)
  const categories = getCategories()
  const byCategory: Record<string, any[]> = {}
  businesses.forEach((b: any) => {
    if (!byCategory[b.category]) byCategory[b.category] = []
    byCategory[b.category].push(b)
  })

  const collectionSchema = generateCollectionPageSchema(
    `Senior Services in ${city.name}, TX`,
    city.metaDescription || '',
    businesses.map((b: any) => ({ name: b.name, url: `${SITE_URL}/seniors/directory/${b.slug}` }))
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Seniors', url: `${SITE_URL}/seniors` },
    { name: city.name, url: `${SITE_URL}/seniors/${city.slug}` },
  ])

  return (
    <>
      <SchemaMarkup schema={collectionSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      <div className="directory-page">
        <Breadcrumb items={[{ label: 'Seniors', href: '/seniors' }, { label: city.name }]} />
        <div className="category-page-header">
          <h1 className="section-title" style={{ marginBottom: 8 }}>Senior Services in {city.name}, TX</h1>
          {city.description && <p className="category-intro">{city.description}</p>}
        </div>
        {Object.entries(byCategory).map(([catSlug, catBusinesses]) => {
          const cat = categories.find((c: any) => c.slug === catSlug)
          const catDisplayName = cat ? cat.name : (catBusinesses[0]?.categoryName || catSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()))
          return (
            <div key={catSlug} className="category-row">
              <div className="section-header">
                <div className="section-title-group">
                  <h2 className="section-title">{catDisplayName}</h2>
                  <span className="section-count">{catBusinesses.length} businesses</span>
                </div>
                <Link href={`/seniors/${catSlug}`} className="section-see-all">See all →</Link>
              </div>
              <div className="row-grid">
                {catBusinesses.slice(0, 4).map((b: any) => (
                  <BusinessCard key={b.slug} business={b} />
                ))}
              </div>
            </div>
          )
        })}
        {businesses.length === 0 && (
          <p style={{ textAlign: 'center', color: '#8e8ea0', padding: '40px 0' }}>No businesses listed in {city.name} yet.</p>
        )}
        <div style={{ marginTop: 32, padding: 24, background: '#f0f4ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>🏡 Relocating to {city.name}?</h3>
            <p style={{ margin: 0, fontSize: 14, color: '#5a5a7a' }}>Read our complete guide to retiring in {city.name}.</p>
          </div>
          <Link href={`/seniors/relocating/${city.slug}`} className="seniors-btn-primary">Relocation Guide →</Link>
        </div>
        <NewsletterCTA variant="inline" />
        <CTABanner />
      </div>
    </>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getGuideBySlug, getGuides } from '@/lib/seniors/getGuides'
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seniors/schema'
import { SITE_URL } from '@/lib/site-config'
import { Breadcrumb } from '@/components/seniors/Breadcrumb'
import { SchemaMarkup } from '@/components/seniors/SchemaMarkup'
import { NewsletterCTA } from '@/components/seniors/NewsletterCTA'
import '../../seniors.css'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const guides = getGuides()
  return guides.map((g: any) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}
  const title = (guide.seoTitle || guide.title || '').replace(/\s*\|\s*WilCo Seniors\s*$/, '')
  return {
    title: title || guide.title,
    description: guide.metaDescription || guide.excerpt,
    alternates: { canonical: `${SITE_URL}/seniors/guides/${guide.slug}` },
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const articleSchema = generateArticleSchema(guide)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Seniors', url: `${SITE_URL}/seniors` },
    { name: 'Guides', url: `${SITE_URL}/seniors` },
    { name: guide.title, url: `${SITE_URL}/seniors/guides/${guide.slug}` },
  ])

  let processedContent = guide.content || ''
  processedContent = processedContent.replace(/\[LINK:(\/seniors\/[^\]]+)\]/g, '$1')

  return (
    <>
      <SchemaMarkup schema={articleSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      <Breadcrumb
        items={[
          { label: 'Seniors', href: '/seniors' },
          { label: guide.categoryName || 'Guide', href: guide.category ? `/seniors/${guide.category}` : '/seniors' },
          { label: guide.title },
        ]}
      />
      <div className="guide-page" style={{ maxWidth: 760, margin: '0 auto', padding: '32px 32px 64px' }}>
        <article>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3589ff', marginBottom: 8 }}>{guide.categoryName || 'Guide'}</div>
            <h1 className="guide-title" style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{guide.title}</h1>
            <p style={{ fontSize: 18, color: '#5a5a7a', lineHeight: 1.6, marginBottom: 16 }}>{guide.excerpt}</p>
            <div style={{ fontSize: 13, color: '#8e8ea0', display: 'flex', gap: 16 }}>
              <span>{guide.publishDate}</span>
              <span>·</span>
              <span>{guide.readTime}</span>
            </div>
          </div>
          {guide.heroImage && (
            <div style={{ width: '100%', height: 360, borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
              <img src={guide.heroImage} alt={guide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div
            className="guide-content"
            style={{ fontSize: 16, lineHeight: 1.8, color: '#5a5a7a' }}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </article>
        <NewsletterCTA variant="inline" />
      </div>
    </>
  )
}

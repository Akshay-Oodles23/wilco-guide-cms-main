import { SITE_URL } from '@/lib/site-config'

export function generateLocalBusinessSchema(business: any) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: business.website || `${SITE_URL}/seniors/directory/${business.slug}`,
  }
  if (business.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: 'TX',
      addressCountry: 'US',
    }
  }
  if (business.phone) schema.telephone = business.phone
  if (business.hours && typeof business.hours === 'object') {
    schema.openingHoursSpecification = Object.entries(business.hours).map(([day, time]: [string, any]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      description: time,
    }))
  }
  if (business.rating != null) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.reviewCount || 0,
    }
  }
  if (business.photos?.length) schema.image = business.photos[0]
  return schema
}

export function generateCollectionPageSchema(title: string, description: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateArticleSchema(guide: any) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt || guide.metaDescription,
    url: `${SITE_URL}/seniors/guides/${guide.slug}`,
    datePublished: guide.publishDate,
    publisher: {
      '@type': 'Organization',
      name: 'WilCo Guide',
      url: SITE_URL,
    },
  }
  if (guide.heroImage) schema.image = guide.heroImage
  if (guide.readTime) schema.timeRequired = guide.readTime
  return schema
}

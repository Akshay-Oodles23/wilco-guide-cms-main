import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from './site-config'

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Williamson County',
      addressRegion: 'TX',
      addressCountry: 'US',
    },
  }
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateLocalBusinessSchema(business: {
  name: string
  description?: string
  category?: string
  address?: { street?: string; city?: string; state?: string; zip?: string }
  phone?: string
  website?: string
  email?: string
  googleRating?: number
  googleReviewCount?: number
  priceRange?: string
  hours?: Record<string, { open?: string; close?: string }>
  slug: string
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: `${SITE_URL}/directory/${business.slug}`,
  }

  if (business.description) schema.description = business.description
  if (business.phone) schema.telephone = business.phone
  if (business.website) schema.sameAs = [business.website]
  if (business.email) schema.email = business.email
  if (business.priceRange) schema.priceRange = business.priceRange

  if (business.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state || 'TX',
      postalCode: business.address.zip,
      addressCountry: 'US',
    }
  }

  if (business.googleRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.googleRating,
      reviewCount: business.googleReviewCount || 0,
      bestRating: 5,
    }
  }

  return schema
}

export function generateJobPostingSchema(job: {
  title: string
  company: string
  description?: string
  salary?: { min?: number; max?: number; type?: string }
  employmentType?: string
  location?: { city?: string; state?: string; remote?: boolean }
  applicationUrl?: string
  postedAt?: string
  expiresAt?: string
  slug: string
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    url: `${SITE_URL}/jobs/${job.slug}`,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    datePosted: job.postedAt || new Date().toISOString(),
  }

  if (job.description) schema.description = job.description
  if (job.expiresAt) schema.validThrough = job.expiresAt
  if (job.applicationUrl) schema.directApply = true

  if (job.employmentType) {
    const typeMap: Record<string, string> = {
      'full-time': 'FULL_TIME',
      'part-time': 'PART_TIME',
      'contract': 'CONTRACTOR',
      'internship': 'INTERN',
    }
    schema.employmentType = typeMap[job.employmentType] || 'FULL_TIME'
  }

  if (job.location) {
    if (job.location.remote) {
      schema.jobLocationType = 'TELECOMMUTE'
    }
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location.city,
        addressRegion: job.location.state || 'TX',
        addressCountry: 'US',
      },
    }
  }

  if (job.salary && (job.salary.min || job.salary.max)) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary.min,
        maxValue: job.salary.max,
        unitText: job.salary.type === 'hourly' ? 'HOUR' : 'YEAR',
      },
    }
  }

  return schema
}

export function generateNewsArticleSchema(article: {
  title: string
  excerpt?: string
  author?: string
  publishedAt?: string
  featuredImage?: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    url: `${SITE_URL}/news/${article.slug}`,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'WilCo Guide Staff',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    image: article.featuredImage || `${SITE_URL}/og-default.png`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/news/${article.slug}`,
    },
  }
}

export function generateItemListSchema(items: Array<{ name: string; url: string; position: number }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  }
}

export function generateBreadcrumbSchema(items: Array<{ name?: string; label?: string; url?: string; href?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name || item.label || '',
      item: item.url || item.href || '',
    })),
  }
}

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getBusinesses } from '@/lib/seniors/getBusinesses'
import { getGuides } from '@/lib/seniors/getGuides'
import { SITE_URL } from '@/lib/site-config'
import SearchPageClient from './SearchPageClient'
import '../seniors.css'

export const metadata: Metadata = {
  title: 'Search Senior Services',
  description: 'Search for senior services, healthcare, activities, and resources across Williamson County, TX.',
  alternates: { canonical: `${SITE_URL}/seniors/search` },
}

export default function SearchPage() {
  const businesses = getBusinesses()
  const guides = getGuides()
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <SearchPageClient businesses={businesses} guides={guides} />
    </Suspense>
  )
}

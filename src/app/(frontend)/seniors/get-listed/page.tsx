import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site-config'
import { Breadcrumb } from '@/components/seniors/Breadcrumb'
import '../seniors.css'

export const metadata: Metadata = {
  title: 'Get Listed | WilCo Seniors Directory',
  description: 'List your business on the WilCo Seniors directory and reach thousands of seniors and their families across Williamson County.',
  alternates: { canonical: `${SITE_URL}/seniors/get-listed` },
}

export default function GetListedPage() {
  return (
    <div className="directory-page">
      <Breadcrumb items={[{ label: 'Seniors', href: '/seniors' }, { label: 'Get Listed' }]} />
      <div className="directory-hero">
        <h1 className="directory-hero-title">Get Listed on WilCo Seniors</h1>
        <p className="directory-hero-subtitle">
          Join WilCo&apos;s fastest-growing directory for 55+ services. Reach thousands of seniors and their families across Williamson County, TX.
        </p>
      </div>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 24, background: '#fff', border: '1px solid #e8e8ef', borderRadius: 16 }}>
        <p style={{ marginBottom: 24, lineHeight: 1.7, color: '#5a5a7a' }}>
          Listing your business on WilCo Seniors puts you in front of families and seniors looking for in-home care, senior living, healthcare, legal and financial services, activities, and more.
        </p>
        <p style={{ marginBottom: 24, lineHeight: 1.7, color: '#5a5a7a' }}>
          Contact us to add your business or to nominate someone for our Community Spotlight.
        </p>
        <Link href="/seniors" className="seniors-btn-primary">Back to Seniors Directory</Link>
      </div>
    </div>
  )
}

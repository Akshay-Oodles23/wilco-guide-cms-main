import Link from 'next/link'

export function CTABanner() {
  return (
    <div className="cta-banner">
      <div className="cta-content">
        <h2 className="cta-title">Serve the senior community? Get listed.</h2>
        <p className="cta-desc">
          Join WilCo&apos;s fastest-growing directory for 55+ services. Reach thousands of seniors and their families across Williamson County.
        </p>
      </div>
      <Link href="/seniors/get-listed" className="cta-button">List Your Business</Link>
    </div>
  )
}

interface NewsletterCTAProps {
  variant?: 'sidebar' | 'inline'
}

export function NewsletterCTA({ variant = 'sidebar' }: NewsletterCTAProps) {
  if (variant === 'sidebar') {
    return (
      <div className="newsletter-sidebar">
        <h3 className="ns-title">Stay connected to senior life in WilCo</h3>
        <p className="ns-sub">
          Join 15,000+ Williamson County residents getting weekly updates on local services, events, and deals.
        </p>
        <a
          href="https://www.wilcoseniors.com/subscribe"
          target="_blank"
          rel="noopener noreferrer"
          className="ns-btn"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          Get the Free Weekly Newsletter
        </a>
      </div>
    )
  }

  return (
    <div className="newsletter-sidebar" style={{ borderRadius: '16px', marginTop: '32px' }}>
      <h3 className="ns-title" style={{ fontSize: '22px' }}>
        Stay connected to senior life in WilCo
      </h3>
      <p className="ns-sub" style={{ fontSize: '14px', maxWidth: '480px' }}>
        Join 15,000+ Williamson County residents getting weekly updates on local services, events, and deals.
      </p>
      <a
        href="https://www.wilcoseniors.com/subscribe"
        target="_blank"
        rel="noopener noreferrer"
        className="ns-btn"
        style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', padding: '12px 32px', whiteSpace: 'nowrap' }}
      >
        Get the Free Weekly Newsletter
      </a>
    </div>
  )
}

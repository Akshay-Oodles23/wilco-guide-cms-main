// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import '@/styles/business-detail.css';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Helper functions
function getImageUrl(image: any): string {
  if (!image) return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80';
  if (typeof image === 'string') return image;
  if (image.url) return image.url;
  if (image.filename) return `/uploads/${image.filename}`;
  return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80';
}

function getLocationName(location: any): string {
  if (!location) return 'Location, TX';
  if (typeof location === 'string') return location;
  if (location.city && location.state) return `${location.city}, ${location.state}`;
  if (location.city) return location.city;
  return 'Location, TX';
}

function generateStarRating(rating: number = 4.8): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '☆';
  stars += '☆'.repeat(5 - Math.ceil(rating));
  return stars;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const payload = await getPayload({ config });
    const business = await payload.find({
      collection: 'businesses',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    });

    if (business.docs.length === 0) {
      return {
        title: 'Business Not Found — WilCo Guide Directory',
      };
    }

    const biz = business.docs[0];
    return {
      title: `${biz.name || 'Business'} — WilCo Guide Directory`,
      description: biz.description || 'Explore this business on WilCo Guide Directory',
    };
  } catch (error) {
    return {
      title: 'Business — WilCo Guide Directory',
    };
  }
}

export default async function BusinessDetailPage({ params }: Props) {
  const { slug } = await params;
  let business: any = null;
  let error: string | null = null;

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'businesses',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    });

    if (result.docs.length > 0) {
      business = result.docs[0];
    }
  } catch (err) {
    console.error('Error fetching business:', err);
    error = 'Failed to load business';
  }

  // Use CMS data or fallback to placeholders
  const bizName = business?.name || 'Rosalie\'s Kitchen & Bar';
  const bizCategory = business?.category || 'Italian Restaurant';
  const bizDescription = business?.description || 'Rosalie\'s Kitchen & Bar has been a cornerstone of Leander\'s dining scene since 2019. Founded by chef Rosalie Marchetti, the restaurant brings authentic Italian flavors to Williamson County with a modern Texas twist.\n\nEvery pasta is made in-house daily, and the wood-fired pizza oven was custom-built by artisans from Naples. The bar program features craft cocktails alongside a curated wine list focused on Italian varietals and Texas wineries.\n\nWhether you\'re celebrating a special occasion or grabbing a casual weeknight dinner, Rosalie\'s offers warm hospitality, exceptional food, and a vibrant atmosphere that keeps locals coming back week after week.';
  const bizLocation = getLocationName(business?.location) || 'Leander, TX';
  const bizRating = business?.rating || 4.8;
  const bizReviewCount = business?.reviewCount || 312;
  const bizImage = getImageUrl(business?.images?.[0]);
  const bizPhone = business?.phone || '(512) 555-1234';
  const bizWebsite = business?.website || 'rosalieskitchen.com';
  const bizAddress = business?.address || '1847 Crystal Falls Pkwy';

  const descriptionParagraphs = bizDescription.split('\n\n').filter((p: string) => p.trim());

  return (
    <>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/directory">Directory</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/directory">{bizCategory}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{bizName}</span>
      </div>

      <div className="profile-page">
        {/* GALLERY */}
        <div className="gallery-section">
          <div className="gallery-tabs">
            <button className="gallery-tab active">All</button>
            <button className="gallery-tab">Photos</button>
            <button className="gallery-tab">Videos</button>
          </div>
          <div className="gallery-grid">
            <div className="gallery-item gallery-hero">
              <img src={bizImage} alt={bizName} />
              <div className="gallery-video-badge">▶ Video Tour</div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80" alt="" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80" alt="" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80" alt="" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80" alt="" />
              <div className="gallery-count">+12 more</div>
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="biz-header">
          <div className="biz-header-left">
            <div className="biz-verified">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              WilCo Guide Approved
            </div>
            <h1 className="biz-name">{bizName}</h1>
            <div className="biz-meta">
              <span className="biz-category">{bizCategory}</span>
              <span className="biz-price">$$ <span className="biz-price-muted">$$</span></span>
              <span className="biz-location">📍 {bizLocation}</span>
            </div>
            <div className="biz-rating-row">
              <span className="biz-stars">{generateStarRating(bizRating)}</span>
              <span className="biz-rating-num">{bizRating}</span>
              <span className="biz-rating-count">({bizReviewCount} reviews)</span>
            </div>
            <div className="biz-tags-row">
              <span className="biz-tag biz-tag-deal">15% Off Pasta</span>
              <span className="biz-tag biz-tag-hiring">Hiring 2 Roles</span>
              <span className="biz-tag biz-tag-event">Live Music Fridays</span>
            </div>
          </div>
          <div className="biz-header-actions">
            <button className="action-btn action-btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
              </svg>
              Call
            </button>
            <button className="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Website
            </button>
            <button className="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Directions
            </button>
            <button className="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* DEAL BANNER */}
        <div className="highlight-banner deal">
          <div className="banner-content">
            <div className="banner-label">Limited Time Offer</div>
            <div className="banner-title">15% Off All Pasta Dishes</div>
            <div className="banner-detail">Valid through March 15, 2026 • Dine-in only</div>
          </div>
          <button className="banner-btn">Claim This Deal</button>
        </div>

        {/* JOBS INLINE (Only shows if business has active jobs) */}
        <div className="jobs-inline">
          <div className="jobs-inline-header">
            <div className="jobs-inline-icon">💼</div>
            <div>
              <div className="jobs-inline-title">Now Hiring</div>
              <div className="jobs-inline-count">2 open positions</div>
            </div>
          </div>
          <div className="jobs-inline-list">
            <div className="jobs-inline-card">
              <div className="jobs-inline-role">Line Cook</div>
              <div className="jobs-inline-detail">Full-time • $18-22/hr</div>
              <button className="jobs-inline-apply">Apply Now</button>
            </div>
            <div className="jobs-inline-card">
              <div className="jobs-inline-role">Server</div>
              <div className="jobs-inline-detail">Part-time • $12/hr + tips</div>
              <button className="jobs-inline-apply">Apply Now</button>
            </div>
          </div>
        </div>

        {/* TWO COLUMNS */}
        <div className="profile-content">
          {/* MAIN */}
          <div className="profile-main">
            {/* ABOUT */}
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">About</h2>
              </div>
              <div className="widget-body">
                <div className="about-text">
                  {descriptionParagraphs.map((paragraph: string, idx: number) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* POPULAR ITEMS */}
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">Popular Items</h2>
              </div>
              <div className="widget-body">
                <div className="menu-item">
                  <div className="menu-item-img">
                    <img src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200&q=80" alt="" />
                  </div>
                  <div className="menu-item-info">
                    <div className="menu-item-name">Handmade Pappardelle</div>
                    <div className="menu-item-desc">Wild boar ragu, pecorino, fresh herbs</div>
                  </div>
                  <div className="menu-item-price">$24</div>
                </div>
                <div className="menu-item">
                  <div className="menu-item-img">
                    <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80" alt="" />
                  </div>
                  <div className="menu-item-info">
                    <div className="menu-item-name">Margherita Pizza</div>
                    <div className="menu-item-desc">San Marzano, fresh mozzarella, basil, wood-fired</div>
                  </div>
                  <div className="menu-item-price">$18</div>
                </div>
                <div className="menu-item">
                  <div className="menu-item-img">
                    <img src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=200&q=80" alt="" />
                  </div>
                  <div className="menu-item-info">
                    <div className="menu-item-name">Negroni Sbagliato</div>
                    <div className="menu-item-desc">Campari, sweet vermouth, prosecco</div>
                  </div>
                  <div className="menu-item-price">$14</div>
                </div>
              </div>
            </div>

            {/* ARTICLES (SEO content - paid only) */}
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">Articles</h2>
                <div className="widget-nav">
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>5 articles</span>
                </div>
              </div>
              <div className="widget-body">
                <div className="article-card">
                  <div className="article-thumb">
                    <img src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&q=80" alt="" />
                  </div>
                  <div className="article-info">
                    <div className="article-label">WilCo Guide Feature</div>
                    <div className="article-title">5 Reasons Rosalie's Has the Best Pasta in Leander</div>
                    <div className="article-meta">Jan 28, 2026 • 4 min read</div>
                  </div>
                </div>
                <div className="article-card">
                  <div className="article-thumb">
                    <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80" alt="" />
                  </div>
                  <div className="article-info">
                    <div className="article-label">WilCo Guide Feature</div>
                    <div className="article-title">Date Night in Leander: Inside Rosalie's New Cocktail Menu</div>
                    <div className="article-meta">Feb 3, 2026 • 3 min read</div>
                  </div>
                </div>
                <div className="article-card">
                  <div className="article-thumb">
                    <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80" alt="" />
                  </div>
                  <div className="article-info">
                    <div className="article-label">WilCo Guide Feature</div>
                    <div className="article-title">Meet Chef Rosalie: From Naples to Leander</div>
                    <div className="article-meta">Dec 12, 2025 • 5 min read</div>
                  </div>
                </div>
              </div>
              <div className="articles-more">See 2 more articles →</div>
            </div>

            {/* REVIEWS */}
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">Reviews</h2>
              </div>
              <div className="widget-body">
                <div className="reviews-summary">
                  <div className="reviews-big-num">{bizRating}</div>
                  <div>
                    <div className="reviews-stars-big">{generateStarRating(bizRating)}</div>
                    <div className="reviews-count-text">Based on {bizReviewCount} Google reviews</div>
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: 'var(--blue)' }}>SM</div>
                    <span className="review-name">Sarah M.</span>
                    <span className="review-date">2 weeks ago</span>
                  </div>
                  <div className="review-stars">★★★★★</div>
                  <div className="review-text">Best Italian food in the area, hands down. The handmade pappardelle is incredible and the staff treats you like family. We come here every Friday now.</div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: 'var(--orange)' }}>JT</div>
                    <span className="review-name">James T.</span>
                    <span className="review-date">1 month ago</span>
                  </div>
                  <div className="review-stars">★★★★★</div>
                  <div className="review-text">Took my wife here for our anniversary. The wood-fired pizza was perfect and the cocktails were some of the best I've had in Texas.</div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: 'var(--green)' }}>LR</div>
                    <span className="review-name">Lisa R.</span>
                    <span className="review-date">1 month ago</span>
                  </div>
                  <div className="review-stars">★★★★☆</div>
                  <div className="review-text">Great food and atmosphere. Only giving 4 stars because the wait on a Saturday night was 45 minutes even with a reservation. But worth it.</div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: 'var(--purple)' }}>DK</div>
                    <span className="review-name">David K.</span>
                    <span className="review-date">2 months ago</span>
                  </div>
                  <div className="review-stars">★★★★★</div>
                  <div className="review-text">We've tried every Italian place in WilCo and this is hands down the best. The carbonara is authentic and the tiramisu is unreal. Can't recommend enough.</div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: 'var(--pink)' }}>AM</div>
                    <span className="review-name">Ashley M.</span>
                    <span className="review-date">2 months ago</span>
                  </div>
                  <div className="review-stars">★★★★★</div>
                  <div className="review-text">The live music on Fridays makes this place even better. We brought friends from out of town and they couldn't believe a place this good exists in Leander.</div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: '#64748b' }}>RC</div>
                    <span className="review-name">Robert C.</span>
                    <span className="review-date">3 months ago</span>
                  </div>
                  <div className="review-stars">★★★★★</div>
                  <div className="review-text">Perfect for date night or family dinner. The kids menu is actually good (not just chicken fingers) and the patio seating is beautiful when the weather is nice.</div>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: 'var(--yellow)' }}>KW</div>
                    <span className="review-name">Karen W.</span>
                    <span className="review-date">3 months ago</span>
                  </div>
                  <div className="review-stars">★★★★☆</div>
                  <div className="review-text">Love the food, love the vibe. My only complaint is parking can be tricky on weekends. Get there early or be prepared to walk a bit. The bruschetta appetizer is a must-order.</div>
                </div>
              </div>
              <a href="#" className="reviews-see-all">See all {bizReviewCount} reviews →</a>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="profile-sidebar">
            {/* UPCOMING EVENTS (Top of sidebar — time-sensitive, high visibility) */}
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">Upcoming Events</h2>
                <span className="widget-badge" style={{ background: '#fdf2f8', color: 'var(--pink)' }}>2 upcoming</span>
              </div>
              <div className="widget-body">
                <div className="event-item">
                  <div className="event-date-box">
                    <span className="event-date-month">Feb</span>
                    <span className="event-date-day">14</span>
                  </div>
                  <div className="event-info">
                    <div className="event-title">Valentine's Day Live Jazz</div>
                    <div className="event-detail">7:00 PM – 10:00 PM • Special prix fixe menu</div>
                  </div>
                </div>
                <div className="event-item">
                  <div className="event-date-box">
                    <span className="event-date-month">Feb</span>
                    <span className="event-date-day">21</span>
                  </div>
                  <div className="event-info">
                    <div className="event-title">Friday Night Live Music</div>
                    <div className="event-detail">8:00 PM – 11:00 PM • Local acoustic artists</div>
                  </div>
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">Info</h2>
              </div>
              <div className="widget-body">
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div className="info-label">Hours</div>
                    <div className="info-value">
                      <span className="open-badge">
                        <span className="open-dot"></span> Open Now
                      </span> — Closes 10 PM
                    </div>
                    <div className="hours-grid">
                      <span className="hours-day">Mon</span>
                      <span className="hours-time">11 AM – 9 PM</span>
                      <span className="hours-day hours-today">Tue</span>
                      <span className="hours-time hours-today">11 AM – 10 PM ← Today</span>
                      <span className="hours-day">Wed</span>
                      <span className="hours-time">11 AM – 10 PM</span>
                      <span className="hours-day">Thu</span>
                      <span className="hours-time">11 AM – 10 PM</span>
                      <span className="hours-day">Fri</span>
                      <span className="hours-time">11 AM – 11 PM</span>
                      <span className="hours-day">Sat</span>
                      <span className="hours-time">10 AM – 11 PM</span>
                      <span className="hours-day">Sun</span>
                      <span className="hours-time">10 AM – 9 PM</span>
                    </div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                    </svg>
                  </div>
                  <div>
                    <div className="info-label">Phone</div>
                    <div className="info-value">
                      <a href={`tel:${bizPhone.replace(/\D/g, '')}`}>{bizPhone}</a>
                    </div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div>
                    <div className="info-label">Website</div>
                    <div className="info-value">
                      <a href={`https://${bizWebsite}`}>{bizWebsite}</a>
                    </div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="info-label">Address</div>
                    <div className="info-value">{bizAddress}<br />{bizLocation}</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <div className="info-label">Social</div>
                    <div className="info-value">
                      <a href="#">@rosalieskitchen</a> • <a href="#">Facebook</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAP */}
            <div className="widget">
              <div className="widget-body" style={{ padding: '14px' }}>
                <div className="map-placeholder">
                  <div className="map-pin">
                    <div className="map-pin-icon">
                      <div className="map-pin-dot"></div>
                    </div>
                    <div className="map-address">{bizAddress}, {bizLocation}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* YOU MIGHT ALSO LIKE (fills sidebar space when main column is long) */}
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">You Might Also Like</h2>
              </div>
              <div className="widget-body">
                <div className="sidebar-biz-card">
                  <div className="sidebar-biz-img">
                    <img src="https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=300&q=80" alt="" />
                  </div>
                  <div className="sidebar-biz-info">
                    <div className="sidebar-biz-name">Nonna's Trattoria</div>
                    <div className="sidebar-biz-detail">Italian • $$ • Cedar Park</div>
                    <div className="sidebar-biz-stars">★★★★★ <span>4.7</span></div>
                  </div>
                </div>
                <div className="sidebar-biz-card">
                  <div className="sidebar-biz-img">
                    <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80" alt="" />
                  </div>
                  <div className="sidebar-biz-info">
                    <div className="sidebar-biz-name">Olive & Vine</div>
                    <div className="sidebar-biz-detail">Mediterranean • $$$ • Round Rock</div>
                    <div className="sidebar-biz-stars">★★★★★ <span>4.8</span></div>
                  </div>
                </div>
                <div className="sidebar-biz-card">
                  <div className="sidebar-biz-img">
                    <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80" alt="" />
                  </div>
                  <div className="sidebar-biz-info">
                    <div className="sidebar-biz-name">Russo's Italian Kitchen</div>
                    <div className="sidebar-biz-detail">Italian • $$ • Georgetown</div>
                    <div className="sidebar-biz-stars">★★★★☆ <span>4.4</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED BUSINESSES */}
        <div className="section-header-full">
          <h2 className="section-title-full">Other {bizCategory}s in {bizLocation.split(',')[0]}</h2>
          <a href="/directory" className="section-see-all">See all →</a>
        </div>
        <div className="related-grid">
          <div className="related-card">
            <img src="https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600&q=80" alt="" />
            <div className="related-overlay"></div>
            <div className="related-info">
              <div className="related-name">Nonna's Trattoria</div>
              <div className="related-detail">Italian • $$ • Cedar Park</div>
              <div className="related-stars">★★★★★ 4.7</div>
            </div>
            <div className="related-sponsor">Sponsored</div>
          </div>
          <div className="related-card">
            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80" alt="" />
            <div className="related-overlay"></div>
            <div className="related-info">
              <div className="related-name">Bella Vita Pizzeria</div>
              <div className="related-detail">Pizza • $ • Leander</div>
              <div className="related-stars">★★★★☆ 4.5</div>
            </div>
          </div>
          <div className="related-card">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80" alt="" />
            <div className="related-overlay"></div>
            <div className="related-info">
              <div className="related-name">Olive & Vine</div>
              <div className="related-detail">Mediterranean • $$$ • Round Rock</div>
              <div className="related-stars">★★★★★ 4.8</div>
            </div>
          </div>
          <div className="related-card">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" alt="" />
            <div className="related-overlay"></div>
            <div className="related-info">
              <div className="related-name">Russo's Italian Kitchen</div>
              <div className="related-detail">Italian • $$ • Georgetown</div>
              <div className="related-stars">★★★★☆ 4.4</div>
            </div>
            <div className="related-sponsor">Sponsored</div>
          </div>
        </div>
      </div>
    </>
  );
}

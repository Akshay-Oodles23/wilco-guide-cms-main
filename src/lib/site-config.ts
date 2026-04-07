export const SITE_NAME = 'WilCo Guide'
export const SITE_DESCRIPTION = 'Your home page for everything Williamson County. Local news, jobs, businesses, events, real estate, and deals — all in one place.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wilcoguide.com'
export const WILCO_SITE_ID = 'wilco'

export const CITIES = [
  { slug: 'leander', name: 'Leander', territory: 'leander-scoop' },
  { slug: 'cedar-park', name: 'Cedar Park', territory: 'leander-scoop' },
  { slug: 'liberty-hill', name: 'Liberty Hill', territory: 'leander-scoop' },
  { slug: 'round-rock', name: 'Round Rock', territory: 'round-rock-scoop' },
  { slug: 'pflugerville', name: 'Pflugerville', territory: 'round-rock-scoop' },
  { slug: 'hutto', name: 'Hutto', territory: 'round-rock-scoop' },
  { slug: 'georgetown', name: 'Georgetown', territory: 'round-rock-scoop' },
  { slug: 'taylor', name: 'Taylor', territory: 'round-rock-scoop' },
  { slug: 'austin', name: 'Austin', territory: 'all' },
] as const

export const CITY_SLUGS = CITIES.map(c => c.slug)

export const NAV_LINKS = [
  { label: 'News', href: '/news' },
  { label: 'Directory', href: '/directory' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Guides', href: '/guides' },
  { label: 'Seniors', href: '/seniors' },
  { label: 'Search', href: '/search' },
] as const

export const FOOTER_SECTIONS = {
  sections: [
    { label: 'News', href: '/news' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Directory', href: '/directory' },
    { label: 'Events', href: '/events', comingSoon: true },
    { label: 'Real Estate', href: '/real-estate', comingSoon: true },
    { label: 'Deals', href: '/deals', comingSoon: true },
    { label: 'Obituaries', href: '/obituaries', comingSoon: true },
  ],
  newsletters: [
    { name: 'Leander Scoop', href: '#' },
    { name: 'Round Rock Scoop', href: '#' },
    { name: 'WilCo Grind', href: '#' },
    { name: 'Manage Preferences', href: '#' },
  ],
  forBusinesses: [
    { label: 'Add Your Business', href: '/for-businesses' },
    { label: 'Become a Partner', href: '/partner' },
    { label: 'Advertise With Us', href: '#' },
    { label: 'Post a Job', href: '#' },
    { label: 'Post a Deal', href: '#' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
} as const

export const SOCIAL_LINKS = {
  facebook: '#',
  linkedin: '#',
  twitter: '#',
  instagram: '#',
} as const

export const NEWSLETTER_BRANDS = [
  {
    id: 'leander-scoop',
    slug: 'leander-scoop',
    name: 'Leander Scoop',
    label: 'Leander Scoop',
    domain: 'leanderscoop.com',
    cities: ['leander', 'cedar-park', 'liberty-hill'],
    color: '#2563EB',
    bgLight: '#EFF6FF',
    borderLight: '#BFDBFE',
  },
  {
    id: 'round-rock-scoop',
    slug: 'round-rock-scoop',
    name: 'Round Rock Scoop',
    label: 'Round Rock Scoop',
    domain: 'roundrockscoop.com',
    cities: ['round-rock', 'pflugerville', 'hutto', 'georgetown', 'taylor'],
    color: '#EA580C',
    bgLight: '#FFF7ED',
    borderLight: '#FDBA74',
  },
  {
    id: 'wilco-grind',
    slug: 'wilco-grind',
    name: 'WilCo Grind',
    label: 'WilCo Grind',
    domain: 'wilcogrind.com',
    cities: [], // All WilCo — B2B
    color: '#16A34A',
    bgLight: '#ECFDF5',
    borderLight: '#86EFAC',
  },
] as const

// Domain map for franchise resolution
export const DOMAIN_MAP: Record<string, string> = {
  'wilcoguide.com': 'wilco',
  'www.wilcoguide.com': 'wilco',
  'localhost:3000': 'wilco',
  'localhost': 'wilco',
}

// Beehiiv newsletter subscribe URL
export const BEEHIIV_SUBSCRIBE_URL = 'https://embeds.beehiiv.com/subscribe'

// Category color mapping for article/news categories
const CATEGORY_COLORS: Record<string, string> = {
  development: 'var(--orange)',
  business: 'var(--blue)',
  schools: 'var(--green)',
  education: 'var(--green)',
  'food-drink': 'var(--pink)',
  'food & drink': 'var(--pink)',
  food: 'var(--pink)',
  community: 'var(--red)',
  'real-estate': 'var(--yellow)',
  'real estate': 'var(--yellow)',
  crime: 'var(--red)',
  politics: 'var(--purple)',
}

export function getCategoryColor(categorySlug: string): string {
  const normalized = categorySlug.toLowerCase()
  return CATEGORY_COLORS[normalized] || 'var(--blue)'
}

// Business categories
export const BUSINESS_CATEGORIES = [
  'Restaurant', 'Health & Wellness', 'Automotive', 'Home Services',
  'Professional Services', 'Retail', 'Beauty & Spa', 'Fitness',
  'Education', 'Entertainment', 'Real Estate', 'Technology',
  'Healthcare', 'Legal', 'Financial Services', 'Construction',
  'Nonprofit', 'Government', 'Religious', 'Other',
] as const

// Job categories
export const JOB_CATEGORIES = [
  'restaurant-hospitality', 'healthcare', 'technology', 'education',
  'retail', 'construction', 'professional-services', 'government', 'other',
] as const

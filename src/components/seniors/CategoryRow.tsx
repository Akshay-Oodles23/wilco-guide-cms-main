import Link from 'next/link'
import { BusinessCard } from './BusinessCard'

interface CategoryRowProps {
  title: string
  count: number | null
  categorySlug: string | null
  businesses: any[]
}

export function CategoryRow({ title, count, categorySlug, businesses }: CategoryRowProps) {
  return (
    <div className="category-row">
      <div className="section-header">
        <div className="section-title-group">
          <h2 className="section-title">{title}</h2>
          {count != null && <span className="section-count">{count} listings</span>}
        </div>
        {categorySlug && (
          <Link href={`/seniors/${categorySlug}`} className="section-see-all">
            See all &rarr;
          </Link>
        )}
      </div>
      <div className="row-grid">
        {businesses.map((biz) => (
          <BusinessCard key={biz.slug} business={biz} />
        ))}
      </div>
    </div>
  )
}

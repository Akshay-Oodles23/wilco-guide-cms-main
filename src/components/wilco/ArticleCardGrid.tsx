// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { CategoryTag } from './CategoryTag'
import type { Article, Category, Media } from '@/payload-types'

interface ArticleCardGridProps {
  article: Article
}

export function ArticleCardGrid({ article }: ArticleCardGridProps) {
  const category = typeof article.category === 'object' ? article.category as Category : null
  const featuredImage = typeof article.featuredImage === 'object' ? article.featuredImage as Media : null
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block bg-white border-[1.5px] border-border rounded-card overflow-hidden no-underline transition-all duration-300 hover:shadow-md hover:-translate-y-[3px]"
    >
      {/* Image */}
      {featuredImage?.url && (
        <div className="h-[150px] overflow-hidden">
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || article.title}
            width={400}
            height={300}
            quality={60}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-[14px] px-4">
        {category && (
          <div className="mb-[6px]">
            <CategoryTag category={category} />
          </div>
        )}
        <h3 className="text-sm font-bold leading-[1.35] text-text-primary mb-[6px]">
          {article.title}
        </h3>
        <span className="text-[11px] text-text-muted">
          {publishedDate} · {article.readTime || 3} min
        </span>
      </div>
    </Link>
  )
}

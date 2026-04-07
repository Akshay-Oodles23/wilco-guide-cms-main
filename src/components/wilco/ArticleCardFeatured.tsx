// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { CategoryTag } from './CategoryTag'
import type { Article, Category, Media } from '@/payload-types'

interface ArticleCardFeaturedProps {
  article: Article
}

export function ArticleCardFeatured({ article }: ArticleCardFeaturedProps) {
  const category = typeof article.category === 'object' ? article.category as Category : null
  const featuredImage = typeof article.featuredImage === 'object' ? article.featuredImage as Media : null
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <Link
      href={`/news/${article.slug}`}
      className="block pb-4 mb-4 border-b border-border-light last:border-b-0 last:mb-0 last:pb-0 no-underline transition-opacity hover:opacity-75"
    >
      {/* Image */}
      {featuredImage?.url && (
        <div className="w-full h-[130px] rounded-lg overflow-hidden mb-[10px]">
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || article.title}
            width={400}
            height={260}
            quality={60}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Category */}
      {category && (
        <div className="mb-[5px]">
          <CategoryTag category={category} />
        </div>
      )}

      {/* Title */}
      <h3 className="text-[15px] font-bold leading-[1.3] text-text-primary mb-1">
        {article.title}
      </h3>

      {/* Meta */}
      <span className="text-xs text-text-muted">
        {publishedDate} · {article.readTime || 3} min read
      </span>
    </Link>
  )
}

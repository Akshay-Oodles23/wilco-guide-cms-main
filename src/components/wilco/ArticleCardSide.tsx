// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { CategoryTag } from './CategoryTag'
import type { Article, Category, Media } from '@/payload-types'

interface ArticleCardSideProps {
  article: Article
}

export function ArticleCardSide({ article }: ArticleCardSideProps) {
  const category = typeof article.category === 'object' ? article.category as Category : null
  const featuredImage = typeof article.featuredImage === 'object' ? article.featuredImage as Media : null
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <Link
      href={`/news/${article.slug}`}
      className="flex gap-[14px] py-[14px] border-b border-border-light last:border-b-0 no-underline transition-opacity hover:opacity-75"
    >
      {/* Image */}
      {featuredImage?.url && (
        <div className="w-[100px] md:w-[120px] h-[70px] md:h-[85px] rounded-[10px] overflow-hidden flex-shrink-0">
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || article.title}
            width={240}
            height={170}
            quality={60}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        {category && (
          <div className="mb-1">
            <CategoryTag category={category} />
          </div>
        )}
        <h3 className="text-[15px] font-semibold leading-[1.35] text-text-primary mb-1">
          {article.title}
        </h3>
        <p className="text-xs text-text-secondary leading-[1.4] line-clamp-2 mb-1">
          {article.excerpt}
        </p>
        <span className="text-xs text-text-muted">
          {publishedDate} · {article.readTime || 3} min
        </span>
      </div>
    </Link>
  )
}

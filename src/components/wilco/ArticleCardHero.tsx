// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { CategoryTag } from './CategoryTag'
import type { Article, Category, Media } from '@/payload-types'

interface ArticleCardHeroProps {
  article: Article
}

export function ArticleCardHero({ article }: ArticleCardHeroProps) {
  const category = typeof article.category === 'object' ? article.category as Category : null
  const featuredImage = typeof article.featuredImage === 'object' ? article.featuredImage as Media : null
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <div>
      {/* Image */}
      {featuredImage?.url && (
        <Link href={`/news/${article.slug}`} className="block w-full h-[200px] md:h-[340px] rounded-card overflow-hidden mb-[18px]">
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || article.title}
            width={800}
            height={400}
            quality={60}
            priority
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        </Link>
      )}

      {/* Category */}
      {category && (
        <div className="mb-2">
          <CategoryTag category={category} />
        </div>
      )}

      {/* Title */}
      <Link href={`/news/${article.slug}`} className="no-underline">
        <h2 className="font-serif text-[24px] md:text-[28px] font-bold leading-[1.25] text-text-primary hover:text-blue transition-colors mb-[10px] cursor-pointer">
          {article.title}
        </h2>
      </Link>

      {/* Excerpt */}
      <p className="text-[15px] leading-[1.6] text-text-secondary mb-[10px]">
        {article.excerpt}
      </p>

      {/* Meta */}
      <div className="text-[13px] text-text-muted">
        {publishedDate} · {article.readTime || 3} min read
      </div>
    </div>
  )
}

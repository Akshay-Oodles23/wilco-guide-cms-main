// @ts-nocheck
import Link from 'next/link'
import { CategoryTag } from './CategoryTag'
import type { Article, Category } from '@/payload-types'

interface ArticleCardHeadlineProps {
  article: Article
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ArticleCardHeadline({ article }: ArticleCardHeadlineProps) {
  const category = typeof article.category === 'object' ? article.category as Category : null

  return (
    <Link
      href={`/news/${article.slug}`}
      className="block py-3 border-b border-border-light last:border-b-0 no-underline transition-opacity hover:opacity-70"
    >
      {category && (
        <div className="mb-[5px]">
          <CategoryTag category={category} />
        </div>
      )}
      <h3 className="text-sm font-bold leading-[1.35] text-text-primary mb-1">
        {article.title}
      </h3>
      <span className="text-xs text-text-muted">
        {article.publishedAt ? timeAgo(article.publishedAt) : ''}
      </span>
    </Link>
  )
}

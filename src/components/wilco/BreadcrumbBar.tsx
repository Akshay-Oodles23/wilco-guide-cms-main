import Link from 'next/link'
import { generateBreadcrumbSchema } from '@/lib/schema'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbBarProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbBar({ items }: BreadcrumbBarProps) {
  const schema = generateBreadcrumbSchema(items)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="bg-white border-b border-border px-4 md:px-8 h-10 flex items-center">
        <div className="max-w-article mx-auto w-full flex items-center gap-[6px] text-xs text-text-muted">
          {items.map((item, index) => (
            <span key={index} className="flex items-center gap-[6px]">
              {index > 0 && <span className="text-border">›</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-text-secondary font-medium no-underline hover:text-blue"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate max-w-[200px] md:max-w-none">{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

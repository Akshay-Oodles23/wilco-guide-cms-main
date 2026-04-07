import { getCategoryColor } from '@/lib/site-config'

interface CategoryTagProps {
  category: {
    name: string
    slug?: string
    color?: string | null
  }
}

export function CategoryTag({ category }: CategoryTagProps) {
  const color = category.color || getCategoryColor(category.slug || category.name)

  return (
    <span
      className="inline-flex items-center gap-[5px] text-[11px] font-semibold uppercase tracking-[0.04em]"
      style={{ color }}
    >
      <span
        className="w-[6px] h-[6px] rounded-full"
        style={{ backgroundColor: color }}
      />
      {category.name}
    </span>
  )
}

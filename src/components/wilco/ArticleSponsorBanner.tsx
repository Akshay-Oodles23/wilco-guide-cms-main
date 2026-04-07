// @ts-nocheck
import type { Sponsor } from '@/payload-types'

interface ArticleSponsorBannerProps {
  sponsor: Sponsor | null
}

export function ArticleSponsorBanner({ sponsor }: ArticleSponsorBannerProps) {
  if (!sponsor) return null

  return (
    <a
      href={sponsor.ctaUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex flex-wrap items-center gap-2 md:gap-[14px] p-[10px] px-4 rounded-[10px] bg-white border border-border mb-6 no-underline"
    >
      <span className="text-[9px] font-semibold text-text-muted uppercase tracking-[0.08em] whitespace-nowrap">
        Presented by
      </span>
      <div className="w-px h-[18px] bg-border-light hidden md:block" />
      <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-blue to-blue-dark flex items-center justify-center text-white font-bold text-[10px]">
        {sponsor.initials || sponsor.companyName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-text-primary">{sponsor.companyName}</div>
        <div className="text-[11px] text-text-muted">{sponsor.tagline}</div>
      </div>
      <span className="text-[11px] font-semibold text-blue whitespace-nowrap flex-shrink-0">
        Learn More →
      </span>
    </a>
  )
}

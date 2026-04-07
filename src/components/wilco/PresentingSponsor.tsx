// @ts-nocheck
import type { Sponsor } from '@/payload-types'

interface PresentingSponsorProps {
  sponsor: Sponsor | null
}

export function PresentingSponsor({ sponsor }: PresentingSponsorProps) {
  if (!sponsor) return null

  return (
    <a
      href={sponsor.ctaUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center justify-center gap-4 py-3 px-7 mt-4 bg-white border-[1.5px] border-border rounded-[10px] shadow-sm no-underline"
    >
      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
        Presented by
      </span>
      <div className="w-px h-6 bg-border" />
      <div className="w-9 h-9 rounded-lg bg-blue flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
        {sponsor.initials || sponsor.companyName.charAt(0)}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-text-primary">{sponsor.companyName}</span>
        <span className="text-[11px] text-text-muted">{sponsor.tagline}</span>
      </div>
    </a>
  )
}

// @ts-nocheck
import type { Sponsor } from '@/payload-types'

interface InlineAdProps {
  sponsor: Sponsor | null
}

export function InlineAd({ sponsor }: InlineAdProps) {
  if (!sponsor) return null

  return (
    <a
      href={sponsor.ctaUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex flex-col md:flex-row items-center gap-[10px] md:gap-4 p-4 md:px-5 rounded-card bg-dark-card border-[1.5px] border-blue/10 my-7 no-underline text-center md:text-left"
    >
      {/* Logo */}
      <div className="w-11 h-11 rounded-[10px] flex-shrink-0 bg-white/[0.08] border border-white/10 flex items-center justify-center font-bold text-[13px] text-white/50">
        {sponsor.initials || sponsor.companyName.charAt(0)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.08em] mb-[2px]">
          Sponsored
        </div>
        <div className="text-sm font-bold text-white mb-[2px]">{sponsor.companyName}</div>
        <div className="text-xs text-white/55">{sponsor.description}</div>
      </div>

      {/* CTA */}
      <button className="py-2 px-[18px] rounded-lg bg-blue text-white border-none text-xs font-bold cursor-pointer whitespace-nowrap flex-shrink-0 hover:bg-blue-dark">
        {sponsor.ctaText || 'Learn More'}
      </button>
    </a>
  )
}

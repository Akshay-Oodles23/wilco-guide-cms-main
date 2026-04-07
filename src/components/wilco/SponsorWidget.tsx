// @ts-nocheck
'use client'

import type { Sponsor } from '@/payload-types'

interface SponsorWidgetProps {
  sponsor: Sponsor
  accentColor?: string
}

export function SponsorWidget({ sponsor, accentColor = '#3589ff' }: SponsorWidgetProps) {
  const bgGradient = `linear-gradient(135deg, ${accentColor}33, ${accentColor}1a)`
  const borderColor = `${accentColor}33`

  return (
    <div className="bg-dark-card rounded-lg p-5 border-[1.5px]" style={{ borderColor: `${accentColor}1f` }}>
      {/* Sponsored label */}
      <div className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.08em] mb-3">
        Sponsored
      </div>

      {/* Logo + Name */}
      <div className="flex items-center gap-[10px] mb-[10px]">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center font-bold text-sm border"
          style={{ background: bgGradient, borderColor, color: accentColor }}
        >
          {sponsor.initials || sponsor.companyName.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-bold text-white">{sponsor.companyName}</div>
          <div className="text-[11px] text-white/45">{sponsor.tagline}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-white/60 leading-[1.5] mb-[14px]">
        {sponsor.description}
      </p>

      {/* CTA */}
      <a
        href={sponsor.ctaUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block text-center w-full py-[10px] rounded-lg border-[1.5px] text-[13px] font-bold cursor-pointer no-underline transition-all hover:text-white"
        style={{
          borderColor: accentColor,
          color: accentColor,
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = accentColor
          e.currentTarget.style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = accentColor
        }}
      >
        {sponsor.ctaText || 'Learn More'}
      </a>
    </div>
  )
}

export function SidebarGrindPromo() {
  return (
    <div className="bg-dark-card rounded-lg p-5 border-[1.5px] border-[#eb7b1c]/20">
      {/* Header */}
      <div className="flex items-center gap-[10px] mb-[10px]">
        <div className="w-8 h-8 rounded-lg bg-[#eb7b1c] flex items-center justify-center text-white font-bold text-xs">
          G
        </div>
        <div>
          <div className="font-serif font-bold text-[15px] text-white">WilCo Grind</div>
          <div className="text-[11px] text-white/45">Business & Career Intel</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-white/55 leading-[1.5] mb-3">
        Weekly insights for WilCo business owners and professionals. Hiring trends, growth strategies, and local business news.
      </p>

      {/* CTA */}
      <a
        href="#"
        className="block text-center w-full py-[9px] rounded-lg bg-[#eb7b1c] text-white border-none text-xs font-bold cursor-pointer no-underline hover:opacity-90"
      >
        Subscribe to Grind →
      </a>
    </div>
  )
}

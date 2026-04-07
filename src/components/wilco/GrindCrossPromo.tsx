export function GrindCrossPromo() {
  return (
    <section className="bg-dark-card py-12 px-4 md:px-8 -mx-4 md:-mx-6 lg:-mx-0">
      <div className="max-w-page mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#eb7b1c] mb-1">WilCo Grind</h2>
            <p className="text-sm text-[#8e8ea0]">Business & Career Intel for WilCo Professionals</p>
          </div>
          <a
            href="#"
            className="text-[13px] font-semibold text-[#eb7b1c] no-underline hover:underline"
          >
            Subscribe to Grind →
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Placeholder cards — these would come from Payload Grind content */}
          {[
            {
              category: 'Business',
              title: 'Cedar Park Startup Raises $12M in Series A, Plans 50 New Jobs',
              date: 'Feb 7',
              readTime: '3 min',
            },
            {
              category: 'Hiring',
              title: 'WilCo Unemployment Hits Record Low 2.8% — Where the Jobs Are',
              date: 'Feb 6',
              readTime: '4 min',
            },
            {
              category: 'Real Estate',
              title: 'Commercial Vacancy Drops 15% in Round Rock Tech Corridor',
              date: 'Feb 5',
              readTime: '3 min',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-[#1a1a35] rounded-card p-5 cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md"
            >
              <span className="inline-flex items-center gap-[5px] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#eb7b1c] mb-2">
                <span className="w-[6px] h-[6px] rounded-full bg-[#eb7b1c]" />
                {card.category}
              </span>
              <h3 className="text-[15px] font-semibold text-white leading-[1.35] mb-2">
                {card.title}
              </h3>
              <span className="text-xs text-[#8e8ea0]">
                {card.date} · {card.readTime}
              </span>
            </div>
          ))}
        </div>

        {/* Subscribe CTA */}
        <div className="mt-6 flex justify-center">
          <button className="bg-[#eb7b1c] text-white py-[10px] px-6 rounded-lg text-sm font-bold cursor-pointer border-none hover:opacity-90">
            Subscribe to WilCo Grind
          </button>
        </div>
      </div>
    </section>
  )
}

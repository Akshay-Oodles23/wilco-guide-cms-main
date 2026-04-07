import { BEEHIIV_SUBSCRIBE_URL } from '@/lib/site-config'

export function NewsletterBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-dark rounded-lg p-6 md:px-9 mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Decorative circle */}
      <div className="absolute -top-[30px] right-20 w-[100px] h-[100px] bg-white/[0.06] rounded-full" />

      {/* Text */}
      <div className="relative z-10 text-center md:text-left">
        <h3 className="font-serif text-xl font-bold text-white mb-1">Never Miss a WilCo Story</h3>
        <p className="text-[13px] text-white/80">Join 15,000+ WilCo residents. Every Tuesday in your inbox. Free.</p>
      </div>

      {/* Form */}
      <form
        action={BEEHIIV_SUBSCRIBE_URL}
        method="POST"
        className="relative z-10 flex flex-col md:flex-row gap-2 w-full md:w-auto flex-shrink-0"
      >
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
          className="py-[11px] px-4 rounded-lg border-[1.5px] border-white/20 bg-white/[0.12] text-white text-sm outline-none w-full md:w-[240px] placeholder:text-white/50 focus:border-white/50"
        />
        <button
          type="submit"
          className="py-[11px] px-6 rounded-lg bg-white text-blue border-none text-sm font-bold cursor-pointer whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
    </div>
  )
}

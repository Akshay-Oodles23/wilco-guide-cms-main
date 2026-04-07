import { BEEHIIV_SUBSCRIBE_URL } from '@/lib/site-config'

export function SidebarSubscribe() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-dark rounded-lg p-[22px] px-5">
      {/* Decorative circles */}
      <div className="absolute -top-5 -right-[10px] w-[70px] h-[70px] bg-white/[0.06] rounded-full" />
      <div className="absolute -bottom-[15px] left-5 w-10 h-10 bg-white/[0.04] rounded-full" />

      {/* Content */}
      <div className="relative z-10">
        <div className="text-[22px] mb-[10px]">📧</div>
        <h3 className="font-serif font-bold text-[17px] text-white mb-[6px] leading-[1.3]">
          Get WilCo News Every Tuesday
        </h3>
        <p className="text-xs text-white/75 mb-[14px] leading-[1.4]">
          Local news, business openings, events, and jobs. Join 15,000+ subscribers.
        </p>

        <form action={BEEHIIV_SUBSCRIBE_URL} method="POST">
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            required
            className="w-full py-[10px] px-[14px] rounded-lg border-[1.5px] border-white/20 bg-white/[0.12] text-white text-[13px] outline-none mb-2 placeholder:text-white/50 focus:border-white/50"
          />
          <button
            type="submit"
            className="w-full py-[10px] rounded-lg bg-white text-blue border-none text-[13px] font-bold cursor-pointer hover:bg-blue-light"
          >
            Subscribe Free
          </button>
        </form>
      </div>
    </div>
  )
}

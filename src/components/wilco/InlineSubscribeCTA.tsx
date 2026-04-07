import { BEEHIIV_SUBSCRIBE_URL } from '@/lib/site-config'

export function InlineSubscribeCTA() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-blue-light border border-blue-border rounded-card p-4 md:px-5 my-4">
      {/* Icon + Text */}
      <div className="flex items-start gap-3 flex-1">
        <span className="text-xl flex-shrink-0">📧</span>
        <div>
          <div className="text-sm font-semibold text-text-primary">Never Miss a WilCo Story</div>
          <div className="text-xs text-text-muted mt-0.5">Local news, jobs, events — every Tuesday. Free.</div>
        </div>
      </div>

      {/* Form */}
      <form
        action={BEEHIIV_SUBSCRIBE_URL}
        method="POST"
        className="flex gap-2 w-full md:w-auto flex-shrink-0"
      >
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
          className="flex-1 md:w-[180px] border border-border rounded-lg py-2 px-3 text-[13px] outline-none focus:border-blue text-text-primary bg-white"
        />
        <button
          type="submit"
          className="bg-blue text-white rounded-lg py-2 px-[14px] text-[13px] font-semibold cursor-pointer whitespace-nowrap border-none"
        >
          Subscribe
        </button>
      </form>
    </div>
  )
}

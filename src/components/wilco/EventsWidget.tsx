// @ts-nocheck
import type { Event } from '@/payload-types'

interface EventsWidgetProps {
  events: Event[]
}

export function EventsWidget({ events }: EventsWidgetProps) {
  if (!events.length) return null

  return (
    <div className="bg-white rounded-card p-4 shadow-sm border border-border">
      <h3 className="text-[13px] font-semibold mb-3 flex items-center gap-[6px]">
        <span>📅</span> This Week
      </h3>

      <div className="flex flex-col gap-3">
        {events.map((event) => {
          const eventDate = event.eventDate ? new Date(event.eventDate) : null
          const day = eventDate ? eventDate.getDate() : ''
          const month = eventDate
            ? eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
            : ''

          return (
            <div key={event.id} className="flex gap-3">
              {/* Date block */}
              <div className="w-10 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold leading-tight text-text-primary">{day}</span>
                <span className="text-[10px] uppercase text-text-muted font-medium">{month}</span>
              </div>

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-text-primary leading-[1.3] mb-0.5">
                  {event.title}
                </div>
                <div className="text-[11px] text-text-muted">
                  {event.venue || ''}{event.venue && event.eventTime ? ' · ' : ''}{event.eventTime || ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

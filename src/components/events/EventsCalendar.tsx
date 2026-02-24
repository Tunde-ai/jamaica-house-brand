'use client'

const CALENDAR_SRC =
  'https://calendar.google.com/calendar/embed?src=ed4774ecf0988d70836737524a3c78c51a24781e9bc70f92c83a4aa25725ba4e%40group.calendar.google.com&ctz=America%2FNew_York&showTitle=0&showNav=1&showPrint=0&showCalendars=0&bgcolor=%231A1A1A&color=%23D4A843'

export default function EventsCalendar() {
  return (
    <div className="bg-brand-dark min-h-screen">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Upcoming Events
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pop-ups, tastings, and community events — find out where to experience Jamaica House Brand next.
          </p>
        </div>
      </section>

      {/* Calendar Embed */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="rounded-lg border border-white/10 overflow-hidden bg-[#1A1A1A]">
          <iframe
            src={CALENDAR_SRC}
            title="Jamaica House Brand Events Calendar"
            className="w-full min-h-[600px] sm:min-h-[700px]"
            style={{ border: 0 }}
          />
        </div>
      </section>
    </div>
  )
}

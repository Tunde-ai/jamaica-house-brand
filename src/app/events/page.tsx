import type { Metadata } from 'next'
import EventsCalendar from '@/components/events/EventsCalendar'

export const metadata: Metadata = {
  title: 'Events | Jamaica House Brand',
  description:
    'Pop-ups, tastings, and community events — find out where to experience Jamaica House Brand next.',
}

export default function EventsPage() {
  return <EventsCalendar />
}

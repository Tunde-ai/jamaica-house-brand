import { NextResponse } from 'next/server'

interface CateringQuoteBody {
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  guestCount: string
  venue: string
  proteins: string
  message: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CateringQuoteBody
    const { name, email, phone, eventType, eventDate, guestCount } = body

    if (!name || !email || !phone || !eventType || !eventDate || !guestCount) {
      return NextResponse.json(
        { error: 'Name, email, phone, event type, date, and guest count are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    console.log('[catering-quote] New quote request:', {
      ...body,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[catering-quote] Request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    )
  }
}

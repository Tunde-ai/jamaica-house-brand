import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const orderId = url.searchParams.get('order')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  try {
    // Here you would typically:
    // 1. Mark the order as "quote_requested" in your database
    // 2. Trigger the quote-only email workflow
    // 3. Schedule follow-up emails (3-day automation)

    console.log(`[catering-quote-only] Quote requested for order: ${orderId}`)

    // Redirect to a quote confirmation page
    const redirectUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/catering-menu?quote_requested=${orderId}`

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Quote request error:', error)
    return NextResponse.json(
      { error: 'Failed to process quote request' },
      { status: 500 }
    )
  }
}
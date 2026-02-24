import { NextResponse } from 'next/server'

interface MembershipSignupBody {
  tier: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  agreeTerms: boolean
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MembershipSignupBody
    const { tier, firstName, lastName, email, phone, address, city, state, zip, agreeTerms } = body

    if (!tier || !firstName || !lastName || !email || !phone || !address || !city || !state || !zip) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!agreeTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
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

    console.log('[membership-signup] New signup:', {
      ...body,
      timestamp: new Date().toISOString(),
    })

    // Stripe subscription creation deferred to future phase
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[membership-signup] Request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit signup' },
      { status: 500 }
    )
  }
}

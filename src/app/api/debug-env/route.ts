import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeSecretLength: process.env.STRIPE_SECRET_KEY?.length || 0,
    stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'undefined',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
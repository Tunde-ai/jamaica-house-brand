import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function GET() {
  try {
    const stripe = getStripe()

    // Test 1: Simple balance check
    console.log('[Stripe Test] Starting balance check...')
    const balance = await stripe.balance.retrieve()
    console.log('[Stripe Test] Balance check successful:', balance)

    // Test 2: Simple payment intent creation
    console.log('[Stripe Test] Creating test payment intent...')
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    })
    console.log('[Stripe Test] Payment intent created successfully:', paymentIntent.id)

    return NextResponse.json({
      success: true,
      balanceAvailable: balance.available[0]?.amount || 0,
      paymentIntentId: paymentIntent.id,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Stripe Test] Detailed error:', {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      statusCode: error?.statusCode,
      requestId: error?.requestId,
      stack: error?.stack,
      raw: error
    })

    return NextResponse.json({
      error: 'Stripe test failed',
      details: {
        message: error?.message,
        type: error?.type,
        code: error?.code,
        statusCode: error?.statusCode,
        requestId: error?.requestId
      }
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const {
      customerId,
      productId,
      productName,
      productSize,
      amount,
      originalPaymentIntentId,
    } = (await request.json()) as {
      customerId: string
      productId: string
      productName: string
      productSize: string
      amount: number
      originalPaymentIntentId: string
    }

    if (!customerId || !amount || !originalPaymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // Retrieve the payment method from the original PaymentIntent
    const originalPI = await stripe.paymentIntents.retrieve(originalPaymentIntentId)
    const paymentMethodId = originalPI.payment_method

    if (!paymentMethodId || typeof paymentMethodId !== 'string') {
      return NextResponse.json(
        { error: 'No payment method found on original payment' },
        { status: 400 }
      )
    }

    // Create and confirm a new PaymentIntent using the saved payment method
    const upsellPayment = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        source: 'jamaica-house-brand-checkout',
        type: 'post_purchase_upsell',
        original_payment_intent: originalPaymentIntentId,
        items: JSON.stringify([
          {
            id: productId,
            name: `${productName} (${productSize})`,
            price: amount,
            quantity: 1,
          },
        ]),
      },
    })

    return NextResponse.json({
      success: true,
      paymentIntentId: upsellPayment.id,
    })
  } catch (error) {
    console.error('Upsell payment error:', error)
    return NextResponse.json(
      { error: 'Upsell payment failed' },
      { status: 500 }
    )
  }
}

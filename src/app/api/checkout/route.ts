import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size: string
}

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CheckoutItem[] } = await request.json()

    // Validate items array is non-empty
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    const baseUrl = request.headers.get('origin') || 'https://jamaicahousebrand.com'

    // Calculate subtotal in cents to determine free shipping eligibility
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const FREE_SHIPPING_THRESHOLD = 5000 // $50.00 in cents

    // Build shipping options — free tier only available when subtotal ≥ $50
    const shippingOptions: Stripe.Checkout.SessionCreateParams['shipping_options'] = [
      ...(subtotal >= FREE_SHIPPING_THRESHOLD
        ? [
            {
              shipping_rate_data: {
                type: 'fixed_amount' as const,
                fixed_amount: { amount: 0, currency: 'usd' },
                display_name: 'Free Shipping',
                delivery_estimate: {
                  minimum: { unit: 'business_day' as const, value: 5 },
                  maximum: { unit: 'business_day' as const, value: 7 },
                },
              },
            },
          ]
        : []),
      {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          fixed_amount: { amount: 599, currency: 'usd' },
          display_name: 'Standard Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 5 },
            maximum: { unit: 'business_day' as const, value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          fixed_amount: { amount: 1299, currency: 'usd' },
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 2 },
            maximum: { unit: 'business_day' as const, value: 3 },
          },
        },
      },
    ]

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.name} (${item.size})`,
            // Only include absolute URLs for images — relative paths won't work in Stripe
            images: item.image.startsWith('http') ? [item.image] : [],
          },
          unit_amount: item.price, // Already in cents — do NOT multiply by 100
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: shippingOptions,
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop`,
      metadata: {
        source: 'jamaica-house-brand-web',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

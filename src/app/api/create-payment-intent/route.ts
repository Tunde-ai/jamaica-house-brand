import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getProductById } from '@/data/products'

interface RequestItem {
  id: string
  quantity: number
}

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zip: string
}

const SHIPPING_RATES: Record<string, number> = {
  standard: 599,
  express: 1299,
  free: 0,
}

const FREE_SHIPPING_THRESHOLD = 5000 // $50.00 in cents

export async function POST(request: NextRequest) {
  try {
    const { items, shipping, shippingOption } = (await request.json()) as {
      items: RequestItem[]
      shipping: ShippingInfo
      shippingOption: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!shipping || !shipping.email || !shipping.firstName || !shipping.address) {
      return NextResponse.json({ error: 'Shipping info required' }, { status: 400 })
    }

    // Validate prices server-side against product catalog
    let subtotal = 0
    const validatedItems: { id: string; name: string; size: string; price: number; quantity: number }[] = []

    for (const item of items) {
      // Handle free sample items
      if (item.id === 'free-sample-2oz') {
        validatedItems.push({
          id: item.id,
          name: 'FREE 2oz Jerk Sauce Sample',
          size: '2oz',
          price: 0,
          quantity: item.quantity,
        })
        continue
      }

      // Handle upsell items (e.g. "jerk-sauce-5oz-upsell-25")
      const baseId = item.id.replace(/-upsell-\d+$/, '')
      const product = getProductById(baseId)

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        )
      }

      // For upsell items, accept discounted price (verify it's not higher than original)
      const isUpsell = item.id !== baseId
      const price = isUpsell ? Math.round(product.price * 0.75) : product.price

      subtotal += price * item.quantity
      validatedItems.push({
        id: item.id,
        name: product.name,
        size: product.size,
        price,
        quantity: item.quantity,
      })
    }

    // Determine shipping cost
    let shippingCost = SHIPPING_RATES[shippingOption] ?? SHIPPING_RATES.standard
    if (subtotal >= FREE_SHIPPING_THRESHOLD && shippingOption === 'free') {
      shippingCost = 0
    } else if (subtotal >= FREE_SHIPPING_THRESHOLD && shippingOption !== 'express') {
      shippingCost = 0
    }

    const total = subtotal + shippingCost

    if (total <= 0) {
      return NextResponse.json(
        { error: 'Order total must be greater than zero' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // Create Stripe Customer
    const customer = await stripe.customers.create({
      email: shipping.email,
      name: `${shipping.firstName} ${shipping.lastName}`,
      address: {
        line1: shipping.address,
        city: shipping.city,
        state: shipping.state,
        postal_code: shipping.zip,
        country: 'US',
      },
    })

    // Create PaymentIntent with setup_future_usage to save card for upsells
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      customer: customer.id,
      setup_future_usage: 'off_session',
      metadata: {
        source: 'jamaica-house-brand-checkout',
        items: JSON.stringify(
          validatedItems.map((i) => ({
            id: i.id,
            name: `${i.name} (${i.size})`,
            price: i.price,
            quantity: i.quantity,
          }))
        ),
        shipping_option: shippingOption,
        shipping_cost: String(shippingCost),
        customer_name: `${shipping.firstName} ${shipping.lastName}`,
        customer_email: shipping.email,
        shipping_address: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zip}`,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

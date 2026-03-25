import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'
import { getProductById } from '@/data/products'
import { getCheckoutShippingCostCents } from '@/lib/shipping-calc'

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

const EXPRESS_SURCHARGE = 400 // $4.00 in cents
const FREE_SHIPPING_THRESHOLD = 5000 // $50.00 in cents
const ADDITIONAL_2OZ_PRICE = 524 // $5.24 in cents

export async function POST(request: NextRequest) {
  try {
    const { items, shipping, shippingOption, promoCode } = (await request.json()) as {
      items: RequestItem[]
      shipping: ShippingInfo
      shippingOption: string
      promoCode?: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!shipping || !shipping.email || !shipping.firstName || !shipping.address) {
      return NextResponse.json({ error: 'Shipping info required' }, { status: 400 })
    }

    // =========================================================================
    // SERVER-SIDE 2OZ PRICING ENFORCEMENT
    // Consolidate all 2oz items. Rule: 1st unit = $0, additional = $5.24.
    // =========================================================================
    const freeSampleItems = items.filter((i) => i.id === 'free-sample-2oz')
    const regular2ozItems = items.filter((i) => i.id === 'jerk-sauce-2oz')
    const total2ozQty =
      freeSampleItems.reduce((sum, item) => sum + item.quantity, 0) +
      regular2ozItems.reduce((sum, item) => sum + item.quantity, 0)
    const has2oz = total2ozQty > 0

    // Non-2oz items validated against product catalog
    const otherItems = items.filter(
      (i) => i.id !== 'free-sample-2oz' && i.id !== 'jerk-sauce-2oz'
    )

    let subtotal = 0
    const validatedItems: { id: string; name: string; size: string; price: number; quantity: number }[] = []

    // Add enforced 2oz items
    if (has2oz) {
      // 1 free unit
      validatedItems.push({
        id: 'free-sample-2oz',
        name: 'FREE 2oz Jerk Sauce Sample',
        size: '2oz',
        price: 0,
        quantity: 1,
      })
      // Additional units at $5.24
      const additionalQty = total2ozQty - 1
      if (additionalQty > 0) {
        validatedItems.push({
          id: 'jerk-sauce-2oz-additional',
          name: 'Original Jerk Sauce (2oz) — 25% off',
          size: '2oz',
          price: ADDITIONAL_2OZ_PRICE,
          quantity: additionalQty,
        })
        subtotal += ADDITIONAL_2OZ_PRICE * additionalQty
      }
    }

    // Validate other items
    for (const item of otherItems) {
      const baseId = item.id.replace(/-upsell-\d+$/, '')
      const product = getProductById(baseId)

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        )
      }

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

    // =========================================================================
    // PROMO CODE VALIDATION (server-side)
    // =========================================================================
    let promoDiscount = 0
    let validatedPromoCode: string | null = null

    if (promoCode) {
      try {
        const normalizedCode = promoCode.trim().toUpperCase()
        const { data: promo } = await getSupabase()
          .from('promo_codes')
          .select('*')
          .eq('code', normalizedCode)
          .single()

        if (
          promo &&
          promo.is_active &&
          (!promo.expires_at || new Date(promo.expires_at) >= new Date()) &&
          (promo.max_uses === null || promo.usage_count < promo.max_uses)
        ) {
          validatedPromoCode = normalizedCode
          const discountValue = Number(promo.discount_value)

          if (promo.discount_type === 'percentage') {
            promoDiscount = Math.round((subtotal * discountValue) / 100)
          } else {
            promoDiscount = Math.round(discountValue * 100)
          }

          if (promoDiscount > subtotal) {
            promoDiscount = subtotal
          }
        }
      } catch {
        // Promo validation failed — proceed without discount
      }
    }

    // =========================================================================
    // CALCULATE TOTALS
    // =========================================================================
    const standardShippingCost = getCheckoutShippingCostCents(items)
    let shippingCost: number
    if (shippingOption === 'express') {
      shippingCost = standardShippingCost + EXPRESS_SURCHARGE
    } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      shippingCost = 0
    } else {
      shippingCost = standardShippingCost
    }

    const total = subtotal - promoDiscount + shippingCost

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

    // Create PaymentIntent
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
        promoCode: validatedPromoCode || '',
        promoDiscount: promoDiscount > 0 ? String(promoDiscount) : '0',
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
  } catch (error: any) {
    console.error('Create payment intent error:', error?.message || error)
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

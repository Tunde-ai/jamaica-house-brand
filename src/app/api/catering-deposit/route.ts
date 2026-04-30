import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/database'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const orderId = url.searchParams.get('order')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  try {
    const stripe = getStripe()

    // Fetch actual order from database
    const order = await db.getOrderByNumber(orderId)
    if (!order) {
      console.error(`[catering-deposit] Order not found: ${orderId}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order can accept payments
    if (order.payment_status !== 'pending') {
      console.log(`[catering-deposit] Order ${orderId} already has payment status: ${order.payment_status}`)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success?order=${orderId}&type=deposit&existing=true`)
    }

    const depositAmountCents = Math.round(order.deposit_amount * 100) // Convert to cents

    const orderInfo = {
      orderId: order.order_number,
      dbOrderId: order.id,
      customerName: order.customer?.name || 'Customer',
      description: `Jamaica House Brand Catering Deposit`,
      customerNote: `Order ${orderId} - Event catering deposit for ${order.guest_count} guests`,
      amount: depositAmountCents,
      depositAmount: order.deposit_amount,
    }

    console.log(`[catering-deposit] Creating payment session for ${orderId}:`, {
      dbOrderId: order.id,
      depositAmount: order.deposit_amount,
      totalAmount: order.total_amount
    })

    // Create payment record in database first
    const payment = await db.createPayment({
      order_id: order.id,
      amount: order.deposit_amount,
      payment_type: 'deposit',
      status: 'pending'
    })

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Jamaica House Brand - Catering Deposit',
              description: orderInfo.customerNote,
              metadata: {
                orderId: orderInfo.orderId,
                dbOrderId: orderInfo.dbOrderId,
                paymentId: payment.id,
                type: 'catering_deposit',
              }
            },
            unit_amount: orderInfo.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}&order=${orderId}&type=deposit`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/catering-menu?error=payment_cancelled&order=${orderId}`,
      metadata: {
        orderId: orderInfo.orderId,
        dbOrderId: orderInfo.dbOrderId,
        paymentId: payment.id,
        paymentType: 'catering_deposit',
      },
      customer_creation: 'always',
      customer_email: order.customer?.email,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Catering deposit for order ${orderId}`,
          metadata: {
            orderId: orderInfo.orderId,
            dbOrderId: orderInfo.dbOrderId,
            paymentType: 'catering_deposit',
          },
          footer: 'Jamaica House Brand - Authentic Jamaican Catering',
        },
      },
      automatic_tax: {
        enabled: true,
      },
    })

    // Update payment record with Stripe session ID
    await db.updatePaymentStatus(payment.id, 'processing', {
      payment_intent_id: session.payment_intent as string
    })

    // Save Stripe session ID to payment record
    await db.supabase
      .from('payments')
      .update({ stripe_session_id: session.id })
      .eq('id', payment.id)

    console.log(`[catering-deposit] Payment session created:`, {
      sessionId: session.id,
      paymentId: payment.id,
      amount: orderInfo.depositAmount
    })

    // Redirect to Stripe Checkout
    return NextResponse.redirect(session.url!)
  } catch (error) {
    console.error('[catering-deposit] Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
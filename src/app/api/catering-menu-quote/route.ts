import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { EmailWorkflowEngine, calculateDepositAmount, calculateMinimumOrder } from '@/lib/email/workflow'
import { render } from '@react-email/render'
import OrderConfirmationEmail from '@/components/email-templates/OrderConfirmationEmail'
import { db } from '@/lib/database'
import { trayCategories } from '@/data/catering-menu'
import type { DiscountApplication } from '@/lib/discounts/early-booking'
import type { CreateOrderItemInput } from '@/types/database'

interface CateringMenuQuoteBody {
  name: string
  email: string
  phone: string
  eventDate: string
  guestCount: string
  deliveryMethod: 'pickup' | 'delivery'
  zipCode: string
  selectedItems: {
    [key: string]: {
      small: number
      large: number
    }
  }
  notes: string
  orderTotal: number
  deliveryFee: number
  actionType: 'quote_only' | 'pay_deposit'
  discountApplication?: DiscountApplication | null
  selectedDiscountId?: string | null
  finalTotal?: number
}

function formatSelectedItems(selectedItems: CateringMenuQuoteBody['selectedItems']): string {
  const items: string[] = []

  Object.entries(selectedItems).forEach(([itemName, quantities]) => {
    if (quantities.small > 0 || quantities.large > 0) {
      const parts: string[] = []
      if (quantities.small > 0) parts.push(`${quantities.small} Small`)
      if (quantities.large > 0) parts.push(`${quantities.large} Large`)
      items.push(`${itemName}: ${parts.join(', ')}`)
    }
  })

  return items.join('\n')
}

async function sendOrderConfirmationEmail(orderData: any) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) {
    console.warn('[catering-menu-quote] GMAIL_APP_PASSWORD not set — skipping email')
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olatunde@jamaicahousebrand.com',
      pass: appPassword,
    },
  })

  try {
    const emailHtml = await render(OrderConfirmationEmail(orderData))

    await transporter.sendMail({
      from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
      to: orderData.customerEmail,
      subject: '🎉 Your Jamaica House Catering Order - Choose Your Next Step!',
      html: emailHtml,
    })

    console.log('[catering-menu-quote] Order confirmation email sent to', orderData.customerEmail)
  } catch (error) {
    console.error('[catering-menu-quote] Failed to send order confirmation:', error)
  }
}

async function sendInternalNotification(body: CateringMenuQuoteBody, orderId: string, actionType: string) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) return

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olatunde@jamaicahousebrand.com',
      pass: appPassword,
    },
  })

  const selectedItemsText = formatSelectedItems(body.selectedItems)
  const actualTotal = body.finalTotal || (body.orderTotal + body.deliveryFee)
  const depositAmount = calculateDepositAmount(actualTotal)
  const totalWithDelivery = body.orderTotal + body.deliveryFee

  await transporter.sendMail({
    from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
    to: 'olatunde@jamaicahousebrand.com',
    subject: `🚨 NEW CATERING ORDER: ${orderId} - $${totalWithDelivery.toFixed(2)} (${actionType})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${actionType === 'pay_deposit' ? '#d4a843' : '#6c757d'}; color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">
            🍽️ ${actionType === 'pay_deposit' ? 'DEPOSIT ORDER' : 'QUOTE REQUEST'}
          </h1>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">
            Order ID: ${orderId}
          </p>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: ${actionType === 'pay_deposit' ? '#d4f8d4' : '#fff4e6'}; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid ${actionType === 'pay_deposit' ? '#28a745' : '#d4a843'};">
            <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">
              ${actionType === 'pay_deposit' ? '💳 CUSTOMER WANTS TO PAY DEPOSIT' : '📝 CUSTOMER WANTS QUOTE ONLY'}
            </h3>
            <p style="margin: 0; color: #333;">
              ${actionType === 'pay_deposit'
                ? `Customer will pay $${depositAmount.toFixed(2)} deposit to secure their date immediately.`
                : 'Customer wants a detailed quote first before making any payment decisions.'
              }
            </p>
          </div>

          <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a843; padding-bottom: 10px; margin-top: 0;">
            Customer Information
          </h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 12px; font-weight: bold; color: #555; width: 140px;">Name</td><td style="padding: 8px 12px;">${body.name}</td></tr>
            <tr style="background: #fff;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${body.email}">${body.email}</a></td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Phone</td><td style="padding: 8px 12px;"><a href="tel:${body.phone}">${body.phone}</a></td></tr>
            <tr style="background: #fff;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Event Date</td><td style="padding: 8px 12px;">${body.eventDate}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Guest Count</td><td style="padding: 8px 12px;">${body.guestCount}</td></tr>
            <tr style="background: #fff;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Delivery Method</td><td style="padding: 8px 12px; text-transform: capitalize;">${body.deliveryMethod}</td></tr>
            ${body.deliveryMethod === 'delivery' && body.zipCode ? `<tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">ZIP Code</td><td style="padding: 8px 12px;">${body.zipCode}</td></tr>` : ''}
          </table>

          <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a843; padding-bottom: 10px;">
            Tray Selection
          </h2>
          <div style="background: #fff; padding: 15px; border-radius: 5px; margin-bottom: 20px; white-space: pre-line; font-family: monospace;">
${selectedItemsText}
          </div>

          <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a843; padding-bottom: 10px;">
            Financial Breakdown
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff;">
            <tr><td style="padding: 12px; font-weight: bold; color: #555;">Food Subtotal:</td><td style="padding: 12px; text-align: right; font-weight: bold;">$${body.orderTotal.toFixed(2)}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 12px; font-weight: bold; color: #555;">Delivery Fee:</td><td style="padding: 12px; text-align: right; font-weight: bold;">${body.deliveryFee === 0 ? 'FREE' : '$' + body.deliveryFee.toFixed(2)}</td></tr>
            ${body.discountApplication ? `
            <tr style="background: #d4f8d4;"><td style="padding: 12px; font-weight: bold; color: #2d7a2d;">🎁 Early Booking Discount (${body.discountApplication.discountPercentage}%):</td><td style="padding: 12px; text-align: right; font-weight: bold; color: #2d7a2d;">-$${body.discountApplication.discountAmount.toFixed(2)}</td></tr>
            <tr style="background: #f0f0f0;"><td style="padding: 12px; font-weight: bold; color: #999;">Subtotal before discount:</td><td style="padding: 12px; text-align: right; font-weight: bold; color: #999; text-decoration: line-through;">$${totalWithDelivery.toFixed(2)}</td></tr>
            ` : ''}
            <tr style="background: #d4a843; color: #1a1a1a;"><td style="padding: 15px; font-weight: bold; font-size: 18px;">TOTAL:</td><td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">$${actualTotal.toFixed(2)}</td></tr>
            <tr style="background: #e8f4f8;"><td style="padding: 12px; font-weight: bold; color: #1a1a1a;">33% Deposit:</td><td style="padding: 12px; text-align: right; font-weight: bold; color: #1a1a1a;">$${depositAmount.toFixed(2)}</td></tr>
            <tr style="background: #f0f0f0;"><td style="padding: 12px; font-weight: bold; color: #666;">Balance Due:</td><td style="padding: 12px; text-align: right; font-weight: bold; color: #666;">$${(actualTotal - depositAmount).toFixed(2)}</td></tr>
          </table>
          ${body.discountApplication ? `
          <div style="background: #d4f8d4; border: 1px solid #2d7a2d; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #2d7a2d;">🎉 ${body.discountApplication.savingsMessage}</h3>
            <p style="margin: 0; color: #2d7a2d; font-weight: bold;">Discount Applied: ${body.discountApplication.offerApplied.name} - ${body.discountApplication.offerApplied.badge}</p>
          </div>
          ` : ''}

          ${body.notes ? `
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a843; padding-bottom: 10px;">Special Requests</h2>
          <div style="background: #fff; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #d4a843;">
            <p style="margin: 0; color: #333;">${body.notes}</p>
          </div>` : ''}

          <div style="background: #e8f4f8; border: 1px solid #b8e6f1; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">⏰ Next Steps:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li>Customer has been sent order confirmation with options</li>
              ${actionType === 'pay_deposit'
                ? '<li><strong>Monitor for deposit payment</strong></li><li>Send confirmation once payment received</li>'
                : '<li>Prepare detailed quote response</li><li>Send quote within 24 hours</li>'
              }
              <li>Email workflow automatically scheduled</li>
            </ul>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #999; text-align: center;">
            Order submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>
      </div>
    `,
  })

  console.log('[catering-menu-quote] Internal notification sent')
}

async function sendSlackNotification(body: CateringMenuQuoteBody, orderId: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const selectedItemsText = formatSelectedItems(body.selectedItems)
  const actualTotal = body.finalTotal || (body.orderTotal + body.deliveryFee)
  const depositAmount = calculateDepositAmount(actualTotal)
  const totalWithDelivery = body.orderTotal + body.deliveryFee

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🍽️ New Order: ${orderId}` },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Customer:*\n${body.name}` },
        { type: 'mrkdwn', text: `*Event Date:*\n${body.eventDate}` },
        { type: 'mrkdwn', text: `*Guests:*\n${body.guestCount}` },
        { type: 'mrkdwn', text: `*Total:*\n$${actualTotal.toFixed(2)}${body.discountApplication ? ` (was $${totalWithDelivery.toFixed(2)})` : ''}` },
      ],
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Email:*\n${body.email}` },
        { type: 'mrkdwn', text: `*Phone:*\n${body.phone}` },
        { type: 'mrkdwn', text: `*Deposit:*\n$${depositAmount.toFixed(2)}` },
        { type: 'mrkdwn', text: `*Action:*\n${body.actionType === 'pay_deposit' ? '💳 Pay Deposit' : '📝 Quote Only'}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Tray Selection:*\n\`\`\`${selectedItemsText}\`\`\`` },
    },
  ]

  // Add discount block if applicable
  if (body.discountApplication) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:gift: *Discount Applied:* ${body.discountApplication.offerApplied.name} - Saved $${body.discountApplication.discountAmount.toFixed(2)} (${body.discountApplication.discountPercentage}%)`
      },
    })
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  })

  console.log('[catering-menu-quote] Slack notification sent')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CateringMenuQuoteBody
    const { name, email, phone, eventDate, guestCount, selectedItems, actionType } = body

    // Validate required fields
    if (!name || !email || !phone || !eventDate || !guestCount) {
      return NextResponse.json(
        { error: 'Name, email, phone, event date, and guest count are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Validate that at least one item is selected
    const hasSelectedItems = Object.values(selectedItems).some(
      item => item.small > 0 || item.large > 0
    )
    if (!hasSelectedItems) {
      return NextResponse.json(
        { error: 'Please select at least one tray' },
        { status: 400 }
      )
    }

    // Validate minimum order
    const minimumOrder = calculateMinimumOrder(body.deliveryMethod)
    if (body.orderTotal < minimumOrder) {
      return NextResponse.json(
        {
          error: `Minimum order is $${minimumOrder} for ${body.deliveryMethod}. Current total: $${body.orderTotal.toFixed(2)}`
        },
        { status: 400 }
      )
    }

    // Validate event date (must be at least 7 days in advance)
    const eventDateObj = new Date(eventDate)
    const today = new Date()
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    if (eventDateObj < sevenDaysFromNow) {
      return NextResponse.json(
        { error: 'Orders require 7 days advance notice. Please call us directly for urgent requests.' },
        { status: 400 }
      )
    }

    // Calculate totals (using discounted total if applicable)
    const actualTotal = body.finalTotal || (body.orderTotal + body.deliveryFee)
    const depositAmount = calculateDepositAmount(actualTotal)
    const balanceDue = actualTotal - depositAmount

    // Prepare order items with pricing from menu data
    const orderItems: CreateOrderItemInput[] = []
    Object.entries(selectedItems).forEach(([itemName, quantities]) => {
      if (quantities.small > 0 || quantities.large > 0) {
        // Find item pricing from menu data
        const menuItem = trayCategories
          .flatMap(cat => cat.items)
          .find(item => item.name === itemName)

        if (menuItem) {
          const smallTotal = quantities.small * menuItem.smallPrice
          const largeTotal = quantities.large * menuItem.largePrice

          orderItems.push({
            order_id: '', // Will be filled when order is created
            item_name: itemName,
            small_quantity: quantities.small,
            large_quantity: quantities.large,
            small_price: menuItem.smallPrice,
            large_price: menuItem.largePrice,
            total_price: smallTotal + largeTotal
          })
        }
      }
    })

    // Calculate lead score based on order details
    const eventDateTime = new Date(eventDate)
    const daysUntilEvent = Math.floor((eventDateTime.getTime() - new Date().getTime()) / (1000 * 3600 * 24))

    // Check for premium items
    const premiumItems = ['Oxtail Stew', 'Jerk Shrimp', 'Curry Goat']
    const hasPremiumItems = orderItems.some(item =>
      premiumItems.some(premium => item.item_name.includes(premium))
    )

    // Save complete order to database
    console.log('[catering-menu-quote] Saving order to database...', email)

    const { customer, order, items, discount } = await db.createCompleteOrder({
      customer: {
        name,
        email,
        phone,
        lead_source: 'website'
      },
      order: {
        event_date: eventDate,
        guest_count: parseInt(guestCount),
        subtotal: body.orderTotal,
        delivery_fee: body.deliveryFee,
        discount_amount: body.discountApplication?.discountAmount || 0,
        discount_percentage: body.discountApplication?.discountPercentage || 0,
        total_amount: actualTotal,
        deposit_amount: depositAmount,
        balance_due: balanceDue,
        delivery_method: body.deliveryMethod,
        delivery_address: body.zipCode,
        special_requests: body.notes,
        status: actionType === 'pay_deposit' ? 'quote_requested' : 'quote_requested',
        payment_status: 'pending',
        workflow_stage: actionType === 'pay_deposit' ? 'deposit_requested' : 'quote_requested'
      },
      items: orderItems,
      discount: body.discountApplication ? {
        discount_id: body.selectedDiscountId || 'unknown',
        name: body.discountApplication.offerApplied.name,
        description: body.discountApplication.offerApplied.description,
        percentage: body.discountApplication.discountPercentage,
        amount: body.discountApplication.discountAmount,
        minimum_order: body.discountApplication.offerApplied.minimumOrder,
        days_in_advance: daysUntilEvent
      } : undefined
    })

    const orderId = order.order_number

    // Create order data for email workflows (backward compatibility)
    const orderData = {
      id: order.id, // Use database order ID for email scheduling
      orderNumber: orderId, // Keep order number for display
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      eventDate,
      guestCount: parseInt(guestCount),
      orderTotal: body.orderTotal,
      finalTotal: actualTotal,
      depositAmount,
      balanceDue,
      deliveryFee: body.deliveryFee,
      discountApplication: body.discountApplication,
      selectedDiscountId: body.selectedDiscountId,
      selectedItems: orderItems.map(item => ({
        name: item.item_name,
        smallQty: item.small_quantity,
        largeQty: item.large_quantity,
        smallPrice: item.small_price,
        largePrice: item.large_price,
      })),
      deliveryMethod: body.deliveryMethod,
      deliveryAddress: body.zipCode,
      specialRequests: body.notes,
      paymentStatus: 'pending' as const,
      workflowStage: order.workflow_stage,
    }

    console.log('[catering-menu-quote] Order saved to database:', {
      orderId,
      customerId: customer.id,
      orderDbId: order.id,
      actionType,
      totalAmount: actualTotal,
      depositAmount,
    })

    // Initialize email workflow
    const workflow = new EmailWorkflowEngine(orderData)
    const emailSchedule = await workflow.scheduleEmails()

    // Send immediate order confirmation email with choice
    const depositPaymentUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/catering-deposit?order=${orderId}`
    const quoteOnlyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/catering-quote-only?order=${orderId}`

    await sendOrderConfirmationEmail({
      ...orderData,
      depositPaymentUrl,
      quoteOnlyUrl,
    })

    // Send internal notifications
    await Promise.allSettled([
      sendInternalNotification(body, orderId, actionType),
      sendSlackNotification(body, orderId),
    ]).then((results) => {
      const labels = ['Internal Email', 'Slack']
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[catering-menu-quote] ${labels[i]} failed:`, r.reason)
      })
    })

    return NextResponse.json({
      success: true,
      orderId,
      depositAmount,
      balanceDue,
      emailSchedule: emailSchedule.length,
    })
  } catch (error) {
    console.error('[catering-menu-quote] Request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    )
  }
}
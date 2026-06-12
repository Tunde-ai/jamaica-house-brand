import { NextRequest, NextResponse } from 'next/server'

interface CustomLabelOrder {
  cases: number
  totalBottles: number
  subtotal: number
  contactName: string
  contactEmail: string
  contactPhone: string
  eventDate: string
  notes: string
  labelData: {
    template: string
    line1: string
    line2: string
    line3: string
    logoUrl: string | null
    logoFileName: string | null
  }
}

export async function POST(request: NextRequest) {
  try {
    const order: CustomLabelOrder = await request.json()

    // Validate required fields
    if (!order.contactName || !order.contactEmail || !order.labelData.line1) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (order.cases < 2) {
      return NextResponse.json(
        { error: 'Minimum order is 2 cases' },
        { status: 400 }
      )
    }

    // Calculate pricing server-side (don't trust client)
    const setupFee = order.cases <= 5 ? 15000 : 30000
    const fullTotal = (order.cases * 8000) + setupFee

    // Send notification email to JHB
    // For now, log the order — email integration can use existing email system
    console.log('=== NEW CUSTOM LABEL ORDER ===')
    console.log(`Contact: ${order.contactName} (${order.contactEmail})`)
    console.log(`Phone: ${order.contactPhone || 'N/A'}`)
    console.log(`Cases: ${order.cases} (${order.totalBottles} bottles)`)
    console.log(`Setup Fee: $${(setupFee / 100).toFixed(2)}`)
    console.log(`Total: $${(fullTotal / 100).toFixed(2)}`)
    console.log(`Event Date: ${order.eventDate || 'N/A'}`)
    console.log(`Template: ${order.labelData.template}`)
    console.log(`Label Text: "${order.labelData.line1}" / "${order.labelData.line2}" / "${order.labelData.line3}"`)
    console.log(`Has Logo: ${order.labelData.logoFileName ? 'Yes - ' + order.labelData.logoFileName : 'No'}`)
    console.log(`Notes: ${order.notes || 'None'}`)
    console.log('==============================')

    // Return success — no Stripe session needed yet
    // Payment link will be sent manually after label proof approval + bottle photos
    return NextResponse.json({
      success: true,
      orderSummary: {
        cases: order.cases,
        totalBottles: order.totalBottles,
        setupFee: setupFee / 100,
        total: fullTotal / 100,
      },
    })
  } catch (error) {
    console.error('Custom label order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import nodemailer from 'nodemailer'

// Email templates for different workflow stages
const EMAIL_TEMPLATES = {
  order_confirmation: {
    subject: '🎉 Your Jamaica House Catering Order - Choose Your Next Step!',
    getContent: (order: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Thank you for your catering request!</h1>
        <p>Hi ${order.customer?.name?.split(' ')[0] || 'there'},</p>
        <p>We've received your catering request for ${order.guest_count} guests on ${new Date(order.event_date).toLocaleDateString()}.</p>
        <p>Your order number is: <strong>${order.order_number}</strong></p>
        <p>We'll be in touch within 24 hours with your detailed quote.</p>
        <p>Questions? Call us at (786) 709-1027</p>
      </div>
    `
  },

  quote_follow_up_3_day: {
    subject: '📋 Your Jamaica House Catering Quote - Still Planning Your Event?',
    getContent: (order: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Don't forget about your upcoming event! 🎉</h1>
        <p>Hi ${order.customer?.name?.split(' ')[0] || 'there'},</p>
        <p>We sent you a quote for your ${new Date(order.event_date).toLocaleDateString()} event a few days ago.</p>
        <p><strong>Order #${order.order_number}</strong> - ${order.guest_count} guests</p>
        <p>Ready to secure your date? Pay just a 33% deposit ($${order.deposit_amount.toFixed(2)}) and we'll handle the rest!</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/catering-deposit?order=${order.order_number}"
             style="background: #d4a843; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🚀 Pay Deposit & Reserve Date - $${order.deposit_amount.toFixed(2)}
          </a>
        </div>
        <p>Questions? Reply to this email or call (786) 709-1027</p>
      </div>
    `
  },

  quote_urgency_7_day: {
    subject: '🔥 Popular Date Alert - Your Event Date is Filling Up Fast!',
    getContent: (order: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>⏰ Don't miss out on your perfect event date!</h1>
        <p>Hi ${order.customer?.name?.split(' ')[0] || 'there'},</p>
        <p>We've noticed you haven't secured your catering for <strong>${new Date(order.event_date).toLocaleDateString()}</strong> yet.</p>
        <p>Popular dates like yours book up quickly, especially for events with ${order.guest_count} guests.</p>
        <div style="background: #fff4e6; border-left: 4px solid #d4a843; padding: 15px; margin: 20px 0;">
          <h3>🎯 Secure your date now with just 33% deposit:</h3>
          <ul>
            <li>✅ Instant reservation confirmation</li>
            <li>✅ Authentic Jamaican flavors your guests will love</li>
            <li>✅ Balance due 2 weeks before event</li>
            <li>✅ Flexible refund policy</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/catering-deposit?order=${order.order_number}"
             style="background: #d4a843; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🔒 Reserve Date Now - $${order.deposit_amount.toFixed(2)}
          </a>
        </div>
        <p>Questions? Call us at (786) 709-1027 - we're here to help!</p>
      </div>
    `
  },

  quote_final_14_day: {
    subject: '⏰ Final Notice - Secure Your Authentic Jamaican Catering',
    getContent: (order: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Last chance to secure your catering! 🚨</h1>
        <p>Hi ${order.customer?.name?.split(' ')[0] || 'there'},</p>
        <p>This is our final reminder about your catering request for <strong>${new Date(order.event_date).toLocaleDateString()}</strong>.</p>
        <p>We'd hate for you to miss out on serving authentic Jamaican cuisine to your ${order.guest_count} guests.</p>
        <div style="background: #fee; border: 2px solid #e00; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #e00; margin-top: 0;">This is your final opportunity!</h3>
          <p>After this email, we'll remove your quote from our system to make room for confirmed orders.</p>
          <p>Don't let your guests miss out on an unforgettable dining experience.</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/catering-deposit?order=${order.order_number}"
             style="background: #d4a843; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
            🔥 SECURE NOW - $${order.deposit_amount.toFixed(2)}
          </a>
        </div>
        <p>Last chance! Call us at (786) 709-1027 if you need to discuss anything.</p>
      </div>
    `
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) {
    console.warn('[process-emails] GMAIL_APP_PASSWORD not set — skipping email')
    return false
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olatunde@jamaicahousebrand.com',
      pass: appPassword,
    },
  })

  try {
    await transporter.sendMail({
      from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('[process-emails] Failed to send email:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    console.log('[process-emails] Starting email processing...')

    // Get pending emails
    const pendingEmails = await db.getPendingEmails()
    console.log(`[process-emails] Found ${pendingEmails.length} pending emails`)

    if (pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending emails to process',
        processed: 0
      })
    }

    let processed = 0
    let failed = 0

    // Process each email
    for (const email of pendingEmails) {
      try {
        console.log(`[process-emails] Processing email: ${email.template_id} for ${email.recipient_email}`)

        // Get order details for template
        const order = await db.getOrder(email.order_id)
        if (!order) {
          console.warn(`[process-emails] Order not found for email: ${email.id}`)
          continue
        }

        // Get email template
        const template = EMAIL_TEMPLATES[email.template_id as keyof typeof EMAIL_TEMPLATES]
        if (!template) {
          console.warn(`[process-emails] Template not found: ${email.template_id}`)
          continue
        }

        // Generate email content
        const subject = email.subject || template.subject
        const html = template.getContent(order)

        // Send email
        const sent = await sendEmail(email.recipient_email, subject, html)

        if (sent) {
          // Mark as sent in database
          await db.markEmailSent(email.id)

          // Track activity
          if (order.customer_id) {
            await db.trackLeadActivity({
              customer_id: order.customer_id,
              order_id: order.id,
              activity_type: 'follow_up_sent',
              description: `Email sent: ${email.template_id}`,
              metadata: {
                email_id: email.id,
                template_id: email.template_id
              }
            })
          }

          processed++
          console.log(`[process-emails] ✅ Sent: ${email.template_id}`)
        } else {
          failed++
          console.error(`[process-emails] ❌ Failed: ${email.template_id}`)
        }

      } catch (error) {
        failed++
        console.error(`[process-emails] Error processing email ${email.id}:`, error)
      }
    }

    console.log(`[process-emails] Completed: ${processed} sent, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: `Processed ${processed + failed} emails`,
      processed,
      failed
    })

  } catch (error) {
    console.error('[process-emails] Error processing emails:', error)
    return NextResponse.json(
      { error: 'Failed to process emails' },
      { status: 500 }
    )
  }
}

// Allow GET for manual triggers
export async function GET() {
  return POST(new Request('http://localhost:3000/api/process-emails', { method: 'POST' }))
}
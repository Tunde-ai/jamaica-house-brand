import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import mailchimp from '@mailchimp/mailchimp_marketing'
import crypto from 'crypto'
import { WelcomeEmail } from '@/lib/email-templates/WelcomeEmail'

const apiKey = process.env.MAILCHIMP_API_KEY ?? ''
const audienceId = process.env.MAILCHIMP_AUDIENCE_ID ?? ''

if (apiKey) {
  mailchimp.setConfig({
    apiKey,
    server: apiKey.split('-').pop() ?? '',
  })
}

interface SubscribeBody {
  firstName: string
  email: string
  phone?: string
  emailOptIn: boolean
  smsOptIn: boolean
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscribeBody
    const { firstName, email, phone, emailOptIn, smsOptIn } = body

    if (!firstName || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Log subscriber data (visible in Vercel logs as backup)
    console.log('[subscribe] New subscriber:', {
      firstName,
      email,
      phone: phone ?? null,
      emailOptIn,
      smsOptIn,
      timestamp: new Date().toISOString(),
    })

    // Attempt Mailchimp integration
    if (apiKey && audienceId) {
      try {
        const mergeFields: Record<string, string> = { FNAME: firstName }
        if (phone && smsOptIn) {
          mergeFields.PHONE = phone
        }

        const subscriberHash = crypto
          .createHash('md5')
          .update(email.toLowerCase())
          .digest('hex')

        await mailchimp.lists.setListMember(audienceId, subscriberHash, {
          email_address: email,
          status: 'subscribed',
          merge_fields: mergeFields,
          tags: ['website-signup'],
        })

        console.log('[subscribe] Mailchimp success for:', email)
      } catch (mcError) {
        // Log but don't block
        console.error('[subscribe] Mailchimp error:', mcError)
      }
    } else {
      console.warn('[subscribe] Mailchimp not configured — skipping API call')
    }

    // Send welcome email via Resend
    if (process.env.RESEND_API_KEY && emailOptIn) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const html = await render(WelcomeEmail({ firstName: firstName.trim() }))

        await resend.emails.send({
          from: 'Jamaica House Brand <hello@jamaicahousebrand.com>',
          to: email,
          subject: `Welcome to the family, ${firstName}! 🔥`,
          html,
        })

        console.log('[subscribe] Welcome email sent to:', email)
      } catch (emailError) {
        // Log but don't block
        console.error('[subscribe] Welcome email error:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[subscribe] Request error:', error)
    return NextResponse.json({ success: true })
  }
}

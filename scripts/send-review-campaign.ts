// One-time campaign: "Record a Review, Get a Free Bottle"
// Targets Mailchimp contacts tagged "customer" only
// Run: npx tsx scripts/send-review-campaign.ts [--dry-run]

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { ReviewRequestEmail } from '../src/lib/email-templates/ReviewRequest'

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY ?? ''
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_AUDIENCE_ID ?? ''
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const SERVER = MAILCHIMP_API_KEY.split('-').pop()

if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
  console.error('ERROR: MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID must be set')
  process.exit(1)
}

const DRY_RUN = process.argv.includes('--dry-run')

interface MailchimpMember {
  email_address: string
  merge_fields: { FNAME?: string; LNAME?: string }
  tags: { name: string }[]
}

async function getCustomerContacts(): Promise<{ email: string; firstName: string }[]> {
  // Get contacts tagged "customer"
  const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/segments`

  // First find the customer tag/segment ID
  const tagsRes = await fetch(
    `https://${SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/tag-search?name=customer`,
    {
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )

  // Fall back to getting all members and filtering by tag
  const allMembers: { email: string; firstName: string }[] = []
  let offset = 0

  while (true) {
    const res = await fetch(
      `https://${SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members?status=subscribed&count=200&offset=${offset}&fields=members.email_address,members.merge_fields,members.tags,total_items`,
      {
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await res.json()

    for (const member of data.members as MailchimpMember[]) {
      const hasCustomerTag = member.tags?.some(
        (t: { name: string }) => t.name.toLowerCase() === 'customer'
      )
      if (hasCustomerTag) {
        allMembers.push({
          email: member.email_address,
          firstName: member.merge_fields?.FNAME || '',
        })
      }
    }

    offset += 200
    if (offset >= data.total_items) break
  }

  return allMembers
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('=== Review Campaign: Record a Review, Get a Free Bottle ===\n')

  if (DRY_RUN) {
    console.log('>>> DRY RUN — no emails will be sent <<<\n')
  }

  const customers = await getCustomerContacts()
  console.log(`Found ${customers.length} customers tagged "customer":\n`)

  for (const c of customers) {
    const name = c.firstName || '(no name)'
    console.log(`  ${name.padEnd(20)} ${c.email}`)
  }

  if (customers.length === 0) {
    console.log('\nNo customers found. Exiting.')
    return
  }

  if (DRY_RUN) {
    console.log('\n>>> Dry run complete. Run without --dry-run to send. <<<')
    return
  }

  if (!RESEND_API_KEY) {
    console.error('\nERROR: RESEND_API_KEY not set. Export it or add to .env')
    process.exit(1)
  }

  const resend = new Resend(RESEND_API_KEY)
  let sent = 0
  let failed = 0

  for (const customer of customers) {
    try {
      const html = await render(
        ReviewRequestEmail({ firstName: customer.firstName || undefined })
      )

      await resend.emails.send({
        from: 'Jamaica House Brand <hello@jamaicahousebrand.com>',
        to: customer.email,
        subject: `${customer.firstName || 'Hey'}, record a quick review & get a FREE bottle!`,
        html,
      })

      sent++
      console.log(`  ✓ Sent to ${customer.email}`)
    } catch (err: any) {
      failed++
      console.error(`  ✗ Failed: ${customer.email} — ${err.message}`)
    }

    // Rate limit
    await delay(500)
  }

  console.log(`\n=== Done: ${sent} sent, ${failed} failed ===`)
}

main().catch(console.error)

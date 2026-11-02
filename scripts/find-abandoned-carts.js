#!/usr/bin/env node

// =============================================================================
// One-time script: Find ALL abandoned PaymentIntents in Stripe
// and output a CSV-style report for manual outreach.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_live_xxx node scripts/find-abandoned-carts.js
//   # or if .env.local has the key:
//   node -e "require('dotenv').config({path:'.env.local'})" -e "" && node scripts/find-abandoned-carts.js
//
// To load from .env.local:
//   node --require dotenv/config scripts/find-abandoned-carts.js dotenv_config_path=.env.local
// =============================================================================

const Stripe = require('stripe')

async function main() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.error('ERROR: Set STRIPE_SECRET_KEY env var')
    process.exit(1)
  }

  const stripe = new Stripe(key)
  const allAbandoned = []
  let hasMore = true
  let startingAfter = undefined

  console.log('Scanning Stripe for abandoned carts...\n')

  while (hasMore) {
    const params = {
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    }

    const paymentIntents = await stripe.paymentIntents.list(params)

    for (const pi of paymentIntents.data) {
      const isOurCheckout = pi.metadata?.source === 'jamaica-house-brand-checkout'
      const isIncomplete =
        pi.status === 'requires_payment_method' ||
        pi.status === 'requires_confirmation' ||
        pi.status === 'requires_action'
      const hasEmail = !!pi.metadata?.customer_email
      const isNotUpsell = pi.metadata?.type !== 'post_purchase_upsell'
      const notAlreadyRecovered = !pi.metadata?.recovery_email_sent

      if (isOurCheckout && isIncomplete && hasEmail && isNotUpsell && notAlreadyRecovered) {
        let items = []
        try {
          items = JSON.parse(pi.metadata.items || '[]')
        } catch {}

        allAbandoned.push({
          id: pi.id,
          created: new Date(pi.created * 1000).toISOString(),
          age_hours: Math.round((Date.now() - pi.created * 1000) / (60 * 60 * 1000)),
          email: pi.metadata.customer_email,
          name: pi.metadata.customer_name || 'Unknown',
          amount: `$${(pi.amount / 100).toFixed(2)}`,
          items: items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
          shipping_address: pi.metadata.shipping_address || '',
          status: pi.status,
        })
      }
    }

    hasMore = paymentIntents.has_more
    if (hasMore && paymentIntents.data.length > 0) {
      startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id
    }
  }

  if (allAbandoned.length === 0) {
    console.log('No abandoned carts found.')
    return
  }

  console.log(`Found ${allAbandoned.length} abandoned cart(s):\n`)
  console.log('---')

  for (const cart of allAbandoned) {
    console.log(`Name:     ${cart.name}`)
    console.log(`Email:    ${cart.email}`)
    console.log(`Amount:   ${cart.amount}`)
    console.log(`Items:    ${cart.items}`)
    console.log(`Address:  ${cart.shipping_address}`)
    console.log(`Created:  ${cart.created} (${cart.age_hours}h ago)`)
    console.log(`Status:   ${cart.status}`)
    console.log(`PI ID:    ${cart.id}`)
    console.log('---')
  }

  // Also output as JSON for programmatic use
  const outPath = require('path').join(__dirname, '..', 'abandoned-carts-report.json')
  require('fs').writeFileSync(outPath, JSON.stringify(allAbandoned, null, 2))
  console.log(`\nFull report saved to: ${outPath}`)
}

main().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})

// Quick script to render the weekly marketing email to an HTML file for preview
// Run: npx tsx scripts/preview-email.tsx

import { render } from '@react-email/render'
import { writeFileSync } from 'fs'
import { WeeklyMarketingEmail, DEFAULT_PRODUCTS } from '../src/lib/email-templates/WeeklyMarketing'

async function main() {
  const html = await render(
    WeeklyMarketingEmail({
      firstName: 'Tunde',
      headline: 'Flash Sale: 20oz for $20',
      subheadline: "Two bottles of our Original Jerk Sauce at 50% off. Limited time — grab yours before they're gone.",
      products: DEFAULT_PRODUCTS,
    })
  )

  const outPath = '/Users/rfmstaff/Desktop/jhb-weekly-email-preview.html'
  writeFileSync(outPath, html, 'utf-8')
  console.log(`Email preview written to: ${outPath}`)
}

main().catch(console.error)

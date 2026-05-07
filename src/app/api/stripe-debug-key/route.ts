import { NextResponse } from 'next/server'

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY

  if (!stripeKey) {
    return NextResponse.json({ error: 'No Stripe key found' })
  }

  // Check for problematic characters
  const keyBytes = Buffer.from(stripeKey, 'utf8')
  const hasNonPrintable = keyBytes.some(byte => byte < 32 || byte > 126)
  const hexDump = keyBytes.toString('hex')

  return NextResponse.json({
    keyLength: stripeKey.length,
    keyPrefix: stripeKey.substring(0, 10),
    keySuffix: stripeKey.substring(stripeKey.length - 10),
    hasNonPrintableChars: hasNonPrintable,
    firstFewBytes: hexDump.substring(0, 40),
    lastFewBytes: hexDump.substring(hexDump.length - 20),
    containsNewline: stripeKey.includes('\n'),
    containsCarriageReturn: stripeKey.includes('\r'),
    containsTab: stripeKey.includes('\t'),
    rawLength: keyBytes.length
  })
}
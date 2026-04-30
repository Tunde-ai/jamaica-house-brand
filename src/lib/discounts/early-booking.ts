export interface DiscountOffer {
  id: string
  name: string
  description: string
  discountPercentage: number
  minimumOrder: number
  validUntil: Date
  conditions: string[]
  urgencyMessage: string
  badge: string
}

export interface DiscountApplication {
  originalTotal: number
  discountAmount: number
  finalTotal: number
  discountPercentage: number
  offerApplied: DiscountOffer
  savingsMessage: string
}

export class EarlyBookingDiscounts {
  getAvailableOffers(orderTotal: number, eventDate: string): DiscountOffer[] {
    const eventDateTime = new Date(eventDate)
    const today = new Date()
    const daysUntilEvent = Math.floor((eventDateTime.getTime() - today.getTime()) / (1000 * 3600 * 24))

    const offers: DiscountOffer[] = []

    // Early Bird Discount (Book 30+ days in advance)
    if (daysUntilEvent >= 30) {
      offers.push({
        id: 'early_bird_30',
        name: 'Early Bird Special',
        description: 'Book 30+ days ahead and save!',
        discountPercentage: 15,
        minimumOrder: 200,
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        conditions: [
          'Event must be 30+ days away',
          'Minimum order $200',
          'Pay deposit now to lock in savings'
        ],
        urgencyMessage: '⏰ This 15% discount expires in 48 hours!',
        badge: '15% OFF'
      })
    }

    // Plan Ahead Discount (Book 14-29 days in advance)
    if (daysUntilEvent >= 14 && daysUntilEvent < 30) {
      offers.push({
        id: 'plan_ahead_14',
        name: 'Plan Ahead Discount',
        description: 'Smart planners save money!',
        discountPercentage: 10,
        minimumOrder: 150,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        conditions: [
          'Event must be 14+ days away',
          'Minimum order $150',
          'Pay deposit within 24 hours'
        ],
        urgencyMessage: '🚨 Save 10% - Limited time offer!',
        badge: '10% OFF'
      })
    }

    // Instant Booking Bonus (Any event, immediate deposit)
    offers.push({
      id: 'instant_booking',
      name: 'Instant Booking Bonus',
      description: 'Skip the wait, secure your savings!',
      discountPercentage: 8,
      minimumOrder: 250,
      validUntil: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      conditions: [
        'Pay deposit immediately',
        'Minimum order $250',
        'Valid for next 60 minutes'
      ],
      urgencyMessage: '⚡ Pay deposit now and save 8% - Expires in 1 hour!',
      badge: 'INSTANT 8% OFF'
    })

    // Filter offers by minimum order requirement
    return offers.filter(offer => orderTotal >= offer.minimumOrder)
  }

  getBestOffer(orderTotal: number, eventDate: string): DiscountOffer | null {
    const availableOffers = this.getAvailableOffers(orderTotal, eventDate)

    if (availableOffers.length === 0) return null

    // Return the offer with highest discount percentage
    return availableOffers.reduce((best, current) =>
      current.discountPercentage > best.discountPercentage ? current : best
    )
  }

  calculateDiscount(orderTotal: number, eventDate: string, offerId?: string): DiscountApplication | null {
    const availableOffers = this.getAvailableOffers(orderTotal, eventDate)

    let selectedOffer: DiscountOffer | undefined

    if (offerId) {
      selectedOffer = availableOffers.find(offer => offer.id === offerId)
    } else {
      selectedOffer = this.getBestOffer(orderTotal, eventDate) || undefined
    }

    if (!selectedOffer) return null

    const discountAmount = Math.round(orderTotal * (selectedOffer.discountPercentage / 100) * 100) / 100
    const finalTotal = orderTotal - discountAmount

    return {
      originalTotal: orderTotal,
      discountAmount,
      finalTotal,
      discountPercentage: selectedOffer.discountPercentage,
      offerApplied: selectedOffer,
      savingsMessage: `You saved $${discountAmount.toFixed(2)} with ${selectedOffer.name}!`
    }
  }

  generateUrgencyMessage(offer: DiscountOffer): string {
    const now = new Date()
    const timeLeft = offer.validUntil.getTime() - now.getTime()
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (timeLeft <= 0) return '⏰ This offer has expired'

    if (hoursLeft >= 24) {
      const daysLeft = Math.floor(hoursLeft / 24)
      return `⏰ ${offer.urgencyMessage} Only ${daysLeft} day${daysLeft > 1 ? 's' : ''} left!`
    } else if (hoursLeft > 0) {
      return `⏰ ${offer.urgencyMessage} Only ${hoursLeft}h ${minutesLeft}m left!`
    } else {
      return `🚨 FINAL MINUTES! ${offer.urgencyMessage} Only ${minutesLeft} minutes left!`
    }
  }

  isOfferValid(offer: DiscountOffer): boolean {
    return new Date() < offer.validUntil
  }
}

export const earlyBookingDiscounts = new EarlyBookingDiscounts()

// Preset discount configurations for easy management
export const DISCOUNT_CONFIGS = {
  EARLY_BIRD_PERCENTAGE: 15,
  PLAN_AHEAD_PERCENTAGE: 10,
  INSTANT_BOOKING_PERCENTAGE: 8,

  EARLY_BIRD_MIN_DAYS: 30,
  PLAN_AHEAD_MIN_DAYS: 14,

  EARLY_BIRD_MIN_ORDER: 200,
  PLAN_AHEAD_MIN_ORDER: 150,
  INSTANT_BOOKING_MIN_ORDER: 250,

  EARLY_BIRD_VALIDITY_HOURS: 48,
  PLAN_AHEAD_VALIDITY_HOURS: 24,
  INSTANT_BOOKING_VALIDITY_HOURS: 1
}
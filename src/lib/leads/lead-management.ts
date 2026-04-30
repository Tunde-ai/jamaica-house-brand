export interface Lead {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  eventDate: string
  guestCount: number
  orderTotal: number
  depositAmount: number
  selectedItems: any[]
  deliveryMethod: 'pickup' | 'delivery'
  status: 'quote_requested' | 'deposit_paid' | 'quote_sent' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'converted' | 'lost'
  source: 'website' | 'phone' | 'referral' | 'social_media'
  createdAt: string
  lastContactDate?: string
  conversionDate?: string
  notes?: string
  leadScore: number
}

export interface LeadMetrics {
  totalLeads: number
  quoteRequests: number
  depositsPaid: number
  conversionRate: number
  averageOrderValue: number
  leadsNeedingFollowUp: number
}

export class LeadManager {
  calculateLeadScore(lead: Lead): number {
    let score = 0

    // Base score
    score += 10

    // Order value scoring
    if (lead.orderTotal > 500) score += 30
    else if (lead.orderTotal > 300) score += 20
    else if (lead.orderTotal > 200) score += 10

    // Group size scoring
    if (lead.guestCount > 100) score += 20
    else if (lead.guestCount > 50) score += 15
    else if (lead.guestCount > 25) score += 10

    // Event timing scoring (closer events are higher value)
    const eventDate = new Date(lead.eventDate)
    const today = new Date()
    const daysUntilEvent = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (daysUntilEvent <= 30) score += 25
    else if (daysUntilEvent <= 60) score += 15
    else if (daysUntilEvent <= 90) score += 10

    // Delivery method scoring (delivery indicates serious intent)
    if (lead.deliveryMethod === 'delivery') score += 10

    // Special items scoring (premium items indicate higher budget)
    const premiumItems = ['Oxtail Stew', 'Jerk Shrimp', 'Curry Goat']
    const hasPremiumItems = lead.selectedItems.some(item =>
      premiumItems.some(premium => item.name.includes(premium))
    )
    if (hasPremiumItems) score += 15

    return Math.min(score, 100) // Cap at 100
  }

  getFollowUpSchedule(lead: Lead): Array<{
    day: number
    emailTemplate: string
    action: string
  }> {
    const eventDate = new Date(lead.eventDate)
    const today = new Date()
    const daysUntilEvent = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    const schedule = []

    // Immediate confirmation (Day 0)
    schedule.push({
      day: 0,
      emailTemplate: 'quote_confirmation',
      action: 'Send quote request confirmation'
    })

    // First follow-up (Day 2)
    schedule.push({
      day: 2,
      emailTemplate: 'gentle_follow_up',
      action: 'Gentle follow-up with special offer'
    })

    // Second follow-up (Day 5)
    schedule.push({
      day: 5,
      emailTemplate: 'value_proposition',
      action: 'Highlight unique value and testimonials'
    })

    // Third follow-up (Day 10)
    schedule.push({
      day: 10,
      emailTemplate: 'urgency_creator',
      action: 'Create urgency based on event date'
    })

    // Event-based follow-up (if event is soon)
    if (daysUntilEvent <= 21) {
      schedule.push({
        day: 14,
        emailTemplate: 'last_chance',
        action: 'Final opportunity to book'
      })
    }

    return schedule
  }

  prioritizeLeads(leads: Lead[]): Lead[] {
    return leads
      .map(lead => ({ ...lead, leadScore: this.calculateLeadScore(lead) }))
      .sort((a, b) => {
        // First priority: event date proximity
        const aEventDays = Math.floor((new Date(a.eventDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        const bEventDays = Math.floor((new Date(b.eventDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))

        // Events in next 30 days get top priority
        if (aEventDays <= 30 && bEventDays > 30) return -1
        if (bEventDays <= 30 && aEventDays > 30) return 1

        // Then by lead score
        if (a.leadScore !== b.leadScore) return b.leadScore - a.leadScore

        // Finally by order value
        return b.orderTotal - a.orderTotal
      })
  }

  getLeadMetrics(leads: Lead[]): LeadMetrics {
    const totalLeads = leads.length
    const quoteRequests = leads.filter(l => l.status === 'quote_requested').length
    const depositsPaid = leads.filter(l => l.status === 'deposit_paid' || l.status === 'converted').length
    const conversionRate = totalLeads > 0 ? (depositsPaid / totalLeads) * 100 : 0
    const averageOrderValue = totalLeads > 0 ?
      leads.reduce((sum, l) => sum + l.orderTotal, 0) / totalLeads : 0

    // Leads needing follow-up (created more than 24 hours ago, no recent contact)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const leadsNeedingFollowUp = leads.filter(l =>
      l.status === 'quote_requested' &&
      new Date(l.createdAt) < oneDayAgo &&
      (!l.lastContactDate || new Date(l.lastContactDate) < oneDayAgo)
    ).length

    return {
      totalLeads,
      quoteRequests,
      depositsPaid,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      leadsNeedingFollowUp
    }
  }
}

export const leadManager = new LeadManager()
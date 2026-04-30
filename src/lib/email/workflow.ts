interface OrderData {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  eventDate: string
  guestCount: number
  orderTotal: number
  depositAmount: number
  balanceDue: number
  selectedItems: any[]
  deliveryMethod: 'pickup' | 'delivery'
  deliveryAddress?: string
  specialRequests?: string
  paymentStatus: 'pending' | 'deposit_paid' | 'paid_full' | 'refunded'
  workflowStage: string
}

interface EmailTemplate {
  id: string
  subject: string
  trigger: string
  daysOffset: number
  condition?: (order: OrderData) => boolean
}

export const emailWorkflow: EmailTemplate[] = [
  {
    id: 'order_confirmation',
    subject: '🎉 Your Jamaica House Catering Order - Choose Your Next Step!',
    trigger: 'immediate',
    daysOffset: 0,
  },
  {
    id: 'deposit_gentle_reminder',
    subject: '⏰ Secure Your Date - 33% Deposit Reserves Your Trays',
    trigger: 'after_order',
    daysOffset: 2,
    condition: (order) => order.paymentStatus === 'pending',
  },
  {
    id: 'quote_follow_up_3_day',
    subject: '📋 Your Jamaica House Catering Quote - Still Planning Your Event?',
    trigger: 'after_order',
    daysOffset: 3,
    condition: (order) => order.paymentStatus === 'pending' && order.workflowStage === 'quote_requested',
  },
  {
    id: 'quote_urgency_7_day',
    subject: '🔥 Popular Date Alert - Your Event Date is Filling Up Fast!',
    trigger: 'after_order',
    daysOffset: 7,
    condition: (order) => order.paymentStatus === 'pending' && order.workflowStage === 'quote_requested',
  },
  {
    id: 'quote_final_14_day',
    subject: '⏰ Final Notice - Secure Your Authentic Jamaican Catering',
    trigger: 'after_order',
    daysOffset: 14,
    condition: (order) => order.paymentStatus === 'pending' && order.workflowStage === 'quote_requested',
  },
  {
    id: 'headcount_confirmation',
    subject: '📋 Final Headcount Check - 3 Weeks to Go!',
    trigger: 'before_event',
    daysOffset: -21,
  },
  {
    id: 'balance_payment_reminder',
    subject: '💳 Complete Your Order - Balance Payment Ready',
    trigger: 'before_event',
    daysOffset: -14,
    condition: (order) => order.paymentStatus === 'deposit_paid',
  },
  {
    id: 'final_confirmation',
    subject: '✅ Final Details - Your Jamaica House Catering is Confirmed!',
    trigger: 'before_event',
    daysOffset: -7,
  },
  {
    id: 'delivery_logistics',
    subject: '🚚 Almost Here - Event Day Logistics & Contact Info',
    trigger: 'before_event',
    daysOffset: -3,
  },
  {
    id: 'day_of_notification',
    subject: '🔥 We\'re On Our Way - Jamaica House Catering En Route!',
    trigger: 'event_day',
    daysOffset: 0,
  },
  {
    id: 'thank_you_review',
    subject: '🙏 How Was Everything? Share Your Experience!',
    trigger: 'after_event',
    daysOffset: 1,
  },
  {
    id: 'future_booking_offer',
    subject: '🎊 Planning Another Event? VIP Pricing Inside',
    trigger: 'after_event',
    daysOffset: 7,
  },
]

export class EmailWorkflowEngine {
  constructor(private orderData: OrderData) {}

  calculateEmailSchedule(): Array<{
    emailId: string
    scheduledDate: Date
    subject: string
  }> {
    const eventDate = new Date(this.orderData.eventDate)
    const orderDate = new Date()
    const schedule: Array<{
      emailId: string
      scheduledDate: Date
      subject: string
    }> = []

    emailWorkflow.forEach(template => {
      // Check condition if exists
      if (template.condition && !template.condition(this.orderData)) {
        return
      }

      let scheduledDate: Date

      switch (template.trigger) {
        case 'immediate':
          scheduledDate = orderDate
          break
        case 'after_order':
          scheduledDate = new Date(orderDate.getTime() + template.daysOffset * 24 * 60 * 60 * 1000)
          break
        case 'before_event':
        case 'event_day':
          scheduledDate = new Date(eventDate.getTime() + template.daysOffset * 24 * 60 * 60 * 1000)
          break
        case 'after_event':
          scheduledDate = new Date(eventDate.getTime() + template.daysOffset * 24 * 60 * 60 * 1000)
          break
        default:
          return
      }

      // Don't schedule emails in the past
      if (scheduledDate > orderDate) {
        schedule.push({
          emailId: template.id,
          scheduledDate,
          subject: template.subject,
        })
      }
    })

    return schedule.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  }

  async scheduleEmails() {
    const schedule = this.calculateEmailSchedule()

    console.log('📧 Email Schedule for Order:', this.orderData.id)

    // Import database service dynamically to avoid circular dependencies
    const { db } = await import('@/lib/database')

    // Save each email to the database for actual scheduling
    const scheduledEmails = await Promise.allSettled(
      schedule.map(async (email) => {
        console.log(`  Scheduling: ${email.scheduledDate.toLocaleDateString()} - ${email.subject}`)

        return await db.scheduleEmail({
          order_id: this.orderData.id, // This will be the database order ID, not the order number
          template_id: email.emailId,
          subject: email.subject,
          recipient_email: this.orderData.customerEmail,
          scheduled_for: email.scheduledDate.toISOString(),
        })
      })
    )

    // Log results
    scheduledEmails.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`  ✅ Scheduled: ${schedule[index].subject}`)
      } else {
        console.error(`  ❌ Failed to schedule: ${schedule[index].subject}`, result.reason)
      }
    })

    return schedule
  }
}

export function calculateDepositAmount(orderTotal: number): number {
  return Math.round(orderTotal * 0.33) // 33% deposit
}

export function calculateMinimumOrder(deliveryMethod: 'pickup' | 'delivery'): number {
  return deliveryMethod === 'delivery' ? 250 : 150
}

export function calculateRefundAmount(
  depositAmount: number,
  daysUntilEvent: number
): { refundAmount: number; refundPercentage: number } {
  if (daysUntilEvent >= 21) {
    return { refundAmount: depositAmount, refundPercentage: 100 }
  } else if (daysUntilEvent >= 14) {
    const refund = Math.round(depositAmount * 0.75)
    return { refundAmount: refund, refundPercentage: 75 }
  } else if (daysUntilEvent >= 7) {
    const refund = Math.round(depositAmount * 0.50)
    return { refundAmount: refund, refundPercentage: 50 }
  } else if (daysUntilEvent >= 3) {
    const refund = Math.round(depositAmount * 0.25)
    return { refundAmount: refund, refundPercentage: 25 }
  } else {
    return { refundAmount: 0, refundPercentage: 0 }
  }
}
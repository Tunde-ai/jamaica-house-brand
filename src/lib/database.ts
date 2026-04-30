import { getSupabase } from './supabase'
import type {
  Customer,
  Order,
  OrderItem,
  Payment,
  Discount,
  EmailWorkflow,
  LeadActivity,
  CreateCustomerInput,
  CreateOrderInput,
  CreateOrderItemInput,
  CreatePaymentInput,
  CreateEmailWorkflowInput,
  CreateLeadActivityInput,
  UpdateOrderInput,
  UpdateCustomerInput,
  OrderAnalytics,
  CustomerAnalytics,
  DashboardSummary,
  DatabaseError
} from '@/types/database'

export class DatabaseService {
  public supabase = getSupabase()

  // =============================================
  // CUSTOMER MANAGEMENT
  // =============================================

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    console.log('[DatabaseService] Creating customer:', input.email)

    // Check if customer already exists
    const existing = await this.getCustomerByEmail(input.email)
    if (existing) {
      console.log('[DatabaseService] Customer already exists, returning existing:', existing.id)
      return existing
    }

    const { data, error } = await this.supabase
      .from('customers')
      .insert([input])
      .select()
      .single()

    if (error) {
      console.error('[DatabaseService] Error creating customer:', error)
      throw new Error(`Failed to create customer: ${error.message}`)
    }

    console.log('[DatabaseService] Customer created:', data.id)
    return data
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[DatabaseService] Error fetching customer:', error)
      throw new Error(`Failed to fetch customer: ${error.message}`)
    }

    return data || null
  }

  async updateCustomer(id: string, updates: UpdateCustomerInput): Promise<Customer> {
    const { data, error } = await this.supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[DatabaseService] Error updating customer:', error)
      throw new Error(`Failed to update customer: ${error.message}`)
    }

    return data
  }

  async updateCustomerStats(customerId: string, orderTotal: number): Promise<void> {
    const { error } = await this.supabase.rpc('update_customer_stats', {
      customer_id: customerId,
      order_amount: orderTotal
    })

    if (error) {
      console.error('[DatabaseService] Error updating customer stats:', error)
    }
  }

  // =============================================
  // ORDER MANAGEMENT
  // =============================================

  async createOrder(input: CreateOrderInput): Promise<Order> {
    console.log('[DatabaseService] Creating order for customer:', input.customer_id)

    // Generate unique order number
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const order_number = `JHB-${timestamp}-${random}`

    const orderData = {
      ...input,
      order_number,
    }

    const { data, error } = await this.supabase
      .from('orders')
      .insert([orderData])
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        payments(*),
        discounts(*)
      `)
      .single()

    if (error) {
      console.error('[DatabaseService] Error creating order:', error)
      throw new Error(`Failed to create order: ${error.message}`)
    }

    console.log('[DatabaseService] Order created:', data.order_number)
    return data
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        payments(*),
        discounts(*)
      `)
      .eq('id', orderId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[DatabaseService] Error fetching order:', error)
      throw new Error(`Failed to fetch order: ${error.message}`)
    }

    return data || null
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        payments(*),
        discounts(*)
      `)
      .eq('order_number', orderNumber)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[DatabaseService] Error fetching order by number:', error)
      throw new Error(`Failed to fetch order: ${error.message}`)
    }

    return data || null
  }

  async updateOrder(orderId: string, updates: UpdateOrderInput): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        payments(*),
        discounts(*)
      `)
      .single()

    if (error) {
      console.error('[DatabaseService] Error updating order:', error)
      throw new Error(`Failed to update order: ${error.message}`)
    }

    return data
  }

  async getOrdersByStatus(status: Order['status'], limit = 50): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(name, email, phone)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[DatabaseService] Error fetching orders by status:', error)
      throw new Error(`Failed to fetch orders: ${error.message}`)
    }

    return data || []
  }

  // =============================================
  // ORDER ITEMS
  // =============================================

  async createOrderItems(items: CreateOrderItemInput[]): Promise<OrderItem[]> {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert(items)
      .select()

    if (error) {
      console.error('[DatabaseService] Error creating order items:', error)
      throw new Error(`Failed to create order items: ${error.message}`)
    }

    return data
  }

  // =============================================
  // PAYMENT TRACKING
  // =============================================

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .insert([input])
      .select()
      .single()

    if (error) {
      console.error('[DatabaseService] Error creating payment:', error)
      throw new Error(`Failed to create payment: ${error.message}`)
    }

    console.log('[DatabaseService] Payment record created:', data.id)
    return data
  }

  async updatePaymentStatus(
    paymentId: string,
    status: Payment['status'],
    stripeData?: {
      charge_id?: string
      payment_intent_id?: string
    }
  ): Promise<Payment> {
    const updates: any = {
      status,
      processed_at: status === 'succeeded' ? new Date().toISOString() : null
    }

    if (stripeData) {
      if (stripeData.charge_id) updates.stripe_charge_id = stripeData.charge_id
      if (stripeData.payment_intent_id) updates.stripe_payment_intent_id = stripeData.payment_intent_id
    }

    const { data, error } = await this.supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      console.error('[DatabaseService] Error updating payment:', error)
      throw new Error(`Failed to update payment: ${error.message}`)
    }

    return data
  }

  async getPaymentByStripeSession(sessionId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[DatabaseService] Error fetching payment:', error)
      throw new Error(`Failed to fetch payment: ${error.message}`)
    }

    return data || null
  }

  // =============================================
  // DISCOUNT TRACKING
  // =============================================

  async createDiscount(discount: Omit<Discount, 'id' | 'created_at'>): Promise<Discount> {
    const { data, error } = await this.supabase
      .from('discounts')
      .insert([discount])
      .select()
      .single()

    if (error) {
      console.error('[DatabaseService] Error creating discount:', error)
      throw new Error(`Failed to create discount: ${error.message}`)
    }

    return data
  }

  // =============================================
  // EMAIL WORKFLOW AUTOMATION
  // =============================================

  async scheduleEmail(input: CreateEmailWorkflowInput): Promise<EmailWorkflow> {
    const { data, error } = await this.supabase
      .from('email_workflows')
      .insert([input])
      .select()
      .single()

    if (error) {
      console.error('[DatabaseService] Error scheduling email:', error)
      throw new Error(`Failed to schedule email: ${error.message}`)
    }

    console.log('[DatabaseService] Email scheduled:', data.template_id, 'for', data.scheduled_for)
    return data
  }

  async getPendingEmails(): Promise<EmailWorkflow[]> {
    const now = new Date().toISOString()

    const { data, error } = await this.supabase
      .from('email_workflows')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('[DatabaseService] Error fetching pending emails:', error)
      throw new Error(`Failed to fetch pending emails: ${error.message}`)
    }

    return data || []
  }

  async markEmailSent(emailId: string): Promise<void> {
    const { error } = await this.supabase
      .from('email_workflows')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', emailId)

    if (error) {
      console.error('[DatabaseService] Error marking email sent:', error)
    }
  }

  // =============================================
  // LEAD ACTIVITY TRACKING
  // =============================================

  async trackLeadActivity(input: CreateLeadActivityInput): Promise<LeadActivity> {
    const { data, error } = await this.supabase
      .from('lead_activities')
      .insert([input])
      .select()
      .single()

    if (error) {
      console.error('[DatabaseService] Error tracking lead activity:', error)
      throw new Error(`Failed to track lead activity: ${error.message}`)
    }

    return data
  }

  // =============================================
  // ANALYTICS & REPORTING
  // =============================================

  async getDashboardSummary(): Promise<DashboardSummary> {
    const [ordersData, revenueData, customersData] = await Promise.all([
      this.getOrderSummary(),
      this.getRevenueSummary(),
      this.getCustomerSummary()
    ])

    const alerts = await this.getAlerts()

    return {
      orders: ordersData,
      revenue: revenueData,
      customers: customersData,
      alerts
    }
  }

  private async getOrderSummary() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('status, event_date, created_at')

    if (error) throw new Error(`Failed to fetch order summary: ${error.message}`)

    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return {
      pending_quotes: data?.filter(o => o.status === 'quote_requested').length || 0,
      awaiting_deposit: data?.filter(o => o.status === 'quote_requested').length || 0,
      confirmed_orders: data?.filter(o => o.status === 'confirmed' || o.status === 'deposit_paid').length || 0,
      upcoming_events: data?.filter(o => {
        const eventDate = new Date(o.event_date)
        return eventDate <= nextWeek && eventDate >= now
      }).length || 0
    }
  }

  private async getRevenueSummary() {
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const { data, error } = await this.supabase
      .from('orders')
      .select('total_amount, deposit_amount, payment_status, created_at')
      .gte('created_at', thisMonth.toISOString())

    if (error) throw new Error(`Failed to fetch revenue summary: ${error.message}`)

    const thisMonthRevenue = data?.reduce((sum, o) => {
      return sum + (o.payment_status === 'deposit_paid' ? o.deposit_amount : 0)
    }, 0) || 0

    const pendingDeposits = data?.reduce((sum, o) => {
      return sum + (o.payment_status === 'pending' ? o.deposit_amount : 0)
    }, 0) || 0

    const projectedMonthly = data?.reduce((sum, o) => sum + o.total_amount, 0) || 0

    return {
      this_month: thisMonthRevenue,
      pending_deposits: pendingDeposits,
      projected_monthly: projectedMonthly
    }
  }

  private async getCustomerSummary() {
    const thisMonth = new Date()
    thisMonth.setDate(1)

    const { data: totalData, error: totalError } = await this.supabase
      .from('customers')
      .select('created_at', { count: 'exact' })

    const { data: newData, error: newError } = await this.supabase
      .from('customers')
      .select('created_at', { count: 'exact' })
      .gte('created_at', thisMonth.toISOString())

    const { data: highValueData, error: highValueError } = await this.supabase
      .from('customers')
      .select('lead_score', { count: 'exact' })
      .gte('lead_score', 70)

    if (totalError || newError || highValueError) {
      throw new Error('Failed to fetch customer summary')
    }

    return {
      total: totalData?.length || 0,
      new_this_month: newData?.length || 0,
      high_value_leads: highValueData?.length || 0
    }
  }

  private async getAlerts() {
    // This would be more sophisticated in production
    return [
      {
        type: 'follow_up_needed' as const,
        message: 'New system ready! Check pending quotes for follow-up opportunities.'
      }
    ]
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  async createCompleteOrder(orderData: {
    customer: CreateCustomerInput
    order: Omit<CreateOrderInput, 'customer_id'>
    items: Omit<CreateOrderItemInput, 'order_id'>[]
    discount?: Omit<Discount, 'id' | 'order_id' | 'created_at'>
  }) {
    console.log('[DatabaseService] Creating complete order for:', orderData.customer.email)

    try {
      // 1. Create or get customer
      const customer = await this.createCustomer(orderData.customer)

      // 2. Create order
      const order = await this.createOrder({
        ...orderData.order,
        customer_id: customer.id
      })

      // 3. Create order items
      const items = await this.createOrderItems(
        orderData.items.map(item => ({
          ...item,
          order_id: order.id
        }))
      )

      // 4. Create discount if provided
      let discount = null
      if (orderData.discount) {
        discount = await this.createDiscount({
          ...orderData.discount,
          order_id: order.id
        })
      }

      // 5. Track lead activity
      await this.trackLeadActivity({
        customer_id: customer.id,
        order_id: order.id,
        activity_type: 'quote_requested',
        description: `Order ${order.order_number} - ${order.status}`
      })

      console.log('[DatabaseService] Complete order created:', order.order_number)

      return {
        customer,
        order: { ...order, order_items: items, discounts: discount ? [discount] : [] },
        items,
        discount
      }
    } catch (error) {
      console.error('[DatabaseService] Error creating complete order:', error)
      throw error
    }
  }
}

// Export singleton instance
export const db = new DatabaseService()
// Database Types for Jamaica House Brand Catering System

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  lead_score: number
  lead_source: 'website' | 'phone' | 'referral' | 'social_media'
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  event_date: string
  guest_count: number
  subtotal: number
  delivery_fee: number
  discount_amount: number
  discount_percentage: number
  total_amount: number
  deposit_amount: number
  balance_due: number
  delivery_method: 'pickup' | 'delivery'
  delivery_address?: string
  special_requests?: string
  status: 'quote_requested' | 'deposit_paid' | 'confirmed' | 'in_preparation' | 'ready' | 'delivered' | 'completed' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'deposit_paid' | 'paid_full' | 'refunded' | 'partially_refunded'
  workflow_stage: string
  created_at: string
  updated_at: string

  // Relations
  customer?: Customer
  order_items?: OrderItem[]
  payments?: Payment[]
  discounts?: Discount[]
}

export interface OrderItem {
  id: string
  order_id: string
  item_name: string
  small_quantity: number
  large_quantity: number
  small_price: number
  large_price: number
  total_price: number
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  payment_type: 'deposit' | 'balance' | 'full' | 'refund'
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
  processed_at?: string
  created_at: string
}

export interface Discount {
  id: string
  order_id: string
  discount_id: string
  name: string
  description?: string
  percentage: number
  amount: number
  minimum_order?: number
  days_in_advance?: number
  created_at: string
}

export interface EmailWorkflow {
  id: string
  order_id: string
  template_id: string
  subject: string
  recipient_email: string
  scheduled_for: string
  sent_at?: string
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  opened_at?: string
  clicked_at?: string
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  customer_id: string
  order_id?: string
  activity_type: 'quote_requested' | 'email_opened' | 'email_clicked' | 'deposit_paid' | 'phone_call' | 'website_visit' | 'follow_up_sent'
  description?: string
  metadata?: Record<string, any>
  created_at: string
}

// Input types for creating new records
export interface CreateCustomerInput {
  name: string
  email: string
  phone: string
  lead_source?: Customer['lead_source']
}

export interface CreateOrderInput {
  customer_id: string
  event_date: string
  guest_count: number
  subtotal: number
  delivery_fee: number
  discount_amount?: number
  discount_percentage?: number
  total_amount: number
  deposit_amount: number
  balance_due: number
  delivery_method: Order['delivery_method']
  delivery_address?: string
  special_requests?: string
  status?: Order['status']
  payment_status?: Order['payment_status']
  workflow_stage?: string
}

export interface CreateOrderItemInput {
  order_id: string
  item_name: string
  small_quantity: number
  large_quantity: number
  small_price: number
  large_price: number
  total_price: number
}

export interface CreatePaymentInput {
  order_id: string
  amount: number
  payment_type: Payment['payment_type']
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  status?: Payment['status']
}

export interface CreateEmailWorkflowInput {
  order_id: string
  template_id: string
  subject: string
  recipient_email: string
  scheduled_for: string
}

export interface CreateLeadActivityInput {
  customer_id: string
  order_id?: string
  activity_type: LeadActivity['activity_type']
  description?: string
  metadata?: Record<string, any>
}

// Update types
export interface UpdateOrderInput {
  status?: Order['status']
  payment_status?: Order['payment_status']
  workflow_stage?: string
  delivery_address?: string
  special_requests?: string
}

export interface UpdateCustomerInput {
  name?: string
  email?: string
  phone?: string
  lead_score?: number
  total_orders?: number
  total_spent?: number
}

// Analytics and reporting types
export interface OrderAnalytics {
  total_orders: number
  total_revenue: number
  average_order_value: number
  deposit_conversion_rate: number
  popular_items: Array<{
    item_name: string
    total_orders: number
    total_quantity: number
  }>
  monthly_trends: Array<{
    month: string
    orders: number
    revenue: number
  }>
}

export interface CustomerAnalytics {
  total_customers: number
  new_customers_this_month: number
  repeat_customer_rate: number
  average_lead_score: number
  lead_conversion_rate: number
  top_customers: Array<{
    customer: Customer
    total_spent: number
    total_orders: number
  }>
}

// Dashboard summary type
export interface DashboardSummary {
  orders: {
    pending_quotes: number
    awaiting_deposit: number
    confirmed_orders: number
    upcoming_events: number
  }
  revenue: {
    this_month: number
    pending_deposits: number
    projected_monthly: number
  }
  customers: {
    total: number
    new_this_month: number
    high_value_leads: number
  }
  alerts: Array<{
    type: 'payment_overdue' | 'event_approaching' | 'follow_up_needed'
    message: string
    order_id?: string
    customer_id?: string
  }>
}

// Error types
export interface DatabaseError {
  code: string
  message: string
  details?: string
}
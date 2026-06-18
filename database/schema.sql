-- Jamaica House Brand Catering Database Schema
-- Run this in Supabase SQL Editor

-- =============================================
-- CUSTOMERS TABLE - Lead and customer tracking
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Lead scoring and tracking
  lead_score INTEGER DEFAULT 0,
  lead_source TEXT CHECK (lead_source IN ('website', 'phone', 'referral', 'social_media')) DEFAULT 'website',
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for performance
  UNIQUE(email)
);

-- =============================================
-- ORDERS TABLE - Main order tracking
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE, -- JHB-timestamp-random format
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Event details
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL,

  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_percentage INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Deposit calculations
  deposit_amount DECIMAL(10,2) NOT NULL,
  balance_due DECIMAL(10,2) NOT NULL,

  -- Order details
  delivery_method TEXT CHECK (delivery_method IN ('pickup', 'delivery')) NOT NULL,
  delivery_address TEXT,
  special_requests TEXT,

  -- Status tracking
  status TEXT CHECK (status IN (
    'quote_requested',
    'deposit_paid',
    'confirmed',
    'in_preparation',
    'ready',
    'delivered',
    'completed',
    'cancelled',
    'refunded'
  )) DEFAULT 'quote_requested',

  payment_status TEXT CHECK (payment_status IN (
    'pending',
    'deposit_paid',
    'paid_full',
    'refunded',
    'partially_refunded'
  )) DEFAULT 'pending',

  -- Workflow tracking
  workflow_stage TEXT DEFAULT 'order_confirmation',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ORDER_ITEMS TABLE - Individual tray items
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Item details
  item_name TEXT NOT NULL,
  small_quantity INTEGER DEFAULT 0,
  large_quantity INTEGER DEFAULT 0,
  small_price DECIMAL(8,2) DEFAULT 0.00,
  large_price DECIMAL(8,2) DEFAULT 0.00,
  total_price DECIMAL(10,2) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PAYMENTS TABLE - Payment tracking with Stripe
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('deposit', 'balance', 'full', 'refund')) NOT NULL,

  -- Stripe integration
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,

  -- Status
  status TEXT CHECK (status IN (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'canceled',
    'refunded'
  )) DEFAULT 'pending',

  -- Metadata
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(stripe_session_id),
  UNIQUE(stripe_payment_intent_id)
);

-- =============================================
-- DISCOUNTS TABLE - Applied discount tracking
-- =============================================
CREATE TABLE IF NOT EXISTS discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Discount details
  discount_id TEXT NOT NULL, -- early_bird_30, plan_ahead_14, etc.
  name TEXT NOT NULL,
  description TEXT,
  percentage INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,

  -- Conditions met
  minimum_order DECIMAL(10,2),
  days_in_advance INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EMAIL_WORKFLOWS TABLE - Automated email tracking
-- =============================================
CREATE TABLE IF NOT EXISTS email_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Email details
  template_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_email TEXT NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,

  -- Status tracking
  status TEXT CHECK (status IN (
    'scheduled',
    'sent',
    'failed',
    'cancelled'
  )) DEFAULT 'scheduled',

  -- Results tracking
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LEAD_ACTIVITIES TABLE - Lead interaction tracking
-- =============================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Activity details
  activity_type TEXT CHECK (activity_type IN (
    'quote_requested',
    'email_opened',
    'email_clicked',
    'deposit_paid',
    'phone_call',
    'website_visit',
    'follow_up_sent'
  )) NOT NULL,

  description TEXT,
  metadata JSONB, -- For storing additional activity data

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES for better performance
-- =============================================

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_date ON orders(event_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);

-- Email workflow indexes
CREATE INDEX IF NOT EXISTS idx_email_workflows_order_id ON email_workflows(order_id);
CREATE INDEX IF NOT EXISTS idx_email_workflows_scheduled_for ON email_workflows(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_workflows_status ON email_workflows(status);

-- Lead activity indexes
CREATE INDEX IF NOT EXISTS idx_lead_activities_customer_id ON lead_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_order_id ON lead_activities(order_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at);

-- =============================================
-- TRIGGERS for automatic timestamp updates
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_workflows_updated_at ON email_workflows;
CREATE TRIGGER update_email_workflows_updated_at
  BEFORE UPDATE ON email_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
-- RLS enabled on all tables. The service_role key (used by API routes)
-- bypasses RLS. The anon key (public) is default-deny on all tables
-- except promo_codes which allows read-only access to active codes.

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read active promo codes (needed for checkout validation)
CREATE POLICY "Allow anon to read active promo codes"
  ON promo_codes
  FOR SELECT
  USING (is_active = true);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================
/*
-- Insert sample customer
INSERT INTO customers (name, email, phone, lead_source)
VALUES ('John Smith', 'john@example.com', '(555) 123-4567', 'website');

-- Insert sample order
INSERT INTO orders (
  order_number, customer_id, event_date, guest_count,
  subtotal, delivery_fee, total_amount, deposit_amount, balance_due,
  delivery_method, status
) VALUES (
  'JHB-' || extract(epoch from now()) || '-ABC123',
  (SELECT id FROM customers WHERE email = 'john@example.com'),
  '2024-02-15', 50,
  300.00, 25.00, 325.00, 107.25, 217.75,
  'delivery', 'quote_requested'
);
*/
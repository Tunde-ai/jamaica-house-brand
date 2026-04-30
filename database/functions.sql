-- Database Functions for Jamaica House Brand

-- =============================================
-- Function to update customer statistics
-- =============================================
CREATE OR REPLACE FUNCTION update_customer_stats(
  customer_id UUID,
  order_amount DECIMAL(10,2)
)
RETURNS VOID AS $$
BEGIN
  UPDATE customers
  SET
    total_orders = total_orders + 1,
    total_spent = total_spent + order_amount,
    updated_at = NOW()
  WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function to calculate lead scores
-- =============================================
CREATE OR REPLACE FUNCTION calculate_lead_score(
  order_total DECIMAL(10,2),
  guest_count INTEGER,
  days_until_event INTEGER,
  delivery_method TEXT,
  has_premium_items BOOLEAN DEFAULT FALSE
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 10; -- Base score
BEGIN
  -- Order value scoring
  IF order_total > 500 THEN
    score := score + 30;
  ELSIF order_total > 300 THEN
    score := score + 20;
  ELSIF order_total > 200 THEN
    score := score + 10;
  END IF;

  -- Group size scoring
  IF guest_count > 100 THEN
    score := score + 20;
  ELSIF guest_count > 50 THEN
    score := score + 15;
  ELSIF guest_count > 25 THEN
    score := score + 10;
  END IF;

  -- Event timing scoring
  IF days_until_event <= 30 THEN
    score := score + 25;
  ELSIF days_until_event <= 60 THEN
    score := score + 15;
  ELSIF days_until_event <= 90 THEN
    score := score + 10;
  END IF;

  -- Delivery method scoring
  IF delivery_method = 'delivery' THEN
    score := score + 10;
  END IF;

  -- Premium items scoring
  IF has_premium_items THEN
    score := score + 15;
  END IF;

  -- Cap at 100
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function to get popular items
-- =============================================
CREATE OR REPLACE FUNCTION get_popular_items(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  item_name TEXT,
  total_orders BIGINT,
  total_small_qty BIGINT,
  total_large_qty BIGINT,
  total_revenue DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.item_name,
    COUNT(DISTINCT oi.order_id) as total_orders,
    SUM(oi.small_quantity) as total_small_qty,
    SUM(oi.large_quantity) as total_large_qty,
    SUM(oi.total_price) as total_revenue
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.created_at >= NOW() - INTERVAL '%s days' FORMAT(days_back)
  GROUP BY oi.item_name
  ORDER BY total_orders DESC, total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function to get conversion rates
-- =============================================
CREATE OR REPLACE FUNCTION get_conversion_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_quotes INTEGER,
  deposits_paid INTEGER,
  conversion_rate DECIMAL(5,2),
  average_order_value DECIMAL(10,2),
  total_revenue DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_quotes,
    COUNT(CASE WHEN o.payment_status IN ('deposit_paid', 'paid_full') THEN 1 END)::INTEGER as deposits_paid,
    ROUND(
      (COUNT(CASE WHEN o.payment_status IN ('deposit_paid', 'paid_full') THEN 1 END) * 100.0 /
       NULLIF(COUNT(*), 0)), 2
    ) as conversion_rate,
    ROUND(AVG(o.total_amount), 2) as average_order_value,
    SUM(CASE WHEN o.payment_status IN ('deposit_paid', 'paid_full') THEN o.total_amount ELSE 0 END) as total_revenue
  FROM orders o
  WHERE o.created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function to clean up old scheduled emails
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_old_emails()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Cancel emails for orders that are no longer in pending status
  UPDATE email_workflows
  SET status = 'cancelled', updated_at = NOW()
  WHERE status = 'scheduled'
    AND order_id IN (
      SELECT id FROM orders
      WHERE payment_status != 'pending'
      OR status NOT IN ('quote_requested', 'deposit_paid')
    );

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Create indexes for better performance on functions
-- =============================================
CREATE INDEX IF NOT EXISTS idx_orders_created_date ON orders(created_at::DATE);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_created ON orders(payment_status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_workflows_status_scheduled ON email_workflows(status, scheduled_for) WHERE status = 'scheduled';
-- =============================================
-- JHB Command Center: Enable RLS on ALL Tables
-- Run this in Supabase SQL Editor
-- =============================================
--
-- IMPORTANT: Your app uses the service_role key server-side,
-- which bypasses RLS. These policies only affect the anon key
-- (public API access). All your Next.js API routes will continue
-- to work unchanged.
-- =============================================

-- =============================================
-- STEP 1: Enable RLS on every table
-- =============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 2: Default-deny for anon users
-- =============================================
-- With RLS enabled and NO policies granting access,
-- all tables are now locked down by default.
-- The service_role key still has full access.

-- =============================================
-- STEP 3: Selective read-only access for anon users
-- =============================================
-- Only promo_codes needs public read access (for validation).
-- Everything else stays locked to service_role only.

-- Allow anon users to read active promo codes (needed for checkout validation)
CREATE POLICY "Allow anon to read active promo codes"
  ON promo_codes
  FOR SELECT
  USING (is_active = true);

-- =============================================
-- STEP 4: Block all anon writes on promo_codes
-- =============================================
-- No INSERT/UPDATE/DELETE policies = anon can't modify promo codes.
-- Only service_role (your API routes) can manage them.

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these after applying to confirm RLS is active:

-- Check RLS status on all tables:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- Test anon access is blocked (should return 0 rows):
-- SET ROLE anon;
-- SELECT count(*) FROM customers;  -- Should be 0
-- SELECT count(*) FROM orders;     -- Should be 0
-- SELECT count(*) FROM payments;   -- Should be 0
-- RESET ROLE;

-- Test promo_codes anon read works:
-- SET ROLE anon;
-- SELECT code, discount_type, discount_value FROM promo_codes WHERE is_active = true;  -- Should work
-- INSERT INTO promo_codes (code, discount_type, discount_value) VALUES ('HACK', 'percentage', 100);  -- Should FAIL
-- RESET ROLE;

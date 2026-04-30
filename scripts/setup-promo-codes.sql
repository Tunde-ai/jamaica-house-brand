-- Create promo codes table for Jamaica House Brand
CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    max_uses INTEGER,
    usage_count INTEGER DEFAULT 0,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add Tom's TOM20 code (20% discount)
INSERT INTO promo_codes (
    code,
    discount_type,
    discount_value,
    is_active,
    expires_at,
    max_uses,
    assigned_to
) VALUES (
    'TOM20',
    'percentage',
    20,
    true,
    NULL, -- No expiration
    NULL, -- Unlimited uses
    'Tom L.'
) ON CONFLICT (code) DO NOTHING;

-- Add some other useful promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, is_active, assigned_to) VALUES
('WELCOME10', 'percentage', 10, true, 'New customers'),
('SPICY15', 'percentage', 15, true, 'General promo'),
('VIP25', 'percentage', 25, true, 'VIP customers')
ON CONFLICT (code) DO NOTHING;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
-- Add AJBAR26 promo code (20% discount for AJ Bar promotional campaign)
INSERT INTO promo_codes (
    code,
    discount_type,
    discount_value,
    is_active,
    expires_at,
    max_uses,
    assigned_to
) VALUES (
    'AJBAR26',
    'percentage',
    20,
    true,
    NULL, -- No expiration
    NULL, -- Unlimited uses
    'AJ Bar promotional campaign'
) ON CONFLICT (code) DO NOTHING;
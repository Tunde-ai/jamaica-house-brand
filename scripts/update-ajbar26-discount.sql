-- Update AJBAR26 promo code to 20% discount (was 10%)
UPDATE promo_codes
SET discount_value = 20,
    assigned_to = 'AJ Bar promotional campaign',
    updated_at = NOW()
WHERE code = 'AJBAR26';
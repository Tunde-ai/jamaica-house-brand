-- Revert AJBAR26 promo code back to 10% discount (was incorrectly set to 20%)
UPDATE promo_codes
SET discount_value = 10,
    assigned_to = 'AJ Bar promotional campaign',
    updated_at = NOW()
WHERE code = 'AJBAR26';
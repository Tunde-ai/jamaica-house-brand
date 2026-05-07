---
phase: quick
plan: 260502-uyw
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/revert-ajbar26-to-10.sql
  - scripts/add-ajbar26-promo.sql
autonomous: true
requirements: []
must_haves:
  truths:
    - "AJBAR26 promo code applies 10% discount (not 20%)"
    - "Existing promo code row in database is updated to discount_value=10"
  artifacts:
    - path: "scripts/revert-ajbar26-to-10.sql"
      provides: "SQL to revert AJBAR26 to 10% discount"
  key_links:
    - from: "scripts/revert-ajbar26-to-10.sql"
      to: "Supabase promo_codes table"
      via: "UPDATE statement"
      pattern: "UPDATE promo_codes.*SET discount_value = 10.*WHERE code = 'AJBAR26'"
---

<objective>
Revert the AJBAR26 promo code from 20% back to 10% discount.

Purpose: The discount was incorrectly changed to 20% -- user confirmed it should be 10%.
Output: SQL script executed against Supabase to fix the discount value, plus corrected seed script.
</objective>

<execution_context>
@/Users/rfmstaff/.claude/get-shit-done/workflows/execute-plan.md
@/Users/rfmstaff/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@scripts/update-ajbar26-discount.sql
@scripts/add-ajbar26-promo.sql
@src/app/api/validate-promo/route.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create revert SQL and update seed script</name>
  <files>scripts/revert-ajbar26-to-10.sql, scripts/add-ajbar26-promo.sql</files>
  <action>
1. Create `scripts/revert-ajbar26-to-10.sql` with:
```sql
-- Revert AJBAR26 promo code back to 10% discount (was incorrectly set to 20%)
UPDATE promo_codes
SET discount_value = 10,
    assigned_to = 'AJ Bar promotional campaign',
    updated_at = NOW()
WHERE code = 'AJBAR26';
```

2. Update `scripts/add-ajbar26-promo.sql` to change the INSERT value from 20 to 10 so future re-runs reflect the correct discount:
   - Change comment from "20% discount" to "10% discount"
   - Change `discount_value` from `20` to `10` in the VALUES clause

3. Run the revert SQL against the production Supabase database using the Supabase SQL Editor or CLI:
```bash
# Use supabase CLI if available, otherwise instruct to run in Supabase Dashboard SQL Editor
npx supabase db execute --project-ref <project-ref> -f scripts/revert-ajbar26-to-10.sql
```
If CLI is not configured, output the SQL and note it must be run in Supabase Dashboard > SQL Editor.

4. Verify by querying:
```sql
SELECT code, discount_value, discount_type FROM promo_codes WHERE code = 'AJBAR26';
```
Expected result: discount_value = 10
  </action>
  <verify>
    <automated>curl -s -X POST http://localhost:3000/api/validate-promo -H "Content-Type: application/json" -d '{"code":"AJBAR26"}' | grep -q '"discount_value":10'</automated>
  </verify>
  <done>AJBAR26 promo code returns 10% discount when validated via API. Seed script updated to reflect 10%.</done>
</task>

</tasks>

<verification>
- API endpoint /api/validate-promo returns discount_value: 10 for code AJBAR26
- scripts/add-ajbar26-promo.sql shows discount_value of 10 (not 20)
- Database row for AJBAR26 has discount_value = 10
</verification>

<success_criteria>
AJBAR26 promo code correctly applies 10% discount in both the live database and seed scripts.
</success_criteria>

<output>
After completion, create `.planning/quick/260502-uyw-revert-ajbar26-promo-code-back-to-10-dis/260502-uyw-SUMMARY.md`
</output>

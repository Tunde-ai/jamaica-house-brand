#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to orders table...')

  const queries = [
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT \'pending\'',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0.00',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10,2) DEFAULT 0.00',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0.00'
  ]

  for (const query of queries) {
    console.log(`Executing: ${query}`)
    const { error } = await supabase.rpc('exec_sql', { query })
    if (error) {
      console.error(`❌ Error: ${error.message}`)
    } else {
      console.log('✅ Success')
    }
  }

  console.log('🎉 Database schema update complete!')
  console.log('🧪 Testing dashboard API...')

  // Test the API
  const response = await fetch('http://localhost:3000/api/dashboard')
  const result = await response.text()
  console.log('API Response:', result)
}

addMissingColumns().catch(console.error)
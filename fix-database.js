#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
})

async function fixDatabase() {
  try {
    console.log('Checking and fixing database schema...')

    // Add missing columns to orders table
    const addColumnsSQL = `
      -- Add missing columns to orders table if they don't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
          ALTER TABLE orders ADD COLUMN payment_status TEXT CHECK (payment_status IN ('pending', 'deposit_paid', 'paid_full', 'refunded', 'partially_refunded')) DEFAULT 'pending';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='workflow_stage') THEN
          ALTER TABLE orders ADD COLUMN workflow_stage TEXT DEFAULT 'order_confirmation';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='deposit_amount') THEN
          ALTER TABLE orders ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0.00;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='balance_due') THEN
          ALTER TABLE orders ADD COLUMN balance_due DECIMAL(10,2) DEFAULT 0.00;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discount_amount') THEN
          ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discount_percentage') THEN
          ALTER TABLE orders ADD COLUMN discount_percentage INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_fee') THEN
          ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0.00;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_number') THEN
          ALTER TABLE orders ADD COLUMN order_number TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_method') THEN
          ALTER TABLE orders ADD COLUMN delivery_method TEXT CHECK (delivery_method IN ('pickup', 'delivery'));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_address') THEN
          ALTER TABLE orders ADD COLUMN delivery_address TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='special_requests') THEN
          ALTER TABLE orders ADD COLUMN special_requests TEXT;
        END IF;
      END
      $$;
    `

    console.log('Adding missing columns to orders table...')

    const { error: alterError } = await supabase.rpc('exec', {
      sql: addColumnsSQL.replace(/\n/g, ' ').trim()
    })

    if (alterError) {
      console.error('Error adding columns:', alterError)
    } else {
      console.log('✓ Successfully updated orders table')
    }

    // Test the API
    console.log('Testing dashboard API...')

    const response = await fetch('http://localhost:3000/api/dashboard')
    const result = await response.json()

    if (response.ok) {
      console.log('✓ Dashboard API working!')
      console.log('Response:', result)
    } else {
      console.log('Dashboard API error:', result)
    }

  } catch (error) {
    console.error('Failed to fix database:', error)
    process.exit(1)
  }
}

fixDatabase()
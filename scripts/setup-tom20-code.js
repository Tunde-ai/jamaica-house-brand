#!/usr/bin/env node

// Setup promo codes table and add TOM20 for Tom L.
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function setupPromoCodes() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🛠️  Setting up promo codes for Jamaica House Brand...');
  console.log('═══════════════════════════════════════════════════');

  try {
    // Create the table using raw SQL
    const { error: tableError } = await supabase.rpc('exec_sql', {
      query: `
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

        CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
        CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
      `
    });

    if (tableError) {
      console.log('⚠️  Using direct table creation method...');

      // Alternative: Insert directly (table might already exist)
      const { error: insertError } = await supabase
        .from('promo_codes')
        .upsert([
          {
            code: 'TOM20',
            discount_type: 'percentage',
            discount_value: 20,
            is_active: true,
            assigned_to: 'Tom L.'
          },
          {
            code: 'WELCOME10',
            discount_type: 'percentage',
            discount_value: 10,
            is_active: true,
            assigned_to: 'New customers'
          }
        ], { onConflict: 'code' });

      if (insertError) {
        console.log('❌ Failed to create promo codes:', insertError.message);
        console.log('\n🔧 MANUAL STEPS NEEDED:');
        console.log('1. Go to Supabase dashboard → SQL Editor');
        console.log('2. Run the SQL from scripts/setup-promo-codes.sql');
        return;
      }
    }

    console.log('✅ Promo codes table created successfully!');

    // Add TOM20 code
    const { data: tom20, error: tom20Error } = await supabase
      .from('promo_codes')
      .upsert({
        code: 'TOM20',
        discount_type: 'percentage',
        discount_value: 20,
        is_active: true,
        expires_at: null,
        max_uses: null,
        assigned_to: 'Tom L.'
      }, { onConflict: 'code' })
      .select();

    if (tom20Error) {
      console.log('❌ Error adding TOM20:', tom20Error.message);
    } else {
      console.log('🎉 TOM20 code added successfully!');
      console.log('   Code: TOM20');
      console.log('   Discount: 20% off');
      console.log('   Status: Active');
      console.log('   Assigned to: Tom L.');
    }

    // Verify the code works
    const { data: verification, error: verifyError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', 'TOM20')
      .single();

    if (verifyError) {
      console.log('⚠️  Could not verify TOM20 code');
    } else {
      console.log('\n✅ VERIFICATION: TOM20 is ready to use!');
      console.log(`   Discount: ${verification.discount_value}% off`);
      console.log(`   Active: ${verification.is_active}`);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 MANUAL SETUP REQUIRED:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the SQL commands from scripts/setup-promo-codes.sql');
  }
}

setupPromoCodes();
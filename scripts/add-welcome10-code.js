#!/usr/bin/env node

// Add welcome10 promo code for new customers
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function addWelcome10Code() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    console.log('💡 Make sure your .env.local file has:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_key');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🎫 Adding welcome10 promo code...');
  console.log('═══════════════════════════════════');

  try {
    // Add welcome10 code (lowercase)
    const { data: welcomeCode, error: welcomeError } = await supabase
      .from('promo_codes')
      .upsert({
        code: 'WELCOME10',  // Store uppercase (the API normalizes to uppercase anyway)
        discount_type: 'percentage',
        discount_value: 10,
        is_active: true,
        expires_at: null,  // Never expires
        max_uses: null,    // Unlimited uses
        assigned_to: 'New customers'
      }, { onConflict: 'code' })
      .select();

    if (welcomeError) {
      console.log('❌ Error adding WELCOME10:', welcomeError.message);
      return;
    }

    console.log('🎉 WELCOME10 code added successfully!');
    console.log('   Code: WELCOME10 (accepts "welcome10", "WELCOME10", etc.)');
    console.log('   Discount: 10% off');
    console.log('   Status: Active');
    console.log('   Expires: Never');
    console.log('   Max uses: Unlimited');
    console.log('   Assigned to: New customers');

    // Test the code via the API to verify it works
    console.log('\n🧪 Testing the code via API...');

    // Test both uppercase and lowercase
    const testCodes = ['WELCOME10', 'welcome10'];

    for (const testCode of testCodes) {
      const { data: verification } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', testCode.toUpperCase())
        .single();

      if (verification && verification.is_active) {
        console.log(`✅ ${testCode} → Valid (${verification.discount_value}% off)`);
      } else {
        console.log(`❌ ${testCode} → Invalid`);
      }
    }

    console.log('\n🎯 READY! Customers can now use "welcome10" for 10% off');

  } catch (error) {
    console.error('❌ Failed to add welcome10 code:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check your Supabase credentials in .env.local');
    console.log('2. Verify the promo_codes table exists in your database');
    console.log('3. Make sure your service role key has INSERT permissions');
  }
}

addWelcome10Code();
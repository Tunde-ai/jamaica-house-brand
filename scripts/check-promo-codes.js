#!/usr/bin/env node

// Quick script to check TOM20 promo code status
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function checkPromoCodes() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🎫 Checking TOM20 promo code...');
  console.log('════════════════════════════════════');

  try {
    // Check for TOM20 specifically
    const { data: tom20, error: tom20Error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', 'TOM20')
      .single();

    if (tom20Error && tom20Error.code !== 'PGRST116') {
      console.log('❌ Database error:', tom20Error.message);
      return;
    }

    if (!tom20) {
      console.log('❌ TOM20 code NOT FOUND in database');
      console.log('\n🔧 To fix this, you need to add TOM20 to your promo_codes table');
    } else {
      console.log('✅ TOM20 found!');
      console.log(`   Code: ${tom20.code}`);
      console.log(`   Discount: ${tom20.discount_type === 'percentage' ? tom20.discount_value + '%' : '$' + tom20.discount_value} off`);
      console.log(`   Active: ${tom20.is_active ? '✅ YES' : '❌ NO'}`);
      console.log(`   Expires: ${tom20.expires_at ? new Date(tom20.expires_at).toLocaleDateString() : 'Never'}`);
      console.log(`   Usage: ${tom20.usage_count || 0}${tom20.max_uses ? ' / ' + tom20.max_uses : ' (unlimited)'}`);

      // Check if it's currently valid
      const now = new Date();
      const isExpired = tom20.expires_at && new Date(tom20.expires_at) < now;
      const isOverLimit = tom20.max_uses !== null && tom20.usage_count >= tom20.max_uses;

      if (!tom20.is_active) {
        console.log('⚠️  Code is INACTIVE');
      } else if (isExpired) {
        console.log('⚠️  Code is EXPIRED');
      } else if (isOverLimit) {
        console.log('⚠️  Code has reached USAGE LIMIT');
      } else {
        console.log('🎉 Code is READY TO USE!');
      }
    }

    // Also check for other Tom-related codes
    console.log('\n📋 All Tom-related promo codes:');
    const { data: tomCodes, error: tomCodesError } = await supabase
      .from('promo_codes')
      .select('*')
      .ilike('code', '%TOM%');

    if (!tomCodesError && tomCodes?.length > 0) {
      tomCodes.forEach(code => {
        const status = code.is_active ? '✅' : '❌';
        console.log(`   ${status} ${code.code} - ${code.discount_value}${code.discount_type === 'percentage' ? '%' : '$'} off`);
      });
    } else {
      console.log('   No Tom-related codes found');
    }

  } catch (error) {
    console.error('❌ Error checking promo codes:', error.message);
  }
}

checkPromoCodes();
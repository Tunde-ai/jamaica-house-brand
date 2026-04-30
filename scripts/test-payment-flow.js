#!/usr/bin/env node

// Deep Payment Flow Diagnostic - Test actual checkout process
require('dotenv').config({ path: '.env.local' });

async function testPaymentFlow() {
  const SITE_URL = 'https://jamaicahousebrand.com';

  console.log('🔍 Testing Jamaica House Brand Payment Flow...');
  console.log('════════════════════════════════════════════════');

  try {
    // 1. Test homepage loads
    console.log('📱 Testing homepage...');
    const homeResponse = await fetch(SITE_URL);
    console.log(`   Homepage: ${homeResponse.status} ${homeResponse.ok ? '✅' : '❌'}`);

    // 2. Test products page
    console.log('\n🛍️ Testing products page...');
    const productsResponse = await fetch(`${SITE_URL}/products`);
    console.log(`   Products: ${productsResponse.status} ${productsResponse.ok ? '✅' : '❌'}`);

    // 3. Test promo code validation (Tom's TOM20)
    console.log('\n🎫 Testing TOM20 promo code...');
    const promoResponse = await fetch(`${SITE_URL}/api/validate-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TOM20' })
    });

    const promoResult = await promoResponse.json();
    console.log(`   Promo API: ${promoResponse.status} ${promoResponse.ok ? '✅' : '❌'}`);
    console.log(`   TOM20 Status: ${promoResult.valid ? '✅ Valid' : '❌ Invalid'}`);
    if (promoResult.message) console.log(`   Message: ${promoResult.message}`);

    // 4. Test Stripe checkout creation (simulate cart)
    console.log('\n💳 Testing Stripe checkout creation...');

    const testCartData = {
      items: [
        {
          name: 'Test Product',
          price: 1000, // $10.00 in cents
          quantity: 1
        }
      ],
      customer_email: 'test@example.com'
    };

    const checkoutResponse = await fetch(`${SITE_URL}/api/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCartData)
    });

    console.log(`   Checkout API: ${checkoutResponse.status} ${checkoutResponse.ok ? '✅' : '❌'}`);

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.log(`   ❌ Checkout Error: ${errorText}`);
    } else {
      const checkoutResult = await checkoutResponse.json();
      console.log(`   ✅ Checkout URL created: ${checkoutResult.url ? 'Yes' : 'No'}`);
    }

    // 5. Test Supabase connection (orders table)
    console.log('\n🗄️ Testing database connection...');

    const dbTestResponse = await fetch(`${SITE_URL}/api/health-check`);
    const dbTest = await dbTestResponse.json();
    console.log(`   Database: ${dbTest.checks?.supabase?.status === 'OK' ? '✅' : '❌'}`);

    // Check for URL mismatch
    const expectedURL = 'https://ooggcwftnrdizgnhlgul.supabase.co';
    const actualURL = dbTest.checks?.supabase?.url;
    if (actualURL && actualURL !== expectedURL) {
      console.log(`   ⚠️ URL MISMATCH: Expected ${expectedURL}, Got ${actualURL}`);
    }

    // 6. Summary and recommendations
    console.log('\n📊 DIAGNOSTIC SUMMARY:');
    console.log('═══════════════════════');

    const issues = [];
    if (!homeResponse.ok) issues.push('Homepage not loading');
    if (!productsResponse.ok) issues.push('Products page not loading');
    if (!promoResult.valid) issues.push('TOM20 promo code not working');
    if (!checkoutResponse.ok) issues.push('Stripe checkout creation failing');

    if (issues.length === 0) {
      console.log('✅ All tests passed - payment flow should work');
      console.log('💡 If Tom is still getting errors, it might be:');
      console.log('   • Browser-specific issue (ask Tom to clear cache/try different browser)');
      console.log('   • Form validation error (check required fields)');
      console.log('   • JavaScript error (check browser console)');
    } else {
      console.log('❌ Issues found:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    }

  } catch (error) {
    console.error('💥 Payment flow test failed:', error.message);
    console.log('\n🚨 CRITICAL: Website may be completely down');
    console.log('   • Check hosting status (Vercel)');
    console.log('   • Check DNS resolution');
    console.log('   • Check for deployment issues');
  }
}

testPaymentFlow();
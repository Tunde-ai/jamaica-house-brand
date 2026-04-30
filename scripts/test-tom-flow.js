#!/usr/bin/env node

// Test the exact flow Tom would experience

async function testTomFlow() {
  console.log('🔍 Testing Tom\'s Shopping Flow...');
  console.log('════════════════════════════════════════');

  try {
    // 1. Test homepage
    console.log('1. 🏠 Homepage...');
    const home = await fetch('https://jamaicahousebrand.com');
    console.log(`   Status: ${home.status} ${home.ok ? '✅' : '❌'}`);

    // 2. Test shop page (where Tom should go)
    console.log('\n2. 🛍️ Shop page...');
    const shop = await fetch('https://jamaicahousebrand.com/shop');
    console.log(`   Status: ${shop.status} ${shop.ok ? '✅' : '❌'}`);

    // Check if shop page has content
    if (shop.ok) {
      const shopHTML = await shop.text();
      const hasProducts = shopHTML.includes('price') || shopHTML.includes('product') || shopHTML.includes('Add to Cart');
      console.log(`   Has products: ${hasProducts ? '✅' : '❌'}`);
    }

    // 3. Test TOM20 promo code
    console.log('\n3. 🎫 TOM20 Promo Code...');
    const promo = await fetch('https://jamaicahousebrand.com/api/validate-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TOM20' })
    });

    const promoData = await promo.json();
    console.log(`   Status: ${promo.status} ${promo.ok ? '✅' : '❌'}`);
    console.log(`   Valid: ${promoData.valid ? '✅' : '❌'}`);
    console.log(`   Discount: ${promoData.discount_value}% off`);

    // 4. Test checkout with realistic cart
    console.log('\n4. 💳 Checkout Flow...');
    const checkout = await fetch('https://jamaicahousebrand.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{
          id: 'original-jerk-sauce-5oz',
          name: 'Original Jerk Sauce (5oz)',
          price: 1200, // $12.00
          quantity: 2,
          image: '/images/products/original-jerk-sauce.jpg',
          size: '5oz'
        }]
      })
    });

    console.log(`   Status: ${checkout.status} ${checkout.ok ? '✅' : '❌'}`);

    if (checkout.ok) {
      const checkoutData = await checkout.json();
      console.log(`   Stripe URL: ${checkoutData.url ? '✅ Created' : '❌ Missing'}`);

      // Test if the Stripe URL is accessible
      if (checkoutData.url) {
        const stripeTest = await fetch(checkoutData.url, { method: 'HEAD' });
        console.log(`   Stripe accessible: ${stripeTest.ok ? '✅' : '❌'} (${stripeTest.status})`);
      }
    } else {
      const errorText = await checkout.text();
      console.log(`   Error: ${errorText.substring(0, 200)}...`);
    }

    // 5. Test health check
    console.log('\n5. 🔍 Health Check...');
    const health = await fetch('https://jamaicahousebrand.com/api/health-check');
    const healthData = await health.json();
    console.log(`   Overall: ${healthData.overallStatus} ${healthData.overallStatus === 'HEALTHY' ? '✅' : '❌'}`);
    console.log(`   Stripe: ${healthData.checks?.stripe?.status} ${healthData.checks?.stripe?.status === 'OK' ? '✅' : '❌'}`);

    // 6. Summary
    console.log('\n📊 SUMMARY FOR TOM:');
    console.log('═══════════════════');

    if (home.ok && shop.ok && promo.ok && checkout.ok && healthData.overallStatus === 'HEALTHY') {
      console.log('✅ ALL SYSTEMS WORKING - Payment flow is functional');
      console.log('\n💡 If Tom still has issues, it\'s likely:');
      console.log('   • Browser cache/cookies issue');
      console.log('   • JavaScript disabled or blocked');
      console.log('   • AdBlocker interfering with Stripe');
      console.log('   • Network/ISP blocking checkout');
      console.log('   • Mobile device compatibility issue');
      console.log('\n🔧 Tell Tom to try:');
      console.log('   • Clear browser cache completely');
      console.log('   • Try incognito/private browsing mode');
      console.log('   • Try different browser (Chrome/Firefox/Safari)');
      console.log('   • Try different device (phone vs computer)');
      console.log('   • Disable adblockers temporarily');
    } else {
      console.log('❌ ISSUES DETECTED - Need to fix server-side problems');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testTomFlow();
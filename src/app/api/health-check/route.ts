import { NextResponse } from 'next/server';

// API Health Check - Prevents customer-facing errors by monitoring all external APIs
export async function GET() {
  const healthChecks: Record<string, any> = {};

  try {
    // 1. Stripe API Check
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (!stripeSecretKey || !stripePublishableKey) {
        healthChecks.stripe = { status: 'ERROR', message: 'Missing Stripe API keys' };
      } else {
        // Check if live/test keys match
        const secretIsLive = stripeSecretKey.startsWith('sk_live_');
        const publishableIsLive = stripePublishableKey.startsWith('pk_live_');

        if (secretIsLive !== publishableIsLive) {
          healthChecks.stripe = {
            status: 'ERROR',
            message: `Stripe key mismatch: Secret key is ${secretIsLive ? 'LIVE' : 'TEST'} but publishable key is ${publishableIsLive ? 'LIVE' : 'TEST'}`
          };
        } else {
          healthChecks.stripe = { status: 'OK', environment: secretIsLive ? 'LIVE' : 'TEST' };
        }
      }
    } catch (error) {
      healthChecks.stripe = { status: 'ERROR', message: 'Stripe check failed' };
    }

    // 2. Google Places API Check
    try {
      const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
      const placeId = process.env.GOOGLE_PLACES_PLACE_ID;

      if (!googleApiKey) {
        healthChecks.googlePlaces = { status: 'DISABLED', message: 'API key not configured' };
      } else if (!placeId) {
        healthChecks.googlePlaces = { status: 'ERROR', message: 'Place ID not configured' };
      } else {
        // Test the API key
        const testResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name&key=${googleApiKey}`,
          { next: { revalidate: 300 } } // Cache for 5 minutes
        );

        const testResult = await testResponse.json();

        if (testResult.status === 'OK') {
          healthChecks.googlePlaces = { status: 'OK', placeName: testResult.result?.name };
        } else {
          healthChecks.googlePlaces = {
            status: 'ERROR',
            message: testResult.error_message || `API returned: ${testResult.status}`
          };
        }
      }
    } catch (error) {
      healthChecks.googlePlaces = { status: 'ERROR', message: 'API test failed' };
    }

    // 3. Supabase Connection Check
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        healthChecks.supabase = { status: 'ERROR', message: 'Missing Supabase credentials' };
      } else {
        healthChecks.supabase = { status: 'OK', url: supabaseUrl };
      }
    } catch (error) {
      healthChecks.supabase = { status: 'ERROR', message: 'Supabase check failed' };
    }

    // 4. Other API Keys Check
    const otherApis = {
      resend: process.env.RESEND_API_KEY,
      cloudflare: process.env.CLOUDFLARE_API_TOKEN,
      slack: process.env.SLACK_WEBHOOK_URL,
    };

    healthChecks.otherApis = Object.entries(otherApis).map(([name, value]) => ({
      name,
      status: value ? 'CONFIGURED' : 'MISSING'
    }));

    // Overall health status
    const hasErrors = Object.values(healthChecks).some((check: any) =>
      check.status === 'ERROR' || (Array.isArray(check) && check.some((c: any) => c.status === 'ERROR'))
    );

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overallStatus: hasErrors ? 'UNHEALTHY' : 'HEALTHY',
      checks: healthChecks
    }, {
      status: hasErrors ? 500 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overallStatus: 'CRITICAL_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
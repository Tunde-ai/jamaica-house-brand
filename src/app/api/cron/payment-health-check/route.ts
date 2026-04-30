import { NextRequest, NextResponse } from 'next/server';

// CRITICAL: Hourly Payment System Health Check
// This monitors revenue-critical systems and sends IMMEDIATE alerts

export async function GET(request: NextRequest) {
  // Verify this is coming from Vercel Cron
  const authHeader = request.headers.get('Authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚨 Running CRITICAL payment health check...');

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });

    // CRITICAL CHECKS - These block revenue if they fail
    const criticalIssues: string[] = [];
    const healthData: Record<string, any> = {};

    // 1. CRITICAL: Stripe Configuration Check
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (!stripeSecretKey || !stripePublishableKey) {
        const error = 'CRITICAL: Missing Stripe API keys - ALL PAYMENTS BLOCKED';
        criticalIssues.push(error);
        healthData.stripe = { status: 'CRITICAL_ERROR', message: 'Missing API keys' };
      } else {
        // Check for key mismatch (live/test)
        const secretIsLive = stripeSecretKey.startsWith('sk_live_');
        const publishableIsLive = stripePublishableKey.startsWith('pk_live_');

        if (secretIsLive !== publishableIsLive) {
          const error = `CRITICAL: Stripe key mismatch - Secret: ${secretIsLive ? 'LIVE' : 'TEST'}, Publishable: ${publishableIsLive ? 'LIVE' : 'TEST'} - ALL PAYMENTS FAILING`;
          criticalIssues.push(error);
          healthData.stripe = { status: 'CRITICAL_ERROR', message: 'Key mismatch blocking payments' };
        } else {
          healthData.stripe = { status: 'OK', environment: secretIsLive ? 'LIVE' : 'TEST' };
        }
      }
    } catch (error) {
      const errorMsg = 'CRITICAL: Stripe health check failed - PAYMENT STATUS UNKNOWN';
      criticalIssues.push(errorMsg);
      healthData.stripe = { status: 'CRITICAL_ERROR', message: 'Health check failed' };
    }

    // 2. CRITICAL: Test Stripe API Connectivity (quick test)
    if (healthData.stripe?.status === 'OK') {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // Quick API test - just get account info (doesn't count against rate limits)
        const account = await stripe.accounts.retrieve();
        healthData.stripeApi = { status: 'OK', accountId: account.id };
      } catch (error) {
        const errorMsg = `CRITICAL: Stripe API unreachable - ${error instanceof Error ? error.message : 'Unknown error'}`;
        criticalIssues.push(errorMsg);
        healthData.stripeApi = { status: 'CRITICAL_ERROR', message: 'API unreachable' };
      }
    }

    // 3. CRITICAL: Database Connectivity Check
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        const error = 'CRITICAL: Missing Supabase credentials - ORDER PROCESSING BLOCKED';
        criticalIssues.push(error);
        healthData.database = { status: 'CRITICAL_ERROR', message: 'Missing credentials' };
      } else {
        // Quick connectivity test
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });

        if (response.ok) {
          healthData.database = { status: 'OK', url: supabaseUrl };
        } else {
          const error = `CRITICAL: Database unreachable (${response.status}) - ORDER STORAGE FAILING`;
          criticalIssues.push(error);
          healthData.database = { status: 'CRITICAL_ERROR', message: `HTTP ${response.status}` };
        }
      }
    } catch (error) {
      const errorMsg = `CRITICAL: Database health check failed - ${error instanceof Error ? error.message : 'Unknown error'}`;
      criticalIssues.push(errorMsg);
      healthData.database = { status: 'CRITICAL_ERROR', message: 'Connection failed' };
    }

    // Determine overall status
    const overallStatus = criticalIssues.length > 0 ? 'CRITICAL' : 'HEALTHY';

    // IMMEDIATE ALERTS for CRITICAL issues
    if (criticalIssues.length > 0) {
      await sendCriticalAlerts(criticalIssues, timestamp, healthData);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overallStatus,
      criticalIssues: criticalIssues.length,
      healthData,
      alertsSent: criticalIssues.length > 0
    });

  } catch (error) {
    console.error('Payment health check failed:', error);

    // EMERGENCY: Send critical system failure alert
    await sendEmergencyAlert(error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// IMMEDIATE ALERT SYSTEM
async function sendCriticalAlerts(criticalIssues: string[], timestamp: string, healthData: Record<string, any>) {
  const alertPromises: Promise<void>[] = [];

  // 1. URGENT SLACK ALERT
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackWebhookUrl) {
    alertPromises.push(sendSlackAlert(criticalIssues, timestamp, healthData, slackWebhookUrl));
  }

  // 2. URGENT EMAIL ALERT
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    alertPromises.push(sendUrgentEmail(criticalIssues, timestamp, healthData, resendApiKey));
  }

  // Send all alerts in parallel
  await Promise.allSettled(alertPromises);
}

async function sendSlackAlert(criticalIssues: string[], timestamp: string, healthData: Record<string, any>, webhookUrl: string): Promise<void> {
  try {
    const message = {
      text: "🚨 CRITICAL PAYMENT SYSTEM ALERT",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚨 CRITICAL: Payment System Issues Detected"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Time:* ${timestamp}\n*Issues Found:* ${criticalIssues.length}\n*Site:* https://jamaicahousebrand.com`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Critical Issues:*\n${criticalIssues.map(issue => `• ${issue}`).join('\n')}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*System Status:*\n• Stripe: ${healthData.stripe?.status}\n• Database: ${healthData.database?.status}\n• API: ${healthData.stripeApi?.status || 'Not tested'}`
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Check Health Status"
              },
              url: "https://jamaicahousebrand.com/api/health-check"
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Test Checkout"
              },
              url: "https://jamaicahousebrand.com/shop"
            }
          ]
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      console.error('Failed to send Slack alert:', response.status);
    }
  } catch (error) {
    console.error('Slack alert failed:', error);
  }
}

async function sendUrgentEmail(criticalIssues: string[], timestamp: string, healthData: Record<string, any>, resendApiKey: string): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'tunde@jamaicahousebrand.com';

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Jamaica House URGENT <alerts@jamaicahousebrand.com>',
        to: [adminEmail],
        subject: '🚨 URGENT: Critical Payment System Failure',
        html: `
          <h2 style="color: red;">🚨 CRITICAL PAYMENT SYSTEM ALERT</h2>
          <p><strong>Time:</strong> ${timestamp}</p>
          <p><strong>Critical Issues Detected:</strong> ${criticalIssues.length}</p>

          <h3>Issues Found:</h3>
          <ul>
            ${criticalIssues.map(issue => `<li style="color: red; font-weight: bold;">${issue}</li>`).join('')}
          </ul>

          <h3>System Status:</h3>
          <ul>
            <li>Stripe: ${healthData.stripe?.status} ${healthData.stripe?.message ? `(${healthData.stripe.message})` : ''}</li>
            <li>Database: ${healthData.database?.status} ${healthData.database?.message ? `(${healthData.database.message})` : ''}</li>
            <li>Stripe API: ${healthData.stripeApi?.status || 'Not tested'} ${healthData.stripeApi?.message ? `(${healthData.stripeApi.message})` : ''}</li>
          </ul>

          <p><strong>IMMEDIATE ACTION REQUIRED:</strong></p>
          <ol>
            <li>Check the site: <a href="https://jamaicahousebrand.com">https://jamaicahousebrand.com</a></li>
            <li>Test checkout process: <a href="https://jamaicahousebrand.com/shop">Test Order</a></li>
            <li>View health status: <a href="https://jamaicahousebrand.com/api/health-check">Health Check</a></li>
          </ol>

          <p style="color: red; font-weight: bold;">Revenue is potentially being lost until this is resolved!</p>
        `,
        text: `CRITICAL PAYMENT SYSTEM ALERT\n\nTime: ${timestamp}\nIssues: ${criticalIssues.join(', ')}\n\nIMMEDIATE ACTION REQUIRED - Revenue potentially being lost!`
      })
    });
  } catch (error) {
    console.error('Urgent email failed:', error);
  }
}

async function sendEmergencyAlert(error: unknown): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown system error';

  // Emergency Slack alert
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackWebhookUrl) {
    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 EMERGENCY: Payment monitoring system crashed!\n\nError: ${errorMessage}\nTime: ${new Date().toISOString()}\n\nMonitoring is DOWN - manual checks required!`,
          channel: "#alerts"
        })
      });
    } catch (slackError) {
      console.error('Emergency Slack alert failed:', slackError);
    }
  }
}
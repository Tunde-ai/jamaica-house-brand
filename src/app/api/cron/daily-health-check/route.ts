import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron Job - Daily Health Check
// Add this to vercel.json crons section to run automatically

export async function GET(request: NextRequest) {
  // Verify this is coming from Vercel Cron
  const authHeader = request.headers.get('Authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🔍 Running Vercel cron daily health check...');

    // Get the base URL for the health check
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://jamaicahousebrand.com'
      : 'http://localhost:3000';

    // Run health check
    const response = await fetch(`${baseUrl}/api/health-check`);
    const healthData = await response.json();

    const isHealthy = healthData.overallStatus === 'HEALTHY';
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });

    // Send email if Resend is configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tunde@jamaicahousebrand.com';

    if (RESEND_API_KEY) {
      // Build health summary for email
      let healthSummary = `Overall Status: ${healthData.overallStatus}\n`;

      for (const [service, check] of Object.entries(healthData.checks || {})) {
        if (Array.isArray(check)) {
          healthSummary += `${service}: ${check.map(c => `${c.name}=${c.status}`).join(', ')}\n`;
        } else {
          healthSummary += `${service}: ${(check as any).status}${(check as any).message ? ` (${(check as any).message})` : ''}\n`;
        }
      }

      // Send email
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Jamaica House Health Check <noreply@jamaicahousebrand.com>',
          to: [ADMIN_EMAIL],
          subject: `${isHealthy ? '✅' : '🚨'} Daily Health Report - ${new Date().toLocaleDateString()}`,
          text: `Daily Health Check Report\n\nTime: ${timestamp}\n\n${healthSummary}\n\nView detailed report: ${baseUrl}/api/health-check`
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send health check email');
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      healthStatus: healthData.overallStatus,
      checks: Object.keys(healthData.checks || {}).length,
      emailSent: !!RESEND_API_KEY
    });

  } catch (error) {
    console.error('Daily health check failed:', error);

    // Send emergency email
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Jamaica House Alerts <alerts@jamaicahousebrand.com>',
            to: [process.env.ADMIN_EMAIL || 'tunde@jamaicahousebrand.com'],
            subject: '🚨 CRITICAL: Daily Health Check Failed',
            text: `Critical website issue detected!\n\nTime: ${new Date().toISOString()}\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nImmediate action required.`
          })
        });
      } catch (emailError) {
        console.error('Failed to send emergency email:', emailError);
      }
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
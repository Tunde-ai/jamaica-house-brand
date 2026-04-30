#!/usr/bin/env node

// Daily Health Check Email - Automated monitoring for Jamaica House Brand
// Runs health check and emails results daily via Resend

require('dotenv').config({ path: '.env.local' });

async function sendDailyHealthEmail() {
  const SITE_URL = process.env.NODE_ENV === 'production'
    ? 'https://jamaicahousebrand.com'
    : 'http://localhost:3000';

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = 'tunde@jamaicahousebrand.com'; // Update with your email

  console.log('🔍 Running daily health check...');
  console.log(`📡 Checking: ${SITE_URL}`);

  try {
    // Run health check
    const response = await fetch(`${SITE_URL}/api/health-check`);
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

    // Build email content
    let emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${isHealthy ? '#059669' : '#DC2626'};">
          ${isHealthy ? '✅' : '🚨'} Jamaica House Brand - Daily Health Report
        </h1>

        <p><strong>Time:</strong> ${timestamp}</p>
        <p><strong>Overall Status:</strong>
          <span style="color: ${isHealthy ? '#059669' : '#DC2626'}; font-weight: bold;">
            ${healthData.overallStatus}
          </span>
        </p>

        <h2>🔍 System Checks:</h2>
    `;

    // Add detailed checks
    for (const [service, check] of Object.entries(healthData.checks || {})) {
      if (Array.isArray(check)) {
        emailHTML += `<h3>${service.toUpperCase()}:</h3><ul>`;
        check.forEach(item => {
          const emoji = item.status === 'CONFIGURED' || item.status === 'OK' ? '✅' : '⚠️';
          emailHTML += `<li>${emoji} ${item.name}: ${item.status}</li>`;
        });
        emailHTML += `</ul>`;
      } else {
        const emoji = check.status === 'OK' ? '✅' : check.status === 'DISABLED' ? '⚠️' : '🚨';
        emailHTML += `
          <div style="margin: 10px 0; padding: 10px; border-left: 3px solid ${check.status === 'OK' ? '#059669' : '#DC2626'};">
            <strong>${emoji} ${service.toUpperCase()}:</strong> ${check.status}<br>
            ${check.message ? `<small>${check.message}</small>` : ''}
            ${check.environment ? `<small>Environment: ${check.environment}</small>` : ''}
            ${check.placeName ? `<small>Place: ${check.placeName}</small>` : ''}
          </div>
        `;
      }
    }

    emailHTML += `
        <hr style="margin: 30px 0;">
        <h2>📊 Quick Actions:</h2>
        <ul>
          <li><a href="${SITE_URL}/api/health-check" style="color: #059669;">View Live Health Check</a></li>
          <li><a href="https://vercel.com/dashboard" style="color: #059669;">Vercel Dashboard</a></li>
          <li><a href="https://supabase.com/dashboard" style="color: #059669;">Supabase Dashboard</a></li>
        </ul>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated daily health check for jamaicahousebrand.com.<br>
          If you see issues, check the links above or contact your development team.
        </p>
      </div>
    `;

    // Send email via Resend
    if (!RESEND_API_KEY) {
      console.log('⚠️  RESEND_API_KEY not configured - printing email content instead:');
      console.log(emailHTML);
      return;
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Jamaica House Brand Health Check <noreply@jamaicahousebrand.com>',
        to: [ADMIN_EMAIL],
        subject: `${isHealthy ? '✅' : '🚨'} Daily Health Report - ${timestamp}`,
        html: emailHTML
      })
    });

    if (emailResponse.ok) {
      console.log('📧 Daily health email sent successfully!');
    } else {
      const errorData = await emailResponse.json();
      console.error('❌ Failed to send email:', errorData);
    }

    // Exit with error code if unhealthy (for monitoring systems)
    if (!isHealthy) {
      console.log('💥 Health check failed - exiting with error');
      process.exit(1);
    }

    console.log('🎉 Daily health check completed successfully!');

  } catch (error) {
    console.error('💥 Daily health check failed:', error);

    // Send emergency email if possible
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Jamaica House Brand Alerts <alerts@jamaicahousebrand.com>',
            to: [ADMIN_EMAIL],
            subject: '🚨 CRITICAL: Daily Health Check Failed',
            html: `
              <h1 style="color: #DC2626;">🚨 Critical Website Issue</h1>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Error:</strong> ${error.message}</p>
              <p>The automated health check completely failed to run. This could indicate:</p>
              <ul>
                <li>Website is completely down</li>
                <li>Server/hosting issues</li>
                <li>DNS problems</li>
              </ul>
              <p><strong>Immediate Action Required:</strong> Check your website and hosting status.</p>
            `
          })
        });
      } catch (emailError) {
        console.error('💥 Failed to send emergency email:', emailError);
      }
    }

    process.exit(1);
  }
}

// Run the daily check
sendDailyHealthEmail();
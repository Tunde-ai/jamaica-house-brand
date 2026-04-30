#!/usr/bin/env node

// API Health Monitor - Run this daily to catch API key issues before customers do
// Usage: node scripts/check-api-health.js

const { execSync } = require('child_process');

async function checkAPIHealth() {
  console.log('🔍 Jamaica House Brand - API Health Check');
  console.log('═══════════════════════════════════════════');

  try {
    // Check localhost or deployed URL
    const url = process.env.NODE_ENV === 'production'
      ? 'https://jamaicahousebrand.com'
      : 'http://localhost:3000';

    console.log(`📡 Checking: ${url}/api/health-check`);

    const response = await fetch(`${url}/api/health-check`);
    const healthData = await response.json();

    console.log(`\n⏰ Timestamp: ${healthData.timestamp}`);
    console.log(`📊 Overall Status: ${healthData.overallStatus}`);

    if (healthData.overallStatus === 'UNHEALTHY' || healthData.overallStatus === 'CRITICAL_ERROR') {
      console.log('\n🚨 CRITICAL ISSUES FOUND:');
      console.log('═══════════════════════════');
    } else {
      console.log('\n✅ All systems operational');
    }

    // Display detailed results
    for (const [service, check] of Object.entries(healthData.checks || {})) {
      const statusEmoji = getStatusEmoji(check.status);
      console.log(`\n${statusEmoji} ${service.toUpperCase()}:`);

      if (Array.isArray(check)) {
        check.forEach(item => {
          const emoji = getStatusEmoji(item.status);
          console.log(`   ${emoji} ${item.name}: ${item.status}`);
        });
      } else {
        console.log(`   Status: ${check.status}`);
        if (check.message) console.log(`   Message: ${check.message}`);
        if (check.environment) console.log(`   Environment: ${check.environment}`);
        if (check.placeName) console.log(`   Place: ${check.placeName}`);
      }
    }

    // Exit with error code if unhealthy (for CI/CD integration)
    if (healthData.overallStatus !== 'HEALTHY') {
      console.log('\n💥 Health check failed - see issues above');
      process.exit(1);
    }

    console.log('\n🎉 Health check passed!');

  } catch (error) {
    console.error('\n💥 Health check failed with error:');
    console.error(error.message);
    process.exit(1);
  }
}

function getStatusEmoji(status) {
  switch (status) {
    case 'OK':
    case 'HEALTHY':
    case 'CONFIGURED':
      return '✅';
    case 'ERROR':
    case 'CRITICAL_ERROR':
    case 'UNHEALTHY':
      return '🚨';
    case 'DISABLED':
    case 'MISSING':
      return '⚠️';
    default:
      return '❓';
  }
}

// Run the health check
checkAPIHealth();
---
phase: 06-production-launch
plan: 02
subsystem: infra
tags: [vercel, stripe, google-analytics, meta-pixel, dns, ssl, domain, production]

# Dependency graph
requires:
  - phase: 06-production-launch
    plan: 01
    provides: GitHub repo and Vercel preview deployment as deployment target
  - phase: 05-seo-performance
    plan: 03
    provides: Google Analytics and Meta Pixel components needing production IDs
  - phase: 03-cart-checkout
    plan: 02
    provides: Stripe integration needing production keys
provides:
  - Production deployment live at https://jamaicahousebrand.com
  - SSL certificate active with HSTS (max-age=63072000)
  - HTTP-to-HTTPS redirect (308) enforced
  - www.jamaicahousebrand.com resolving to production
  - All 5 production env vars set on Vercel (Stripe, GA4, Meta Pixel)
  - Custom domain managed via Vercel nameservers
affects: [06-03-launch-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Vercel nameserver delegation (ns1/ns2.vercel-dns.com) for full DNS control
    - NEXT_PUBLIC_ env vars baked at build time — production deployment must follow env var configuration

key-files:
  created: []
  modified: []

key-decisions:
  - "Used Vercel nameserver delegation (Option B) instead of A record + CNAME — gives Vercel full DNS control and simplifies SSL provisioning"
  - "All 5 env vars configured: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_META_PIXEL_ID"
  - "Production build triggered after env vars set to ensure NEXT_PUBLIC_ values are baked into client bundle"

patterns-established:
  - "Env vars first, production build second — NEXT_PUBLIC_ variables are embedded at build time"

# Metrics
duration: ~30min
completed: 2026-02-24
---

# Phase 06 Plan 02: Production Environment & Domain Configuration Summary

**Production site live at https://jamaicahousebrand.com with SSL, Stripe live keys, GA4, and Meta Pixel — DNS delegated to Vercel via nameserver swap at Bluehost**

## Performance

- **Duration:** ~30 min (includes DNS propagation wait)
- **Started:** 2026-02-24
- **Completed:** 2026-02-24
- **Tasks:** 3
- **Files modified:** 0 (all changes were Vercel config and DNS — no code files modified)

## Accomplishments

- All 5 production env vars set on Vercel: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_META_PIXEL_ID
- Custom domain jamaicahousebrand.com added to Vercel with SSL certificate provisioned automatically
- Nameservers changed from Bluehost defaults to ns1.vercel-dns.com / ns2.vercel-dns.com — Vercel has full DNS control
- Production build deployed with all env vars baked in (NEXT_PUBLIC_ variables embedded at build time)
- All 6 pages return HTTP 200 at jamaicahousebrand.com
- www.jamaicahousebrand.com resolving correctly (200)
- SSL active: strict-transport-security max-age=63072000
- HTTP-to-HTTPS redirect enforced (308)

## Task Commits

Tasks 1 and 3 were human-action checkpoints (no code commits). Task 2 was Vercel CLI configuration (no code changes). No per-task git commits for this plan — all changes were external service configurations.

1. **Task 1: Provide production API keys and service IDs** — human-action checkpoint, user provided all 5 env var values
2. **Task 2: Set production env vars on Vercel and add custom domain** — Vercel CLI configuration, production build triggered
3. **Task 3: Configure DNS at domain registrar** — human-action checkpoint, user changed nameservers at Bluehost

## Files Created/Modified

None — this plan made no code changes. All configuration was:
- Vercel dashboard/CLI: environment variables and custom domain
- Bluehost registrar: nameserver records updated to Vercel

## Decisions Made

- **Vercel nameserver delegation over A record**: The plan offered Option A (A record + CNAME) or Option B (nameserver delegation). User chose Option B — delegating nameservers to Vercel. This gives Vercel full DNS control, simplifies SSL provisioning, and enables Vercel-managed DNS records going forward.
- **All 5 env vars configured**: No services were skipped. Stripe (live keys + webhook), GA4 measurement ID, and Meta Pixel ID all configured for production.
- **Build order respected**: Production build was triggered after env vars were set, ensuring NEXT_PUBLIC_ analytics IDs are correctly baked into the client bundle.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — DNS propagation was fast (well under the 48-hour maximum). All verification checks passed on first attempt.

## User Setup Required

All external service configuration was completed during this plan execution:
- Stripe production keys and webhook endpoint: configured
- Google Analytics 4 measurement ID: configured
- Meta Pixel ID: configured
- Bluehost nameservers updated to Vercel: configured

No remaining external setup required for this plan.

## Next Phase Readiness

Ready for Phase 6 Plan 3 (Launch Verification):
- https://jamaicahousebrand.com is live and returning 200 on all pages
- SSL active and HTTPS enforced
- Production Stripe keys in place — live checkout flow can be verified
- Analytics tracking IDs configured — GA4 and Meta Pixel will fire in production
- www subdomain working

No blockers.

---
*Phase: 06-production-launch*
*Completed: 2026-02-24*

## Self-Check: PASSED

No code files were created or modified in this plan — all changes were external service configurations (Vercel env vars, domain, DNS). Verification confirmed via HTTP checks:
- jamaicahousebrand.com: 200
- www.jamaicahousebrand.com: 200
- SSL/HSTS: active
- HTTP-to-HTTPS redirect: 308

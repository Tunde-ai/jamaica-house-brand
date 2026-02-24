---
phase: 06-production-launch
plan: 03
subsystem: infra
tags: [vercel, stripe, nextjs, ssl, sitemap, google-analytics, meta-pixel]

# Dependency graph
requires:
  - phase: 06-production-launch plan 02
    provides: Production env vars, domain DNS, SSL certificate, Vercel deployment
provides:
  - Verified production site at jamaicahousebrand.com — all pages load, payments process, analytics track
  - Confirmed Stripe checkout end-to-end with real checkout session creation
  - Smoke test results: 6/6 pages 200, SSL HSTS active, sitemap 17 URLs, robots.txt valid
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Smoke test pattern: curl-based HTTP status, SSL header, SEO endpoint, API health checks"
    - "Checkout fallback: use request.headers.get('origin') || hardcoded production URL to handle missing Origin headers"

key-files:
  created: []
  modified:
    - "src/app/api/checkout/route.ts - Added fallback base URL when origin header is null"

key-decisions:
  - "Stripe secret key re-set on Vercel to resolve ERR_INVALID_CHAR — original key had invalid characters in Authorization header"
  - "Checkout route uses hardcoded fallback 'https://jamaicahousebrand.com' when Origin header is absent to ensure valid success_url scheme"

patterns-established:
  - "Origin header fallback: API routes that construct absolute URLs must guard against null Origin headers from non-browser callers"

# Metrics
duration: 45min
completed: 2026-02-24
---

# Phase 6 Plan 03: Go-Live Verification Summary

**Production site at jamaicahousebrand.com fully verified: 6/6 pages live, Stripe checkout end-to-end confirmed, SSL HSTS active, sitemap with 17 URLs, GA4 tracking loaded**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-02-24
- **Completed:** 2026-02-24
- **Tasks:** 2 of 2
- **Files modified:** 1 (checkout route bug fix)

## Accomplishments

- Automated smoke tests passed for all 6 production pages (HTTP 200), SSL with HSTS, HTTP-to-HTTPS redirect (308), sitemap.xml (17 URLs), robots.txt with sitemap reference, GA4 script present, checkout API returning 400 for empty cart, www subdomain resolving
- Fixed checkout failure caused by null Origin header — Stripe was rejecting success_url without a scheme; fallback to hardcoded production domain resolved the issue
- Re-set Stripe secret key on Vercel to clear ERR_INVALID_CHAR (invalid characters had been encoded into the key value during initial setup)
- User completed manual end-to-end checkout verification — Stripe returned a valid checkout.stripe.com URL and confirmed the flow works

## Task Commits

Each task was committed atomically:

1. **Task 1: Automated production smoke tests** - `f4aaf37` (fix — checkout bug fix applied during verification)
2. **Task 2: Manual end-to-end checkout verification** - User-approved checkpoint, no additional commits

**Plan metadata:** committed in this docs commit (docs: complete Go-Live Verification)

## Files Created/Modified

- `src/app/api/checkout/route.ts` - Added `const baseUrl = request.headers.get('origin') || 'https://jamaicahousebrand.com'` fallback to handle null Origin headers

## Decisions Made

- **Stripe key re-set:** The original STRIPE_SECRET_KEY on Vercel had invalid characters (ERR_INVALID_CHAR in Node's http module when setting the Authorization header). The key was deleted and re-entered on Vercel with a fresh production build triggered to bake the corrected value.
- **Origin header fallback:** When the checkout API is called without a browser Origin header (e.g., during testing or non-browser clients), `request.headers.get('origin')` returns null. Constructing `null/success?...` as the success_url causes Stripe to reject the request. The fix uses a hardcoded fallback of `'https://jamaicahousebrand.com'` which is the canonical production domain.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed checkout failure due to null Origin header**
- **Found during:** Task 1 (Automated production smoke tests)
- **Issue:** `request.headers.get('origin')` returned null when the checkout API was called without an Origin header, causing the success_url to be constructed as `null/success?session_id=...`. Stripe rejected this as an invalid URL scheme.
- **Fix:** Added fallback: `const baseUrl = request.headers.get('origin') || 'https://jamaicahousebrand.com'`
- **Files modified:** `src/app/api/checkout/route.ts`
- **Verification:** Checkout API returned valid Stripe checkout URL; user confirmed end-to-end checkout works
- **Committed in:** f4aaf37 (fix(checkout): use fallback base URL when origin header is missing)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix was essential for checkout to function. No scope creep.

## Issues Encountered

- Stripe secret key had invalid characters from initial Vercel setup — deleted and re-entered with a fresh production build triggered. This was an environment configuration error, not a code error.

## User Setup Required

None - all configuration was completed in plan 06-02 (or corrected inline during this plan).

## Next Phase Readiness

**All 6 phases complete. The Jamaica House Brand ecommerce site is fully launched.**

- jamaicahousebrand.com is live and verified
- Stripe production checkout is working end-to-end
- Google Analytics 4 tracking is active
- SSL/HTTPS enforced with HSTS
- Sitemap and robots.txt in place for SEO indexing
- No outstanding blockers or concerns

---
*Phase: 06-production-launch*
*Completed: 2026-02-24*

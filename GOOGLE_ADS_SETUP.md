# Google Ads Setup for Jamaica House Brand
**Budget: $5-7/day • Goal: Drive online hot sauce sales**

## 🚀 Phase 1: Account Setup & Conversion Tracking

### Step 1: Create Google Ads Account
1. Go to [ads.google.com](https://ads.google.com)
2. Click "Start now" → Use your Jamaica House Brand Gmail
3. Choose "Get more website sales"
4. Enter your website: `https://jamaicahousebrand.com`
5. **SKIP** the guided setup for now (we'll optimize manually)

### Step 2: Get Your Google Ads Account ID
1. In Google Ads dashboard, click the **? icon** → "About this Google Ads account"
2. Copy your **Customer ID** (format: 123-456-7890)
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-1234567890
   ```
   *(Remove hyphens and add AW- prefix)*

### Step 3: Set Up Conversion Tracking
1. In Google Ads → **Tools & Settings** → **Conversions**
2. Click **+ New conversion**
3. Choose **Website**
4. Configure:
   - **Category**: Purchase
   - **Value**: Use transaction-specific values
   - **Count**: One
   - **Attribution model**: Last click
5. Copy the **Conversion ID** and **Label**
6. Update `TrackPurchase.tsx` (line 32):
   ```typescript
   send_to: 'AW-YOUR_CONVERSION_ID/YOUR_CONVERSION_LABEL'
   ```

## 💰 Phase 2: Campaign Strategy for $5-7/Day Budget

### Campaign Structure (Recommended)
```
Account Budget: $180-210/month
├── Campaign 1: Search - Branded (30% = $54-63/month)
│   ├── Ad Group: "Jamaica House Brand" + variants
│   └── Keywords: Brand-related terms
│
├── Campaign 2: Search - Hot Sauce (50% = $90-105/month)  
│   ├── Ad Group 1: "Jamaican Hot Sauce"
│   ├── Ad Group 2: "Jerk Sauce"
│   └── Ad Group 3: "Caribbean Sauce"
│
└── Campaign 3: Shopping (20% = $36-42/month)
    └── Product Feed: All sauces
```

### Bidding Strategy
- **Start with**: Manual CPC bidding
- **Max CPC**: $0.50-1.00 for brand terms, $1.50-2.50 for competitive terms
- **After 30 conversions**: Switch to Target CPA bidding

## 🎯 Phase 3: Keyword Research & Setup

### Primary Keywords (Start with these):
```
Low Competition (Brand):
• "jamaica house brand" - CPC: $0.30-0.50
• "jamaica house jerk sauce" - CPC: $0.40-0.60

Medium Competition (Product):
• "jamaican hot sauce" - CPC: $1.20-2.00
• "jerk sauce" - CPC: $1.50-2.50
• "caribbean hot sauce" - CPC: $1.00-1.80
• "scotch bonnet sauce" - CPC: $0.80-1.50

Long-tail (Value):
• "authentic jamaican jerk sauce" - CPC: $0.90-1.40
• "best jerk sauce online" - CPC: $1.10-1.70
• "buy jerk sauce" - CPC: $1.30-2.00
```

### Negative Keywords (Add immediately):
```
• free
• recipe
• homemade
• cheap
• discount
• reviews
• restaurants
```

## 📝 Phase 4: Ad Copy Templates

### Search Ad #1 (Brand Protection)
```
Headline 1: Jamaica House Brand® Jerk Sauce
Headline 2: 30+ Years Restaurant Heritage
Headline 3: Free Shipping Over $50
Description: Authentic Jamaican jerk sauce with all-natural ingredients. Zero calories, maximum flavor. Order your restaurant-quality sauce today.
```

### Search Ad #2 (Product-Focused)
```
Headline 1: Authentic Jamaican Hot Sauce
Headline 2: All-Natural • Zero Calories  
Headline 3: Free Shipping Over $50
Description: Experience 30+ years of restaurant tradition. Our scotch bonnet jerk sauce delivers authentic Caribbean heat. Shop now!
```

### Search Ad #3 (Benefit-Driven)
```
Headline 1: Restaurant-Quality Jerk Sauce
Headline 2: Delivered Fresh to Your Door
Headline 3: All Natural Ingredients
Description: Skip the grocery store disappointment. Get authentic Jamaican jerk sauce from a real Caribbean restaurant. Order today!
```

## 🛒 Phase 5: Google Shopping Setup

### Step 1: Google Merchant Center
1. Go to [merchants.google.com](https://merchants.google.com)
2. Create account → Verify website ownership
3. Link to Google Ads account

### Step 2: Product Feed
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>original-jerk-sauce-5oz</g:id>
      <g:title>Jamaica House Brand Original Jerk Sauce - 5oz</g:title>
      <g:description>Authentic Jamaican jerk sauce with 30+ years restaurant heritage. All-natural, zero calories.</g:description>
      <g:link>https://jamaicahousebrand.com/shop</g:link>
      <g:image_link>https://jamaicahousebrand.com/images/products/original-jerk-sauce.jpg</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>12.00 USD</g:price>
      <g:brand>Jamaica House Brand</g:brand>
      <g:product_type>Food &amp; Beverages > Condiments &amp; Sauces > Hot Sauce</g:product_type>
      <g:google_product_category>Food, Beverages &amp; Tobacco > Food Items > Condiments &amp; Sauces</g:google_product_category>
    </item>
  </channel>
</rss>
```

## 📊 Phase 6: Budget Optimization Strategy

### Week 1-2: Data Gathering
- Start with $5/day evenly split
- Search Campaigns: $3.50/day
- Shopping: $1.50/day
- **Goal**: 50+ clicks per campaign

### Week 3-4: Initial Optimization  
- Identify top-performing keywords
- Increase budget on converting terms
- Add negative keywords for irrelevant traffic
- **Target**: 2-3 conversions minimum

### Month 2+: Scale What Works
- Increase to $7/day if ROAS > 3:1
- Focus 70% budget on converting keywords
- Expand successful ad groups
- **Target**: $100+ revenue/week

## ⚡ Phase 7: Quick Wins (Immediate Actions)

### Day 1 Checklist:
- [ ] Set up Google Ads account  
- [ ] Configure conversion tracking
- [ ] Create branded campaign (protect your name)
- [ ] Start with 5-10 exact match keywords
- [ ] Set daily budget to $5

### Week 1 Actions:
- [ ] Add TOM20 and AJBAR26 promo codes to ads
- [ ] Set up Google Shopping feed
- [ ] Create 3 different ad variations
- [ ] Add location targeting (focus on US)
- [ ] Set up mobile bid adjustments (+20%)

### Performance Targets:
- **CTR**: 3%+ (higher is better)
- **Conversion Rate**: 2%+ 
- **ROAS**: 3:1 or better ($3 revenue per $1 ad spend)
- **CPA**: Under $15 per sale

## 🎯 Pro Tips for Small Budgets

### 1. Time-of-Day Optimization
- Run ads 10 AM - 8 PM (when people cook)
- Pause overnight to preserve budget
- Boost Friday-Sunday (weekend cooking)

### 2. Geographic Focus  
- Start with states where you ship fastest
- Exclude rural areas (lower conversion rates)
- Focus on metro areas with Caribbean populations

### 3. Device Strategy
- Mobile gets 60%+ of traffic
- Desktop users convert better
- Set mobile bid adjustment: +10-20%

### 4. Ad Extensions (Free Traffic!)
- **Sitelinks**: Shop, About, Contact, Reviews
- **Callouts**: "Free Shipping", "All Natural", "Restaurant Quality"  
- **Structured Snippets**: Brands, Product Types
- **Price Extensions**: Show sauce prices directly in ads

### 5. Landing Page Optimization
- Send traffic directly to `/shop` page
- Highlight TOM20 promo prominently  
- Add urgency: "Free shipping ends soon"
- Mobile-optimize the entire funnel

## 📈 Scaling Signals (When to Increase Budget)

### Increase to $7/day when:
- ROAS consistently above 3:1 for 2 weeks
- At least 10 conversions total
- Quality Score above 7 on main keywords
- Conversion rate above 2%

### Add new campaigns when:
- Current campaigns profitable at $7/day
- Search impression share below 80%
- Ready to test YouTube/Display ads
- Have enough conversion data for automation

---

## 🚀 Ready to Launch?

1. **Complete account setup first** (Steps 1-3)
2. **Deploy the tracking code** (already done ✅)
3. **Start with branded campaign** (lowest cost, highest conversion)
4. **Monitor daily for first week**
5. **Optimize based on data, not guesses**

**Remember**: With a small budget, focus on high-intent keywords and perfect your funnel before expanding. Better to win big on 5 keywords than lose money on 50!
# Togor & Tweed — Complete SEO Roadmap
**Updated: 2026-04-28**
**Target: Google rankings + AI suggestion visibility (ChatGPT, Gemini, Perplexity)**

---

## ✅ What Has Been Implemented (Code Complete)

### Technical Foundation
| Item | File | Status |
|---|---|---|
| Dynamic sitemap (products + categories + static pages) | `src/app/sitemap.ts` | ✅ Done |
| Robots.txt — allows all AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) | `src/app/robots.ts` | ✅ Done |
| AI guidance file (`llms.txt`) | `public/llms.txt` | ✅ Done |
| Root layout — extended keywords, OG images, `googleBot` robots directive | `src/app/layout.tsx` | ✅ Done |
| Google Search Console verification placeholder | `src/app/layout.tsx` (commented) | ✅ Ready |
| GA4 tag — fires when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set | `src/app/layout.tsx` | ✅ Done |

### Structured Data (JSON-LD)
| Schema | Page | Status |
|---|---|---|
| Organization (rich — with `alternateName`, `areaServed`, `foundingLocation`) | Homepage | ✅ Done |
| LocalBusiness + ClothingStore (full offer catalog, payment, hours) | Homepage | ✅ Done |
| WebSite + SearchAction (Sitelinks Searchbox) | Homepage | ✅ Done |
| BreadcrumbList | Category pages | ✅ Done |
| BreadcrumbList | Product pages | ✅ Done |
| Product (price, availability, brand, aggregateRating) | Product pages | ✅ Done |
| ItemList (top 10 products per category) | Category pages | ✅ Done |
| FAQPage (8 Q&As covering shipping, returns, payments, sizing) | FAQ page | ✅ Done |
| AboutPage + Organization | About page | ✅ Done |

### Metadata & OG Tags
| Page | Title | Description | OG Image | Canonical |
|---|---|---|---|---|
| Homepage | ✅ | ✅ | ✅ `/og` route | ✅ |
| Collections list | ✅ | ✅ | ✅ `/og` route | ✅ |
| Category `[slug]` | ✅ dynamic | ✅ dynamic | ✅ category image or `/og` | ✅ |
| Product `[slug]` | ✅ dynamic | ✅ dynamic | ✅ `/og` route | — |
| About | ✅ | ✅ | ✅ | ✅ |
| FAQ | ✅ (via layout) | ✅ | — | — |
| Contact | ✅ (via layout) | ✅ | — | — |
| Shipping & Returns | ✅ | ✅ | — | — |
| Privacy Policy | ✅ | ✅ | — | — |
| Terms & Conditions | ✅ | ✅ | — | — |
| Size Guide | ✅ | ✅ | — | — |
| Auth pages (login, register, forgot) | noindex | — | — | — |
| Admin pages | noindex | — | — | — |
| Account pages | noindex | — | — | — |
| Checkout | noindex | — | — | — |
| Search | noindex | — | — | — |

### Alt Text
| Component | Status |
|---|---|
| `ProductCard` — primary image | ✅ `Buy ${name} - Togor & Tweed Bangladesh` |
| `ProductGallery` — main image | ✅ `Buy ${name} - Togor & Tweed Bangladesh` |
| `ProductGallery` — thumbnails | ✅ `${name} - view N \| Togor & Tweed Bangladesh` |
| `CategoryGrid` tiles | ✅ `Shop ${name} collection at Togor & Tweed Bangladesh` |
| `FeaturedCategories` tiles | ✅ `Shop ${name} at Togor & Tweed Bangladesh` |
| Category page hero banner | ✅ `Shop ${name} collection at Togor & Tweed Bangladesh` |
| HeroSlider images | ✅ `${slide.title} — Togor & Tweed Bangladesh Fashion` |

### Core Web Vitals
| Item | Status |
|---|---|
| Hero slider first image — `fetchPriority="high"` (LCP) | ✅ Done |
| Category hero image — `priority` prop (LCP) | ✅ Done |
| ProductGallery main image — `priority` prop (LCP) | ✅ Done |
| Fonts — `display: swap` (no FOIT) | ✅ Done |

### Analytics
| Item | Status |
|---|---|
| GA4 base pageview tracking | ✅ Done (needs `NEXT_PUBLIC_GA_MEASUREMENT_ID`) |
| GA4 `view_item` event on product pages | ✅ Done via `ViewItemTracker` |
| GA4 `add_to_cart` event | ✅ Done in `AddToCartButton` |
| GA4 `begin_checkout` event | 🔲 Wire in checkout form |
| GA4 `purchase` event | 🔲 Wire in order confirmation page |
| Google Search Console verification | 🔲 Add code to `layout.tsx` when domain is live |

---

## 🔲 Next Steps — Implement When Ready

### Priority 1: Set Up Analytics (Do This First — Before Launch)

**A. Get Your GA4 Measurement ID**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property for togorandtweed.com
3. Copy your Measurement ID (starts with `G-`)
4. Add to your `.env` file:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
5. GA4 pageview tracking will start automatically

**B. Set Up Google Search Console**
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your domain: `togorandtweed.com`
3. Verify ownership via HTML meta tag
4. In `src/app/layout.tsx`, uncomment and fill in:
   ```typescript
   verification: { google: 'YOUR_CODE_HERE' },
   ```
5. Submit your sitemap: `https://togorandtweed.com/sitemap.xml`

**C. Wire GA4 Purchase Event**
In `src/app/checkout/confirmation/[orderId]/page.tsx`, add:
```typescript
import { trackPurchase } from '@/lib/analytics'
// ...on mount:
trackPurchase({ transaction_id: orderId, value: total, items: lineItems })
```

---

### Priority 2: Content Strategy for Category Ranking

Each category page needs **unique, keyword-rich content** in the `description` field (set via Admin → Categories). Write 150–300 words covering:

**Shirts page description (example):**
> "Shop men's shirts online at Togor & Tweed Bangladesh. Our collection features formal shirts for the office, casual shirts for weekends, and smart-casual options for every occasion. Made from breathable cotton and linen blends, our shirts are available in sizes XS to 3XL. Choose from classic white and blue shirts, bold prints, and fine checks. Free delivery on orders over ৳1,500 anywhere in Bangladesh. Cash on delivery available. Easy 7-day returns."

**Write descriptions for each category:**
- `/collections/shirts` — Focus on: formal shirts, casual shirts, cotton shirts, men shirts Dhaka
- `/collections/panjabi` — Focus on: traditional panjabi, eid panjabi, cotton panjabi, panjabi online Bangladesh
- `/collections/t-shirts` — Focus on: casual t-shirts, graphic tees, oversized t-shirts, cotton t-shirts Bangladesh
- `/collections/polo` — Focus on: polo shirts, smart-casual, polo for men Bangladesh
- `/collections/trousers` — Focus on: formal trousers, chinos, men trousers Bangladesh, tailored pants

**Target keywords per category:**

| Category | Primary Keyword | Secondary Keywords |
|---|---|---|
| Shirts | men shirts Bangladesh | formal shirts Dhaka, cotton shirts BD, casual shirts online BD |
| Panjabi | panjabi online Bangladesh | eid panjabi BD, cotton panjabi, panjabi for men |
| T-Shirts | t-shirt Bangladesh | oversized t-shirts BD, graphic tees Bangladesh |
| Polo | polo shirt Bangladesh | polo for men BD, premium polo |
| Trousers | trousers for men Bangladesh | formal trousers BD, chinos Bangladesh |

---

### Priority 3: Google My Business (Critical for Local + AI)

1. Create a **Google Business Profile** at [business.google.com](https://business.google.com)
2. Use category: **Clothing Store** + **Online Store**
3. Fill in:
   - Business name: Togor & Tweed
   - Category: Clothing Store
   - Service area: All Bangladesh (select all divisions)
   - Website: https://togorandtweed.com
   - Description: Use the `llms.txt` "About" section
   - Products: Add key products with photos
4. **Why this matters:** Google Business Profile is one of the primary sources AI systems (Google Gemini, SGE/AI Overviews) use to suggest local businesses. It also appears in map results and knowledge panels.

---

### Priority 4: Facebook & Instagram Presence (for AI training data)

AI models (ChatGPT, Gemini, Perplexity) are trained on publicly crawlable web content. Active social profiles with consistent brand mentions help AI systems "know" your brand.

**Action items:**
1. Create `@togorandtweed` on Instagram and Facebook (if not done)
2. Post consistently (3–4 times/week) with:
   - Product photos with keyword-rich captions
   - "Available at togorandtweed.com"
   - Mention product categories by name: "our new cotton panjabi collection"
3. Use hashtags: #TogorAndTweed #FashionBangladesh #PanjabiBD #MensFashionBD #ShirtsBangladesh
4. Link website in bio on every platform

---

### Priority 5: Backlink Strategy

Backlinks = trust signals for Google rankings. Target Bangladeshi sites:

**A. Directory Listings (Free)**
- Pathao vendor directory
- Shajgoj brand listings  
- Bikroy.com brand page
- Bangladesh Yellow Pages
- AjkerDeal seller profile (even if you don't sell there)

**B. Guest Posts / PR**
Pitch these outlets for fashion brand features:
- The Daily Star Lifestyle section (thedailystar.net)
- Dhaka Tribune features
- Prothomalo lifestyle (Bengali audience)
- Bangladeshi fashion bloggers on Instagram/YouTube

**Sample pitch template:**
> Subject: Feature Request — Bangladeshi Fashion Brand Story
>
> Hi [Name], I'm reaching out from Togor & Tweed, a new premium menswear brand based in Dhaka. We've recently launched our online store at togorandtweed.com and would love to share our story with your readers. We'd be happy to offer an exclusive first look at our collection, provide product samples for review, or contribute a piece about "The rise of homegrown Bangladeshi fashion brands." Would you be interested?

**C. Influencer Outreach**
Target micro-influencers (5k–100k followers) in Bangladesh fashion space:
- DM 10–20 fashion influencers per month
- Offer 2–3 free products in exchange for a post tagging @togorandtweed and linking to the website
- Ask them to use keywords: "panjabi online," "men's fashion Bangladesh," "togorandtweed.com"

---

### Priority 6: Content Marketing (Ranks for Long-tail Keywords)

Create a blog or articles section at `/blog` or `/articles`. Each article targets a long-tail search query. High-opportunity topics for Bangladesh:

| Article Title | Target Keyword | Monthly Searches (Est.) |
|---|---|---|
| "How to Choose the Right Size Panjabi in Bangladesh" | panjabi size guide BD | Low-Medium |
| "Best Fabrics for Shirts in Bangladesh's Climate" | cotton shirts Bangladesh | Low-Medium |
| "Eid Outfit Ideas for Men in Bangladesh 2026" | eid outfit men Bangladesh | High (seasonal) |
| "Office Dress Code Guide for Men in Dhaka" | office wear men Dhaka | Medium |
| "How to Style a Polo Shirt — 5 Looks for Bangladeshi Men" | polo shirt style | Low |
| "Difference Between Panjabi and Kurta" | panjabi vs kurta | Low |
| "What to Wear in Bangladesh's Monsoon Season" | monsoon fashion Bangladesh | Low |

---

### Priority 7: Product-Level SEO (Via Admin Panel)

For top-selling products, fill in the `metaTitle` and `metaDesc` fields in the admin panel:

**metaTitle format:** `[Product Name] — Buy Online Bangladesh | Togor & Tweed` (max 60 chars)
**metaDesc format:** `Buy [Product Name] at Togor & Tweed Bangladesh. ৳[Price]. Free delivery over ৳1,500. COD available. [Key feature].` (max 155 chars)

**Example:**
- Product: White Oxford Shirt
- metaTitle: `White Oxford Shirt for Men — Togor & Tweed Bangladesh`
- metaDesc: `Buy White Oxford Shirt at Togor & Tweed Bangladesh. ৳1,200. Premium cotton, sizes XS–3XL. Free delivery on orders over ৳1,500. Cash on delivery.`

---

### Priority 8: Image SEO

For Cloudinary-hosted product images, set descriptive filenames and alt text:

**Image filename format:** `togor-tweed-[product-name]-[color]-[view].jpg`
Example: `togor-tweed-white-oxford-shirt-front.jpg`

**Alt text stored in DB (set via admin):**
`Buy [Product Name] in [Color] — Togor & Tweed Bangladesh`

---

## 🤖 AI Suggestion Strategy (ChatGPT, Gemini, Perplexity)

AI systems like ChatGPT, Google Gemini, and Perplexity recommend brands when:
1. The brand has a clear, factual web presence (done — `llms.txt`, About page, structured data)
2. The brand appears in multiple trusted sources (backlinks, social profiles, reviews)
3. The brand's website answers common questions clearly (done — FAQ schema, About page)
4. The AI crawlers can access the content (done — robots.ts allows all AI bots)

**What's been implemented:**
- `public/llms.txt` — Direct guidance for AI crawlers (brand facts, Q&As, content permissions)
- `LocalBusiness` JSON-LD — Structured brand facts Google/AI can read
- `Organization` JSON-LD with `knowsAbout`, `areaServed`, `alternateName`
- `FAQPage` JSON-LD with answers to common queries
- `AboutPage` JSON-LD with detailed brand description
- AI-crawler-friendly `robots.ts` (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot allowed)

**Additional AI targeting tactics:**
- Get mentioned in Bangladeshi fashion articles and reviews (AI training data)
- Maintain consistent brand name across all platforms: always "Togor & Tweed" (not variations)
- Publish factual, specific content (prices, delivery times, payment methods) — AI prefers verifiable facts
- Build a Wikipedia-style "About" presence where possible

---

## 📊 Tracking & Measuring Success

### Monthly KPIs to Monitor in Google Search Console
| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Indexed pages | > 50 | > 100 |
| Total clicks/month | > 100 | > 500 |
| Top query: "togor & tweed" | Top 3 | Position 1 |
| Top query: "panjabi online Bangladesh" | Top 20 | Top 10 |
| Top query: "men shirts Bangladesh" | Top 30 | Top 15 |
| Core Web Vitals (LCP) | < 2.5s | < 2.5s |

### Monthly KPIs in GA4
| Metric | Baseline | Target (3 months) |
|---|---|---|
| Organic traffic sessions | 0 | > 200/month |
| Add-to-cart rate | — | > 3% |
| Conversion rate | — | > 1% |

---

## 🗓 Launch Checklist (Before Going Live)

- [ ] Set `NEXTAUTH_URL=https://togorandtweed.com` in production `.env`
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in production `.env`
- [ ] Create Google Analytics 4 property
- [ ] Create Google Search Console account and verify domain
- [ ] Add GSC verification code to `src/app/layout.tsx`
- [ ] Submit `https://togorandtweed.com/sitemap.xml` to Google Search Console
- [ ] Submit site to Bing Webmaster Tools (also feeds Copilot AI)
- [ ] Create Google Business Profile
- [ ] Create Facebook Page and Instagram account `@togorandtweed`
- [ ] Verify `public/llms.txt` is accessible at `https://togorandtweed.com/llms.txt`
- [ ] Run Google Rich Results Test on homepage and a product page
- [ ] Check PageSpeed Insights for Core Web Vitals score
- [ ] Verify all category images have the `imageUrl` set in admin

---

## 📁 File Change Summary (This Session)

| File | Change |
|---|---|
| `src/app/robots.ts` | Added AI crawler rules (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, CCBot, FacebookBot) |
| `public/llms.txt` | **Created** — AI guidance file with brand facts, Q&As, product catalog, and content permissions |
| `src/app/og/route.tsx` | Fixed "TORGOR" → "TOGOR" typo in OG image generator |
| `src/app/layout.tsx` | Added 9 more keywords, OG images wired to `/og` route, `googleBot` robots directive, GSC verification placeholder, `metadataBase` updated to production URL |
| `src/app/page.tsx` | Added `LocalBusiness + ClothingStore` JSON-LD, enriched `Organization` JSON-LD with `alternateName`, `areaServed`, `foundingLocation`, `hasOfferCatalog` |
| `src/app/(shop)/collections/page.tsx` | Improved title, 10 keywords, OG image, canonical tag |
| `src/app/(shop)/collections/[slug]/page.tsx` | Improved generateMetadata (title formula, canonical, OG image), added `ItemList` JSON-LD for top 10 products per category |
| `src/app/(shop)/about/page.tsx` | Full rewrite — richer content, internal links to all categories, `AboutPage` JSON-LD, OG image |
| `src/lib/analytics.ts` | **Created** — GA4 event utilities (trackAddToCart, trackViewItem, trackPurchase, trackSearch, etc.) |
| `src/components/product/AddToCartButton.tsx` | Wired `trackAddToCart` GA4 event with item_id, item_name, category, price |
| `src/components/product/ViewItemTracker.tsx` | **Created** — client component that fires `view_item` GA4 event on product page mount |
| `src/app/(shop)/products/[slug]/page.tsx` | Imported and rendered `ViewItemTracker` |
| `src/app/(shop)/faq/layout.tsx` | Created — metadata + FAQPage JSON-LD (8 Q&As) |
| `src/app/(shop)/contact/layout.tsx` | Created — metadata for client-component contact page |
| `src/app/(shop)/shipping/page.tsx` | Added OG, improved title and description |
| `src/app/(shop)/privacy/page.tsx` | Added OG |
| `src/app/(shop)/terms/page.tsx` | Added OG, improved description |
| `src/app/(shop)/size-guide/page.tsx` | Added OG, improved title and description |
| `src/app/sitemap.ts` | Added 7 static pages (about, contact, faq, shipping, size-guide, privacy, terms) |
| `src/components/home/FeaturedCategories.tsx` | Fixed alt text: `Shop ${name} at Togor & Tweed Bangladesh` |
| `src/components/product/ProductGallery.tsx` | Improved alt text on both thumbnail and main image |
| `src/components/home/HeroSlider.tsx` | Added `fetchPriority="high"` on first slide, improved alt text |
| `src/app/(shop)/products/[slug]/page.tsx` | Added BreadcrumbList JSON-LD (4-level breadcrumb) |
| `SEO/seo-session-2026-04-16.md` | Previous session report |
| `SEO/seo-session-2026-04-28.md` | Session 2 report |
| `SEO/complete-seo-roadmap.md` | **This document** |

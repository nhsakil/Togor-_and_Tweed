# Snitch.com — Complete UI Style Reference Guide
### For: Togor & Tweed Frontend Implementation
**Prepared by:** Lead Developer  
**Assigned to:** Frontend Developer  
**Date:** 2026-04-13  
**Reference site:** https://www.snitch.com

---

## 1. BRAND PHILOSOPHY

Snitch.com is a premium men's fashion brand with a **clean, modern, minimal** aesthetic. Every design decision reinforces:
- **Confidence** — bold typography, strong contrast
- **Clarity** — zero clutter, generous whitespace
- **Premium feel** — sharp edges, precise spacing, editorial photography
- **Mobile-first** — designed for 320px and scaled up

---

## 2. COLOR SYSTEM

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-black` | `#111111` | Primary text, buttons, nav, footer |
| `--color-white` | `#FFFFFF` | Background, inverse text |
| `--color-sale-red` | `#E53935` | Sale price, discount badge |
| `--color-gray-bg` | `#F5F5F5` | Product card background, input bg |
| `--color-gray-border` | `#E8E8E8` | Dividers, card borders, input borders |
| `--color-gray-text` | `#888888` | Secondary text, placeholders, labels |
| `--color-gray-light` | `#F9F9F9` | Section backgrounds, hover states |
| `--color-overlay` | `rgba(0,0,0,0.45)` | Image overlays |
| `--color-announcement` | `#111111` | Announcement bar background |

### Do NOT use:
- Gold/amber (#c8a96e) in layout — **only** allowed on brand logo wordmark
- Gradients on UI elements (only on hero image overlay)
- Any color with opacity on text (use solid colors only)

---

## 3. TYPOGRAPHY

### Font Families
```css
/* Primary — all UI text */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Brand logo ONLY */
font-family: 'Playfair Display', Georgia, serif;
```

### Type Scale

| Element | Size | Weight | Transform | Tracking | Line-height |
|---------|------|--------|-----------|----------|-------------|
| Hero H1 | `52px / 72px / 84px` | `900 (Black)` | `uppercase` | `-0.02em` | `1.0` |
| Section heading | `20px / 24px` | `800 (ExtraBold)` | `uppercase` | `-0.01em` | `1.1` |
| Category tile | `16px / 20px` | `700 (Bold)` | `uppercase` | `0.02em` | `1.2` |
| Nav links | `12px` | `600 (SemiBold)` | `uppercase` | `0.08em` | `1` |
| Product name | `13px` | `500 (Medium)` | `none` | `0` | `1.4` |
| Product price | `13px / 14px` | `700 (Bold)` | `none` | `0` | `1` |
| Badge text | `10px` | `700 (Bold)` | `uppercase` | `0.05em` | `1` |
| Button text | `11px / 12px` | `700 (Bold)` | `uppercase` | `0.12em` | `1` |
| Body / description | `14px` | `400 (Regular)` | `none` | `0` | `1.65` |
| Label / caption | `11px` | `500 (Medium)` | `uppercase` | `0.15em` | `1` |
| Footer links | `13px` | `400 (Regular)` | `none` | `0` | `1.6` |
| Footer heading | `11px` | `700 (Bold)` | `uppercase` | `0.15em` | `1` |

---

## 4. SPACING SYSTEM

Base unit: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `4px` | Tight internal padding |
| `space-2` | `8px` | Icon padding, badge padding |
| `space-3` | `12px` | Card info padding-top |
| `space-4` | `16px` | Section inner padding, card gap |
| `space-5` | `20px` | Filter bar padding |
| `space-6` | `24px` | Component gap |
| `space-8` | `32px` | Section padding vertical |
| `space-10` | `40px` | Large section gap |
| `space-12` | `48px` | Page section padding md |
| `space-16` | `64px` | Hero content padding |

### Container widths
```
Mobile:   100% with 16px padding each side
Tablet:   100% with 24px padding each side
Desktop:  max-width 1500px, centered, 40px padding each side
```

---

## 5. BORDER RADIUS

**Snitch uses ZERO border-radius on all interactive elements.**

| Element | Radius |
|---------|--------|
| Buttons | `0px` |
| Product cards | `0px` |
| Input fields | `0px` |
| Badges | `0px` |
| Modals / drawers | `0px` |
| Image containers | `0px` |

> The only exception is avatar/profile images: `50%` (circle)

---

## 6. ANNOUNCEMENT BAR

```
Height:           32px
Background:       #111111
Text color:       #FFFFFF
Font size:        11px
Font weight:      500
Letter-spacing:   0.08em
Transform:        uppercase
Animation:        horizontal marquee, 28s linear infinite
Content:          3–5 short messages separated by · or ✦
Position:         fixed top-0, z-index 50
```

**Messages to show:**
- "Free Delivery on Orders Over ৳2,000"
- "Cash on Delivery Available"
- "New Season Arrivals — Shop Now"
- "Easy 7-Day Returns"
- "Premium Quality · Made in Bangladesh"

---

## 7. NAVIGATION / HEADER

```
Position:         fixed, below announcement bar (top: 32px)
Height:           56px desktop / 48px mobile
Background:       #FFFFFF (always — NO transparent/hero overlay)
Border-bottom:    1px solid #E8E8E8
Z-index:          40
Transition:       none (always white)
```

### Desktop Layout (≥768px)
```
[  New In    Men    Women  ]  [  TOGOR & TWEED  ]  [  Accessories  Sale  🔍  👤  🛍️  ]
      Left nav (3 items)           Logo center          Right nav + icons
```

### Logo
```
Font:             Playfair Display
Size:             22px
Weight:           700 (Bold)
Color:            #111111
Case:             Title case (not uppercase)
```

### Nav Links
```
Font size:        12px
Weight:           600 (SemiBold)
Transform:        uppercase
Tracking:         0.08em
Color default:    #111111
Color hover:      #888888
Transition:       color 150ms ease
Active underline: 2px solid #111111 below text (for current page)
Gap between:      24px
```

### Right Icons (Search, Account, Cart)
```
Icon size:        18px
Stroke width:     1.75px (Lucide style — NOT filled)
Color:            #111111
Hover:            #888888
Gap:              16px
```

### Cart Badge
```
Size:             16px × 16px
Background:       #111111
Text:             #FFFFFF, 9px, bold
Position:         absolute, top-right of cart icon
Shape:            square (no border-radius)
```

### Mobile Header (< 768px)
```
Left:             Hamburger icon (Menu, 20px stroke 1.75)
Center:           Logo (Playfair, 19px)
Right:            Search icon + Cart icon with badge
Height:           48px
Background:       #FFFFFF always
Border-bottom:    1px solid #E8E8E8
```

### Mobile Drawer
```
Width:            300px (max 85vw)
Background:       #FFFFFF
Overlay:          rgba(0,0,0,0.5)
Animation:        slide-in from left, 300ms ease
Nav items:        full-width, 48px height, border-bottom #F0F0F0
Nav font:         13px, 600, uppercase, tracking 0.08em
Chevron:          › right-aligned, color #CCCCCC
Bottom actions:   account + sign-in buttons, full-width, sharp corners
```

---

## 8. PRODUCT CARD

```
Image ratio:      3 : 4  (portrait)
Background:       #F5F5F5
Border:           none
Border-radius:    0px
Shadow:           none
```

### Image
```
Object-fit:       cover
Object-position:  top center
Hover transform:  scale(1.04)
Transition:       transform 500ms ease-out
```

### Badges (top-left corner)
```
Position:         absolute, 10px from top, 10px from left
Stack direction:  column, 4px gap
```

| Badge | Background | Text color | Text |
|-------|-----------|------------|------|
| Sale  | `#E53935` | `#FFFFFF`  | `-XX%` |
| New   | `#111111` | `#FFFFFF`  | `NEW` |
| Hot   | `#FF6B00` | `#FFFFFF`  | `HOT` |

```
Badge padding:    2px 8px
Font size:        10px
Font weight:      700
Letter-spacing:   0.05em
Transform:        uppercase
```

### Slide-up CTA (hover only)
```
Position:         absolute bottom-0, full width
Background:       #111111
Text color:       #FFFFFF
Text:             "VIEW PRODUCT" or "ADD TO CART"
Font size:        11px, bold, uppercase, tracking 0.15em
Height:           44px
Transform:        translateY(100%) → translateY(0) on hover
Transition:       transform 280ms ease-out
Hover bg:         #333333
```

### Product Info (below image)
```
Padding-top:      10px
Gap between name and price: 6px
```

### Product Name
```
Font size:        13px
Weight:           500 (Medium)
Color:            #111111
Line-clamp:       2 lines
Line-height:      1.4
Hover color:      #555555
Transition:       150ms
```

### Price Display
```
Regular price:    13px, 700 (Bold), #111111
Sale price:       13px, 700 (Bold), #E53935
Original price:   12px, 400, #AAAAAA, line-through
Gap:              8px between prices
```

---

## 9. PRODUCT GRID

```
Mobile (< 640px):     2 columns
Tablet (640–1024px):  3 columns
Desktop (≥ 1024px):   4 columns
XL (≥ 1280px):        4–5 columns (snitch uses 4 max)

Gap mobile:       12px
Gap desktop:      16px
```

---

## 10. HERO SECTION

```
Height:           100svh (full viewport, min 580px)
Background:       dark editorial fashion photography
Overlay:          linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)
Content position: left-aligned, vertically centered
Content padding:  left 56px desktop / left 20px mobile
```

### Hero Typography
```
Season label:     11px, 500, uppercase, tracking 0.4em, rgba(255,255,255,0.65)
H1 title:         52px (mobile) / 72px (tablet) / 84px+ (desktop)
                  font-weight: 900 (Black)
                  uppercase
                  letter-spacing: -0.02em
                  line-height: 1.0
                  color: #FFFFFF
Subtitle:         14px, 400, rgba(255,255,255,0.80), max-width 280px, line-height 1.65
```

### Hero Buttons
```
Primary CTA:      white bg, black text
Secondary CTA:    transparent bg, white border (60% opacity), white text
Height:           52px
Padding:          0 32px
Font:             11px, 700, uppercase, tracking 0.12em
Hover (primary):  bg #EEEEEE
Hover (secondary): bg rgba(255,255,255,0.10), border full white
Gap between:      12px
```

---

## 11. CATEGORY SECTION

### Section Header
```
Section padding:  48px vertical, responsive
Label above:      10px, 500, uppercase, tracking 0.25em, #AAAAAA
Heading:          20–24px, 800, uppercase, #111111, tracking -0.01em
"View All" link:  11px, 700, uppercase, tracking 0.1em, #111111
                  text-decoration: underline, underline-offset 4px
                  hover: #888888
```

### Category Tiles Grid
```
Columns:          2 mobile / 4 desktop
Gap:              8px desktop / 6px mobile
Image ratio:      3:4 portrait
Overlay:          linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)
Hover scale:      1.04 on image only, 500ms ease-out
```

### Tile Text (overlay)
```
Position:         absolute bottom, 16px padding
Name font:        16–18px, 700, uppercase, tracking 0.04em, white
"Shop Now →":     hidden by default, 10px, 600, white/80
                  opacity 0 → 1 on tile hover, translateY(4px) → 0
```

---

## 12. COLLECTIONS / CATEGORY PAGE

### Page Header
```
Style:            centered text, border-bottom
Padding:          40px vertical
Label:            10px, 500, uppercase, tracking 0.3em, #AAAAAA
H1:               30–40px, 800, uppercase, #111111
```

### Filter Bar
```
Position:         sticky top (below nav), or static
Background:       #FFFFFF
Border-bottom:    1px solid #E8E8E8
Padding:          16px 0
```

### Filter Pills
```
Style:            square border buttons (0px radius)
Inactive:         border #E0E0E0, text #555555, bg white
Active:           border #111111, bg #111111, text white
Hover:            border #111111, text #111111
Font:             11px, 700, uppercase, tracking 0.08em
Padding:          8px 16px
Gap:              6px
```

### Product Count
```
Font:             11px, 500, uppercase, tracking 0.08em, #AAAAAA
Padding:          12px 0
```

### Pagination
```
Button style:     square (0 radius), border #111111
Active:           bg #111111, text white
Inactive:         transparent, text #555555
Hover:            bg #111111, text white
Size:             44px × 44px square for number buttons
Prev/Next:        wider, rectangular (56px+)
```

---

## 13. PRODUCT DETAIL PAGE

### Breadcrumb
```
Style:            border-bottom divider line
Background:       white
Padding:          12px 0
Font:             10px, 500, uppercase, tracking 0.15em, #AAAAAA
Separator:        /
Active item:      #111111
Hover:            #111111
```

### Layout (desktop)
```
Grid:             2 columns (gallery left | details right)
Gap:              80px
Gallery:          sticky top while scrolling
Max width:        1500px container
```

### Product Gallery
```
Main image:       square or 3:4 portrait
Thumbnail strip:  vertical, left side (4–5 thumbs)
Active thumb:     2px solid #111111 border
Hover thumb:      border #AAAAAA
Thumbnails size:  80px × 80px
```

### Product Details Panel
```
Brand name:       10px, 500, uppercase, tracking 0.3em, #AAAAAA
Product name:     26–32px, 700, #111111, line-height 1.2
Rating row:       stars in #111111 (filled), count in #AAAAAA 12px
Price:            22px, 700 — regular #111111 / sale #E53935 + strikethrough original
```

### Size Selector
```
Label:            10px, 600, uppercase, tracking 0.2em, #888888
Buttons:          square, 44px × 44px (or wider for text sizes)
Inactive:         border #E8E8E8, text #111111, bg white
Selected:         border #111111, bg #111111, text white
Out of stock:     border #F0F0F0, text #CCCCCC, line-through, cursor not-allowed
Gap:              8px
```

### Add to Cart Button
```
Width:            100%
Height:           52px
Background:       #111111
Text color:       #FFFFFF
Font:             12px, 700, uppercase, tracking 0.15em
Hover bg:         #333333
Disabled bg:      #CCCCCC
Border-radius:    0px
```

### Wishlist Button
```
Width:            52px
Height:           52px
Border:           1px solid #E8E8E8
Icon:             Heart, 18px, stroke 1.5
Hover bg:         #F5F5F5
Active (wishlisted): filled heart, bg #FFF0F0, border #E53935
```

### Trust Badges
```
Grid:             2 columns
Gap:              16px
Label:            10px, 700, uppercase, tracking 0.12em, #111111
Value:            11px, 400, #888888
Border-top:       1px solid #E8E8E8, padding-top 24px
```

---

## 14. PROMO / BANNER STRIP

### Dark Variant (black bg)
```
Background:       #111111
Heading:          20–24px, 800, uppercase, white
Subtext:          13px, 400, rgba(255,255,255,0.50)
CTA button:       white bg, black text
Layout:           flex row (text left, button right) md / stack mobile
Padding:          48px vertical
```

### Light Variant (cream bg)
```
Background:       #F7F4EF
Heading:          20–24px, 800, uppercase, #111111
Subtext:          13px, 400, #666666
CTA button:       black bg, white text
```

---

## 15. FOOTER

```
Background:       #111111
Text color:       rgba(255,255,255,0.70)
Heading color:    rgba(255,255,255,0.35)
Link hover:       rgba(255,255,255,1.0)
```

### Top section
```
Grid:             1 col mobile / 4 col desktop
Gap:              32px
Padding:          48px horizontal+vertical
Border-bottom:    1px solid rgba(255,255,255,0.10)
```

### Column headings
```
Font:             10px, 700, uppercase, tracking 0.18em, rgba(255,255,255,0.35)
Margin-bottom:    16px
```

### Footer links
```
Font:             13px, 400, rgba(255,255,255,0.65)
Hover:            white
Line-height:      2.0 (generous)
```

### Brand column
```
Logo:             Playfair, 22px, bold, white
Tagline:          13px, 400, rgba(255,255,255,0.45), max-width 220px, line-height 1.6
```

### Bottom bar
```
Background:       same as footer
Border-top:       1px solid rgba(255,255,255,0.08)
Padding:          16px
Copyright:        12px, rgba(255,255,255,0.30)
Links:            Privacy · Terms — 12px, rgba(255,255,255,0.30), hover white
Layout:           flex, space-between
```

---

## 16. BUTTONS (Global)

| Class | Background | Text | Border | Hover |
|-------|-----------|------|--------|-------|
| Primary | `#111111` | `#FFFFFF` | none | `#333333` bg |
| Outline | `transparent` | `#111111` | `1px solid #111111` | `#111111` bg + white text |
| White | `#FFFFFF` | `#111111` | none | `#EEEEEE` bg |
| Ghost | `transparent` | `#111111` | `1px solid #E8E8E8` | `#F5F5F5` bg |
| Danger | `#E53935` | `#FFFFFF` | none | `#C62828` bg |

```
All buttons:
  border-radius: 0px
  font-size:     11–12px
  font-weight:   700
  letter-spacing: 0.12em
  text-transform: uppercase
  padding:       14px 28px (standard) / 12px 20px (small)
  transition:    background-color 200ms ease, color 200ms ease
  cursor:        pointer
```

---

## 17. FORMS & INPUTS

```
Height:           48px (standard input)
Border:           1px solid #E8E8E8
Border-radius:    0px
Background:       #FFFFFF (or #F5F5F5 on gray bg)
Font-size:        14px
Color:            #111111
Placeholder:      #AAAAAA
Focus border:     1px solid #111111
Focus outline:    none (use border only)
Padding:          0 16px
Transition:       border-color 200ms
```

---

## 18. ANIMATIONS & TRANSITIONS

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Product card image zoom | transform scale | 500ms | ease-out |
| Slide-up CTA | transform translateY | 280ms | ease-out |
| Nav link hover | color | 150ms | ease |
| Button hover | background-color | 200ms | ease |
| Category tile zoom | transform scale | 600ms | ease-out |
| Mobile drawer open | transform translateX | 300ms | ease |
| Search expand | width | 250ms | ease |
| Wishlist active | background, border | 200ms | ease |
| Announcement marquee | transform translateX | 28s | linear infinite |
| Cart badge appear | opacity, scale | 200ms | ease |
| Page fade in | opacity, translateY(6px) | 250ms | ease |

---

## 19. ICONS

- **Library:** Lucide React
- **Default size:** 18px (nav), 20px (mobile), 16px (inline)
- **Stroke width:** 1.75px (NOT filled icons — keep them outlined)
- **Color:** inherit from parent (use `currentColor`)
- **Never use:** filled/solid icon variants in UI

---

## 20. IMAGERY GUIDELINES

```
Product images:       Always 3:4 portrait ratio
                      Clean white or neutral gray background
                      Model shots preferred over flat lay
                      High contrast, well-lit

Category images:      Fashion editorial photography
                      Portrait or landscape acceptable
                      Always overlaid with gradient for text readability

Hero image:           Full-width editorial, high resolution
                      Model in context (street, studio)
                      Should work with left-side gradient overlay

Unsplash sources:     Use fashion-specific search terms
                      Prefer: men's clothing, streetwear, fashion editorial
```

---

## 21. Z-INDEX STACK

```
Announcement bar:   50
Header/Nav:         40
Mobile drawer:      50 (drawer) / 45 (overlay)
Cart drawer:        55
Toast/notification: 60
Modal:              70
```

---

## 22. RESPONSIVE BREAKPOINTS

```css
/* Mobile first */
/* sm  */ @media (min-width: 640px)  { /* 2→3 col grid */ }
/* md  */ @media (min-width: 768px)  { /* Desktop nav visible, mobile nav hidden */ }
/* lg  */ @media (min-width: 1024px) { /* 4 col grid, wider padding */ }
/* xl  */ @media (min-width: 1280px) { /* Max container, full layout */ }
/* 2xl */ @media (min-width: 1500px) { /* Constrain at 1500px max-width */ }
```

---

## 23. WHAT NOT TO DO ❌

| Wrong | Right |
|-------|-------|
| Using gold `#c8a96e` on buttons/badges | Gold only on Togor & Tweed logo |
| Rounded corners (`rounded-lg`, `rounded-md`) | Sharp edges (`rounded-none` / `0px`) |
| Playfair Display for body/headings | Playfair only for brand logo |
| Gradient on buttons | Solid flat background |
| Box shadows on cards | No shadows (elevation = whitespace) |
| Colored section backgrounds | White or `#F5F5F5` or `#F7F4EF` max |
| Centered section text | Left-aligned (except hero/banner) |
| Heavy use of borders | Minimal borders, only where structurally needed |
| Serif font for product names | Inter medium weight |
| Multiple accent colors | Black, white, red only |

---

## 24. CURRENT GAPS vs SNITCH.COM

Based on audit of current Togor & Tweed implementation:

| Area | Current State | Target State |
|------|--------------|--------------|
| Desktop nav | Always white ✅ | + active underline on current page |
| Mobile nav | Drawer working ✅ | + size should be 300px, chevron on nav items |
| Product card | Close ✅ | Remove brand name line, tighter info spacing |
| Hero | Font weight ok | Increase to `font-black`, true uppercase |
| Category grid | Working ✅ | Asymmetric 1-large + 3-small layout (see snitch) |
| Collections page | Filter pills ok ✅ | Sticky filter bar, product count visible |
| Product detail | Working | Better gallery (thumbs left strip), sticky panel |
| Footer | Created ✅ | Add social media icons row |
| Announcement bar | Working ✅ | Reduce font size to 10px |
| Cart drawer | Exists | Review styling for snitch-match |
| Search | Inline expand ✅ | Add overlay dimmer behind |
| Size selector | Working | 44px min-height per button |

---

*Reference: https://www.snitch.com | Version 1.0 | 2026-04-13*

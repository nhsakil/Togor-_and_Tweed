# Torgor & Tweed — Fashion E-Commerce Website Plan

## Context
Build a production-grade fashion e-commerce website from scratch for the brand **Torgor & Tweed**.
The project directory `E:\Togor & Tweed` is currently empty.
Architecture mirrors snitch.com: Next.js App Router storefront, MySQL database (via Prisma), Tailwind CSS, Redis caching.
Hosting: **Hostinger** (shared/VPS). All tools and assets used are **free tier / open source** only.
This plan file + the local todo list at `E:\Togor & Tweed\.claude\TODO.md` must be kept up-to-date so work can resume at any point.

---

## Brand Identity
- **Brand Name**: Torgor & Tweed
- **Tagline**: "Wear the story"
- **Color Palette**: Minimalist — near-black `#1a1a1a`, white `#ffffff`, warm accent `#c8a96e` (gold/tan)
- **Typography**: Google Fonts — `Playfair Display` (headings) + `Inter` (body)
- **Logo**: SVG text logo in code

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MySQL (Hostinger) via Prisma ORM |
| Auth | NextAuth v5 + PrismaAdapter (Credentials + Google OAuth) |
| Cart state | Zustand |
| Server cache | Upstash Redis |
| Images | Cloudinary + next-cloudinary |
| Email | Resend SDK |
| Validation | Zod |
| Toasts | Sonner |
| Payments | Cash on Delivery + bKash API + Nagad API |
| Currency | BDT (৳ Bangladeshi Taka) |
| Hosting | Hostinger VPS (Node.js + MySQL + PM2 + Nginx) |

---

## Free Assets
- Fonts: Google Fonts (Playfair Display, Inter)
- Icons: Lucide React
- UI: shadcn/ui
- Images: Cloudinary (free tier)
- DB: MySQL on Hostinger
- Cache: Upstash Redis (free tier)
- Email: Resend (free tier: 3k/mo)
- Analytics: Google Analytics 4
- OG Images: next/og

---

## Deployment (Hostinger VPS)
```
Nginx → PM2 → Next.js standalone
MySQL (Hostinger) + Upstash Redis + Cloudinary
```
- `next.config.ts`: `output: 'standalone'`
- `ecosystem.config.js` for PM2
- SSL via Let's Encrypt (certbot)

---

## Phases Overview
1. Foundation (Next.js setup, Prisma, NextAuth, Header/Footer)
2. Product Catalog (Homepage, Collections, PDP)
3. Cart & Wishlist
4. Auth Pages
5. Checkout (COD + bKash + Nagad)
6. Account Dashboard
7. Search
8. Reviews
9. SEO & Performance
10. Hostinger Deployment

See TODO.md for step-by-step task tracking.

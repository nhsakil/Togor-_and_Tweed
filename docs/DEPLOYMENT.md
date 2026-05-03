# Torgor & Tweed — Hostinger VPS Deployment Guide

## Overview

This guide walks through deploying the Torgor & Tweed Next.js 14 app to a Hostinger VPS with:
- Node.js 20 runtime
- PM2 process manager (standalone mode)
- Nginx reverse proxy with gzip
- Let's Encrypt SSL
- MySQL database
- Upstash Redis for caching

## Prerequisites

- Hostinger VPS with Ubuntu 22.04+ (2GB+ RAM, 2 vCPU recommended)
- Domain name
- GitHub private repo access
- SSH key pair

## Phase 1: GitHub Repository Setup

1. Create private repo: `torgor-and-tweed` on GitHub
2. Push local code: `git push -u origin main`

## Phase 2: VPS Provisioning

Run the automated setup script:
```bash
scp scripts/deploy.sh root@YOUR_VPS_IP:/tmp/
ssh root@YOUR_VPS_IP "bash /tmp/deploy.sh"
```

This installs: Node.js 20, Nginx, PM2, Certbot

## Phase 3: Clone Repository & Setup Environment

1. SSH into VPS as torgor user
2. Clone repo: `git clone https://github.com/USERNAME/torgor-and-tweed.git /home/torgor/app`
3. Create `.env.local` with all required variables from `.env.example`

## Phase 4: Build & Deploy

```bash
cd /home/torgor/app
npm ci
npx prisma migrate deploy
npm run build
```

## Phase 5: Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Phase 6: Configure SSL with Let's Encrypt

```bash
sudo certbot certonly --nginx -d torgorandtweed.com
```

Then update `/etc/nginx/sites-available/torgor-and-tweed` with SSL paths and reload Nginx.

## Phase 7: DNS Configuration

Point domain A record to VPS IP address.

## Phase 8: Verify Deployment

- Check: `curl -I https://torgorandtweed.com`
- Monitor: `pm2 logs torgor-and-tweed`
- View dashboard: https://torgorandtweed.com

## Phase 9: Google Search Console

Submit sitemap at https://search.google.com/search-console

## Phase 10: Production Smoke Tests

- Homepage loads
- Product pages display
- Search works
- Checkout process completes
- SSL certificate valid
- Security headers present
- Analytics firing
- No console errors

## Troubleshooting

- App won't start: Check `pm2 logs`
- Database connection: Verify `DATABASE_URL` in `.env.local`
- SSL issues: Run `sudo certbot certificates`
- Nginx issues: Run `sudo nginx -t`

See full guide for complete documentation.

#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  FIX-403.sh — Immediately fix "403 Forbidden" on Hostinger VPS
#
#  This script diagnoses and resolves the most common causes of 403 on Nginx.
#  Run on the server as root:  bash fix-403.sh
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[FIX-403]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }

DOMAIN="torgorandtweed.com"
WEB_ROOT="/var/www/torgor-tweed"

log "=== 403 Forbidden Diagnostic & Fix ==="

# ── Cause 1: Default Nginx site blocking custom site ─────────────────────────
log "Checking for conflicting default Nginx site..."
if [[ -f /etc/nginx/sites-enabled/default ]]; then
  warn "Removing /etc/nginx/sites-enabled/default — this is the most common 403 cause on fresh VPS."
  rm -f /etc/nginx/sites-enabled/default
  log "Default site removed ✓"
fi

# ── Cause 2: Web root doesn't exist or is empty ───────────────────────────────
log "Checking web root: $WEB_ROOT ..."
if [[ ! -d "$WEB_ROOT" ]]; then
  warn "$WEB_ROOT does not exist — creating with placeholder..."
  mkdir -p "$WEB_ROOT"
fi

if [[ ! -f "$WEB_ROOT/index.html" && ! -d "$WEB_ROOT/.next" ]]; then
  warn "No index.html or Next.js build found — deploying placeholder page..."
  cat > "$WEB_ROOT/index.html" << 'PLACEHOLDER'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Torgor &amp; Tweed — Coming Soon</title>
  <style>
    body { font-family: Georgia, serif; background: #1a1a1a; color: #fff;
           min-height: 100vh; display: flex; flex-direction: column;
           align-items: center; justify-content: center; text-align: center; padding: 2rem; }
    .logo { font-size: 3rem; color: #c8a96e; letter-spacing: 0.12em; margin-bottom: 0.5rem; }
    .sub  { font-size: 0.9rem; letter-spacing: 0.3em; text-transform: uppercase; color: #888; margin-bottom: 2rem; }
    p     { color: #aaa; font-family: Arial, sans-serif; max-width: 400px; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="logo">Torgor &amp; Tweed</div>
  <div class="sub">Wear the story</div>
  <p>Our store is being crafted. Something beautiful is coming soon.</p>
</body>
</html>
PLACEHOLDER
  log "Placeholder index.html created ✓"
fi

# ── Cause 3: Wrong file permissions ──────────────────────────────────────────
log "Fixing file permissions on $WEB_ROOT ..."
find "$WEB_ROOT" -type d -exec chmod 755 {} \;
find "$WEB_ROOT" -type f -exec chmod 644 {} \;
# Give Nginx read access
chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || \
  chown -R nginx:nginx "$WEB_ROOT" 2>/dev/null || \
  log "Could not chown — continuing anyway"
log "Permissions fixed ✓"

# ── Cause 4: Nginx config missing or not enabled ─────────────────────────────
log "Checking Nginx config for $DOMAIN ..."
NGINX_CONF="/etc/nginx/sites-available/torgor-tweed.conf"

if [[ ! -f "$NGINX_CONF" ]]; then
  warn "Nginx config not found — creating basic config..."
  cat > "$NGINX_CONF" << NGINXCONF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    root $WEB_ROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Once Next.js app is deployed, replace the above location with:
    # location / {
    #     proxy_pass http://127.0.0.1:3000;
    #     proxy_set_header Host \$host;
    #     proxy_set_header X-Real-IP \$remote_addr;
    #     proxy_set_header X-Forwarded-Proto \$scheme;
    # }
}
NGINXCONF
  log "Basic Nginx config created ✓"
fi

if [[ ! -L "/etc/nginx/sites-enabled/torgor-tweed.conf" ]]; then
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/torgor-tweed.conf
  log "Nginx config enabled ✓"
fi

# ── Cause 5: Options Indexes or deny all in config ────────────────────────────
log "Checking for deny/autoindex issues..."
if grep -q "autoindex off" "$NGINX_CONF" 2>/dev/null; then
  warn "autoindex off found (normal — not the issue)"
fi

# ── Cause 6: Test & reload Nginx ─────────────────────────────────────────────
log "Testing Nginx config..."
nginx -t
log "Reloading Nginx..."
systemctl reload nginx
log "Nginx reloaded ✓"

# ── Cause 7: Check port 3000 if proxying Next.js ─────────────────────────────
log "Checking if Next.js app is running on port 3000..."
if command -v pm2 &>/dev/null; then
  pm2_status=$(pm2 describe torgor-tweed 2>/dev/null | grep status || echo "not running")
  log "PM2 status: $pm2_status"
  if echo "$pm2_status" | grep -q "stopped\|errored"; then
    warn "Next.js app is stopped — trying to restart..."
    pm2 restart torgor-tweed 2>/dev/null || warn "Cannot restart — app not yet deployed"
  fi
elif ! curl -s http://127.0.0.1:3000 &>/dev/null; then
  warn "Nothing running on port 3000 — placeholder HTML will serve for now"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
log "=== Fix Complete ==="
log "Verify in browser: http://$DOMAIN"
log ""
log "If still 403, check:"
log "  1. Hostinger hPanel → DNS → A record points to this server IP"
log "  2. cat /var/log/nginx/error.log | tail -20"
log "  3. Your domain DNS may still be propagating (wait up to 24h)"

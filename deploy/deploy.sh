#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  Torgor & Tweed — Hostinger VPS Deployment Script
#  Run from your LOCAL machine:  bash deploy/deploy.sh
#  Or on the server after git pull: bash deploy/deploy.sh --server
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── CONFIG — edit these ───────────────────────────────────────────────────────
SERVER_USER="root"                          # your Hostinger SSH user
SERVER_IP="YOUR_VPS_IP"                     # replace with actual IP
SERVER_DIR="/var/www/torgor-tweed"
DOMAIN="torgorandtweed.com"
PM2_APP="torgor-tweed"
NODE_VERSION="20"
# ─────────────────────────────────────────────────────────────────────────────

MODE="${1:-remote}"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── STEP 0: Pre-flight checks ─────────────────────────────────────────────────
if [[ "$MODE" != "--server" ]]; then
  log "Running remote deployment to $SERVER_USER@$SERVER_IP ..."
  ssh "$SERVER_USER@$SERVER_IP" "bash -s" < "$0" --server
  exit 0
fi

log "=== Torgor & Tweed Server Deployment Started ==="
log "Server: $(hostname), Date: $(date)"

# ── STEP 1: System packages ───────────────────────────────────────────────────
log "Checking Node.js..."
if ! command -v node &>/dev/null; then
  log "Installing Node.js $NODE_VERSION via NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install "$NODE_VERSION"
  nvm use "$NODE_VERSION"
  nvm alias default "$NODE_VERSION"
fi
log "Node: $(node -v), NPM: $(npm -v)"

if ! command -v pm2 &>/dev/null; then
  log "Installing PM2..."
  npm install -g pm2
fi

# ── STEP 2: Create app directory ──────────────────────────────────────────────
log "Setting up $SERVER_DIR ..."
mkdir -p "$SERVER_DIR"
mkdir -p /var/log/pm2

# ── STEP 3: Upload/pull code ──────────────────────────────────────────────────
if [[ -d "$SERVER_DIR/.git" ]]; then
  log "Pulling latest code..."
  cd "$SERVER_DIR"
  git pull origin main
else
  warn "No git repo found at $SERVER_DIR."
  warn "Upload your code first:  rsync -avz --exclude node_modules . $SERVER_USER@$SERVER_IP:$SERVER_DIR/"
  warn "Then re-run this script."
  exit 1
fi

# ── STEP 4: Install dependencies ──────────────────────────────────────────────
cd "$SERVER_DIR"
log "Installing dependencies..."
npm ci --omit=dev

# ── STEP 5: Build Next.js ─────────────────────────────────────────────────────
log "Building Next.js..."
npm run build

# ── STEP 6: Copy .env ─────────────────────────────────────────────────────────
if [[ ! -f "$SERVER_DIR/.env" ]]; then
  err ".env file missing at $SERVER_DIR/.env — copy and fill it from .env.example before deploying."
fi

# ── STEP 7: File permissions ──────────────────────────────────────────────────
log "Setting file permissions..."
find "$SERVER_DIR" -type d -exec chmod 755 {} \;
find "$SERVER_DIR" -type f -exec chmod 644 {} \;
chmod 600 "$SERVER_DIR/.env"

# ── STEP 8: Install Nginx config ──────────────────────────────────────────────
log "Installing Nginx config..."
NGINX_CONF="/etc/nginx/sites-available/torgor-tweed.conf"
if [[ ! -f "$NGINX_CONF" ]]; then
  cp "$SERVER_DIR/deploy/nginx/torgor-tweed.conf" "$NGINX_CONF"
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/torgor-tweed.conf
  # Update domain placeholder
  sed -i "s/torgorandtweed.com/$DOMAIN/g" "$NGINX_CONF"
  log "Nginx config installed."
else
  log "Nginx config already exists — skipping overwrite."
fi

# Remove default Nginx site (common cause of 403)
if [[ -f /etc/nginx/sites-enabled/default ]]; then
  log "Removing default Nginx site (was causing 403)..."
  rm -f /etc/nginx/sites-enabled/default
fi

# Test and reload Nginx
nginx -t && systemctl reload nginx
log "Nginx reloaded ✓"

# ── STEP 9: SSL via certbot ───────────────────────────────────────────────────
if ! command -v certbot &>/dev/null; then
  log "Installing certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

if [[ ! -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
  log "Obtaining SSL certificate for $DOMAIN ..."
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos \
    -m "admin@$DOMAIN" --redirect
  log "SSL installed ✓"
else
  log "SSL certificate already exists ✓"
fi

# ── STEP 10: Start / restart PM2 ─────────────────────────────────────────────
log "Starting application with PM2..."
if pm2 describe "$PM2_APP" &>/dev/null; then
  pm2 reload "$PM2_APP" --update-env
else
  pm2 start "$SERVER_DIR/deploy/ecosystem.config.js"
fi
pm2 save
pm2 startup systemd -u "$SERVER_USER" --hp "$HOME" 2>/dev/null || true

# ── DONE ──────────────────────────────────────────────────────────────────────
log "=== Deployment Complete ==="
log "Site:    https://$DOMAIN"
log "Status:  pm2 status"
log "Logs:    pm2 logs $PM2_APP"
echo ""
pm2 status

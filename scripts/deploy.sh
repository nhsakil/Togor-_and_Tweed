#\!/bin/bash
#
# Torgor & Tweed — Hostinger VPS Deployment Script
# Complete automated setup from fresh Ubuntu to running Next.js app
#
# Usage: bash deploy.sh
# Run as root or with sudo
#

set -e

echo "=========================================="
echo "Torgor & Tweed VPS Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="torgor-and-tweed"
APP_DIR="/home/torgor/app"
APP_USER="torgor"
APP_GROUP="torgor"
NODE_VERSION="20"
DOMAIN="${DOMAIN:-torgorandtweed.com}"
PORT="3000"

# ============================================================================
# 1. UPDATE SYSTEM & INSTALL DEPENDENCIES
# ============================================================================
echo -e "${YELLOW}[1/8] Updating system and installing base dependencies...${NC}"
apt-get update
apt-get upgrade -y
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    ca-certificates \
    gnupg \
    lsb-release

# ============================================================================
# 2. INSTALL NODE.JS 20
# ============================================================================
echo -e "${YELLOW}[2/8] Installing Node.js v${NODE_VERSION}...${NC}"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# Verify installation
NODE_VERSION_CHECK=$(node -v)
echo -e "${GREEN}Installed ${NODE_VERSION_CHECK}${NC}"

# ============================================================================
# 3. INSTALL NGINX
# ============================================================================
echo -e "${YELLOW}[3/8] Installing Nginx...${NC}"
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}Nginx installed and enabled${NC}"

# ============================================================================
# 4. INSTALL PM2 GLOBALLY
# ============================================================================
echo -e "${YELLOW}[4/8] Installing PM2 globally...${NC}"
npm install -g pm2
pm2 install pm2-logrotate

# Setup PM2 startup script
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
systemctl enable pm2-${APP_USER}

echo -e "${GREEN}PM2 installed and configured${NC}"

# ============================================================================
# 5. CREATE APP USER & DIRECTORY
# ============================================================================
echo -e "${YELLOW}[5/8] Creating app user and directories...${NC}"

# Create user if not exists
if \! id "${APP_USER}" &>/dev/null; then
    useradd -m -s /bin/bash ${APP_USER}
    echo -e "${GREEN}Created user ${APP_USER}${NC}"
else
    echo -e "${YELLOW}User ${APP_USER} already exists${NC}"
fi

# Create app directory
mkdir -p ${APP_DIR}
chown -R ${APP_USER}:${APP_GROUP} ${APP_DIR}
chmod 755 ${APP_DIR}

echo -e "${GREEN}App directories created at ${APP_DIR}${NC}"

# ============================================================================
# 6. INSTALL CERTBOT FOR LET'S ENCRYPT SSL
# ============================================================================
echo -e "${YELLOW}[6/8] Installing Certbot for Let's Encrypt SSL...${NC}"
apt-get install -y certbot python3-certbot-nginx

echo -e "${GREEN}Certbot installed${NC}"

# ============================================================================
# 7. SETUP NGINX REVERSE PROXY CONFIG (WITHOUT SSL - ADD MANUALLY)
# ============================================================================
echo -e "${YELLOW}[7/8] Configuring Nginx reverse proxy...${NC}"

cat > /etc/nginx/sites-available/${APP_NAME} << 'NGINXEOF'
# Torgor & Tweed - Next.js Reverse Proxy

upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    client_max_body_size 50M;
    proxy_buffering off;

    gzip on;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
    gzip_disable "msie6";

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /_next/static {
        proxy_cache_valid 365d;
        proxy_pass http://nextjs_upstream;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    location /public {
        alias /home/torgor/app/public;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location /health {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        access_log off;
    }

    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        proxy_buffering off;
    }
}
NGINXEOF

# Enable the site
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/${APP_NAME}

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

systemctl reload nginx

echo -e "${GREEN}Nginx reverse proxy configured${NC}"

# ============================================================================
# 8. CREATE DEPLOYMENT INSTRUCTIONS FILE
# ============================================================================
echo -e "${YELLOW}[8/8] Creating deployment instructions...${NC}"

cat > /home/${APP_USER}/NEXT_STEPS.txt << 'STEPSEOF'
Torgor & Tweed VPS Setup Complete\!
System is ready. See docs/DEPLOYMENT.md for next steps.
STEPSEOF

chown ${APP_USER}:${APP_GROUP} /home/${APP_USER}/NEXT_STEPS.txt
chmod 644 /home/${APP_USER}/NEXT_STEPS.txt

echo ""
echo -e "${GREEN}=========================================="
echo "VPS Setup Complete\!"
echo "=========================================="
echo "Read deployment guide at: docs/DEPLOYMENT.md"
echo -e "${NC}"

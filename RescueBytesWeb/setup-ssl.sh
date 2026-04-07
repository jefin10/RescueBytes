#!/bin/bash

# RescueBytes HTTPS Setup Script
# This script helps automate SSL certificate setup with Let's Encrypt

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔒 RescueBytes HTTPS Setup"
echo "=========================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root${NC}"
   echo "Run as: ./setup-ssl.sh"
   exit 1
fi

# Get domain name
echo -e "${YELLOW}Enter your domain name (e.g., rescuebytes.com):${NC}"
read -r DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Domain name is required${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Enter your email for SSL certificate notifications:${NC}"
read -r EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Email is required${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Include www subdomain? (y/n):${NC}"
read -r INCLUDE_WWW

# Build domain list
if [ "$INCLUDE_WWW" = "y" ] || [ "$INCLUDE_WWW" = "Y" ]; then
    DOMAINS="-d $DOMAIN -d www.$DOMAIN"
    SERVER_NAME="$DOMAIN www.$DOMAIN"
else
    DOMAINS="-d $DOMAIN"
    SERVER_NAME="$DOMAIN"
fi

echo ""
echo "Configuration:"
echo "  Domain(s): $DOMAINS"
echo "  Email: $EMAIL"
echo ""
echo -e "${YELLOW}Continue? (y/n):${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo -e "${GREEN}Step 1: Installing Certbot...${NC}"
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
echo -e "${GREEN}✓ Certbot installed${NC}"

echo ""
echo -e "${GREEN}Step 2: Stopping frontend container...${NC}"
docker-compose stop frontend
echo -e "${GREEN}✓ Frontend stopped${NC}"

echo ""
echo -e "${GREEN}Step 3: Obtaining SSL certificate...${NC}"
sudo certbot certonly --standalone \
  $DOMAINS \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL certificate obtained${NC}"
else
    echo -e "${RED}❌ Failed to obtain certificate${NC}"
    echo "Starting frontend container..."
    docker-compose start frontend
    exit 1
fi

echo ""
echo -e "${GREEN}Step 4: Creating nginx SSL configuration...${NC}"

cat > frontend/nginx-ssl.conf << EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name $SERVER_NAME;
    
    # Redirect all HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $SERVER_NAME;
    
    root /usr/share/nginx/html;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy backend API routes
    location ~ ^/(auth|news|chat|sos|signup|registercom|volunteerSignup|addAlert|addInventory|manageInv|emergencyReport|invReqRc|addUserReq|approveUserReq|rejectUserReq|deleteAlert|addComRep|approveComReq|comReportsRejected|addVolunteerMessage|deleteSOS|getComRepAdm|getComRepUser|getInvReqRc|getUserReq|getUserReqbyId|getAlerts|getLatestAlerts|getInv|getRC|getUsers|getVolunteers|getVolMessagebyId|getStats|getRCName|addRC|hash|health)(/|\$) {
        proxy_pass         http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Cookie            \$http_cookie;
        proxy_read_timeout 60s;
    }

    # React SPA
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
}
EOF

echo -e "${GREEN}✓ nginx-ssl.conf created${NC}"

echo ""
echo -e "${GREEN}Step 5: Updating docker-compose.yml...${NC}"

# Backup original
cp docker-compose.yml docker-compose.yml.backup

# Update docker-compose.yml to use SSL config
cat > docker-compose-ssl-temp.yml << 'EOF'
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ""
    container_name: rescuebytes-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./frontend/nginx-ssl.conf:/etc/nginx/conf.d/app.conf
    depends_on:
      - backend
    networks:
      - rescuebytes-net
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: rescuebytes-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env
    environment:
      - NODE_ENV=production
      - MONGO_DB_URI=mongodb://mongo:27017/rescuebytes
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - rescuebytes-net
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  mongo:
    image: mongo:7
    container_name: rescuebytes-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=rescuebytes
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s
    networks:
      - rescuebytes-net

  mongo-express:
    image: mongo-express:latest
    container_name: rescuebytes-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongo
      - ME_CONFIG_MONGODB_PORT=27017
      - ME_CONFIG_MONGODB_URL=mongodb://mongo:27017/
      - ME_CONFIG_BASICAUTH_USERNAME=admin
      - ME_CONFIG_BASICAUTH_PASSWORD=admin123
    depends_on:
      - mongo
    networks:
      - rescuebytes-net

volumes:
  mongo-data:
    driver: local

networks:
  rescuebytes-net:
    driver: bridge
EOF

mv docker-compose-ssl-temp.yml docker-compose.yml
echo -e "${GREEN}✓ docker-compose.yml updated (backup saved as docker-compose.yml.backup)${NC}"

echo ""
echo -e "${GREEN}Step 6: Updating backend CORS...${NC}"
sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://$DOMAIN|g" backend/.env
echo -e "${GREEN}✓ CORS updated${NC}"

echo ""
echo -e "${GREEN}Step 7: Restarting containers...${NC}"
docker-compose up -d --build
echo -e "${GREEN}✓ Containers restarted${NC}"

echo ""
echo -e "${GREEN}Step 8: Setting up auto-renewal...${NC}"

# Add cron job for auto-renewal
(sudo crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet --post-hook 'cd $(pwd) && docker-compose restart frontend'") | sudo crontab -

echo -e "${GREEN}✓ Auto-renewal configured${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 HTTPS Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your site is now accessible at:"
echo "  🔒 https://$DOMAIN"
if [ "$INCLUDE_WWW" = "y" ] || [ "$INCLUDE_WWW" = "Y" ]; then
    echo "  🔒 https://www.$DOMAIN"
fi
echo ""
echo "Certificate details:"
echo "  Location: /etc/letsencrypt/live/$DOMAIN/"
echo "  Expires: 90 days (auto-renews)"
echo ""
echo "Next steps:"
echo "  1. Test your site: https://$DOMAIN"
echo "  2. Update mobile app API URL to: https://$DOMAIN:3000"
echo "  3. Test SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "Backup created: docker-compose.yml.backup"
echo ""

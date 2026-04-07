# 🔒 Complete HTTPS Setup Guide for RescueBytes

## Overview

This guide will help you secure your RescueBytes deployment with HTTPS using Let's Encrypt free SSL certificates.

**What you'll get:**
- ✅ Free SSL certificate (valid for 90 days, auto-renewable)
- ✅ HTTPS access: `https://yourdomain.com`
- ✅ Automatic HTTP to HTTPS redirect
- ✅ A+ SSL rating
- ✅ Secure mobile app connections

---

## Prerequisites

### Required:
- ✅ A domain name (e.g., `rescuebytes.com`)
- ✅ Domain pointing to your EC2 IP
- ✅ AWS EC2 instance with RescueBytes deployed
- ✅ Port 443 open in Security Group

### Optional but Recommended:
- Elastic IP (prevents IP changes on restart)

---

## 📋 Complete Setup Process

### Step 1: Get a Domain Name

**Option A: Free Domain (for testing)**
- Freenom: https://www.freenom.com
- Get a free `.tk`, `.ml`, `.ga`, `.cf`, or `.gq` domain

**Option B: Paid Domain (recommended for production)**
- Namecheap: https://www.namecheap.com (~$10/year)
- GoDaddy: https://www.godaddy.com
- AWS Route 53: https://aws.amazon.com/route53/

---

### Step 2: Allocate Elastic IP (Recommended)

This prevents your IP from changing when you restart EC2.

1. **AWS Console** → **EC2** → **Elastic IPs**
2. Click **Allocate Elastic IP address**
3. Click **Allocate**
4. Select the new IP → **Actions** → **Associate Elastic IP address**
5. Select your EC2 instance
6. Click **Associate**

**Note your Elastic IP** (e.g., `51.20.42.250`)

---

### Step 3: Point Domain to EC2

#### If using Namecheap/GoDaddy:

1. Go to your domain registrar
2. Find **DNS Management** or **DNS Settings**
3. Add/Edit **A Record**:
   - **Type**: A
   - **Host**: @ (or leave blank)
   - **Value**: Your EC2 Elastic IP (e.g., `51.20.42.250`)
   - **TTL**: 300 (5 minutes)
4. Add **A Record** for www:
   - **Type**: A
   - **Host**: www
   - **Value**: Your EC2 Elastic IP
   - **TTL**: 300
5. **Save changes**

#### If using AWS Route 53:

1. **AWS Console** → **Route 53** → **Hosted zones**
2. Click your domain
3. Click **Create record**
4. Leave **Record name** blank (for root domain)
5. **Record type**: A
6. **Value**: Your EC2 Elastic IP
7. Click **Create records**
8. Repeat for `www` subdomain

**Wait 5-10 minutes** for DNS propagation.

**Verify DNS:**
```bash
# On your local machine
nslookup yourdomain.com
# Should return your EC2 IP
```

---

### Step 4: Open Port 443 in Security Group

1. **AWS Console** → **EC2** → **Security Groups**
2. Select your instance's security group
3. Click **Edit inbound rules**
4. Click **Add rule**:
   - **Type**: HTTPS
   - **Protocol**: TCP
   - **Port**: 443
   - **Source**: 0.0.0.0/0
5. Click **Save rules**

Your security group should now have:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3000 (Backend API)
- Port 8081 (Mongo Express - optional)

---

### Step 5: Install Certbot on EC2

SSH into your EC2 instance:

```bash
ssh -i "your-key.pem" ubuntu@yourdomain.com
```

Install Certbot:

```bash
# Update system
sudo apt update

# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# Verify installation
certbot --version
```

---

### Step 6: Stop Docker Nginx (Temporarily)

Certbot needs port 80 to verify domain ownership:

```bash
cd ~/RescueBytes/RescueBytesWeb
docker-compose stop frontend
```

---

### Step 7: Obtain SSL Certificate

Replace `yourdomain.com` with your actual domain:

```bash
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com
```

**Expected output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Note the certificate paths!**

---

### Step 8: Update Nginx Configuration

Create new nginx config with SSL:

```bash
cd ~/RescueBytes/RescueBytesWeb/frontend
nano nginx-ssl.conf
```

Paste this configuration (replace `yourdomain.com`):

```nginx
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    root /usr/share/nginx/html;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
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
    location ~ ^/(auth|news|chat|sos|signup|registercom|volunteerSignup|addAlert|addInventory|manageInv|emergencyReport|invReqRc|addUserReq|approveUserReq|rejectUserReq|deleteAlert|addComRep|approveComReq|comReportsRejected|addVolunteerMessage|deleteSOS|getComRepAdm|getComRepUser|getInvReqRc|getUserReq|getUserReqbyId|getAlerts|getLatestAlerts|getInv|getRC|getUsers|getVolunteers|getVolMessagebyId|getStats|getRCName|addRC|hash|health)(/|$) {
        proxy_pass         http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Cookie            $http_cookie;
        proxy_read_timeout 60s;
    }

    # React SPA - serve static assets or fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

Save: `Ctrl+X`, `Y`, `Enter`

---

### Step 9: Update Docker Compose for SSL

Edit docker-compose.yml:

```bash
cd ~/RescueBytes/RescueBytesWeb
nano docker-compose.yml
```

Update the frontend service:

```yaml
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
      - "443:443"    # Add HTTPS port
    volumes:
      # Mount SSL certificates
      - /etc/letsencrypt:/etc/letsencrypt:ro
      # Use SSL nginx config
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
```

Save: `Ctrl+X`, `Y`, `Enter`

---

### Step 10: Update Backend CORS

Edit backend .env:

```bash
nano backend/.env
```

Update CORS_ORIGIN:

```env
CORS_ORIGIN=https://yourdomain.com
```

Save: `Ctrl+X`, `Y`, `Enter`

---

### Step 11: Restart Docker Compose

```bash
cd ~/RescueBytes/RescueBytesWeb
docker-compose up -d --build
```

Wait 1-2 minutes for containers to start.

---

### Step 12: Verify HTTPS

**Test in browser:**
```
https://yourdomain.com
```

Should show:
- 🔒 Padlock icon in address bar
- Your RescueBytes dashboard
- No certificate warnings

**Test HTTP redirect:**
```
http://yourdomain.com
```

Should automatically redirect to `https://yourdomain.com`

**Test SSL certificate:**
```bash
curl -I https://yourdomain.com
```

Should return `HTTP/2 200` or `HTTP/1.1 200`

**Check SSL rating:**
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

Should get **A** or **A+** rating!

---

### Step 13: Update Mobile App

Update your mobile app to use HTTPS:

**File**: `RescueBytezApp/RescueBytez/Auth/api.js`

```javascript
export const API_URL = 'https://yourdomain.com:3000';
```

**Or use the domain without port** (if you setup backend proxy):

```javascript
export const API_URL = 'https://yourdomain.com';
```

Rebuild mobile app:
```bash
cd RescueBytezApp/RescueBytez
npx expo start
```

---

### Step 14: Setup Auto-Renewal

Let's Encrypt certificates expire after 90 days. Setup automatic renewal:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run
```

If successful, setup cron job:

```bash
# Edit crontab
sudo crontab -e
```

Add this line (runs twice daily):

```cron
0 0,12 * * * certbot renew --quiet --post-hook "cd /home/ubuntu/RescueBytes/RescueBytesWeb && docker-compose restart frontend"
```

Save and exit.

**Verify cron job:**
```bash
sudo crontab -l
```

---

## 🎯 Alternative: Backend API on HTTPS

If you want backend API also on HTTPS (recommended):

### Option A: Use Nginx Proxy for Backend

Update `nginx-ssl.conf` to proxy backend on same domain:

```nginx
# Add this location block
location /api/ {
    rewrite ^/api/(.*) /$1 break;
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then mobile app uses:
```javascript
export const API_URL = 'https://yourdomain.com/api';
```

### Option B: Separate Subdomain for API

1. **Create DNS A record** for `api.yourdomain.com` → EC2 IP
2. **Get SSL certificate** for API subdomain:
   ```bash
   sudo certbot certonly --standalone -d api.yourdomain.com
   ```
3. **Create separate nginx config** for API
4. Mobile app uses:
   ```javascript
   export const API_URL = 'https://api.yourdomain.com';
   ```

---

## 🐛 Troubleshooting

### Certificate Not Found Error

```bash
# Check if certificates exist
sudo ls -la /etc/letsencrypt/live/yourdomain.com/

# If not, re-run certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### Port 443 Connection Refused

```bash
# Check if frontend container is running
docker-compose ps

# Check nginx logs
docker-compose logs frontend

# Verify port 443 is open
sudo netstat -tlnp | grep :443
```

### Certificate Expired

```bash
# Renew certificate
sudo certbot renew

# Restart frontend
docker-compose restart frontend
```

### Mixed Content Warnings

Update all HTTP URLs to HTTPS in your frontend code.

### DNS Not Resolving

```bash
# Check DNS propagation
nslookup yourdomain.com

# Wait 5-10 minutes and try again
```

---

## 📊 Verification Checklist

- [ ] Domain points to EC2 IP
- [ ] Port 443 open in Security Group
- [ ] SSL certificate obtained successfully
- [ ] nginx-ssl.conf created with correct domain
- [ ] docker-compose.yml updated with SSL volumes
- [ ] Backend CORS_ORIGIN updated to HTTPS
- [ ] Docker containers restarted
- [ ] HTTPS site loads in browser
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid (check padlock icon)
- [ ] Mobile app updated to use HTTPS
- [ ] Auto-renewal cron job setup
- [ ] SSL Labs test shows A/A+ rating

---

## 🔒 Security Best Practices

1. **Force HTTPS** - All HTTP traffic redirects to HTTPS ✅
2. **HSTS Header** - Prevents downgrade attacks ✅
3. **Strong Ciphers** - Only TLS 1.2 and 1.3 ✅
4. **Security Headers** - XSS, clickjacking protection ✅
5. **Regular Updates** - Keep certbot and nginx updated
6. **Monitor Expiry** - Certificates auto-renew every 90 days
7. **Backup Certificates** - Keep backup of `/etc/letsencrypt/`

---

## 💰 Cost

- **SSL Certificate**: FREE (Let's Encrypt)
- **Domain**: $10-15/year (or free with Freenom)
- **Elastic IP**: FREE (while associated with running instance)
- **Total**: ~$10-15/year

---

## 🎊 Success!

Your RescueBytes platform is now secured with HTTPS!

**Access URLs:**
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com:3000` (or via proxy)
- Mongo Express: `http://yourdomain.com:8081` (consider adding SSL)

**Mobile App:**
```javascript
export const API_URL = 'https://yourdomain.com:3000';
```

---

## 📚 Additional Resources

- Let's Encrypt: https://letsencrypt.org/
- Certbot Documentation: https://certbot.eff.org/
- SSL Labs Test: https://www.ssllabs.com/ssltest/
- Mozilla SSL Config: https://ssl-config.mozilla.org/

---

**Need help?** Check logs: `docker-compose logs frontend`

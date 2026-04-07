# 🔒 HTTPS Quick Start (5 Steps)

## Prerequisites
- ✅ Domain name (e.g., `rescuebytes.com`)
- ✅ Domain pointing to your EC2 IP
- ✅ Port 443 open in AWS Security Group

---

## 🚀 Automated Setup (Easiest!)

### Step 1: SSH to EC2
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
cd ~/RescueBytes/RescueBytesWeb
```

### Step 2: Run SSL Setup Script
```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

Follow the prompts:
- Enter your domain name
- Enter your email
- Confirm setup

**Done!** Your site is now on HTTPS! 🎉

---

## 📋 Manual Setup (If Script Fails)

### Step 1: Install Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Stop Frontend
```bash
docker-compose stop frontend
```

### Step 3: Get SSL Certificate
```bash
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

### Step 4: Create SSL Nginx Config
```bash
nano frontend/nginx-ssl.conf
```

Paste the config from [HTTPS_SETUP_GUIDE.md](./HTTPS_SETUP_GUIDE.md#step-8-update-nginx-configuration)

### Step 5: Update Docker Compose
```bash
nano docker-compose.yml
```

Add to frontend service:
```yaml
ports:
  - "80:80"
  - "443:443"
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
  - ./frontend/nginx-ssl.conf:/etc/nginx/conf.d/app.conf
```

### Step 6: Update Backend CORS
```bash
nano backend/.env
```

Change:
```env
CORS_ORIGIN=https://yourdomain.com
```

### Step 7: Restart
```bash
docker-compose up -d --build
```

---

## ✅ Verify

**Test HTTPS:**
```bash
curl -I https://yourdomain.com
```

**Test in browser:**
```
https://yourdomain.com
```

Should show 🔒 padlock icon!

---

## 📱 Update Mobile App

```javascript
// File: RescueBytezApp/RescueBytez/Auth/api.js
export const API_URL = 'https://yourdomain.com:3000';
```

---

## 🔄 Auto-Renewal

Setup cron job:
```bash
sudo crontab -e
```

Add:
```cron
0 0,12 * * * certbot renew --quiet --post-hook "cd /home/ubuntu/RescueBytes/RescueBytesWeb && docker-compose restart frontend"
```

---

## 🐛 Troubleshooting

**Certificate not found:**
```bash
sudo ls -la /etc/letsencrypt/live/yourdomain.com/
```

**Port 443 not accessible:**
- Check AWS Security Group has port 443 open
- Check: `sudo netstat -tlnp | grep :443`

**DNS not resolving:**
```bash
nslookup yourdomain.com
```

**View logs:**
```bash
docker-compose logs frontend
```

---

## 📚 Full Documentation

See [HTTPS_SETUP_GUIDE.md](./HTTPS_SETUP_GUIDE.md) for complete guide.

---

**Total time: 10-15 minutes** ⏱️

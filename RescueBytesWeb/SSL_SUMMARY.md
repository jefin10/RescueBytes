# 🔒 HTTPS/SSL Setup Summary

## What You Need

1. **Domain Name** - Get from:
   - Namecheap (~$10/year): https://www.namecheap.com
   - Freenom (free): https://www.freenom.com
   - AWS Route 53: https://aws.amazon.com/route53/

2. **Point Domain to EC2**
   - Add A record: `yourdomain.com` → `Your EC2 IP`
   - Add A record: `www.yourdomain.com` → `Your EC2 IP`
   - Wait 5-10 minutes for DNS propagation

3. **Open Port 443**
   - AWS Console → EC2 → Security Groups
   - Add inbound rule: HTTPS (443) from 0.0.0.0/0

---

## 🚀 Quick Setup (Automated)

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Navigate to project
cd ~/RescueBytes/RescueBytesWeb

# Run SSL setup script
chmod +x setup-ssl.sh
./setup-ssl.sh
```

**Follow prompts and done!** ✅

---

## 📋 What the Script Does

1. ✅ Installs Certbot
2. ✅ Stops frontend container
3. ✅ Obtains SSL certificate from Let's Encrypt
4. ✅ Creates nginx SSL configuration
5. ✅ Updates docker-compose.yml
6. ✅ Updates backend CORS settings
7. ✅ Restarts containers with HTTPS
8. ✅ Sets up auto-renewal cron job

---

## 🎯 After Setup

### Your URLs:
- Frontend: `https://yourdomain.com` 🔒
- Backend: `https://yourdomain.com:3000` 🔒
- HTTP redirects to HTTPS automatically

### Update Mobile App:
```javascript
// File: RescueBytezApp/RescueBytez/Auth/api.js
export const API_URL = 'https://yourdomain.com:3000';
```

### Test SSL:
- Browser: `https://yourdomain.com` (should show padlock 🔒)
- SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

---

## 🔄 Certificate Renewal

**Automatic!** Certificates renew every 90 days via cron job.

**Manual renewal:**
```bash
sudo certbot renew
docker-compose restart frontend
```

---

## 📚 Documentation Files

- **[HTTPS_QUICK_START.md](./HTTPS_QUICK_START.md)** - 5-step quick guide
- **[HTTPS_SETUP_GUIDE.md](./HTTPS_SETUP_GUIDE.md)** - Complete detailed guide
- **[setup-ssl.sh](./setup-ssl.sh)** - Automated setup script

---

## 💰 Cost

- SSL Certificate: **FREE** (Let's Encrypt)
- Domain: **$10-15/year** (or free with Freenom)
- Total: **~$10-15/year**

---

## ✅ Benefits

- 🔒 Encrypted connections
- 🛡️ Secure data transmission
- 📱 Required for modern mobile apps
- 🔍 Better SEO ranking
- ✨ Professional appearance
- 🚀 HTTP/2 support (faster)

---

## 🐛 Common Issues

### "Certificate not found"
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

### "Port 443 connection refused"
- Check AWS Security Group
- Check: `docker-compose ps`

### "DNS not resolving"
```bash
nslookup yourdomain.com
# Wait 5-10 minutes if just updated
```

### "Mixed content warnings"
- Update all HTTP URLs to HTTPS in code

---

## 🎊 Success Checklist

- [ ] Domain purchased and configured
- [ ] DNS A records point to EC2 IP
- [ ] Port 443 open in Security Group
- [ ] SSL certificate obtained
- [ ] Docker containers restarted
- [ ] HTTPS site loads with padlock icon
- [ ] HTTP redirects to HTTPS
- [ ] Mobile app updated to HTTPS
- [ ] Auto-renewal configured
- [ ] SSL Labs test shows A/A+ rating

---

## 📞 Need Help?

**Check logs:**
```bash
docker-compose logs frontend
```

**Test certificate:**
```bash
sudo certbot certificates
```

**Verify nginx config:**
```bash
docker-compose exec frontend nginx -t
```

**Full documentation:**
- [HTTPS_SETUP_GUIDE.md](./HTTPS_SETUP_GUIDE.md)

---

**Ready to secure your site?** Run `./setup-ssl.sh` now! 🚀

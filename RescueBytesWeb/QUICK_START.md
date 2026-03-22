# 🚀 RescueBytes - AWS Deployment Quick Start

## What You'll Deploy

✅ **Frontend** - React admin dashboard (Nginx on port 80)  
✅ **Backend** - Node.js/Express API (port 3000)  
✅ **Database** - MongoDB Atlas (cloud, free tier)  
✅ **Docker** - Containerized deployment with auto-restart

---

## Prerequisites Checklist

- [ ] AWS EC2 instance (Ubuntu 22.04, t2.medium)
- [ ] MongoDB Atlas account (free at mongodb.com/cloud/atlas)
- [ ] Gemini API key (free at makersuite.google.com/app/apikey)
- [ ] SSH access to EC2 instance

---

## 🎯 Deployment Steps

### Step 1: Setup MongoDB Atlas (5 min)

```bash
1. Go to: https://mongodb.com/cloud/atlas/register
2. Create M0 FREE cluster (AWS, closest region)
3. Database Access → Add User (save username/password!)
4. Network Access → Allow 0.0.0.0/0
5. Connect → Drivers → Copy connection string
```

Your connection string will look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rescuebytes
```

### Step 2: Connect to EC2

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

### Step 3: Install Docker (one-time)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose git -y

# Logout and login again
exit
# Reconnect
```

### Step 4: Clone & Configure

```bash
# Clone repository
git clone https://github.com/jenjose72/RescueBytes.git
cd RescueBytes/RescueBytesWeb

# Setup environment
cd backend
cp .env.example .env
nano .env
```

**Edit .env** (paste your values):
```env
MONGO_DB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rescuebytes
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
CORS_ORIGIN=http://YOUR_EC2_IP
PORT=3000
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Deploy! 🚀

```bash
cd ~/RescueBytes/RescueBytesWeb

# Option A: Use deploy script (recommended)
chmod +x deploy.sh
./deploy.sh

# Option B: Manual deployment
docker-compose up -d --build
```

Wait 2-3 minutes for build to complete...

### Step 6: Verify

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test health
curl http://localhost:3000/health
```

### Step 7: Access Your App

Open browser:
- **Frontend**: `http://YOUR_EC2_IP`
- **Backend**: `http://YOUR_EC2_IP:3000`

---

## 🎉 Initial Setup

### Create Rescue Center

```bash
curl -X POST http://YOUR_EC2_IP:3000/addRC \
  -H "Content-Type: application/json" \
  -d '{"location":"Kottayam","contactNumber":"+91-1234567890"}'
```

### Register Admin

Go to: `http://YOUR_EC2_IP/register`

Fill in:
- Name: Your Name
- Email: admin@rescuebytes.com
- Password: (secure password)
- Rescue Center: Kottayam
- Role: Admin

### Login

Go to: `http://YOUR_EC2_IP/login`

---

## 📱 Update Mobile App

Edit your mobile app API configuration:

```typescript
// File: RescueBytezApp/RescueBytez/Auth/apiService.ts
const API_URL = 'http://YOUR_EC2_IP:3000';
```

Rebuild and test your mobile app!

---

## 🛠️ Management Commands

```bash
# Navigate to project
cd ~/RescueBytes/RescueBytesWeb

# Make management script executable
chmod +x manage.sh

# Use management commands
./manage.sh start      # Start services
./manage.sh stop       # Stop services
./manage.sh restart    # Restart services
./manage.sh logs       # View all logs
./manage.sh logs-be    # Backend logs only
./manage.sh status     # Container status
./manage.sh health     # Health check
./manage.sh update     # Pull latest code & rebuild
```

---

## 🔍 Troubleshooting

### Can't access frontend?

```bash
# Check if containers are running
docker-compose ps

# Check frontend logs
docker-compose logs frontend

# Verify port 80 is open in AWS Security Group
```

### Backend not responding?

```bash
# Check backend logs
docker-compose logs backend

# Test health endpoint
curl http://localhost:3000/health

# Restart backend
docker-compose restart backend
```

### MongoDB connection failed?

```bash
# Check .env file
cat backend/.env | grep MONGO_DB_URI

# Verify Atlas Network Access allows 0.0.0.0/0
# Check Atlas Database Access has correct user/password
```

### CORS errors in browser?

```bash
# Update CORS_ORIGIN in .env
nano backend/.env
# Change CORS_ORIGIN to your EC2 IP

# Restart backend
docker-compose restart backend
```

---

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Check Resources

```bash
# Container stats
docker stats

# Disk usage
df -h

# Memory usage
free -h
```

---

## 🔄 Updates

### Update Application

```bash
cd ~/RescueBytes/RescueBytesWeb

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Or use management script
./manage.sh update
```

---

## 🔒 Security Checklist

- [ ] Change default JWT_SECRET in .env
- [ ] Use strong MongoDB password
- [ ] Restrict SSH to your IP only (AWS Security Group)
- [ ] Setup SSL/HTTPS with Let's Encrypt (optional)
- [ ] Enable AWS CloudWatch monitoring (optional)
- [ ] Setup automated backups (optional)

---

## 💰 Cost Estimate

| Service | Cost |
|---------|------|
| EC2 t2.medium | ~$30/month |
| MongoDB Atlas M0 | Free |
| Data Transfer | ~$1-5/month |
| **Total** | **~$31-35/month** |

**Save money:**
- Use t2.small ($15/month) for testing
- Use Reserved Instance (save 30-40%)
- Stop instance when not in use

---

## 📚 Documentation

- **Full Guide**: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
- **Quick Reference**: [DEPLOYMENT_README.md](./DEPLOYMENT_README.md)
- **Project README**: [../README.md](../README.md)

---

## 🆘 Need Help?

**Common Issues:**
1. Port 80/3000 not accessible → Check AWS Security Group
2. MongoDB connection failed → Verify Atlas Network Access
3. Containers not starting → Check logs: `docker-compose logs`
4. Out of memory → Upgrade to t2.medium or larger

**Get Support:**
- Check logs: `docker-compose logs -f`
- View container status: `docker-compose ps`
- Test health: `curl http://localhost:3000/health`

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Frontend loads at `http://YOUR_EC2_IP`
- [ ] Backend responds at `http://YOUR_EC2_IP:3000/health`
- [ ] Can register new user
- [ ] Can login to admin dashboard
- [ ] Can create SOS alert from mobile app
- [ ] Dashboard shows statistics

---

## 🎊 You're Done!

Your RescueBytes platform is now live on AWS!

**Next Steps:**
1. Test all features (SOS, inventory, volunteers, news)
2. Update mobile app with new API URL
3. Add more rescue centers
4. Invite team members
5. Setup domain name (optional)
6. Enable HTTPS (optional)

**Share your deployment:**
- Frontend: `http://YOUR_EC2_IP`
- API Docs: `http://YOUR_EC2_IP:3000`

---

**Questions?** Check the full [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for detailed documentation.

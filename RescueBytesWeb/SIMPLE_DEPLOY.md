# 🚀 RescueBytes - Super Simple AWS Deployment

## Everything in Docker - No External Database Needed!

Your deployment includes:
- ✅ Frontend (React + Nginx)
- ✅ Backend (Node.js + Express)
- ✅ MongoDB (in Docker container)

All running together, no external services required!

---

## 📋 What You Need

1. **AWS EC2 Instance**
   - Ubuntu 22.04
   - t2.medium (2 vCPU, 4GB RAM)
   - Ports open: 22, 80, 3000

2. **Gemini API Key** (free)
   - Get from: https://makersuite.google.com/app/apikey

That's it! No MongoDB Atlas, no external database!

---

## 🎯 Deploy in 5 Steps

### Step 1: Connect to EC2

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

### Step 2: Install Docker (one-time)

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

### Step 3: Clone Repository

```bash
git clone https://github.com/jenjose72/RescueBytes.git
cd RescueBytes/RescueBytesWeb
```

### Step 4: Configure

```bash
cd backend
cp .env.example .env
nano .env
```

**Only change these 2 lines:**

```env
GEMINI_API_KEY=paste_your_gemini_api_key_here
CORS_ORIGIN=http://YOUR_EC2_IP
```

**Leave MongoDB as is** - it will use the Docker container automatically!

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Deploy! 🚀

```bash
cd ~/RescueBytes/RescueBytesWeb
chmod +x deploy.sh
./deploy.sh
```

Wait 3-5 minutes for build...

---

## ✅ Done!

Your app is now running at:
- **Frontend**: `http://YOUR_EC2_IP`
- **Backend**: `http://YOUR_EC2_IP:3000`

---

## 🎉 Initial Setup

### 1. Create Rescue Center

```bash
curl -X POST http://YOUR_EC2_IP:3000/addRC \
  -H "Content-Type: application/json" \
  -d '{"location":"Kottayam","contactNumber":"+91-1234567890"}'
```

### 2. Register Admin

Go to: `http://YOUR_EC2_IP/register`

### 3. Login

Go to: `http://YOUR_EC2_IP/login`

---

## 🛠️ Useful Commands

```bash
cd ~/RescueBytes/RescueBytesWeb

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Start
docker-compose up -d
```

---

## 📊 What's Running?

```bash
docker-compose ps
```

You should see:
- `rescuebytes-frontend` (port 80)
- `rescuebytes-backend` (port 3000)
- `rescuebytes-mongo` (port 27017)

---

## 💾 Data Persistence

Your MongoDB data is stored in a Docker volume named `mongo-data`.

**Backup database:**
```bash
cd ~/RescueBytes/RescueBytesWeb
docker-compose exec mongo mongodump --archive --gzip > backup.gz
```

**Restore database:**
```bash
docker-compose exec -T mongo mongorestore --archive --gzip < backup.gz
```

---

## 🔄 Update Application

```bash
cd ~/RescueBytes/RescueBytesWeb
git pull origin main
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Can't access the app?

```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f

# Restart everything
docker-compose restart
```

### MongoDB connection failed?

```bash
# Check if mongo container is healthy
docker-compose ps

# View mongo logs
docker-compose logs mongo

# Restart mongo
docker-compose restart mongo
```

### Out of disk space?

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
```

---

## 💰 Cost

- **EC2 t2.medium**: ~$30/month
- **MongoDB**: $0 (included in Docker)
- **Total**: ~$30/month

---

## 🎊 Advantages of This Setup

✅ **No external dependencies** - everything in Docker  
✅ **Simple deployment** - one command  
✅ **Easy backup** - just backup Docker volume  
✅ **Fast** - no network latency to external DB  
✅ **Free database** - no MongoDB Atlas costs  
✅ **Portable** - move to any server easily  

---

## 📱 Update Mobile App

Edit your mobile app API URL:

```typescript
const API_URL = 'http://YOUR_EC2_IP:3000';
```

---

## 🔒 Security Tips

1. **Change JWT_SECRET** in .env to a random string
2. **Restrict SSH** to your IP only (AWS Security Group)
3. **Regular backups** of MongoDB data
4. **Keep Docker updated**: `sudo apt update && sudo apt upgrade`

---

## 📚 Need More Help?

- **Full Guide**: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
- **Management Commands**: [manage.sh](./manage.sh)
- **Quick Reference**: [QUICK_START.md](./QUICK_START.md)

---

**That's it!** Your complete disaster management platform is running with just Docker. No complicated cloud database setup needed! 🎉

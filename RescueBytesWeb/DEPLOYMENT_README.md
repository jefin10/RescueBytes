# RescueBytes - Quick Deployment Guide

## 🚀 Deploy to AWS EC2 in 10 Minutes

### Prerequisites
- AWS EC2 instance (Ubuntu 22.04, t2.medium recommended)
- MongoDB Atlas account (free tier)
- Gemini API key

---

## Quick Start

### 1. Setup MongoDB Atlas (5 minutes)

1. Go to [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register)
2. Create free M0 cluster
3. Create database user (username + password)
4. Allow access from anywhere (0.0.0.0/0)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rescuebytes
   ```

### 2. Launch EC2 Instance (3 minutes)

1. **AMI**: Ubuntu Server 22.04 LTS
2. **Type**: t2.medium (2 vCPU, 4GB RAM)
3. **Security Group**: Allow ports 22, 80, 443, 3000
4. **Storage**: 20 GB
5. Note your **Public IP**: e.g., `54.123.45.67`

### 3. Connect to EC2

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

### 4. Install Docker (2 minutes)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Log out and back in
exit
# Reconnect via SSH
```

### 5. Clone and Configure (2 minutes)

```bash
# Clone repository
git clone https://github.com/jenjose72/RescueBytes.git
cd RescueBytes/RescueBytesWeb

# Create .env file
cd backend
cp .env.example .env
nano .env
```

**Edit .env file** (Ctrl+X, Y, Enter to save):
```env
MONGO_DB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rescuebytes
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_random_32_char_secret
NODE_ENV=production
CORS_ORIGIN=http://YOUR_EC2_IP
PORT=3000
```

### 6. Deploy (5 minutes)

```bash
cd ~/RescueBytes/RescueBytesWeb

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

**Or manually:**
```bash
docker-compose up -d --build
```

### 7. Access Your Application

- **Frontend**: `http://YOUR_EC2_IP`
- **Backend**: `http://YOUR_EC2_IP:3000`
- **Health Check**: `http://YOUR_EC2_IP:3000/auth/check`

---

## Initial Setup

### Create Rescue Center
```bash
curl -X POST http://YOUR_EC2_IP:3000/addRC \
  -H "Content-Type: application/json" \
  -d '{"location":"Kottayam","contactNumber":"+91-1234567890"}'
```

### Register Admin User
Go to: `http://YOUR_EC2_IP/register`

---

## Update Mobile App

Update API URL in your mobile app:
```typescript
const API_URL = 'http://YOUR_EC2_IP:3000';
```

---

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
git pull && docker-compose up -d --build
```

---

## Troubleshooting

**Can't connect to MongoDB?**
- Check Atlas Network Access (allow 0.0.0.0/0)
- Verify connection string in .env

**Frontend not loading?**
- Check: `docker-compose logs frontend`
- Verify backend is running: `curl http://localhost:3000/auth/check`

**CORS errors?**
- Update `CORS_ORIGIN` in .env to match your access URL
- Restart: `docker-compose restart backend`

---

## Full Documentation

See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for complete documentation.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           AWS EC2 Instance                  │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │   Frontend   │      │    Backend      │ │
│  │  (Nginx:80)  │─────▶│  (Node:3000)    │ │
│  └──────────────┘      └─────────────────┘ │
│                              │              │
└──────────────────────────────┼──────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  MongoDB Atlas   │
                    │   (Cloud DB)     │
                    └──────────────────┘
```

---

## Cost

- **EC2 t2.medium**: ~$30/month
- **MongoDB Atlas M0**: Free
- **Total**: ~$30/month

---

**Need help?** Check the full [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

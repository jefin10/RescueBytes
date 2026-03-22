# RescueBytes - Docker Deployment

## 🎯 Complete Containerized Solution

This deployment includes **everything you need** in Docker containers:

```
┌─────────────────────────────────────┐
│     AWS EC2 Instance                │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Frontend │  │ Backend  │       │
│  │ (Nginx)  │──│ (Node.js)│       │
│  │  :80     │  │  :3000   │       │
│  └──────────┘  └────┬─────┘       │
│                     │              │
│                ┌────▼─────┐        │
│                │ MongoDB  │        │
│                │  :27017  │        │
│                └──────────┘        │
│                                     │
└─────────────────────────────────────┘
```

**No external services needed!** Everything runs together in Docker.

---

## 📚 Documentation Files

Choose the guide that fits your needs:

### 🚀 Quick Deployment
- **[SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md)** - Fastest way to deploy (5 steps)
- **[QUICK_START.md](./QUICK_START.md)** - 10-minute deployment guide

### 📖 Detailed Guides
- **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)** - Complete AWS deployment documentation
- **[DEPLOYMENT_README.md](./DEPLOYMENT_README.md)** - Quick reference guide
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - What's configured and how it works

### 🛠️ Scripts
- **[deploy.sh](./deploy.sh)** - Automated deployment script
- **[manage.sh](./manage.sh)** - Management commands (start, stop, logs, etc.)

---

## ⚡ Super Quick Start

```bash
# 1. Clone
git clone https://github.com/jenjose72/RescueBytes.git
cd RescueBytes/RescueBytesWeb

# 2. Configure (only need Gemini API key!)
cd backend
cp .env.example .env
nano .env  # Add GEMINI_API_KEY and CORS_ORIGIN

# 3. Deploy
cd ..
chmod +x deploy.sh
./deploy.sh
```

**Done!** Access at `http://YOUR_EC2_IP`

---

## 🎯 What You Get

### Included Services
- ✅ **Frontend** - React admin dashboard on port 80
- ✅ **Backend** - Node.js REST API on port 3000
- ✅ **MongoDB** - Database on port 27017
- ✅ **Auto-restart** - All services restart on failure
- ✅ **Health checks** - Automatic health monitoring
- ✅ **Persistent data** - MongoDB data saved in Docker volume

### Features
- ✅ **One-command deployment** - `./deploy.sh`
- ✅ **Easy management** - `./manage.sh [command]`
- ✅ **Automatic networking** - Containers communicate internally
- ✅ **Data persistence** - Survives container restarts
- ✅ **Easy backup** - Simple Docker volume backup
- ✅ **Portable** - Move to any server easily

---

## 📋 Prerequisites

### Required
- AWS EC2 instance (Ubuntu 22.04, t2.medium)
- Gemini API key (free from https://makersuite.google.com/app/apikey)
- SSH access to EC2

### Security Group Ports
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS - optional)
- 3000 (Backend API)

---

## 🛠️ Management

### Using manage.sh Script

```bash
cd ~/RescueBytes/RescueBytesWeb

# Start services
./manage.sh start

# Stop services
./manage.sh stop

# Restart services
./manage.sh restart

# View logs
./manage.sh logs

# View backend logs only
./manage.sh logs-be

# Check health
./manage.sh health

# View status
./manage.sh status

# Update application
./manage.sh update

# Backup database
./manage.sh backup-db
```

### Using Docker Compose Directly

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Check status
docker-compose ps
```

---

## 💾 Data Management

### Backup Database

```bash
# Create backup
docker-compose exec mongo mongodump --archive --gzip > backup_$(date +%Y%m%d).gz

# Or use management script
./manage.sh backup-db
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T mongo mongorestore --archive --gzip < backup_20240322.gz
```

### View Database

```bash
# Connect to MongoDB shell
docker-compose exec mongo mongosh rescuebytes

# List collections
show collections

# Query data
db.users.find()
db.sos.find()
```

---

## 🔄 Updates

### Update Application Code

```bash
cd ~/RescueBytes/RescueBytesWeb

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Or use management script
./manage.sh update
```

### Update Docker Images

```bash
# Pull latest base images
docker-compose pull

# Rebuild with new images
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Check Container Status

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Check Health

```bash
# Frontend
curl http://localhost/

# Backend
curl http://localhost:3000/health

# MongoDB
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

### Common Issues

**Containers won't start:**
```bash
docker-compose logs
docker-compose down
docker-compose up -d
```

**Out of disk space:**
```bash
df -h
docker system prune -a
```

**MongoDB connection failed:**
```bash
docker-compose logs mongo
docker-compose restart mongo
```

**Port already in use:**
```bash
sudo lsof -i :80
sudo lsof -i :3000
# Kill the process or change ports in docker-compose.yml
```

---

## 🔒 Security

### Best Practices

1. **Change JWT_SECRET** in .env to a random string
   ```bash
   openssl rand -base64 32
   ```

2. **Restrict SSH access** to your IP only (AWS Security Group)

3. **Regular backups** of MongoDB data
   ```bash
   ./manage.sh backup-db
   ```

4. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **Monitor logs** for suspicious activity
   ```bash
   ./manage.sh logs
   ```

### Optional: Add MongoDB Authentication

Edit `docker-compose.yml`:

```yaml
mongo:
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=your_secure_password
```

Update `backend/.env`:

```env
MONGO_DB_URI=mongodb://admin:your_secure_password@mongo:27017/rescuebytes?authSource=admin
```

---

## 📊 Monitoring

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h

# Memory usage
free -h

# Docker disk usage
docker system df
```

### Health Checks

```bash
# Use management script
./manage.sh health

# Or manually
curl http://localhost/
curl http://localhost:3000/health
```

---

## 💰 Cost

| Component | Cost |
|-----------|------|
| EC2 t2.medium | ~$30/month |
| MongoDB | $0 (in Docker) |
| Storage (20GB) | ~$2/month |
| Data Transfer | ~$1-3/month |
| **Total** | **~$33-35/month** |

**Save money:**
- Use t2.small for testing (~$15/month)
- Use Reserved Instance (save 30-40%)
- Stop instance when not in use

---

## 🎊 Advantages

### vs MongoDB Atlas
- ✅ **No external dependencies** - everything in one place
- ✅ **Faster** - no network latency to cloud DB
- ✅ **Cheaper** - no database costs
- ✅ **Simpler** - no cloud account setup
- ✅ **More control** - full access to database

### vs Manual Installation
- ✅ **Consistent** - same environment everywhere
- ✅ **Portable** - move to any server
- ✅ **Isolated** - no conflicts with system packages
- ✅ **Easy rollback** - just restart containers
- ✅ **Easy cleanup** - `docker-compose down`

---

## 📱 Mobile App Configuration

Update your mobile app to use the deployed backend:

```typescript
// File: RescueBytezApp/RescueBytez/Auth/apiService.ts
const API_URL = 'http://YOUR_EC2_IP:3000';
```

---

## 🆘 Support

### Get Help

1. **Check logs**: `./manage.sh logs`
2. **Check health**: `./manage.sh health`
3. **Check status**: `./manage.sh status`
4. **Review documentation** in this folder
5. **Check AWS Security Group** settings

### Common Commands

```bash
# Navigate to project
cd ~/RescueBytes/RescueBytesWeb

# View all commands
./manage.sh

# Quick health check
./manage.sh health

# View recent logs
docker-compose logs --tail=50
```

---

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **MongoDB in Docker**: https://hub.docker.com/_/mongo
- **AWS EC2**: https://aws.amazon.com/ec2/

---

## ✅ Deployment Checklist

- [ ] EC2 instance launched and accessible
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned
- [ ] .env file configured with Gemini API key
- [ ] Deployment script executed
- [ ] All containers running (`docker-compose ps`)
- [ ] Frontend accessible at `http://YOUR_EC2_IP`
- [ ] Backend responding at `http://YOUR_EC2_IP:3000/health`
- [ ] Rescue center created
- [ ] Admin user registered
- [ ] Mobile app updated with new API URL

---

**Ready to deploy?** Start with [SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md) for the fastest path! 🚀

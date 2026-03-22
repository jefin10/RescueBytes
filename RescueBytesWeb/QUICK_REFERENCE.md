# 🚀 RescueBytes - Quick Reference Card

## 📍 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | `http://YOUR_EC2_IP` | Register first |
| **Backend API** | `http://YOUR_EC2_IP:3000` | - |
| **MongoDB Admin** | `http://YOUR_EC2_IP:8081` | admin / admin123 |
| **Health Check** | `http://YOUR_EC2_IP:3000/health` | - |

---

## 🛠️ Management Commands

```bash
cd ~/RescueBytes/RescueBytesWeb

# Service Control
./manage.sh start          # Start all services
./manage.sh stop           # Stop all services
./manage.sh restart        # Restart all services

# Monitoring
./manage.sh logs           # View all logs
./manage.sh logs-be        # Backend logs only
./manage.sh logs-fe        # Frontend logs only
./manage.sh status         # Container status
./manage.sh health         # Health check

# Database
./manage.sh mongo          # Open MongoDB shell
./manage.sh mongo-ui       # Show Mongo Express URL
./manage.sh backup-db      # Backup database

# Maintenance
./manage.sh update         # Update application
./manage.sh clean          # Remove all containers
```

---

## 🗄️ MongoDB Access

### Web UI (Easiest)
```
URL: http://YOUR_EC2_IP:8081
Username: admin
Password: admin123
```

### Shell Access
```bash
docker-compose exec mongo mongosh rescuebytes
```

### Common MongoDB Commands
```javascript
show collections              // List all collections
db.users.find().pretty()      // View all users
db.sos.find().pretty()        // View all SOS alerts
db.users.countDocuments()     // Count users
exit                          // Exit shell
```

---

## 👤 Create Admin User

### Method 1: Frontend (Easiest)
1. Go to `http://YOUR_EC2_IP/register`
2. Fill form, select "Admin" role
3. Submit

### Method 2: API
```bash
curl -X POST http://YOUR_EC2_IP:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@rescuebytes.com",
    "password": "Admin@123",
    "confirmPassword": "Admin@123",
    "rescueCenter": "Kottayam",
    "role": "admin"
  }'
```

### Method 3: Mongo Express
1. Go to `http://YOUR_EC2_IP:8081`
2. Click `rescuebytes` → `users`
3. Click "New Document"
4. Add user data

---

## 🏥 Create Rescue Center

```bash
curl -X POST http://YOUR_EC2_IP:3000/addRC \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Kottayam",
    "contactNumber": "+91-1234567890"
  }'
```

---

## 🔄 Update Application

```bash
cd ~/RescueBytes/RescueBytesWeb
git pull origin main
docker-compose up -d --build
```

Or use:
```bash
./manage.sh update
```

---

## 💾 Backup & Restore

### Backup
```bash
docker-compose exec mongo mongodump --archive --gzip > backup.gz
```

### Restore
```bash
docker-compose exec -T mongo mongorestore --archive --gzip < backup.gz
```

---

## 🐛 Troubleshooting

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f mongo
```

### Restart Service
```bash
docker-compose restart backend
docker-compose restart mongo
```

### Check Health
```bash
curl http://localhost:3000/health
curl http://localhost/
```

### Clean Restart
```bash
docker-compose down
docker-compose up -d
```

---

## 🔐 Security

### Change Mongo Express Password
Edit `docker-compose.yml`:
```yaml
ME_CONFIG_BASICAUTH_USERNAME=newuser
ME_CONFIG_BASICAUTH_PASSWORD=newpassword
```

Then restart:
```bash
docker-compose up -d
```

### Generate Secure JWT Secret
```bash
openssl rand -base64 32
```

---

## 📊 Monitoring

### Container Stats
```bash
docker stats
```

### Disk Usage
```bash
df -h
docker system df
```

### Memory Usage
```bash
free -h
```

---

## 🚨 AWS Security Group Ports

Required ports:
- **22** - SSH
- **80** - Frontend (HTTP)
- **443** - HTTPS (optional)
- **3000** - Backend API
- **8081** - Mongo Express (optional)

---

## 📱 Mobile App Configuration

Update API URL in your mobile app:
```typescript
const API_URL = 'http://YOUR_EC2_IP:3000';
```

---

## 🆘 Emergency Commands

### Stop Everything
```bash
docker-compose down
```

### Remove Everything (including data)
```bash
docker-compose down -v
```

### Clean Docker System
```bash
docker system prune -a
```

### Restart EC2 Instance
```bash
sudo reboot
```

---

## 📚 Documentation Files

- **[SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md)** - 5-step deployment
- **[MONGODB_ACCESS.md](./MONGODB_ACCESS.md)** - Database access guide
- **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)** - Complete guide
- **[README_DEPLOYMENT.md](./README_DEPLOYMENT.md)** - Overview

---

## 💡 Quick Tips

1. **Always backup before updates**: `./manage.sh backup-db`
2. **Check logs if something fails**: `./manage.sh logs`
3. **Use Mongo Express for easy DB management**: `http://YOUR_EC2_IP:8081`
4. **Monitor disk space**: `df -h`
5. **Keep system updated**: `sudo apt update && sudo apt upgrade`

---

## 📞 Support Checklist

If something goes wrong:
- [ ] Check container status: `docker-compose ps`
- [ ] View logs: `./manage.sh logs`
- [ ] Check health: `./manage.sh health`
- [ ] Verify AWS Security Group ports
- [ ] Check disk space: `df -h`
- [ ] Try restart: `./manage.sh restart`

---

**Print this page for quick reference!** 📄

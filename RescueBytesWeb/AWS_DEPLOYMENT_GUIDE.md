# AWS EC2 Deployment Guide for RescueBytes

Complete guide to deploy RescueBytes (Frontend + Backend + MongoDB) on AWS EC2 using Docker Compose.

## Prerequisites

- AWS Account
- MongoDB Atlas account (recommended) OR use local MongoDB in Docker
- Gemini API Key from Google AI Studio

---

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. **Name**: `rescuebytes-server`
3. **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance Type**: 
   - Minimum: `t2.medium` (2 vCPU, 4GB RAM) - Recommended
   - Budget: `t2.small` (1 vCPU, 2GB RAM) - May be slow
5. **Key Pair**: Create new or use existing (download .pem file)
6. **Network Settings**:
   - Create security group with these rules:
     - SSH (22) - Your IP only
     - HTTP (80) - Anywhere (0.0.0.0/0)
     - HTTPS (443) - Anywhere (0.0.0.0/0)
     - Custom TCP (3000) - Anywhere (for direct API access)
7. **Storage**: 20 GB gp3 (minimum)
8. Click **Launch Instance**

### 1.2 Note Your Instance Details

After launch, note:
- **Public IPv4 Address**: e.g., `54.123.45.67`
- **Public IPv4 DNS**: e.g., `ec2-54-123-45-67.compute-1.amazonaws.com`

---

## Step 2: Connect to EC2 Instance

### Windows (using Git Bash or WSL)
```bash
# Navigate to where your .pem file is
cd ~/Downloads

# Set permissions
chmod 400 your-key.pem

# Connect
ssh -i "your-key.pem" ubuntu@54.123.45.67
```

### Alternative: Use EC2 Instance Connect (browser-based)
1. Go to EC2 Console
2. Select your instance
3. Click "Connect" → "EC2 Instance Connect" → "Connect"

---

## Step 3: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no need for sudo)
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installations
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
exit
# Then reconnect via SSH
```

---

## Step 4: Setup MongoDB Atlas (Recommended)

### 4.1 Create MongoDB Atlas Cluster

1. Go to [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register)
2. Sign up (free tier)
3. Create new cluster:
   - Choose **M0 FREE** tier
   - Select **AWS** provider
   - Choose region closest to your EC2 (e.g., Mumbai, Singapore)
   - Click **Create**

### 4.2 Configure Access

1. **Database Access**:
   - Click "Database Access" → "Add New Database User"
   - Username: `rescuebytes`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

2. **Network Access**:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your EC2 public IP specifically
   - Click "Confirm"

### 4.3 Get Connection String

1. Click "Database" → "Connect" → "Connect your application"
2. Copy connection string:
   ```
   mongodb+srv://rescuebytes:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your actual password
4. Add database name: `rescuebytes`
   ```
   mongodb+srv://rescuebytes:yourpassword@cluster0.xxxxx.mongodb.net/rescuebytes?retryWrites=true&w=majority
   ```

---

## Step 5: Deploy Application on EC2

### 5.1 Clone Repository

```bash
# Install git if not present
sudo apt install git -y

# Clone your repository
git clone https://github.com/jenjose72/RescueBytes.git
cd RescueBytes/RescueBytesWeb
```

### 5.2 Configure Environment Variables

```bash
# Create .env file in backend directory
cd backend
cp .env.example .env
nano .env
```

**Edit the .env file** (press Ctrl+X, then Y, then Enter to save):

```env
# MongoDB Atlas Connection (use your connection string from Step 4.3)
MONGO_DB_URI=mongodb+srv://rescuebytes:yourpassword@cluster0.xxxxx.mongodb.net/rescuebytes?retryWrites=true&w=majority

# Google Gemini API Key (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_actual_gemini_api_key

# Generate a random secret (or use: openssl rand -base64 32)
JWT_SECRET=your_long_random_secret_string_here_min_32_characters

# Production environment
NODE_ENV=production

# CORS - Use your EC2 public IP or domain
CORS_ORIGIN=http://54.123.45.67

# Port
PORT=3000
```

**To generate a secure JWT_SECRET**:
```bash
openssl rand -base64 32
```

### 5.3 Update Docker Compose for Atlas

If using MongoDB Atlas, edit `docker-compose.yml`:

```bash
cd ..  # Back to RescueBytesWeb directory
nano docker-compose.yml
```

**Comment out the mongo service** since you're using Atlas:

```yaml
  # ── MongoDB Database ──────────────────────────────────────────────────────
  # Using MongoDB Atlas - local mongo service disabled
  # mongo:
  #   image: mongo:7
  #   container_name: rescuebytes-mongo
  #   ...
```

**Update backend service** to remove mongo dependency:

```yaml
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
    # Remove depends_on mongo if using Atlas
    networks:
      - rescuebytes-net
```

---

## Step 6: Build and Start Services

```bash
# Make sure you're in RescueBytesWeb directory
cd ~/RescueBytes/RescueBytesWeb

# Build and start all services
docker-compose up -d --build

# This will:
# 1. Build backend Docker image
# 2. Build frontend Docker image with Nginx
# 3. Start all containers in background
```

### 6.1 Monitor Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Press Ctrl+C to exit logs
```

---

## Step 7: Verify Deployment

### 7.1 Check Services

```bash
# Check if containers are running
docker ps

# You should see:
# - rescuebytes-frontend (port 80)
# - rescuebytes-backend (port 3000)
```

### 7.2 Test Access

**Frontend (Web Dashboard)**:
```
http://54.123.45.67
```

**Backend API**:
```
http://54.123.45.67:3000/auth/check
```

**Health Checks**:
```bash
# Test backend
curl http://localhost:3000/auth/check

# Test frontend
curl http://localhost/
```

---

## Step 8: Create Initial Admin User

### 8.1 Add Rescue Center

```bash
curl -X POST http://54.123.45.67:3000/addRC \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Kottayam",
    "contactNumber": "+91-1234567890"
  }'
```

### 8.2 Register Admin User

Open browser and go to:
```
http://54.123.45.67/register
```

Fill in:
- Name: Your name
- Email: admin@rescuebytes.com
- Password: (secure password)
- Rescue Center: Kottayam
- Role: Admin

---

## Step 9: Update Mobile App Configuration

Update the API URL in your mobile app to point to your EC2 instance:

**File**: `RescueBytezApp/RescueBytez/Auth/apiService.ts` (or similar)

```typescript
const API_URL = 'http://54.123.45.67:3000';
```

---

## Step 10: Domain Setup (Optional but Recommended)

### 10.1 Get a Domain

- Use Route 53, Namecheap, GoDaddy, etc.
- Example: `rescuebytes.com`

### 10.2 Point Domain to EC2

1. Get Elastic IP (to prevent IP changes):
   - EC2 Console → Elastic IPs → Allocate
   - Associate with your instance

2. Add DNS A Record:
   - Type: A
   - Name: @ (or www)
   - Value: Your Elastic IP
   - TTL: 300

### 10.3 Update CORS in .env

```bash
cd ~/RescueBytes/RescueBytesWeb/backend
nano .env
```

Update:
```env
CORS_ORIGIN=https://rescuebytes.com
```

Restart:
```bash
cd ~/RescueBytes/RescueBytesWeb
docker-compose restart backend
```

---

## Useful Commands

### Container Management

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Start services
docker-compose up -d

# Rebuild and restart
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check Docker disk usage
docker system df

# Clean up unused Docker resources
docker system prune -a
```

### Update Application

```bash
cd ~/RescueBytes
git pull origin main
cd RescueBytesWeb
docker-compose up -d --build
```

---

## Troubleshooting

### Issue: Containers won't start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend

# Restart services
docker-compose restart
```

### Issue: Can't connect to MongoDB Atlas

1. Check Network Access in Atlas (allow 0.0.0.0/0)
2. Verify connection string in `.env`
3. Check backend logs: `docker-compose logs backend`

### Issue: Frontend shows blank page

1. Check if backend is running: `curl http://localhost:3000/auth/check`
2. Check frontend logs: `docker-compose logs frontend`
3. Check browser console for errors

### Issue: CORS errors

Update `CORS_ORIGIN` in `.env` to match your access URL:
```env
CORS_ORIGIN=http://your-ec2-ip
```

Then restart:
```bash
docker-compose restart backend
```

### Issue: Out of memory

Upgrade to larger instance type (t2.medium or t2.large)

---

## Security Best Practices

### 1. Restrict SSH Access

```bash
# Edit security group to allow SSH only from your IP
# AWS Console → EC2 → Security Groups → Edit inbound rules
```

### 2. Enable Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

### 3. Setup SSL/HTTPS (Recommended)

Use Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (requires domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 4. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
cd ~/RescueBytes/RescueBytesWeb
docker-compose pull
docker-compose up -d
```

---

## Cost Estimation

**AWS EC2 (t2.medium)**:
- ~$30-35/month (on-demand)
- ~$20/month (1-year reserved instance)

**MongoDB Atlas**:
- Free tier (M0): $0/month (512MB storage)
- Paid tier (M10): ~$57/month (10GB storage)

**Total**: ~$20-35/month with free MongoDB Atlas

---

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify .env configuration
3. Check AWS security group rules
4. Verify MongoDB Atlas network access

---

## Quick Reference

**Access URLs**:
- Frontend: `http://YOUR_EC2_IP`
- Backend API: `http://YOUR_EC2_IP:3000`
- Admin Dashboard: `http://YOUR_EC2_IP/login`

**Important Files**:
- Environment: `~/RescueBytes/RescueBytesWeb/backend/.env`
- Docker Compose: `~/RescueBytes/RescueBytesWeb/docker-compose.yml`
- Logs: `docker-compose logs -f`

**Common Commands**:
```bash
# Navigate to project
cd ~/RescueBytes/RescueBytesWeb

# View status
docker-compose ps

# Restart
docker-compose restart

# Update and rebuild
git pull && docker-compose up -d --build
```

---

**Deployment Complete!** 🚀

Your RescueBytes platform is now live on AWS with:
- ✅ Frontend accessible on port 80
- ✅ Backend API on port 3000
- ✅ MongoDB Atlas database
- ✅ Auto-restart on failure
- ✅ Health checks enabled

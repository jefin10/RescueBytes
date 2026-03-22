# 🎯 MongoDB Admin Access - Complete Setup

## ✅ What I Added

I've added **Mongo Express** to your docker-compose - a beautiful web-based MongoDB admin interface!

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Restart Docker Compose

```bash
cd ~/RescueBytes/RescueBytesWeb
docker-compose up -d
```

This will start the new Mongo Express container.

### Step 2: Open AWS Security Group Port

1. Go to **AWS Console** → **EC2** → **Security Groups**
2. Select your instance's security group
3. Click **Edit inbound rules**
4. Click **Add rule**:
   - Type: **Custom TCP**
   - Port: **8081**
   - Source: **0.0.0.0/0** (or your IP for security)
5. Click **Save rules**

---

## 🌐 Access Mongo Express

**URL**: `http://YOUR_EC2_IP:8081`

**Login**:
- Username: `admin`
- Password: `admin123`

---

## 🎉 Create Admin User (3 Easy Ways)

### ⭐ Method 1: Use Frontend (EASIEST!)

1. Go to: `http://YOUR_EC2_IP/register`
2. Fill in:
   - Name: Admin User
   - Email: admin@rescuebytes.com
   - Password: (your password)
   - Rescue Center: Select from dropdown
   - Role: **Admin**
3. Click Register
4. Done! ✅

### Method 2: Use Mongo Express (Visual)

1. Go to: `http://YOUR_EC2_IP:8081`
2. Login with admin/admin123
3. Click **rescuebytes** database
4. Click **users** collection
5. Click **New Document**
6. Paste this (update the values):

```json
{
  "name": "Admin User",
  "email": "admin@rescuebytes.com",
  "password": "$2b$10$hashed_password_here",
  "role": "admin",
  "RescueCenters": ObjectId("your_rescue_center_id"),
  "pfpLink": "https://avatar.iran.liara.run/public/boy",
  "sessionToken": ""
}
```

7. Click **Save**

**Note**: You need to hash the password first (see below)

### Method 3: Use API (Automated)

```bash
# First, create rescue center if needed
curl -X POST http://YOUR_EC2_IP:3000/addRC \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Kottayam",
    "contactNumber": "+91-1234567890"
  }'

# Then create admin user
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

---

## 🔑 Get Rescue Center ID

### Via Mongo Express:
1. Go to `http://YOUR_EC2_IP:8081`
2. Click **rescuebytes** → **rescuecenters**
3. Copy the **_id** value

### Via API:
```bash
curl http://YOUR_EC2_IP:3000/getRC
```

### Via MongoDB Shell:
```bash
docker-compose exec mongo mongosh rescuebytes
db.rescuecenters.find().pretty()
```

---

## 🛠️ Useful Mongo Express Features

### What You Can Do:
- ✅ **Browse Collections** - View all your data visually
- ✅ **Search & Filter** - Find specific documents
- ✅ **Create Documents** - Add new users, SOS alerts, etc.
- ✅ **Edit Documents** - Update existing data
- ✅ **Delete Documents** - Remove data
- ✅ **Export Data** - Download as JSON
- ✅ **Import Data** - Upload JSON files
- ✅ **Run Queries** - Execute MongoDB queries
- ✅ **View Stats** - Database statistics

### Common Tasks:

**View All Users:**
1. Click `rescuebytes` → `users`
2. Browse the list

**Make User Admin:**
1. Find the user in `users` collection
2. Click the document
3. Change `"role": "user"` to `"role": "admin"`
4. Click Save

**View SOS Alerts:**
1. Click `rescuebytes` → `sos`
2. See all emergency alerts

**Delete Test Data:**
1. Navigate to collection
2. Click document
3. Click Delete

---

## 🔐 Change Mongo Express Password

### Edit docker-compose.yml:

```yaml
mongo-express:
  environment:
    - ME_CONFIG_BASICAUTH_USERNAME=yourusername
    - ME_CONFIG_BASICAUTH_PASSWORD=your_secure_password
```

### Restart:
```bash
docker-compose up -d
```

---

## 🔒 Security Best Practices

### 1. Change Default Password
Edit `docker-compose.yml` and change:
- `ME_CONFIG_BASICAUTH_USERNAME`
- `ME_CONFIG_BASICAUTH_PASSWORD`

### 2. Restrict Access by IP
In AWS Security Group, change port 8081 source from `0.0.0.0/0` to your specific IP.

### 3. Use HTTPS (Optional)
Setup SSL certificate with Let's Encrypt for secure access.

### 4. Disable After Setup (Optional)
If you only need it for initial setup:
```bash
docker-compose stop mongo-express
```

To start again:
```bash
docker-compose start mongo-express
```

---

## 🐛 Troubleshooting

### Can't Access Mongo Express?

**Check if container is running:**
```bash
docker-compose ps
```

**View logs:**
```bash
docker-compose logs mongo-express
```

**Restart:**
```bash
docker-compose restart mongo-express
```

### Shows "Cannot connect to MongoDB"?

**Restart both MongoDB and Mongo Express:**
```bash
docker-compose restart mongo mongo-express
```

### Forgot to open port 8081?

Add it to AWS Security Group (see Step 2 above)

### Wrong credentials?

Default is:
- Username: `admin`
- Password: `admin123`

Check `docker-compose.yml` for current values.

---

## 📱 Alternative: MongoDB Compass (Desktop)

If you prefer a desktop application:

1. **Download**: https://www.mongodb.com/try/download/compass
2. **Install** on your computer
3. **Connect** using:
   ```
   mongodb://YOUR_EC2_IP:27017/rescuebytes
   ```

**Note**: Port 27017 must be open in Security Group (it already is!)

---

## 🎯 Recommended Workflow

1. **Initial Setup**: Use frontend registration (`/register`) to create admin
2. **Database Management**: Use Mongo Express for browsing and editing
3. **Bulk Operations**: Use MongoDB shell (`mongosh`) for scripts
4. **Development**: Use MongoDB Compass on your local machine

---

## 📊 Quick Commands Reference

```bash
# Show Mongo Express URL
./manage.sh mongo-ui

# Open MongoDB shell
./manage.sh mongo

# View Mongo Express logs
docker-compose logs mongo-express

# Restart Mongo Express
docker-compose restart mongo-express

# Stop Mongo Express
docker-compose stop mongo-express

# Start Mongo Express
docker-compose start mongo-express
```

---

## ✅ Complete Setup Checklist

- [ ] Restarted docker-compose: `docker-compose up -d`
- [ ] Opened port 8081 in AWS Security Group
- [ ] Accessed Mongo Express: `http://YOUR_EC2_IP:8081`
- [ ] Logged in with admin/admin123
- [ ] Created rescue center (if needed)
- [ ] Created admin user via frontend or API
- [ ] Logged into admin dashboard
- [ ] Changed Mongo Express password (optional)
- [ ] Restricted access by IP (optional)

---

## 🎊 You're All Set!

You now have:
- ✅ Web-based MongoDB admin interface
- ✅ Easy user management
- ✅ Visual database browsing
- ✅ Admin user created
- ✅ Full database access

**Access Mongo Express**: `http://YOUR_EC2_IP:8081`

**Login**: admin / admin123

---

**Need more help?** Check [MONGODB_ACCESS.md](./MONGODB_ACCESS.md) for detailed guide!

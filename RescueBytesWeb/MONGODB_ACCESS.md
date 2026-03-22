# 🗄️ MongoDB Access Guide

## 3 Ways to Access Your MongoDB Database

---

## 🌐 Option 1: Mongo Express (Web UI) - EASIEST! ⭐

### What is it?
A beautiful web-based MongoDB admin interface - like phpMyAdmin for MongoDB!

### Setup (Already Added!)

Your docker-compose now includes Mongo Express. Just restart:

```bash
cd ~/RescueBytes/RescueBytesWeb
docker-compose up -d
```

### Access

**URL**: `http://YOUR_EC2_IP:8081`

**Login Credentials**:
- Username: `admin`
- Password: `admin123`

### What You Can Do:
- ✅ View all databases and collections
- ✅ Browse, search, and filter documents
- ✅ Create, edit, delete documents
- ✅ Create admin users directly
- ✅ Export/import data
- ✅ Run queries
- ✅ View database statistics

### Create Admin User via Mongo Express:

1. Go to `http://YOUR_EC2_IP:8081`
2. Login with admin/admin123
3. Click on `rescuebytes` database
4. Click on `users` collection
5. Click "New Document"
6. Paste this JSON:

```json
{
  "name": "Admin User",
  "email": "admin@rescuebytes.com",
  "password": "$2b$10$YourHashedPasswordHere",
  "role": "admin",
  "RescueCenters": "YOUR_RESCUE_CENTER_ID",
  "pfpLink": "https://avatar.iran.liara.run/public/boy",
  "sessionToken": ""
}
```

7. Click "Save"

**Note**: For password, you need to hash it first (see Option 2 below for easy hashing)

---

## 💻 Option 2: MongoDB Shell (mongosh) - POWERFUL!

### Access MongoDB Shell

```bash
# Connect to MongoDB container
docker-compose exec mongo mongosh rescuebytes
```

You'll see:
```
rescuebytes>
```

### Useful Commands

```javascript
// View all collections
show collections

// View all users
db.users.find().pretty()

// View all SOS alerts
db.sos.find().pretty()

// Count documents
db.users.countDocuments()

// Find specific user
db.users.findOne({ email: "admin@rescuebytes.com" })

// Create admin user (with hashed password)
db.users.insertOne({
  name: "Admin User",
  email: "admin@rescuebytes.com",
  password: "$2b$10$hashed_password_here",
  role: "admin",
  RescueCenters: ObjectId("your_rescue_center_id"),
  pfpLink: "https://avatar.iran.liara.run/public/boy",
  sessionToken: ""
})

// Update user role to admin
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)

// Delete a user
db.users.deleteOne({ email: "test@example.com" })

// Exit
exit
```

### Get Rescue Center ID

```javascript
// In mongosh
db.rescuecenters.find().pretty()
// Copy the _id value
```

---

## 🔧 Option 3: Use Your Backend API - EASIEST FOR CREATING USERS!

### Method 1: Use the /signup Endpoint

```bash
# First, create a rescue center if you haven't
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
    "password": "YourSecurePassword123",
    "confirmPassword": "YourSecurePassword123",
    "rescueCenter": "Kottayam",
    "role": "admin"
  }'
```

### Method 2: Use the Frontend Registration Page

1. Go to: `http://YOUR_EC2_IP/register`
2. Fill in the form:
   - Name: Admin User
   - Email: admin@rescuebytes.com
   - Password: (your password)
   - Rescue Center: Select from dropdown
   - Role: Admin
3. Click Register

**This is the EASIEST way!** ✅

---

## 🔐 Security: Change Mongo Express Password

### Update docker-compose.yml

```yaml
mongo-express:
  environment:
    - ME_CONFIG_BASICAUTH_USERNAME=yourusername
    - ME_CONFIG_BASICAUTH_PASSWORD=your_secure_password
```

### Restart

```bash
docker-compose up -d
```

---

## 🚨 Important: AWS Security Group

To access Mongo Express from your browser, add port 8081 to your EC2 Security Group:

1. Go to AWS Console → EC2 → Security Groups
2. Select your instance's security group
3. Edit Inbound Rules
4. Add Rule:
   - Type: Custom TCP
   - Port: 8081
   - Source: Your IP (or 0.0.0.0/0 for anywhere)
5. Save

---

## 📊 Quick Admin User Creation (Complete Flow)

### Step 1: Check if Rescue Center Exists

```bash
curl http://YOUR_EC2_IP:3000/getRC
```

### Step 2: Create Rescue Center (if needed)

```bash
curl -X POST http://YOUR_EC2_IP:3000/addRC \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Kottayam",
    "contactNumber": "+91-1234567890"
  }'
```

### Step 3: Create Admin User

**Option A: Via API (Recommended)**
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

**Option B: Via Web UI**
- Go to: `http://YOUR_EC2_IP/register`
- Fill form and select "Admin" role

**Option C: Via Mongo Express**
- Go to: `http://YOUR_EC2_IP:8081`
- Navigate to rescuebytes → users
- Create new document

### Step 4: Login

Go to: `http://YOUR_EC2_IP/login`

---

## 🛠️ Troubleshooting

### Can't access Mongo Express?

```bash
# Check if container is running
docker-compose ps

# View logs
docker-compose logs mongo-express

# Restart
docker-compose restart mongo-express
```

### Forgot to add port 8081 to Security Group?

1. AWS Console → EC2 → Security Groups
2. Add inbound rule for port 8081

### Mongo Express shows "Cannot connect to MongoDB"?

```bash
# Check if MongoDB is running
docker-compose ps mongo

# Restart both
docker-compose restart mongo mongo-express
```

---

## 📱 Bonus: MongoDB Compass (Desktop App)

If you want a desktop GUI:

1. **Download**: https://www.mongodb.com/try/download/compass
2. **Install** on your local machine
3. **Connect** using:
   ```
   mongodb://YOUR_EC2_IP:27017/rescuebytes
   ```

**Note**: Make sure port 27017 is open in your Security Group (it already is!)

---

## 🎯 Recommended Approach

**For creating admin users**: Use the frontend registration page (`/register`) - it's the easiest and safest!

**For database management**: Use Mongo Express (`http://YOUR_EC2_IP:8081`) - it's visual and user-friendly!

**For advanced queries**: Use mongosh - it's powerful for bulk operations!

---

## 📋 Quick Reference

| Method | URL/Command | Best For |
|--------|-------------|----------|
| **Mongo Express** | `http://YOUR_EC2_IP:8081` | Visual browsing, editing |
| **Frontend** | `http://YOUR_EC2_IP/register` | Creating users |
| **API** | `curl http://YOUR_EC2_IP:3000/signup` | Automated user creation |
| **mongosh** | `docker-compose exec mongo mongosh` | Advanced queries |
| **Compass** | Desktop app | Local development |

---

## ✅ Summary

**Easiest way to create admin user:**
1. Go to `http://YOUR_EC2_IP/register`
2. Fill form, select "Admin" role
3. Done!

**Easiest way to manage database:**
1. Open `http://YOUR_EC2_IP:8081`
2. Login: admin/admin123
3. Browse and edit data visually!

---

**Need help?** Check the logs: `docker-compose logs mongo-express`

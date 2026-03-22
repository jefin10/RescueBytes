# 🔧 Mobile App Connection Fix

## Issues Found

1. ❌ **Wrong API URL** - Missing port `:3000`
2. ❌ **Nginx not proxying `/signup`** - Route not configured
3. ❌ **504 Gateway Timeout** - Backend not responding

---

## ✅ Solutions

### Fix 1: Update Mobile App API URL

**File**: `RescueBytezApp/RescueBytez/Auth/api.js`

**Change from:**
```javascript
export const API_URL = 'http://51.20.42.250';
```

**Change to:**
```javascript
export const API_URL = 'http://51.20.42.250:3000';
```

### Fix 2: Rebuild Docker (Nginx Config Updated)

I've already updated the nginx.conf to include `/signup` route. Now rebuild:

```bash
cd ~/RescueBytes/RescueBytesWeb
docker-compose up -d --build
```

---

## 🚀 Complete Fix Steps

### On Your Development Machine:

1. **Update API URL in mobile app:**

```javascript
// File: RescueBytezApp/RescueBytez/Auth/api.js
export const API_URL = 'http://51.20.42.250:3000';
```

2. **Rebuild mobile app:**
```bash
cd RescueBytezApp/RescueBytez
npx expo start
```

### On Your AWS EC2 Instance:

3. **Rebuild Docker containers:**
```bash
cd ~/RescueBytes/RescueBytesWeb
git pull origin main  # Pull the nginx.conf update
docker-compose up -d --build
```

4. **Verify backend is running:**
```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","service":"rescuebytes-backend"}
```

5. **Test signup endpoint:**
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"Test123",
    "confirmPassword":"Test123",
    "rescueCenter":"Kottayam"
  }'
```

---

## 🎯 Why This Happened

### Issue 1: Missing Port Number
Your mobile app was calling:
```
http://51.20.42.250/signup  ❌
```

But should be:
```
http://51.20.42.250:3000/signup  ✅
```

The backend runs on port 3000, not port 80.

### Issue 2: Nginx Not Configured
Nginx (port 80) wasn't proxying `/signup` to the backend. I've added it to the nginx.conf.

### Issue 3: 504 Timeout
Backend might not be running or is slow to respond. Check with:
```bash
docker-compose logs backend
```

---

## 📱 Mobile App API Endpoints

All API calls from mobile app should use port **3000**:

```javascript
// Correct URLs
const API_URL = 'http://51.20.42.250:3000';

// Examples:
http://51.20.42.250:3000/signup
http://51.20.42.250:3000/auth/loginApp
http://51.20.42.250:3000/sos/create
http://51.20.42.250:3000/getRC
http://51.20.42.250:3000/news/all
```

---

## 🌐 Web vs Mobile API Access

### Web Frontend (Port 80)
- Uses Nginx proxy
- Calls like `/signup` are proxied to backend
- URL: `http://51.20.42.250/signup`

### Mobile App (Port 3000)
- Direct backend access
- Must include port 3000
- URL: `http://51.20.42.250:3000/signup`

---

## ✅ Verification Steps

### 1. Check Backend Health
```bash
curl http://51.20.42.250:3000/health
```

Expected:
```json
{"status":"healthy","timestamp":"2026-03-22T...","service":"rescuebytes-backend"}
```

### 2. Check Rescue Centers
```bash
curl http://51.20.42.250:3000/getRC
```

Expected: Array of rescue centers

### 3. Test Signup
```bash
curl -X POST http://51.20.42.250:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "email":"test@test.com",
    "password":"Test123",
    "confirmPassword":"Test123",
    "rescueCenter":"Kottayam"
  }'
```

Expected: Success response with userId and sessionToken

### 4. Test from Mobile App
- Open your mobile app
- Try to register
- Should work now!

---

## 🐛 If Still Not Working

### Check Backend Logs
```bash
cd ~/RescueBytes/RescueBytesWeb
docker-compose logs -f backend
```

### Check if Backend is Running
```bash
docker-compose ps
```

Should show `rescuebytes-backend` as `Up`

### Restart Backend
```bash
docker-compose restart backend
```

### Check MongoDB Connection
```bash
docker-compose logs backend | grep -i mongo
```

### Check .env File
```bash
cat backend/.env
```

Make sure:
- `MONGO_DB_URI=mongodb://mongo:27017/rescuebytes`
- `GEMINI_API_KEY` is set
- `CORS_ORIGIN` includes your IP

---

## 🔐 CORS Configuration

If you get CORS errors, update backend `.env`:

```env
CORS_ORIGIN=http://51.20.42.250
```

Or allow all origins (for testing):

Edit `backend/server.js`:
```javascript
app.use(
  cors({
    origin: "*",  // Allow all origins (testing only!)
    credentials: true,
  })
);
```

Then restart:
```bash
docker-compose restart backend
```

---

## 📋 Quick Fix Checklist

- [ ] Update `Auth/api.js` to include `:3000`
- [ ] Rebuild mobile app
- [ ] Pull latest code on EC2: `git pull`
- [ ] Rebuild Docker: `docker-compose up -d --build`
- [ ] Test backend health: `curl http://51.20.42.250:3000/health`
- [ ] Test signup endpoint with curl
- [ ] Test from mobile app
- [ ] Check logs if issues: `docker-compose logs backend`

---

## 💡 Pro Tip

For easier debugging, add console logs in your mobile app:

```javascript
// In register.tsx
console.log('API URL:', API_URL);
console.log('Full URL:', `${API_URL}/signup`);
console.log('Request body:', JSON.stringify({ name, email, rescueCenter: userRC }));
```

---

**After these fixes, your mobile app should connect successfully!** 🎉

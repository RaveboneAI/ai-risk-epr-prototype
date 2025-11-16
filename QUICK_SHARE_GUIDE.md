# 🚀 Quick Share Guide - Get a URL NOW

Your Docker containers are running! Choose your sharing method:

---

## ✅ EASIEST: Ngrok (Get URL in 30 seconds)

### 1. Install Ngrok
```bash
# Option A: Homebrew (Mac)
brew install ngrok

# Option B: Download directly
# Visit: https://ngrok.com/download
```

### 2. Create Public Tunnel
```bash
# In a new terminal window, run:
ngrok http 3000

# You'll see output like:
# Forwarding: https://abc123xyz.ngrok.io -> http://localhost:3000
```

### 3. Share the URL!
Send your colleague the `https://abc123xyz.ngrok.io` URL

**Pros**: Instant, no setup
**Cons**: URL changes each time, free tier has limits

---

## 🌟 RECOMMENDED: Railway.app (Permanent URL in 10 min)

### Why Railway?
- ✅ Free tier available
- ✅ Permanent HTTPS URL
- ✅ Auto-deploys from GitHub
- ✅ Professional

### Quick Steps:

#### 1. Push to GitHub (if you haven't already)
```bash
cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Initialize git (if needed)
git init
git add .
git commit -m "EPR prototype ready for deployment"

# Create GitHub repo (if you have GitHub CLI)
gh repo create ai-epr-prototype --public --source=. --remote=origin --push

# OR manually:
# 1. Create new repo on github.com
# 2. Then run:
git remote add origin https://github.com/YOUR_USERNAME/ai-epr-prototype.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `ai-epr-prototype` repository
6. Railway auto-detects docker-compose.yml and deploys!

#### 3. Configure Environment
In Railway dashboard:
- **Backend service** → Settings → Generate Domain
- Copy the backend URL (e.g., `https://backend-production-xyz.up.railway.app`)
- **Frontend service** → Variables → Add:
  ```
  REACT_APP_API_BASE=https://backend-production-xyz.up.railway.app/api
  ```
- **Frontend service** → Settings → Generate Domain

#### 4. Share Your URL! 🎉
Send your colleague the frontend Railway URL:
`https://frontend-production-xyz.up.railway.app`

---

## 🔄 Alternative: Render.com (Also Free)

### Steps:

#### 1. Push to GitHub (same as above)

#### 2. Deploy Backend
1. Go to https://render.com
2. **New** → **Web Service**
3. Connect GitHub repo
4. Settings:
   - **Name**: epr-backend
   - **Root Directory**: `backend`
   - **Environment**: Docker
   - **Plan**: Free
5. Click **Create Web Service**
6. Wait for deploy, then copy URL: `https://epr-backend.onrender.com`

#### 3. Deploy Frontend
1. **New** → **Web Service**
2. Connect same GitHub repo
3. Settings:
   - **Name**: epr-frontend
   - **Root Directory**: `frontend`
   - **Environment**: Docker
   - **Plan**: Free
4. Environment Variables → Add:
   ```
   REACT_APP_API_BASE=https://epr-backend.onrender.com/api
   ```
5. Click **Create Web Service**

#### 4. Share URL
`https://epr-frontend.onrender.com`

**Note**: Free tier spins down after 15min inactivity (takes 30-60s to wake up)

---

## 📊 Current Status

✅ Docker containers running locally
✅ Frontend: http://localhost:3000
✅ Backend: http://localhost:4000/api
✅ Ready to deploy!

---

## 🎯 What To Do Right Now

### For Quick Demo (5 minutes):
```bash
# 1. Install ngrok
brew install ngrok

# 2. Create tunnel (in new terminal)
ngrok http 3000

# 3. Share the https://xyz.ngrok.io URL with your colleague
```

### For Professional Deployment (10 minutes):
1. Push code to GitHub
2. Deploy on Railway.app
3. Share permanent Railway URL

---

## 🛑 To Stop Docker Containers

When you're done:
```bash
cd /Users/Kerry_AI/ai-results-risk-prototype-2
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Frontend won't load
```bash
docker-compose logs frontend
```

### Backend errors
```bash
docker-compose logs backend
```

### Restart everything
```bash
docker-compose restart
```

### Full rebuild
```bash
docker-compose down
docker-compose up -d --build
```

---

## 📝 What Your Colleague Will See

When they visit your URL, they'll see:
- ✅ Professional EPR interface
- ✅ 10 patient records with realistic data
- ✅ 12 condition-specific risk assessments
- ✅ NICE/NHSE diagnosis scoring
- ✅ Laboratory results with out-of-range indicators
- ✅ NEWS2 Early Warning Score table
- ✅ Imaging reports (CT, X-ray, MRI)
- ✅ Clinical assessments (MUST, Waterlow, 4AT, etc.)
- ✅ Collapsible sections with warning indicators
- ✅ Modern green-themed EPR UI

---

## 🚀 Recommended Action NOW

**Fastest** (30 seconds):
```bash
brew install ngrok && ngrok http 3000
```

**Best** (10 minutes):
1. Push to GitHub
2. Deploy on Railway.app
3. Get permanent URL

Choose your path and share away! 🎉


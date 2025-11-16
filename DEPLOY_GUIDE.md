# 🚀 Deployment Guide - Share Your EPR Prototype

## Quick Overview

You have 3 options to get a shareable URL:

1. **Easiest**: Railway.app or Render.com (Free tier, 5 minutes setup)
2. **Docker Desktop**: Local test before deploying
3. **Cloud VPS**: DigitalOcean, AWS, etc. (More control)

---

## Option 1: Railway.app (RECOMMENDED - Fastest)

### Why Railway?
- ✅ Free tier available
- ✅ Automatic HTTPS URL
- ✅ Deploys from GitHub in 5 minutes
- ✅ No credit card required for testing

### Steps:

#### 1. Push to GitHub (if not already)
```bash
cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Initialize git if needed
git init
git add .
git commit -m "Initial commit - EPR prototype"

# Create GitHub repo and push
gh repo create ai-epr-prototype --public --source=. --remote=origin --push
# OR manually create repo on GitHub and:
git remote add origin https://github.com/YOUR_USERNAME/ai-epr-prototype.git
git push -u origin main
```

#### 2. Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `ai-epr-prototype` repository
6. Railway will auto-detect docker-compose.yml and deploy!

#### 3. Get Your URL
- Railway will give you URLs like:
  - Frontend: `https://your-app.railway.app`
  - Backend: `https://your-app-backend.railway.app`

#### 4. Configure Environment Variables
In Railway dashboard:
- Frontend service → Variables:
  ```
  REACT_APP_API_BASE=https://your-app-backend.railway.app/api
  ```

**Done! Share the frontend URL with your colleague! 🎉**

---

## Option 2: Render.com (Alternative Free Option)

### Steps:

1. **Push to GitHub** (same as Railway)

2. **Deploy Backend**:
   - Go to https://render.com
   - **New** → **Web Service**
   - Connect your GitHub repo
   - Settings:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `node src/server.js`
     - **Environment**: Node
   - Click **Create Web Service**
   - Note your backend URL: `https://your-backend.onrender.com`

3. **Deploy Frontend**:
   - **New** → **Static Site**
   - Connect same repo
   - Settings:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`
   - Environment Variable:
     ```
     REACT_APP_API_BASE=https://your-backend.onrender.com/api
     ```
   - Click **Create Static Site**

4. **Share URL**: `https://your-frontend.onrender.com`

**Note**: Free tier spins down after inactivity (takes ~30s to wake up)

---

## Option 3: Local Docker (Test Before Deploying)

### Prerequisites
- Docker Desktop installed
- Ports 3000 and 4000 available

### Steps:

#### 1. Build and Run
```bash
cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Start everything
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

#### 2. Access Locally
- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api/patients

#### 3. Share via Ngrok (Temporary URL)
```bash
# Install ngrok: https://ngrok.com/download

# Expose frontend
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
# Share this URL with your colleague
```

**Note**: Ngrok free tier URLs expire after session ends

#### 4. Stop Docker
```bash
docker-compose down

# Or stop and remove volumes
docker-compose down -v
```

---

## Option 4: DigitalOcean Droplet (Professional Deployment)

### Cost: $6/month for basic droplet

### Steps:

#### 1. Create Droplet
- Go to https://digitalocean.com
- Create → Droplets
- Choose: Ubuntu 22.04, Basic plan ($6/mo)
- Add SSH key
- Create Droplet
- Note your droplet IP: `123.456.789.0`

#### 2. Connect and Setup
```bash
# SSH into droplet
ssh root@123.456.789.0

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose

# Clone your repo
git clone https://github.com/YOUR_USERNAME/ai-epr-prototype.git
cd ai-epr-prototype
```

#### 3. Configure and Deploy
```bash
# Update frontend env (create .env file)
echo "REACT_APP_API_BASE=http://123.456.789.0:4000/api" > frontend/.env

# Start services
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs
```

#### 4. Setup Domain (Optional)
- Buy domain (e.g., Namecheap)
- Point A record to your droplet IP
- Access: http://yourdomain.com:3000

#### 5. Add SSL (Optional - HTTPS)
```bash
# Install nginx and certbot
apt install nginx certbot python3-certbot-nginx

# Configure nginx as reverse proxy
# Get SSL certificate
certbot --nginx -d yourdomain.com
```

---

## Option 5: Heroku (Classic Option)

### Steps:

#### 1. Install Heroku CLI
```bash
brew install heroku/brew/heroku
heroku login
```

#### 2. Deploy Backend
```bash
cd backend
heroku create your-epr-backend

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git init
git add .
git commit -m "Deploy backend"
git push heroku main

# Note URL: https://your-epr-backend.herokuapp.com
```

#### 3. Deploy Frontend
```bash
cd ../frontend

# Create React build pack app
heroku create your-epr-frontend
heroku buildpacks:set mars/create-react-app

# Set backend URL
heroku config:set REACT_APP_API_BASE=https://your-epr-backend.herokuapp.com/api

# Deploy
git init
git add .
git commit -m "Deploy frontend"
git push heroku main
```

#### 4. Share URL
`https://your-epr-frontend.herokuapp.com`

**Note**: Heroku removed free tier, requires paid plan

---

## Quick Comparison

| Option | Cost | Setup Time | Pros | Cons |
|--------|------|------------|------|------|
| **Railway** | Free/$5/mo | 5 min | Easiest, auto-deploy | Limited free tier |
| **Render** | Free/$7/mo | 10 min | Good free tier | Slow cold starts |
| **Ngrok + Docker** | Free | 2 min | Quick test | Temporary URLs |
| **DigitalOcean** | $6/mo | 30 min | Full control | More technical |
| **Heroku** | $7/mo | 15 min | Well documented | No free tier |

---

## Recommended Quick Path

### For Immediate Demo (5 minutes):
```bash
# 1. Local Docker
cd /Users/Kerry_AI/ai-results-risk-prototype-2
docker-compose up --build

# 2. In new terminal, install ngrok
brew install ngrok

# 3. Create tunnel
ngrok http 3000

# 4. Share the https://xyz.ngrok.io URL
```

### For Permanent URL (10 minutes):
1. Push to GitHub
2. Deploy on Railway.app
3. Share Railway URL

---

## Environment Variables Summary

### Backend (.env)
```env
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend (.env)
```env
REACT_APP_API_BASE=https://your-backend-url.com/api
```

---

## Troubleshooting

### Issue: CORS errors
**Fix**: Update backend CORS config to allow your frontend domain
```javascript
// backend/src/config/index.js
cors: {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}
```

### Issue: Docker build fails
**Fix**: Increase Docker memory
- Docker Desktop → Settings → Resources → Memory: 4GB+

### Issue: App not loading
**Fix**: Check logs
```bash
# Local Docker
docker-compose logs frontend
docker-compose logs backend

# Railway/Render
Check deployment logs in dashboard
```

### Issue: Cannot connect to backend
**Fix**: Check backend URL in frontend
```bash
# Should match your backend deployment
echo $REACT_APP_API_BASE
```

---

## Security Considerations for Production

### Before Sharing Publicly:
1. ✅ Add authentication (currently none)
2. ✅ Use environment variables for sensitive data
3. ✅ Enable rate limiting (already implemented)
4. ✅ Use HTTPS (automatic on Railway/Render)
5. ✅ Review security headers (Helmet already configured)

### Prototype Disclaimer:
- ⚠️ This is a PROTOTYPE - not for clinical use
- ⚠️ Contains demo patient data only
- ⚠️ No PHI/PII should be added
- ⚠️ Not a validated medical device

---

## What Your Colleague Will See

When they visit your URL:
1. Professional EPR interface
2. 10 patient records to browse
3. 12 risk assessments per patient
4. Imaging reports and clinical assessments
5. NEWS2 EWS scoring
6. NICE/NHSE diagnosis scoring

They can:
- Select different patients
- Expand/collapse sections
- Toggle between Demo/Guideline modes
- See all the comprehensive clinical documentation

---

## Next Steps

### Immediate (5 min demo):
```bash
cd /Users/Kerry_AI/ai-results-risk-prototype-2
docker-compose up --build
# Then in another terminal:
ngrok http 3000
# Share the ngrok URL
```

### Permanent (10 min setup):
1. Push to GitHub
2. Sign up at Railway.app
3. Deploy from GitHub
4. Share Railway URL

---

## Support

If you encounter issues:
1. Check `docker-compose logs`
2. Verify Docker is running
3. Check ports aren't in use: `lsof -i :3000 -i :4000`
4. Review deployment logs in hosting platform

---

**Ready to deploy? Follow the "Railway.app" section above for the fastest path to a shareable URL!** 🚀


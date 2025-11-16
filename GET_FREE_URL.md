# 🆓 Get FREE Shareable URL - 2 Options

Your Docker containers are already running! Choose your free option:

---

## ⚡ Option 1: INSTANT Free URL (30 seconds) - Ngrok

**Best for**: Quick demo, immediate sharing
**Duration**: Temporary (lasts while terminal is open)
**Effort**: 30 seconds

### Step 1: Install ngrok (one-time)

```bash
# Download from website (easiest)
# Visit: https://ngrok.com/download
# Or use this direct download:
curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip
unzip ngrok-v3-stable-darwin-amd64.zip
chmod +x ngrok
sudo mv ngrok /usr/local/bin/
```

### Step 2: Create Public Tunnel

```bash
# Open a NEW terminal window and run:
ngrok http 3000
```

### Step 3: Get Your URL!

You'll see output like this:
```
Session Status                online
Forwarding                    https://abc123xyz.ngrok.io -> http://localhost:3000
```

**Share this URL**: `https://abc123xyz.ngrok.io` 🎉

**Important**: 
- Keep the terminal open while your colleague uses it
- Free tier: URL changes each time you restart
- No signup needed (but signing up gives you a static domain)

---

## 🌟 Option 2: PERMANENT Free URL (5 minutes) - Railway.app

**Best for**: Permanent sharing, professional URL
**Duration**: Permanent (stays online 24/7)
**Effort**: 5 minutes setup

### Prerequisites
- GitHub account (free)
- Git installed locally

### Step 1: Push to GitHub

```bash
cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Initialize git (if not already)
git init
git add .
git commit -m "EPR prototype ready for deployment"

# Create GitHub repo using GitHub CLI (if you have it)
gh repo create ai-epr-prototype --public --source=. --remote=origin --push

# OR create repo manually on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-epr-prototype.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Railway.app

1. **Go to**: https://railway.app
2. **Sign up** with GitHub (free, no credit card needed)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `ai-epr-prototype` repository
6. Railway will detect `docker-compose.yml` and deploy both services!

### Step 3: Configure Environment Variables

After deployment:

1. **Click on Backend service**
   - Go to **Settings** → **Networking**
   - Click **Generate Domain**
   - Copy the URL (e.g., `https://backend-production-abc.up.railway.app`)

2. **Click on Frontend service**
   - Go to **Variables** tab
   - Add variable:
     - **Name**: `REACT_APP_API_BASE`
     - **Value**: `https://backend-production-abc.up.railway.app/api`
   - Go to **Settings** → **Networking**
   - Click **Generate Domain**

3. **Redeploy Frontend**
   - Click **Deploy** → **Redeploy**

### Step 4: Get Your Permanent URL! 🎉

**Share this**: `https://frontend-production-xyz.up.railway.app`

**Benefits**:
- ✅ Permanent URL (doesn't change)
- ✅ Always online (no need to keep your computer on)
- ✅ Free tier: 500 hours/month (plenty for testing)
- ✅ Auto-deploys when you push to GitHub
- ✅ Professional HTTPS URL

---

## 🔄 Option 3: FREE Alternative - Render.com

Similar to Railway but slightly different:

### Quick Steps:

1. **Push to GitHub** (same as Railway)

2. **Go to**: https://render.com → Sign up (free)

3. **Deploy Backend**:
   - New → Web Service
   - Connect GitHub repo
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `node src/server.js`
   - Create Web Service (free tier)
   - Copy backend URL

4. **Deploy Frontend**:
   - New → Static Site
   - Connect same repo
   - Settings:
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `build`
   - Environment Variable:
     - `REACT_APP_API_BASE` = your backend URL + `/api`
   - Create Static Site

5. **Share URL**: Your frontend Render URL

**Note**: Free tier spins down after 15 min inactivity (30s to wake up on next visit)

---

## 🎯 Which Option Should You Choose?

| Option | Best For | Time | Permanent | Cost |
|--------|----------|------|-----------|------|
| **Ngrok** | Quick demo today | 30 sec | ❌ Temporary | Free |
| **Railway** | Professional sharing | 5 min | ✅ Permanent | Free tier |
| **Render** | Alternative to Railway | 10 min | ✅ Permanent | Free tier |

### My Recommendation:

**For Right Now (30 seconds)**:
```bash
# Download ngrok
curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip
unzip ngrok-v3-stable-darwin-amd64.zip
chmod +x ngrok
./ngrok http 3000

# Share the https://xyz.ngrok.io URL that appears!
```

**For Permanent (5 minutes)**:
Use Railway.app - it's the easiest permanent free solution.

---

## 📊 Current Status Check

Before choosing, verify your Docker containers are running:

```bash
cd /Users/Kerry_AI/ai-results-risk-prototype-2
docker-compose ps

# Should show:
# backend  - Up
# frontend - Up
```

If not running:
```bash
docker-compose up -d
```

Then create your tunnel/deployment!

---

## 🆘 Quick Troubleshooting

### Ngrok shows "502 Bad Gateway"
```bash
# Check Docker is running
docker-compose ps

# Restart if needed
docker-compose restart
```

### Railway deployment fails
```bash
# Check docker-compose.yml is in repo root
# Check both Dockerfiles exist:
ls backend/Dockerfile
ls frontend/Dockerfile
```

### Can't push to GitHub
```bash
# Set up git credentials
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Try again
git push -u origin main
```

---

## 🎉 You're Ready!

Choose your path:

**INSTANT**: Run ngrok (30 seconds)
**PERMANENT**: Deploy to Railway (5 minutes)

Both are completely free! 🆓

---

## 💡 Pro Tips

### For Ngrok:
- Sign up (free) to get a static subdomain: `your-name.ngrok.io`
- Add to ngrok.yml for custom domain
- Use `ngrok http 3000 --log stdout` to see access logs

### For Railway:
- Connect repo for auto-deploy on git push
- Check deployment logs if something fails
- Free tier: 500 hours/month = ~16 hours/day
- Upgrade to Pro ($5/mo) for more resources if needed

### For Render:
- Free tier includes automatic SSL
- Services sleep after 15min inactivity
- First request wakes it up (takes 30-60s)
- Good for demos where you control timing

---

## 🚀 Next Steps

1. Choose your option (Ngrok or Railway)
2. Follow the steps above
3. Share the URL with your colleague!
4. Watch them interact with your professional EPR system

**Need help?** All the detailed instructions are above. Pick the option that works best for you! 🎯


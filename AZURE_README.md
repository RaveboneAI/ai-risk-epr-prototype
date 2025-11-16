# 🚀 Deploy to Azure - Complete Setup

This README will guide you through deploying your EPR prototype to Azure Ubuntu VM and getting a live, shareable URL.

---

## ⚡ Quick Start (15 minutes to live URL)

### 1. Create Azure VM

```bash
./azure-create-vm.sh
```

This automated script will:
- ✅ Create Ubuntu 22.04 VM on Azure
- ✅ Configure networking (open ports 22, 80, 443, 3000, 4000)
- ✅ Give you the VM's public IP address
- ✅ Save connection details to `azure-vm-info.txt`

**Prerequisites**: Azure CLI installed and logged in
- Install: `brew install azure-cli`
- Login: `az login`

### 2. Copy Application to VM

```bash
# From your local machine
cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Create compressed archive (exclude large folders)
tar -czf epr-prototype.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='build' \
  .

# Copy to VM (replace with your IP from step 1)
scp epr-prototype.tar.gz azureuser@YOUR_VM_IP:~

# Connect to VM
ssh azureuser@YOUR_VM_IP

# Extract on VM
tar -xzf epr-prototype.tar.gz
ls -la  # Verify files are there
```

### 3. Deploy Application on VM

```bash
# On the Azure VM, run:
./azure-deploy.sh
```

This will:
- ✅ Detect VM's public IP automatically
- ✅ Install Docker & Docker Compose
- ✅ Create production configuration
- ✅ Build and start containers
- ✅ Display your live URLs

**Wait 3-5 minutes** for the Docker build to complete.

### 4. Access Your Live Application! 🎉

**Frontend (share this)**: `http://YOUR_VM_IP:3000`
**Backend API**: `http://YOUR_VM_IP:4000/api`

Example: `http://20.123.45.67:3000`

---

## 📋 What Gets Deployed

Your colleagues will see a **professional EPR system** with:

### Clinical Features:
- ✅ **10 realistic patient records** with diverse conditions
- ✅ **12 condition-specific risk assessments**:
  - AKI, Sepsis, VTE (DVT/PE), Delirium
  - Falls, Pressure Ulcer, Respiratory Failure, Cardiac Arrest
  - Electrolyte Disturbance, Medication Harm, Malnutrition, Bleeding Risk
- ✅ **NICE/NHSE diagnosis scoring**:
  - Heart Failure, Pulmonary Embolism, Diabetic Ketoacidosis
  - Acute Coronary Syndrome, Community-Acquired Pneumonia, Stroke/TIA
- ✅ **Laboratory results** with out-of-range indicators
- ✅ **NEWS2 Early Warning Score** in tabular EWS format
- ✅ **Imaging reports** (CT, X-ray, MRI, Ultrasound)
- ✅ **Clinical assessments** (MUST, Waterlow, 4AT, etc.)

### UI Features:
- ✅ Modern green-themed EPR interface
- ✅ Patient banner with demographics, allergies, alerts
- ✅ Collapsible sections with warning indicators
- ✅ Demo/Guideline mode toggle
- ✅ Patient search and selection
- ✅ Real-time risk calculation

---

## 🗂️ Files Created for Azure Deployment

| File | Purpose |
|------|---------|
| `azure-create-vm.sh` | Automated script to create Azure VM |
| `azure-deploy.sh` | Automated script to deploy app on VM |
| `AZURE_DEPLOYMENT_GUIDE.md` | Comprehensive deployment guide (30+ pages) |
| `AZURE_QUICKSTART.md` | Quick start guide (this file) |
| `docker-compose.yml` | Base Docker configuration |
| `docker-compose.prod.yml` | Production overrides (auto-generated on VM) |
| `backend/Dockerfile` | Backend container definition |
| `frontend/Dockerfile` | Frontend container definition |
| `azure-vm-info.txt` | VM connection details (auto-generated) |

---

## 🎮 Management & Operations

### Common Tasks:

```bash
# SSH to your VM
ssh azureuser@YOUR_VM_IP

# View running containers
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart application
docker-compose restart

# Stop application
docker-compose down

# Start application
docker-compose up -d

# Update application (after code changes)
git pull  # if using git
docker-compose up -d --build

# Check resource usage
docker stats
```

### Azure VM Management (from local machine):

```bash
# Check VM status
az vm get-instance-view \
  --name epr-prototype-vm \
  --resource-group epr-prototype-rg \
  --output table

# Stop VM (saves money, only pay for storage)
az vm deallocate \
  --resource-group epr-prototype-rg \
  --name epr-prototype-vm

# Start VM
az vm start \
  --resource-group epr-prototype-rg \
  --name epr-prototype-vm

# Get VM IP
az vm list-ip-addresses \
  --resource-group epr-prototype-rg \
  --name epr-prototype-vm \
  --output table

# Delete everything (removes all resources)
az group delete \
  --name epr-prototype-rg \
  --yes --no-wait
```

---

## 💰 Cost Information

### Monthly Costs (approximate):

| VM Size | vCPUs | RAM | Cost/Month | Use Case |
|---------|-------|-----|------------|----------|
| Standard_B1ms | 1 | 2GB | ~$15 | Budget/Testing |
| Standard_B2s | 2 | 4GB | ~$30 | **Recommended** |
| Standard_B2ms | 2 | 8GB | ~$60 | High Performance |

**Plus**: Storage (~$1/month), Bandwidth (usually included)

### Save Money:

1. **Deallocate when not using**:
   ```bash
   az vm deallocate --resource-group epr-prototype-rg --name epr-prototype-vm
   ```
   - Only pay ~$1/month for storage when deallocated
   - Restart anytime: `az vm start ...`

2. **Set auto-shutdown**: Azure Portal → VM → Auto-shutdown
   - Configure to shutdown at night/weekends

3. **Monitor costs**: Azure Portal → Cost Management → Cost Analysis
   - Set budget alerts

4. **Free tier**: New Azure accounts get $200 credit for 30 days

---

## 🌐 Optional: Custom Domain + HTTPS

Want `https://epr-demo.yourdomain.com` instead of `http://20.123.45.67:3000`?

### Quick Steps:

1. **Point your domain to VM IP**:
   - In your domain registrar (GoDaddy, Namecheap, etc.)
   - Add A record: `yourdomain.com` → `YOUR_VM_IP`

2. **On your VM, install Nginx + SSL**:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   
   # Create nginx config (creates reverse proxy)
   sudo nano /etc/nginx/sites-available/epr
   # ... (see AZURE_DEPLOYMENT_GUIDE.md for full config)
   
   # Get free SSL certificate from Let's Encrypt
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Access via HTTPS**:
   - `https://yourdomain.com` ✅

**Full instructions**: See Part 4 in `AZURE_DEPLOYMENT_GUIDE.md`

---

## 🔧 Troubleshooting

### Issue: Can't SSH to VM

**Solutions**:
```bash
# Check VM is running
az vm list --resource-group epr-prototype-rg --output table

# If stopped, start it
az vm start --resource-group epr-prototype-rg --name epr-prototype-vm

# Check NSG allows your IP
az network nsg rule list \
  --resource-group epr-prototype-rg \
  --nsg-name epr-prototype-vmNSG \
  --output table

# Test connection
ping YOUR_VM_IP
telnet YOUR_VM_IP 22
```

### Issue: Application not loading

**Solutions**:
```bash
# SSH to VM
ssh azureuser@YOUR_VM_IP

# Check containers are running
docker-compose ps

# Should show backend and frontend as "Up"

# If not, check logs
docker-compose logs

# Common fix: restart
docker-compose down
docker-compose up -d

# Check if ports are listening
sudo netstat -tlnp | grep -E ':(3000|4000)'
```

### Issue: Frontend shows but can't load data

**Solutions**:
```bash
# On VM, test backend
curl http://localhost:4000/api/patients

# Should return JSON with patient data

# Check docker-compose.prod.yml has correct IP
cat docker-compose.prod.yml

# Rebuild frontend with correct config
docker-compose up -d --build frontend
```

### Issue: "Address already in use" error

**Solutions**:
```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :4000

# Kill old processes
docker-compose down

# Clean restart
docker-compose up -d
```

### Issue: Out of disk space

**Solutions**:
```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Clean apt cache
sudo apt clean
sudo apt autoremove
```

---

## 🔐 Security Considerations

### For Demo/Development:

✅ **Already configured**:
- Firewall (UFW) on VM
- Security headers (Helmet)
- Rate limiting
- Input validation

### For Production Use:

⚠️ **Additional requirements**:
- [ ] Add user authentication (OAuth, SAML)
- [ ] Implement role-based access control (RBAC)
- [ ] Setup audit logging
- [ ] Enable data encryption at rest
- [ ] HIPAA/GDPR compliance measures
- [ ] Regular security updates
- [ ] Backup strategy
- [ ] Monitoring & alerting
- [ ] Clinical validation
- [ ] Regulatory approval

**Important**: This is a **prototype** for demonstration only, not validated for clinical use.

---

## 📊 Monitoring Your Deployment

### On VM:

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Logs (real-time)
docker-compose logs -f

# System resources
htop  # (install: sudo apt install htop)
```

### Via Azure Portal:

1. Go to portal.azure.com
2. Navigate to your VM
3. View:
   - **Metrics**: CPU, memory, network, disk
   - **Logs**: Boot diagnostics, serial console
   - **Alerts**: Configure alerts for high CPU/memory

### Setup Alerts:

```bash
# Example: Alert when CPU > 80%
az monitor metrics alert create \
  --name HighCPU \
  --resource-group epr-prototype-rg \
  --scopes /subscriptions/.../epr-prototype-vm \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

---

## 🔄 Updating Your Application

### After making code changes:

```bash
# On VM:
cd ~/ai-epr-prototype

# Pull latest code (if using Git)
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Or update just one service
docker-compose up -d --build frontend
```

### From scratch:

```bash
# On local machine: Create new tarball
cd /Users/Kerry_AI/ai-results-risk-prototype-2
tar -czf epr-prototype-v2.tar.gz --exclude='node_modules' --exclude='.git' .
scp epr-prototype-v2.tar.gz azureuser@YOUR_VM_IP:~

# On VM: Deploy new version
docker-compose down
rm -rf ~/ai-epr-prototype/*
tar -xzf ~/epr-prototype-v2.tar.gz -C ~/ai-epr-prototype
cd ~/ai-epr-prototype
./azure-deploy.sh
```

---

## 📚 Documentation Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **AZURE_QUICKSTART.md** | Quick deployment (15 min) | Start here! |
| **AZURE_DEPLOYMENT_GUIDE.md** | Comprehensive guide (30+ pages) | Detailed instructions, troubleshooting |
| **azure-create-vm.sh** | Automated VM creation | Run from local machine |
| **azure-deploy.sh** | Automated app deployment | Run on Azure VM |
| **DOCKER_READY.md** | Docker overview | Understanding Docker setup |
| **azure-vm-info.txt** | VM connection details | Auto-generated, keep safe |

---

## ✅ Deployment Checklist

### Initial Setup:
- [ ] Azure account created (with credits if new)
- [ ] Azure CLI installed (`brew install azure-cli`)
- [ ] Logged into Azure (`az login`)
- [ ] Run `./azure-create-vm.sh`
- [ ] Note VM IP address
- [ ] Copy code to VM (`scp` or `git clone`)

### Deployment:
- [ ] SSH to VM (`ssh azureuser@VM_IP`)
- [ ] Run `./azure-deploy.sh` on VM
- [ ] Containers built successfully
- [ ] Frontend accessible: `http://VM_IP:3000`
- [ ] Backend responding: `http://VM_IP:4000/api/patients`

### Optional Enhancements:
- [ ] Custom domain configured
- [ ] SSL certificate installed (HTTPS)
- [ ] Auto-shutdown configured
- [ ] Cost alerts setup
- [ ] Monitoring configured
- [ ] Backup strategy defined

---

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ `docker-compose ps` shows both containers as "Up"
2. ✅ `http://VM_IP:3000` loads the EPR interface
3. ✅ You can select and view patient records
4. ✅ All sections (risks, labs, vitals, imaging) display data
5. ✅ Your colleague can access it from their browser

---

## 🆘 Getting Help

### Check these first:

1. **Logs**: `docker-compose logs -f`
2. **Container status**: `docker-compose ps`
3. **Network**: `sudo netstat -tlnp | grep -E ':(3000|4000)'`
4. **Disk space**: `df -h`
5. **VM status**: Check Azure Portal

### Common solutions:

- **Application won't start**: `docker-compose down && docker-compose up -d`
- **Can't access URL**: Check Azure NSG rules, verify ports are open
- **Out of memory**: Restart containers or upgrade VM size
- **SSL not working**: Rerun certbot, check nginx config

### Documentation:

- Detailed troubleshooting: `AZURE_DEPLOYMENT_GUIDE.md` (Part 8)
- Docker issues: `DOCKER_READY.md`
- Azure issues: Check Azure Portal → VM → Diagnostics

---

## 🎉 You're Ready to Deploy!

### Quick Command Summary:

```bash
# 1. Create VM (local machine)
./azure-create-vm.sh

# 2. Copy code (local machine)
tar -czf epr-prototype.tar.gz --exclude='node_modules' --exclude='.git' .
scp epr-prototype.tar.gz azureuser@YOUR_VM_IP:~

# 3. Deploy (on VM)
ssh azureuser@YOUR_VM_IP
tar -xzf epr-prototype.tar.gz
./azure-deploy.sh

# 4. Share URL
# http://YOUR_VM_IP:3000
```

**Total Time**: 15-20 minutes
**Cost**: ~$30/month (can deallocate when not using)
**Result**: Professional, permanent, shareable URL ✅

---

## 🚀 Next Steps

After deployment:
1. Share `http://YOUR_VM_IP:3000` with colleagues
2. Monitor usage in Azure Portal
3. Configure auto-shutdown to save costs
4. (Optional) Setup custom domain
5. (Optional) Enable HTTPS with SSL

---

**Ready? Run `./azure-create-vm.sh` to begin!** 🎯

For step-by-step guidance with screenshots, see `AZURE_DEPLOYMENT_GUIDE.md`


# ⚡ Azure Quick Start - Get Live URL in 15 Minutes

Deploy your EPR prototype to Azure and get a permanent public URL.

---

## 🎯 What You'll Get

- **Live URL**: `http://YOUR_VM_IP:3000`
- **Permanent hosting** on Azure cloud
- **Professional deployment** (~$30/month, can pause when not using)
- **Full control** over the VM

---

## 📋 Prerequisites

- Azure account ([Create free account](https://azure.microsoft.com/free/) - $200 credit)
- Azure CLI installed (or use Azure Portal)

---

## 🚀 Option 1: Automated Deployment (Easiest)

### Step 1: Create Azure VM (5 minutes)

```bash
cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Run automated VM creation script
./azure-create-vm.sh
```

This will:
- ✅ Login to Azure
- ✅ Create VM with Ubuntu 22.04
- ✅ Open required ports (22, 80, 443, 3000, 4000)
- ✅ Give you the VM's public IP

**Save the IP address!** It will be displayed at the end.

### Step 2: Copy Code to VM (2 minutes)

```bash
# Create tarball of your app
tar -czf epr-prototype.tar.gz --exclude='node_modules' --exclude='.git' .

# Copy to VM (replace with your IP and username from Step 1)
scp epr-prototype.tar.gz azureuser@YOUR_VM_IP:~

# Connect to VM
ssh azureuser@YOUR_VM_IP

# Extract files
tar -xzf epr-prototype.tar.gz
```

### Step 3: Deploy on VM (5 minutes)

```bash
# On the VM, run:
./azure-deploy.sh
```

This will:
- ✅ Install Docker and Docker Compose
- ✅ Configure environment for your VM IP
- ✅ Build and start containers
- ✅ Show you the live URLs

### Step 4: Access Your Live App! 🎉

Open in browser: `http://YOUR_VM_IP:3000`

**Share this URL with your colleagues!**

---

## 🚀 Option 2: Manual Deployment via Azure Portal

### Step 1: Create VM in Azure Portal

1. Go to https://portal.azure.com
2. Click **"Create a resource"** → **"Virtual Machine"**
3. Configure:
   - **Resource Group**: Create new → `epr-prototype-rg`
   - **VM Name**: `epr-prototype-vm`
   - **Region**: Choose closest to you
   - **Image**: **Ubuntu Server 22.04 LTS**
   - **Size**: **Standard_B2s** (2 vCPUs, 4GB RAM)
   - **Authentication**: SSH public key (recommended)
   - **Inbound ports**: Check HTTP (80), HTTPS (443), SSH (22)
4. Click **"Review + Create"** → **"Create"**
5. After deployment, click **"Go to resource"**
6. Note the **Public IP address**

### Step 2: Open Additional Ports

1. In your VM, go to **Networking** → **Network settings**
2. Click **"Create port rule"** → **"Inbound"**
3. Add rules:
   - Port 3000 (Frontend) - Priority 1003
   - Port 4000 (Backend) - Priority 1004

### Step 3: Connect and Deploy

```bash
# Connect to VM
ssh azureuser@YOUR_VM_IP

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker $USER
newgrp docker

# Clone or copy your code
# Option A: If using GitHub
git clone https://github.com/YOUR_USERNAME/ai-epr-prototype.git
cd ai-epr-prototype

# Option B: Use SCP from local machine (see Option 1, Step 2)

# Get VM public IP
VM_IP=$(curl -s ifconfig.me)

# Create production config
cat > docker-compose.prod.yml <<EOF
services:
  backend:
    environment:
      - NODE_ENV=production
      - PORT=4000
      - CORS_ORIGIN=http://${VM_IP}:3000
    restart: always

  frontend:
    environment:
      - REACT_APP_API_BASE=http://${VM_IP}:4000/api
    restart: always
EOF

# Build and start
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait 3-5 minutes for build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Access Live App

Browser: `http://YOUR_VM_IP:3000`

---

## 🌐 Option 3: Add Custom Domain (Optional)

If you have a domain name (e.g., `yourdomain.com`):

### 1. Point Domain to VM

In your domain registrar's DNS settings:
- **Type**: A record
- **Host**: `@` (or subdomain like `epr-demo`)
- **Value**: Your VM IP (e.g., `20.123.45.67`)
- **TTL**: 3600

Wait 5-60 minutes for DNS propagation.

### 2. Install Nginx Reverse Proxy (on VM)

```bash
# Install nginx and certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Create nginx config
sudo tee /etc/nginx/sites-available/epr <<EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000/api;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/epr /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Get free SSL certificate (HTTPS)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Access via Domain

Browser: `https://yourdomain.com` 🎉

---

## 📊 Management Commands

### On Your VM:

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart application
docker-compose restart

# Stop application
docker-compose down

# Update application
git pull  # if using git
docker-compose up -d --build

# Check resource usage
docker stats
htop
```

### From Local Machine (Azure CLI):

```bash
# Check VM status
az vm get-instance-view \
  --name epr-prototype-vm \
  --resource-group epr-prototype-rg \
  --query instanceView.statuses[1] \
  --output table

# Stop VM (to save costs)
az vm deallocate \
  --resource-group epr-prototype-rg \
  --name epr-prototype-vm

# Start VM
az vm start \
  --resource-group epr-prototype-rg \
  --name epr-prototype-vm

# Delete everything
az group delete \
  --name epr-prototype-rg \
  --yes --no-wait
```

---

## 💰 Cost Management

### Typical Costs:
- **Standard_B2s VM**: ~$30/month (2 vCPUs, 4GB RAM)
- **Standard_B1ms VM**: ~$15/month (1 vCPU, 2GB RAM, budget option)
- **Storage**: ~$1/month
- **Bandwidth**: Usually included

### Save Money:
1. **Deallocate when not using**:
   ```bash
   az vm deallocate --resource-group epr-prototype-rg --name epr-prototype-vm
   ```
   Only charged for storage (~$1/month) when deallocated

2. **Auto-shutdown**: Configure in Azure Portal → VM → Auto-shutdown

3. **Use Spot Instance**: Save up to 90% (may be evicted)

4. **Monitor costs**: Azure Portal → Cost Management → Cost Analysis

---

## 🔧 Troubleshooting

### Can't connect to VM

```bash
# Check VM is running
az vm list --resource-group epr-prototype-rg --output table

# Check you can reach it
ping YOUR_VM_IP
```

### Application not loading

```bash
# SSH to VM
ssh azureuser@YOUR_VM_IP

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs

# Check if ports are open
sudo netstat -tlnp | grep -E ':(3000|4000)'

# Restart
docker-compose restart
```

### Frontend can't connect to backend

```bash
# Verify backend is working
curl http://localhost:4000/api/patients

# Check frontend environment
docker-compose config | grep REACT_APP_API_BASE

# Rebuild with correct config
docker-compose up -d --build frontend
```

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Create VM | `./azure-create-vm.sh` |
| Deploy app | `./azure-deploy.sh` (on VM) |
| SSH to VM | `ssh azureuser@YOUR_VM_IP` |
| View logs | `docker-compose logs -f` |
| Restart | `docker-compose restart` |
| Stop | `docker-compose down` |
| Update | `git pull && docker-compose up -d --build` |
| Stop VM | `az vm deallocate --resource-group epr-prototype-rg --name epr-prototype-vm` |
| Start VM | `az vm start --resource-group epr-prototype-rg --name epr-prototype-vm` |

---

## 🎯 Success Checklist

- [ ] Azure account created
- [ ] VM created with Ubuntu 22.04
- [ ] Ports opened (22, 80, 443, 3000, 4000)
- [ ] Docker installed on VM
- [ ] Application code copied to VM
- [ ] docker-compose.prod.yml configured
- [ ] Containers built and running
- [ ] Frontend accessible at `http://VM_IP:3000`
- [ ] Backend responding at `http://VM_IP:4000/api`
- [ ] (Optional) Domain configured
- [ ] (Optional) SSL certificate installed

---

## 🎉 You're Live!

Your EPR prototype is now deployed on Azure!

**Live URL**: `http://YOUR_VM_IP:3000`

**Share this URL with anyone!** 

They'll see:
- ✅ Professional EPR interface
- ✅ 10 realistic patient records
- ✅ 12 risk assessments per patient
- ✅ NICE/NHSE diagnosis scoring
- ✅ Laboratory results & NEWS2 tables
- ✅ Imaging reports & clinical assessments
- ✅ Modern green-themed UI

---

## 📚 Additional Resources

- **Detailed Guide**: `AZURE_DEPLOYMENT_GUIDE.md`
- **Docker Guide**: `DOCKER_READY.md`
- **Project README**: `README.md`
- **VM Info**: `azure-vm-info.txt` (created after running azure-create-vm.sh)

---

## 🆘 Need Help?

1. Check `AZURE_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
2. View Docker logs: `docker-compose logs -f`
3. Check Azure Portal for VM status
4. Verify NSG rules allow your ports

---

**Ready to deploy? Run `./azure-create-vm.sh` to start!** 🚀


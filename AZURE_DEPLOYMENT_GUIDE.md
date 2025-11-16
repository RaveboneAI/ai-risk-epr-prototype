# 🚀 Azure Deployment Guide - Ubuntu VM

Deploy your EPR prototype to Azure and get a live, permanent URL.

---

## 📋 Overview

**What you'll get:**
- Permanent public URL (e.g., `http://20.123.45.67:3000`)
- Optional custom domain (e.g., `https://epr-demo.yourdomain.com`)
- Professional cloud hosting on Azure
- Full control over the VM

**Cost:** ~$10-30/month depending on VM size

**Time:** 20-30 minutes

---

## Part 1: Create Azure VM

### Option A: Using Azure Portal (Easiest)

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com
   - Sign in (or create free account - $200 credit for 30 days)

2. **Create Virtual Machine**
   - Click **"Create a resource"**
   - Search for **"Virtual Machine"**
   - Click **Create**

3. **Configure VM:**

   **Basics Tab:**
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new → `epr-prototype-rg`
   - **VM Name**: `epr-prototype-vm`
   - **Region**: Choose closest to you (e.g., `East US`, `UK South`, `Australia East`)
   - **Image**: **Ubuntu Server 22.04 LTS**
   - **Size**: 
     - Recommended: `Standard_B2s` (2 vCPUs, 4GB RAM) - ~$30/month
     - Budget: `Standard_B1ms` (1 vCPU, 2GB RAM) - ~$15/month
     - Performance: `Standard_B2ms` (2 vCPUs, 8GB RAM) - ~$60/month

   **Administrator Account:**
   - **Authentication type**: SSH public key (recommended) or Password
   - **Username**: `azureuser` (or your choice)
   - **SSH public key source**: 
     - If you have SSH key: Use existing
     - If not: Generate new key pair → Download it!

   **Inbound Port Rules:**
   - ✅ Check **HTTP (80)**
   - ✅ Check **HTTPS (443)**
   - ✅ Check **SSH (22)**
   - ✅ **Add port**: 3000 (for frontend)
   - ✅ **Add port**: 4000 (for backend)

4. **Networking Tab:**
   - Leave defaults
   - Make sure **Public IP** is enabled

5. **Management Tab:**
   - Enable **Auto-shutdown** (optional, saves money)

6. **Review + Create**
   - Click **Create**
   - Wait 2-3 minutes for deployment

7. **Get Your VM's IP Address**
   - After deployment, click **"Go to resource"**
   - Copy the **Public IP address** (e.g., `20.123.45.67`)
   - Save this - you'll need it!

---

### Option B: Using Azure CLI (Faster)

```bash
# Install Azure CLI (if needed)
brew install azure-cli

# Login to Azure
az login

# Create resource group
az group create --name epr-prototype-rg --location eastus

# Create VM
az vm create \
  --resource-group epr-prototype-rg \
  --name epr-prototype-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Open ports for the app
az vm open-port --port 3000 --resource-group epr-prototype-rg --name epr-prototype-vm --priority 1001
az vm open-port --port 4000 --resource-group epr-prototype-rg --name epr-prototype-vm --priority 1002
az vm open-port --port 80 --resource-group epr-prototype-rg --name epr-prototype-vm --priority 1003
az vm open-port --port 443 --resource-group epr-prototype-rg --name epr-prototype-vm --priority 1004

# Get public IP
az vm list-ip-addresses --resource-group epr-prototype-rg --name epr-prototype-vm --output table
```

---

## Part 2: Setup VM and Deploy Application

### Step 1: Connect to Your VM

```bash
# Replace with your VM's public IP
ssh azureuser@20.123.45.67

# If using downloaded key file:
ssh -i ~/Downloads/epr-prototype-vm_key.pem azureuser@20.123.45.67
```

### Step 2: Install Docker on Ubuntu

Once connected to your VM, run these commands:

```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify installations
docker --version
docker-compose --version
```

### Step 3: Transfer Your Application to VM

**Option A: Using Git (Recommended)**

```bash
# On your VM:
cd ~

# If you've pushed to GitHub:
git clone https://github.com/YOUR_USERNAME/ai-epr-prototype.git
cd ai-epr-prototype

# If repo is private:
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/ai-epr-prototype.git
```

**Option B: Using SCP (Copy from your local machine)**

```bash
# On your LOCAL machine (not VM):
cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Create tarball
tar -czf epr-prototype.tar.gz .

# Copy to VM (replace IP and username)
scp epr-prototype.tar.gz azureuser@20.123.45.67:~

# Back on the VM:
tar -xzf epr-prototype.tar.gz
```

**Option C: Using Azure Cloud Shell Upload**

1. In Azure Portal, click Cloud Shell icon (>_)
2. Upload `epr-prototype.tar.gz`
3. Copy to VM: `scp epr-prototype.tar.gz azureuser@VM_IP:~`

### Step 4: Configure Environment for Azure

On your VM, update the docker-compose configuration:

```bash
cd ~/ai-epr-prototype  # or wherever you put the code

# Create production docker-compose override
cat > docker-compose.prod.yml <<EOF
services:
  backend:
    environment:
      - NODE_ENV=production
      - PORT=4000
      - CORS_ORIGIN=http://YOUR_VM_IP:3000
    restart: always

  frontend:
    environment:
      - REACT_APP_API_BASE=http://YOUR_VM_IP:4000/api
    restart: always
EOF

# Replace YOUR_VM_IP with actual IP (get it from Azure Portal or run: curl ifconfig.me)
VM_IP=$(curl -s ifconfig.me)
sed -i "s/YOUR_VM_IP/$VM_IP/g" docker-compose.prod.yml

# View the file to confirm
cat docker-compose.prod.yml
```

### Step 5: Build and Start Application

```bash
# Build and start containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# This will take 3-5 minutes for first build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Wait until you see:
# - backend: "Server running on port 4000"
# - frontend: nginx started
```

### Step 6: Verify Deployment

```bash
# Test backend API
curl http://localhost:4000/api/patients

# Should return JSON with patient list

# Test frontend
curl http://localhost:3000

# Should return HTML
```

---

## Part 3: Access Your Live Application

### Your Live URLs:

- **Frontend (share this)**: `http://YOUR_VM_IP:3000`
- **Backend API**: `http://YOUR_VM_IP:4000/api`

Example: `http://20.123.45.67:3000`

**Share the frontend URL with your colleague!** 🎉

---

## Part 4: Optional - Setup Custom Domain with HTTPS

### Prerequisites:
- Own a domain name (e.g., from Namecheap, GoDaddy, etc.)
- Domain DNS management access

### Step 1: Point Domain to Azure VM

1. Go to your domain registrar's DNS settings
2. Add/Update A record:
   - **Host**: `@` (or subdomain like `epr-demo`)
   - **Type**: `A`
   - **Value**: Your VM's public IP (e.g., `20.123.45.67`)
   - **TTL**: `3600`

3. Wait 5-60 minutes for DNS propagation

### Step 2: Install Nginx Reverse Proxy

```bash
# On your VM:
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
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/epr /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 3: Get Free SSL Certificate (HTTPS)

```bash
# Get SSL certificate from Let's Encrypt (free)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (option 2)

# Certificate auto-renews every 90 days
```

### Step 4: Update Frontend Environment

```bash
cd ~/ai-epr-prototype

# Update docker-compose.prod.yml
nano docker-compose.prod.yml

# Change frontend environment to:
# - REACT_APP_API_BASE=https://yourdomain.com/api

# Rebuild frontend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend
```

### Your Secure URLs:

- **Frontend**: `https://yourdomain.com` ✅
- **Backend API**: `https://yourdomain.com/api` ✅

---

## Part 5: Management Commands

### View Application Status

```bash
# SSH into VM
ssh azureuser@YOUR_VM_IP

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Check resource usage
docker stats
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# Full restart
docker-compose down
docker-compose up -d
```

### Update Application

```bash
# Pull latest code (if using Git)
git pull

# Rebuild and restart
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Or just rebuild one service
docker-compose up -d --build frontend
```

### View System Resources

```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top

# Docker disk usage
docker system df
```

### Cleanup Old Images

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a
```

---

## Part 6: Monitoring and Maintenance

### Setup Auto-start on Reboot

```bash
# Create systemd service
sudo tee /etc/systemd/system/epr-prototype.service <<EOF
[Unit]
Description=EPR Prototype Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/azureuser/ai-epr-prototype
ExecStart=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable service
sudo systemctl enable epr-prototype.service

# Start service
sudo systemctl start epr-prototype.service

# Check status
sudo systemctl status epr-prototype.service
```

### Setup Automatic Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Monitor Logs

```bash
# Follow all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Logs from last hour
docker-compose logs --since 1h
```

---

## Part 7: Firewall Configuration (Azure NSG)

Ensure these ports are open in Azure Network Security Group:

### Via Azure Portal:

1. Go to your VM resource
2. Click **Networking** → **Network settings**
3. Click **Create port rule** → **Inbound**
4. Add rules for:

| Port | Protocol | Name | Priority |
|------|----------|------|----------|
| 22 | TCP | SSH | 100 |
| 80 | TCP | HTTP | 1001 |
| 443 | TCP | HTTPS | 1002 |
| 3000 | TCP | Frontend | 1003 |
| 4000 | TCP | Backend | 1004 |

### Via Azure CLI:

```bash
# SSH
az network nsg rule create --resource-group epr-prototype-rg --nsg-name epr-prototype-vmNSG --name AllowSSH --priority 100 --destination-port-ranges 22 --protocol Tcp --access Allow

# HTTP
az network nsg rule create --resource-group epr-prototype-rg --nsg-name epr-prototype-vmNSG --name AllowHTTP --priority 1001 --destination-port-ranges 80 --protocol Tcp --access Allow

# HTTPS
az network nsg rule create --resource-group epr-prototype-rg --nsg-name epr-prototype-vmNSG --name AllowHTTPS --priority 1002 --destination-port-ranges 443 --protocol Tcp --access Allow

# Frontend
az network nsg rule create --resource-group epr-prototype-rg --nsg-name epr-prototype-vmNSG --name AllowFrontend --priority 1003 --destination-port-ranges 3000 --protocol Tcp --access Allow

# Backend
az network nsg rule create --resource-group epr-prototype-rg --nsg-name epr-prototype-vmNSG --name AllowBackend --priority 1004 --destination-port-ranges 4000 --protocol Tcp --access Allow
```

---

## Part 8: Troubleshooting

### Can't Connect to VM

```bash
# Check VM is running in Azure Portal
# Verify NSG rules allow your IP
# Test connection:
ping YOUR_VM_IP
telnet YOUR_VM_IP 22
```

### Application Not Loading

```bash
# Check Docker containers
docker-compose ps

# View logs
docker-compose logs

# Check if ports are listening
sudo netstat -tlnp | grep -E ':(3000|4000)'

# Restart containers
docker-compose restart
```

### Frontend Can't Connect to Backend

```bash
# Check backend is running
curl http://localhost:4000/api/patients

# Check CORS settings in docker-compose.prod.yml
# Verify REACT_APP_API_BASE points to correct backend URL

# Rebuild frontend with correct env
docker-compose up -d --build frontend
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Clean package cache
sudo apt clean
sudo apt autoremove
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart containers
docker-compose restart

# Consider upgrading VM size in Azure Portal
```

---

## Part 9: Cost Optimization

### Reduce Costs:

1. **Auto-shutdown**: Configure in Azure Portal → VM → Auto-shutdown
2. **Deallocate when not in use**:
   ```bash
   az vm deallocate --resource-group epr-prototype-rg --name epr-prototype-vm
   az vm start --resource-group epr-prototype-rg --name epr-prototype-vm
   ```
3. **Use Spot instances**: Save up to 90% (may be evicted)
4. **Rightsize VM**: Start small, upgrade if needed

### Monitor Costs:

- Azure Portal → Cost Management → Cost Analysis
- Set up budget alerts

---

## Part 10: Security Best Practices

### Immediate Security Steps:

```bash
# 1. Setup firewall (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 4000/tcp
sudo ufw enable

# 2. Keep system updated
sudo apt update && sudo apt upgrade -y

# 3. Disable password authentication (if using SSH keys)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd

# 4. Setup fail2ban (blocks brute force attacks)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### For Production Use:

- [ ] Add authentication to your app
- [ ] Use HTTPS only (no HTTP)
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker and system packages updated
- [ ] Use Azure Key Vault for secrets
- [ ] Setup Azure Monitor for alerting

---

## Quick Reference Commands

```bash
# SSH to VM
ssh azureuser@YOUR_VM_IP

# View containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart app
docker-compose restart

# Update app
git pull && docker-compose up -d --build

# Stop app
docker-compose down

# Start app
docker-compose up -d

# Check disk space
df -h

# Check memory
free -h

# Check VM status (from local machine)
az vm get-instance-view --name epr-prototype-vm --resource-group epr-prototype-rg --query instanceView.statuses[1] --output table
```

---

## Summary Checklist

- [ ] Azure VM created with Ubuntu 22.04
- [ ] Ports opened (22, 80, 443, 3000, 4000)
- [ ] Docker and Docker Compose installed
- [ ] Application code deployed to VM
- [ ] docker-compose.prod.yml configured with VM IP
- [ ] Docker containers built and running
- [ ] Frontend accessible at `http://VM_IP:3000`
- [ ] Backend API responding at `http://VM_IP:4000/api`
- [ ] (Optional) Domain pointed to VM
- [ ] (Optional) SSL certificate installed
- [ ] Auto-start on reboot configured
- [ ] Firewall (UFW) configured
- [ ] Cost alerts setup in Azure

---

## Your Live URL

After following this guide, your EPR prototype will be live at:

**Without custom domain:**
- Frontend: `http://YOUR_VM_IP:3000`
- Example: `http://20.123.45.67:3000`

**With custom domain + SSL:**
- Frontend: `https://yourdomain.com`
- Example: `https://epr-demo.example.com`

**Share this URL with anyone!** 🎉

---

## Next Steps

1. Create Azure VM (10 minutes)
2. SSH into VM and install Docker (5 minutes)
3. Deploy application (5 minutes)
4. Test and share URL! ✅

**Estimated Total Time**: 20-30 minutes

**Monthly Cost**: ~$10-30 (can deallocate when not using)

---

## Support

If you encounter issues:
- Check Azure Portal for VM status
- Review `docker-compose logs`
- Verify NSG/firewall rules
- Ensure docker-compose.prod.yml has correct IPs

---

**Ready to deploy? Start with Part 1: Create Azure VM!** 🚀


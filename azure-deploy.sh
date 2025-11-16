#!/bin/bash

# Azure Deployment Helper Script
# This script helps you deploy the EPR prototype to Azure

set -e  # Exit on any error

echo "🚀 Azure EPR Deployment Helper"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're on the VM or local machine
if [ -f /etc/os-release ]; then
    source /etc/os-release
    if [ "$ID" = "ubuntu" ]; then
        ON_VM=true
    fi
fi

if [ "$ON_VM" = true ]; then
    echo -e "${GREEN}✓ Running on Azure VM (Ubuntu)${NC}"
    echo ""
    
    # Get VM's public IP
    echo "🔍 Detecting VM public IP..."
    VM_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "")
    
    if [ -z "$VM_IP" ]; then
        echo -e "${RED}❌ Could not detect public IP${NC}"
        read -p "Enter your VM's public IP address: " VM_IP
    else
        echo -e "${GREEN}✓ VM Public IP: $VM_IP${NC}"
    fi
    
    echo ""
    echo "📝 Creating production configuration..."
    
    # Create docker-compose.prod.yml
    cat > docker-compose.prod.yml <<EOF
services:
  backend:
    environment:
      - NODE_ENV=production
      - PORT=4000
      - CORS_ORIGIN=http://${VM_IP}:3000,http://localhost:3000
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    environment:
      - REACT_APP_API_BASE=http://${VM_IP}:4000/api
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
EOF
    
    echo -e "${GREEN}✓ Configuration created${NC}"
    echo ""
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker not found. Installing Docker...${NC}"
        
        sudo apt-get update
        sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        sudo usermod -aG docker $USER
        
        echo -e "${GREEN}✓ Docker installed${NC}"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker Compose not found. Installing...${NC}"
        
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        echo -e "${GREEN}✓ Docker Compose installed${NC}"
    fi
    
    echo ""
    echo "🏗️  Building and starting containers..."
    echo "This may take 3-5 minutes..."
    echo ""
    
    # Build and start
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check status
    docker-compose ps
    
    echo ""
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}🌐 Your Live URLs:${NC}"
    echo ""
    echo -e "  ${GREEN}Frontend:${NC} http://${VM_IP}:3000"
    echo -e "  ${GREEN}Backend:${NC}  http://${VM_IP}:4000/api"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs:    docker-compose logs -f"
    echo "  Restart:      docker-compose restart"
    echo "  Stop:         docker-compose down"
    echo "  Update:       git pull && docker-compose up -d --build"
    echo ""
    echo -e "${GREEN}Share the frontend URL with your colleagues!${NC} 🎉"
    echo ""
    
else
    # Running on local machine
    echo -e "${BLUE}Running on local machine${NC}"
    echo ""
    echo "This script is designed to run ON the Azure VM."
    echo ""
    echo "📋 To deploy to Azure, follow these steps:"
    echo ""
    echo "1️⃣  Create Azure VM with Ubuntu 22.04"
    echo "   • Size: Standard_B2s (2 vCPUs, 4GB RAM)"
    echo "   • Open ports: 22, 80, 443, 3000, 4000"
    echo ""
    echo "2️⃣  Copy this project to the VM:"
    echo ""
    echo "   Option A - Using Git:"
    echo "   ssh azureuser@YOUR_VM_IP"
    echo "   git clone https://github.com/YOUR_USERNAME/ai-epr-prototype.git"
    echo "   cd ai-epr-prototype"
    echo ""
    echo "   Option B - Using SCP:"
    echo "   tar -czf epr-prototype.tar.gz ."
    echo "   scp epr-prototype.tar.gz azureuser@YOUR_VM_IP:~"
    echo "   ssh azureuser@YOUR_VM_IP"
    echo "   tar -xzf epr-prototype.tar.gz && cd ai-epr-prototype"
    echo ""
    echo "3️⃣  Run this script on the VM:"
    echo "   ./azure-deploy.sh"
    echo ""
    echo "📖 For detailed instructions, see: AZURE_DEPLOYMENT_GUIDE.md"
    echo ""
fi


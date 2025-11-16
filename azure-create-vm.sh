#!/bin/bash

# Azure VM Creation Script
# Creates an Azure VM ready for EPR prototype deployment

set -e  # Exit on any error

echo "🚀 Azure VM Creation for EPR Prototype"
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found${NC}"
    echo ""
    echo "Please install Azure CLI first:"
    echo "  Mac:    brew install azure-cli"
    echo "  Linux:  curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    echo "  Windows: https://aka.ms/installazurecliwindows"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Azure CLI found${NC}"
echo ""

# Check if logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged into Azure${NC}"
    echo "Opening browser for login..."
    az login
fi

echo -e "${GREEN}✓ Logged into Azure${NC}"
echo ""

# Get configuration from user
echo "📋 Configuration"
echo "────────────────"
echo ""

read -p "Resource Group Name [epr-prototype-rg]: " RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-epr-prototype-rg}

read -p "VM Name [epr-prototype-vm]: " VM_NAME
VM_NAME=${VM_NAME:-epr-prototype-vm}

read -p "Admin Username [azureuser]: " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-azureuser}

echo ""
echo "Select Azure Region:"
echo "  1) East US"
echo "  2) West Europe"
echo "  3) UK South"
echo "  4) Southeast Asia"
echo "  5) Australia East"
read -p "Choice [1]: " REGION_CHOICE
REGION_CHOICE=${REGION_CHOICE:-1}

case $REGION_CHOICE in
    1) LOCATION="eastus" ;;
    2) LOCATION="westeurope" ;;
    3) LOCATION="uksouth" ;;
    4) LOCATION="southeastasia" ;;
    5) LOCATION="australiaeast" ;;
    *) LOCATION="eastus" ;;
esac

echo ""
echo "Select VM Size:"
echo "  1) Standard_B1ms - 1 vCPU, 2GB RAM (~$15/month) - Budget"
echo "  2) Standard_B2s  - 2 vCPUs, 4GB RAM (~$30/month) - Recommended"
echo "  3) Standard_B2ms - 2 vCPUs, 8GB RAM (~$60/month) - Performance"
read -p "Choice [2]: " SIZE_CHOICE
SIZE_CHOICE=${SIZE_CHOICE:-2}

case $SIZE_CHOICE in
    1) VM_SIZE="Standard_B1ms" ;;
    2) VM_SIZE="Standard_B2s" ;;
    3) VM_SIZE="Standard_B2ms" ;;
    *) VM_SIZE="Standard_B2s" ;;
esac

echo ""
echo "═══════════════════════════════════════"
echo "Configuration Summary:"
echo "═══════════════════════════════════════"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  VM Name:        $VM_NAME"
echo "  Location:       $LOCATION"
echo "  VM Size:        $VM_SIZE"
echo "  Admin User:     $ADMIN_USER"
echo "  Image:          Ubuntu 22.04 LTS"
echo "═══════════════════════════════════════"
echo ""

read -p "Proceed with creation? (y/n) " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🏗️  Creating Azure Resources..."
echo ""

# Create resource group
echo "📦 Creating resource group..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output table

echo -e "${GREEN}✓ Resource group created${NC}"
echo ""

# Create VM
echo "🖥️  Creating virtual machine..."
echo "This will take 2-3 minutes..."
echo ""

VM_RESULT=$(az vm create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --image Ubuntu2204 \
    --size "$VM_SIZE" \
    --admin-username "$ADMIN_USER" \
    --generate-ssh-keys \
    --public-ip-sku Standard \
    --output json)

PUBLIC_IP=$(echo $VM_RESULT | jq -r '.publicIpAddress')

echo -e "${GREEN}✓ VM created${NC}"
echo ""

# Open required ports
echo "🔓 Opening network ports..."

az vm open-port \
    --port 22 \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --priority 1000 \
    --output none

az vm open-port \
    --port 80 \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --priority 1001 \
    --output none

az vm open-port \
    --port 443 \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --priority 1002 \
    --output none

az vm open-port \
    --port 3000 \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --priority 1003 \
    --output none

az vm open-port \
    --port 4000 \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --priority 1004 \
    --output none

echo -e "${GREEN}✓ Ports opened (22, 80, 443, 3000, 4000)${NC}"
echo ""

# Save connection info
cat > azure-vm-info.txt <<EOF
Azure VM Information
====================

Resource Group: $RESOURCE_GROUP
VM Name:        $VM_NAME
Location:       $LOCATION
VM Size:        $VM_SIZE
Public IP:      $PUBLIC_IP
Admin User:     $ADMIN_USER

SSH Command:
  ssh $ADMIN_USER@$PUBLIC_IP

Frontend URL (after deployment):
  http://$PUBLIC_IP:3000

Backend URL (after deployment):
  http://$PUBLIC_IP:4000/api

Deallocate VM (to save costs):
  az vm deallocate --resource-group $RESOURCE_GROUP --name $VM_NAME

Start VM:
  az vm start --resource-group $RESOURCE_GROUP --name $VM_NAME

Delete VM (and all resources):
  az group delete --name $RESOURCE_GROUP --yes --no-wait
EOF

echo ""
echo "═══════════════════════════════════════"
echo -e "${GREEN}✅ VM Created Successfully!${NC}"
echo "═══════════════════════════════════════"
echo ""
echo -e "${BLUE}VM Public IP:${NC} ${GREEN}$PUBLIC_IP${NC}"
echo ""
echo "📝 Connection details saved to: azure-vm-info.txt"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Connect to your VM:"
echo "   ${BLUE}ssh $ADMIN_USER@$PUBLIC_IP${NC}"
echo ""
echo "2️⃣  Copy your application to the VM:"
echo ""
echo "   Option A - Using Git (if you have GitHub repo):"
echo "   ${BLUE}git clone https://github.com/YOUR_USERNAME/ai-epr-prototype.git${NC}"
echo "   ${BLUE}cd ai-epr-prototype${NC}"
echo ""
echo "   Option B - Using SCP from your local machine:"
echo "   ${BLUE}cd /Users/Kerry_AI/ai-results-risk-prototype-2${NC}"
echo "   ${BLUE}tar -czf epr-prototype.tar.gz .${NC}"
echo "   ${BLUE}scp epr-prototype.tar.gz $ADMIN_USER@$PUBLIC_IP:~${NC}"
echo "   ${BLUE}ssh $ADMIN_USER@$PUBLIC_IP${NC}"
echo "   ${BLUE}tar -xzf epr-prototype.tar.gz${NC}"
echo ""
echo "3️⃣  Deploy the application on the VM:"
echo "   ${BLUE}./azure-deploy.sh${NC}"
echo ""
echo "4️⃣  Access your live application:"
echo "   ${GREEN}http://$PUBLIC_IP:3000${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tips:"
echo "  • Keep azure-vm-info.txt safe (has connection details)"
echo "  • To save costs, deallocate VM when not in use"
echo "  • VM auto-starts on reboot with your app"
echo ""
echo "📖 See AZURE_DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""


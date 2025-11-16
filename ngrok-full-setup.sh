#!/bin/bash

# Complete Ngrok Setup - Frontend + Backend
# This creates TWO tunnels so the frontend can reach the backend

echo "🚀 Complete Ngrok Setup (Frontend + Backend)"
echo "============================================="
echo ""

cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Check Docker
echo "🔍 Checking Docker containers..."
if ! docker-compose ps | grep -q "Up"; then
    echo "⚠️  Starting Docker containers..."
    docker-compose up -d
    sleep 10
fi

echo "✅ Docker containers running"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ Ngrok not found. Please run ./ngrok-quickstart.sh first"
    exit 1
fi

echo "📝 Creating ngrok configuration with TWO tunnels..."
echo ""

# Create ngrok config file
mkdir -p ~/.ngrok2

cat > ~/.ngrok2/ngrok.yml <<EOF
version: "2"
tunnels:
  frontend:
    proto: http
    addr: 3000
  backend:
    proto: http
    addr: 4000
EOF

echo "✅ Configuration created"
echo ""
echo "🌐 Starting BOTH tunnels (frontend + backend)..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT: After tunnels start, follow these steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Note BOTH URLs that appear"
echo "   • frontend: https://xxxx.ngrok.io (port 3000)"
echo "   • backend:  https://yyyy.ngrok.io (port 4000)"
echo ""
echo "2️⃣  Open a NEW terminal and run:"
echo "   cd /Users/Kerry_AI/ai-results-risk-prototype-2"
echo "   ./update-frontend-api.sh https://yyyy.ngrok.io"
echo ""
echo "3️⃣  Then share the FRONTEND URL with your colleague!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Enter to continue..."
read

# Start both tunnels
ngrok start --all --config ~/.ngrok2/ngrok.yml


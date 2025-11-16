#!/bin/bash

# Quick Ngrok Setup Script
# Gets you a free shareable URL in 30 seconds

echo "🚀 Free Shareable URL - Ngrok Setup"
echo "===================================="
echo ""

# Check if ngrok is already installed
if command -v ngrok &> /dev/null; then
    echo "✅ Ngrok already installed"
else
    echo "📦 Installing ngrok..."
    
    # Download ngrok for Mac
    cd /tmp
    curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip
    
    if [ $? -ne 0 ]; then
        echo "❌ Download failed. Please download manually from: https://ngrok.com/download"
        exit 1
    fi
    
    # Unzip
    unzip -o ngrok-v3-stable-darwin-amd64.zip
    
    # Make executable and move to /usr/local/bin
    chmod +x ngrok
    
    echo "🔐 Need sudo permission to install to /usr/local/bin..."
    sudo mv ngrok /usr/local/bin/
    
    # Clean up
    rm ngrok-v3-stable-darwin-amd64.zip
    
    echo "✅ Ngrok installed"
fi

echo ""
echo "🔍 Checking Docker containers..."

cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Check if Docker is running
if ! docker-compose ps | grep -q "Up"; then
    echo "⚠️  Docker containers not running. Starting..."
    docker-compose up -d
    echo "⏳ Waiting for containers to be ready..."
    sleep 10
fi

echo "✅ Docker containers running"
echo ""
echo "🌐 Creating public tunnel..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Your shareable URL will appear below!"
echo "Look for the line that says 'Forwarding'"
echo ""
echo "Example: https://abc123.ngrok.io -> http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Keep this terminal window open!"
echo "   The URL only works while ngrok is running."
echo ""
echo "Press Ctrl+C to stop sharing"
echo ""

# Start ngrok
ngrok http 3000


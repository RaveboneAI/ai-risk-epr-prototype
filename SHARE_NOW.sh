#!/bin/bash

# Quick share script for EPR prototype
# This creates a public tunnel to your local Docker container

echo "🚀 EPR Prototype - Quick Share Setup"
echo "===================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    brew install ngrok
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install ngrok via Homebrew"
        echo "Please install manually from: https://ngrok.com/download"
        exit 1
    fi
fi

echo "✅ Ngrok installed"
echo ""
echo "🌐 Creating public tunnel..."
echo "Your shareable URL will appear below:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start ngrok
ngrok http 3000


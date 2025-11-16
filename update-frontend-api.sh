#!/bin/bash

# Update Frontend to Use Ngrok Backend URL

if [ -z "$1" ]; then
    echo "❌ Error: Backend URL required"
    echo ""
    echo "Usage: ./update-frontend-api.sh https://your-backend.ngrok.io"
    echo ""
    echo "Get your backend URL from the ngrok terminal (port 4000)"
    exit 1
fi

BACKEND_URL=$1

echo "🔧 Updating frontend to use backend: $BACKEND_URL"
echo ""

cd /Users/Kerry_AI/ai-results-risk-prototype-2

# Create updated docker-compose override
cat > docker-compose.ngrok.yml <<EOF
services:
  frontend:
    environment:
      - REACT_APP_API_BASE=${BACKEND_URL}/api
    restart: always
EOF

echo "📝 Configuration updated"
echo ""
echo "🔄 Rebuilding frontend container..."

# Rebuild frontend with new env var
docker-compose -f docker-compose.yml -f docker-compose.ngrok.yml up -d --build frontend

echo ""
echo "⏳ Waiting for frontend to rebuild (this takes 2-3 minutes)..."
echo ""

# Wait for build
sleep 120

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Frontend updated!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your shareable URL:"
echo "   Check your ngrok terminal for the FRONTEND URL (port 3000)"
echo ""
echo "🎉 Share that URL with your colleague - patients should now load!"
echo ""


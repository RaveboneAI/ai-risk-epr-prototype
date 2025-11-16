#!/bin/bash

# Quick diagnostic for ngrok setup

echo "🔍 Ngrok Setup Diagnostic"
echo "=========================="
echo ""

cd /Users/Kerry_AI/ai-results-risk-prototype-2

echo "1️⃣  Checking Docker containers..."
docker-compose ps | grep -E "(backend|frontend)"
echo ""

echo "2️⃣  Testing backend directly (port 4000)..."
BACKEND_TEST=$(curl -s http://localhost:4000/api/patients | jq -r '.status' 2>/dev/null)
if [ "$BACKEND_TEST" = "success" ]; then
    echo "   ✅ Backend API responding correctly"
else
    echo "   ❌ Backend API not responding"
    exit 1
fi
echo ""

echo "3️⃣  Testing through nginx proxy (port 3000)..."
PROXY_TEST=$(curl -s http://localhost:3000/api/patients | jq -r '.status' 2>/dev/null)
if [ "$PROXY_TEST" = "success" ]; then
    echo "   ✅ Nginx proxy working correctly"
else
    echo "   ❌ Nginx proxy not working"
    exit 1
fi
echo ""

echo "4️⃣  Checking recent backend logs for API calls..."
echo "   Recent requests:"
docker-compose logs backend --tail=10 | grep -i "GET\|POST\|patients" || echo "   No recent API calls logged"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All local tests PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your ngrok URL:"
echo "   https://resplendent-cherilyn-swindlingly.ngrok-free.dev"
echo ""
echo "📋 Next steps to troubleshoot:"
echo ""
echo "1️⃣  Open ngrok URL in PRIVATE/INCOGNITO browser:"
echo "   https://resplendent-cherilyn-swindlingly.ngrok-free.dev/api/patients"
echo ""
echo "2️⃣  You should see:"
echo "   • Ngrok warning page → Click 'Visit Site'"
echo "   • Then: JSON data with patient list"
echo ""
echo "3️⃣  After clicking through warning, go to main page:"
echo "   https://resplendent-cherilyn-swindlingly.ngrok-free.dev"
echo ""
echo "4️⃣  Press F12 to open browser console"
echo "   • Check Console tab for any red errors"
echo "   • Check Network tab to see if /api/patients is called"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Most Common Issue:"
echo "   Ngrok free tier shows a warning page that blocks API calls"
echo "   until you click through it. Visit /api/patients first!"
echo ""


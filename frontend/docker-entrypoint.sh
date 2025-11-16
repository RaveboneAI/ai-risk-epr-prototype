#!/bin/sh

# Docker entrypoint script for frontend
# This replaces the backend hostname in nginx config with the actual backend URL

set -e

# If BACKEND_URL is set, update nginx config to use it
if [ -n "$BACKEND_URL" ]; then
    echo "🔧 Configuring nginx to proxy to: $BACKEND_URL"
    
    # Replace 'backend:4000' with the actual backend URL in nginx config
    sed -i "s|http://backend:4000|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf
    
    echo "✅ Nginx configuration updated"
fi

# Start nginx
echo "🚀 Starting nginx..."
exec nginx -g 'daemon off;'


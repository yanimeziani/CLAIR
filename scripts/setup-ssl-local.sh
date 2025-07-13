#!/bin/bash

# Local SSL Setup Script for Development
# This creates self-signed certificates for local development

set -e

echo "🔐 Setting up self-signed SSL certificates for local development"

# Create self-signed certificates directory
mkdir -p ssl-local/live/dev.meziani.org

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl-local/live/dev.meziani.org/privkey.pem \
    -out ssl-local/live/dev.meziani.org/fullchain.pem \
    -subj "/C=US/ST=Local/L=Local/O=Development/OU=Dev/CN=dev.meziani.org"

# Create chain.pem (copy of fullchain for compatibility)
cp ssl-local/live/dev.meziani.org/fullchain.pem ssl-local/live/dev.meziani.org/chain.pem

echo "✅ Self-signed certificates created"

# Update docker-compose to use local SSL config and mount local certificates
sed -i.bak 's|irielle-init.conf:/etc/nginx/conf.d/default.conf|irielle.conf:/etc/nginx/conf.d/default.conf|' docker-compose.yml

# Add volume mount for local SSL certificates
if ! grep -q "ssl-local:/etc/letsencrypt" docker-compose.yml; then
    sed -i '' '/certbot_data:\/etc\/letsencrypt/a\
      - ./ssl-local:/etc/letsencrypt\
' docker-compose.yml
fi

echo "🔄 Restarting services with SSL configuration..."
docker-compose down
docker-compose up -d nginx

echo "🎉 Local SSL setup complete!"
echo "⚠️  Note: Browsers will show security warnings for self-signed certificates"
echo "📋 To trust the certificate:"
echo "   - Chrome/Safari: Click 'Advanced' → 'Proceed to dev.meziani.org'"
echo "   - Firefox: Click 'Advanced' → 'Accept the Risk'"

echo "🌐 Your site is now available at:"
echo "   - https://dev.meziani.org (with browser warning)"
echo "   - http://dev.meziani.org (redirects to HTTPS)"
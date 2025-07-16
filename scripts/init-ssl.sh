#!/bin/bash

# SSL Certificate Initialization Script
# This script safely initializes Let's Encrypt certificates

set -e

DOMAIN="dev.meziani.org"
EMAIL="contact@meziani.org"

echo "🔒 Initializing SSL certificates for $DOMAIN"

# Check if certificates already exist
if docker volume inspect irielle_certbot_data >/dev/null 2>&1; then
    echo "📁 Checking existing certificates..."
    if docker run --rm -v irielle_certbot_data:/etc/letsencrypt alpine ls -la /etc/letsencrypt/live/$DOMAIN/fullchain.pem 2>/dev/null; then
        echo "✅ SSL certificates already exist. Skipping initialization."
        exit 0
    fi
fi

echo "🚀 Starting certificate initialization process..."

# Step 1: Start services without SSL first
echo "📦 Starting core services..."
docker-compose up -d mongodb chromadb ollama ai-backend frontend

# Step 2: Start Nginx with HTTP-only configuration
echo "🌐 Starting Nginx with HTTP-only configuration..."
cp nginx/conf.d/irielle.conf nginx/conf.d/default.conf
docker-compose up -d nginx

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Step 3: Test HTTP access
echo "🔍 Testing HTTP access..."
if ! curl -f http://localhost/.well-known/acme-challenge/ 2>/dev/null; then
    echo "⚠️  HTTP access test failed, but continuing..."
fi

# Step 4: Generate SSL certificate
echo "🔐 Generating Let's Encrypt certificate..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN

# Step 5: Switch to SSL configuration
echo "🔄 Switching to SSL configuration..."
cp nginx/conf.d/irielle-ssl.conf nginx/conf.d/default.conf

# Step 6: Restart Nginx with SSL
echo "🔁 Restarting Nginx with SSL..."
docker-compose restart nginx

# Step 7: Verify SSL
echo "✅ Verifying SSL setup..."
sleep 5
if docker-compose ps nginx | grep -q "Up"; then
    echo "🎉 SSL setup completed successfully!"
    echo "🌐 Your site should now be available at: https://$DOMAIN"
else
    echo "❌ SSL setup failed. Check logs with: docker-compose logs nginx"
    exit 1
fi
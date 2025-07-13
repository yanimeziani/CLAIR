#!/bin/bash

# SSL Setup Script for Irielle Platform
set -e

echo "🔐 Setting up SSL certificates for dev.meziani.org"

# Step 1: Start with HTTP-only configuration
echo "📝 Step 1: Starting with HTTP-only configuration..."
docker-compose up -d nginx

# Wait for nginx to be ready
echo "⏳ Waiting for Nginx to be ready..."
sleep 10

# Step 2: Test domain connectivity
echo "🌐 Step 2: Testing domain connectivity..."
if curl -f http://dev.meziani.org/.well-known/acme-challenge/test 2>/dev/null; then
    echo "✅ Domain is accessible"
else
    echo "❌ Domain is not accessible. Please check:"
    echo "   - DNS records point to this server"
    echo "   - Firewall allows HTTP (port 80) traffic"
    echo "   - Domain propagation is complete"
    exit 1
fi

# Step 3: Test Certbot with dry-run
echo "🧪 Step 3: Testing certificate generation (dry-run)..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email contact@meziani.org \
    --agree-tos \
    --no-eff-email \
    --staging \
    --dry-run \
    -d dev.meziani.org

if [ $? -eq 0 ]; then
    echo "✅ Dry-run successful"
else
    echo "❌ Dry-run failed. Check domain accessibility and DNS settings."
    exit 1
fi

# Step 4: Generate staging certificates
echo "🔧 Step 4: Generating staging certificates..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email contact@meziani.org \
    --agree-tos \
    --no-eff-email \
    --staging \
    -d dev.meziani.org

# Step 5: Switch to SSL configuration
echo "🔄 Step 5: Switching to SSL configuration..."
docker-compose down
# Update docker-compose to use SSL config
sed -i.bak 's|irielle-init.conf:/etc/nginx/conf.d/default.conf|irielle.conf:/etc/nginx/conf.d/default.conf|' docker-compose.yml
docker-compose up -d

# Step 6: Generate production certificates
echo "🏁 Step 6: Generating production certificates..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email contact@meziani.org \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d dev.meziani.org

# Step 7: Reload nginx with production certificates
echo "♻️  Step 7: Reloading Nginx with production certificates..."
docker-compose exec nginx nginx -s reload

echo "🎉 SSL setup complete! Your site should now be accessible at:"
echo "   - http://dev.meziani.org (redirects to HTTPS)"
echo "   - https://dev.meziani.org"

# Setup auto-renewal
echo "⏰ Setting up certificate auto-renewal..."
cat > /tmp/renew-certs.sh << 'EOF'
#!/bin/bash
cd /path/to/your/project
docker-compose run --rm certbot renew --quiet
docker-compose exec nginx nginx -s reload
EOF

echo "📋 To complete setup:"
echo "1. Move /tmp/renew-certs.sh to your preferred location"
echo "2. Update the path in the script"
echo "3. Add to crontab: 0 12 * * * /path/to/renew-certs.sh"
#!/bin/bash

# SSL Setup Script for Irielle Platform
set -e

echo "🔐 Setting up SSL certificates for dev.meziani.org"

# Step 1: Start with HTTP-only configuration
echo "📝 Step 1: Starting with HTTP-only configuration..."
# Backup current configs
cp nginx/conf.d/irielle.conf nginx/conf.d/irielle.conf.backup 2>/dev/null || true
cp nginx/conf.d/irielle-ssl.conf nginx/conf.d/irielle-ssl.conf.backup 2>/dev/null || true

# Set up init config for certificate generation
cp nginx/conf.d/irielle-init.conf nginx/conf.d/irielle.conf
docker-compose up -d nginx

# Wait for nginx to be ready
echo "⏳ Waiting for Nginx to be ready..."
sleep 15

# Test nginx is responding
for i in {1..5}; do
    if curl -f http://localhost 2>/dev/null; then
        echo "✅ Nginx is responding locally"
        break
    fi
    echo "Waiting for nginx... (attempt $i/5)"
    sleep 5
done

# Step 2: Test domain connectivity
echo "🌐 Step 2: Testing domain connectivity..."
if curl -f http://dev.meziani.org 2>/dev/null; then
    echo "✅ Domain is accessible"
else
    echo "❌ Domain is not accessible. Please check:"
    echo "   - DNS records point to this server (should point to $(curl -s ifconfig.me))"
    echo "   - Firewall allows HTTP (port 80) and HTTPS (port 443) traffic"
    echo "   - Domain propagation is complete"
    echo "   - Local nginx is working: $(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "FAILED")"
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
# Copy SSL config to main config
cp nginx/conf.d/irielle-ssl.conf nginx/conf.d/irielle.conf

# Test nginx config before restart
if docker-compose exec nginx nginx -t 2>/dev/null; then
    echo "✅ Nginx config test passed"
    docker-compose restart nginx
else
    echo "❌ Nginx config test failed, reverting..."
    cp nginx/conf.d/irielle-init.conf nginx/conf.d/irielle.conf
    docker-compose restart nginx
    exit 1
fi

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

echo "🎉 SSL setup complete! Testing endpoints..."

# Test the deployment
echo "🧪 Testing HTTP redirect..."
if curl -s -o /dev/null -w "%{http_code}" http://dev.meziani.org | grep -q "301\|302"; then
    echo "✅ HTTP redirect is working"
else
    echo "⚠️ HTTP redirect might not be working properly"
fi

echo "🧪 Testing HTTPS..."
if curl -f https://dev.meziani.org 2>/dev/null; then
    echo "✅ HTTPS is working perfectly!"
    echo "🎉 Your site is now accessible at:"
    echo "   - http://dev.meziani.org (redirects to HTTPS)"
    echo "   - https://dev.meziani.org"
else
    echo "❌ HTTPS is not working. Check certificate generation logs above."
    exit 1
fi

# Setup auto-renewal
echo "⏰ Setting up certificate auto-renewal..."
PROJECT_DIR="$(pwd)"
cat > /tmp/renew-certs.sh << EOF
#!/bin/bash
cd $PROJECT_DIR
docker-compose run --rm certbot renew --quiet
docker-compose exec nginx nginx -s reload
EOF

chmod +x /tmp/renew-certs.sh

echo "📋 To complete setup:"
echo "1. Move /tmp/renew-certs.sh to your preferred location: sudo mv /tmp/renew-certs.sh /usr/local/bin/"
echo "2. Add to crontab: sudo crontab -e"
echo "3. Add this line: 0 12 * * * /usr/local/bin/renew-certs.sh"
echo ""
echo "🔒 SSL Certificate Info:"
docker-compose exec nginx openssl x509 -in /etc/letsencrypt/live/dev.meziani.org/fullchain.pem -text -noout | grep -E "(Subject:|Not After)" || echo "Certificate info not available"
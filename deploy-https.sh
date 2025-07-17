#!/bin/bash

# Deploy script for HTTPS production deployment
# This script will set up SSL certificates and deploy with HTTPS

echo "🚀 Starting HTTPS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Stop existing services
print_step "Stopping existing Docker services..."
docker-compose down --remove-orphans
print_success "Services stopped"

# Step 2: Start services without SSL first
print_step "Starting services without SSL first..."
docker-compose up -d mongodb chromadb ollama ai-backend frontend
print_success "Core services started"

# Step 3: Start nginx temporarily for certificate generation
print_step "Starting nginx for certificate generation..."
# Temporarily use HTTP-only config for certificate generation
mv nginx/conf.d/irielle-ssl.conf nginx/conf.d/irielle-ssl.conf.tmp
cp nginx/conf.d/irielle.conf.temp nginx/conf.d/irielle-temp.conf 2>/dev/null || {
    # Create temporary HTTP-only config
    cat > nginx/conf.d/irielle-temp.conf << 'EOF'
server {
    listen 80;
    server_name dev.meziani.org;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
}

docker-compose up -d nginx
print_success "Nginx started for certificate generation"

# Step 4: Generate SSL certificates
print_step "Generating SSL certificates..."
docker-compose run --rm certbot
if [ $? -eq 0 ]; then
    print_success "SSL certificates generated successfully"
else
    print_error "Failed to generate SSL certificates"
    # Restore original config
    mv nginx/conf.d/irielle-ssl.conf.tmp nginx/conf.d/irielle-ssl.conf
    rm -f nginx/conf.d/irielle-temp.conf
    exit 1
fi

# Step 5: Switch to HTTPS configuration
print_step "Switching to HTTPS configuration..."
rm -f nginx/conf.d/irielle-temp.conf
mv nginx/conf.d/irielle-ssl.conf.tmp nginx/conf.d/irielle-ssl.conf

# Step 6: Restart nginx with SSL configuration
print_step "Restarting nginx with SSL configuration..."
docker-compose restart nginx
print_success "Nginx restarted with SSL"

# Step 7: Wait for application to be ready
print_step "Waiting for application to be ready..."
sleep 15

# Check if the application is responding over HTTPS
while ! curl -f https://dev.meziani.org >/dev/null 2>&1; do
    echo "Waiting for HTTPS application to be ready..."
    sleep 3
done
print_success "HTTPS application is ready"

# Step 8: Display connection info
echo ""
echo "🎉 HTTPS deployment completed successfully!"
echo ""
echo "📱 Access the application:"
echo "   HTTPS: https://dev.meziani.org"
echo "   HTTP: http://dev.meziani.org (redirects to HTTPS)"
echo ""
echo "🔐 Login credentials:"
echo "   Admin PIN: 1234"
echo "   Staff PIN: 5678"
echo ""
echo "🔒 SSL Certificate status:"
echo "   SSL certificates are active"
echo "   Let's Encrypt certificates auto-renew"
echo ""
echo "🔧 Services running:"
docker-compose ps

echo ""
print_success "HTTPS deployment completed! Application is accessible at https://dev.meziani.org"
echo ""
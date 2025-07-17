#!/bin/bash

# Script to generate SSL certificates for HTTPS deployment
# Run this first before the main deployment

echo "🔒 Generating SSL certificates for dev.meziani.org..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Step 1: Stop any existing services
print_step "Stopping existing services..."
docker-compose down --remove-orphans
print_success "Services stopped"

# Step 2: Start core services
print_step "Starting core services..."
docker-compose up -d mongodb chromadb ollama ai-backend frontend
print_success "Core services started"

# Step 3: Disable SSL config and enable HTTP-only
print_step "Setting up HTTP-only configuration..."
mv nginx/conf.d/irielle-ssl.conf nginx/conf.d/irielle-ssl.conf.disabled 2>/dev/null || true
# Make sure HTTP-only config is active
mv nginx/conf.d/irielle-http-only.conf.disabled nginx/conf.d/irielle-http-only.conf 2>/dev/null || true
print_success "HTTP-only configuration active"

# Step 4: Start nginx for certificate generation
print_step "Starting nginx for certificate generation..."
docker-compose up -d nginx
print_success "Nginx started"

# Step 5: Wait for nginx to be ready
print_step "Waiting for nginx to be ready..."
sleep 10

# Step 6: Generate SSL certificates
print_step "Generating SSL certificates..."
docker-compose run --rm certbot

if [ $? -eq 0 ]; then
    print_success "SSL certificates generated successfully!"
    
    # Step 7: Switch to HTTPS configuration
    print_step "Switching to HTTPS configuration..."
    mv nginx/conf.d/irielle-ssl.conf.disabled nginx/conf.d/irielle-ssl.conf
    mv nginx/conf.d/irielle-http-only.conf nginx/conf.d/irielle-http-only.conf.disabled
    
    # Step 8: Restart nginx with SSL
    print_step "Restarting nginx with SSL configuration..."
    docker-compose restart nginx
    print_success "Nginx restarted with SSL"
    
    # Step 9: Test HTTPS
    print_step "Testing HTTPS connection..."
    sleep 10
    
    if curl -f https://dev.meziani.org >/dev/null 2>&1; then
        print_success "HTTPS is working correctly!"
        echo ""
        echo "🎉 SSL certificates generated and configured successfully!"
        echo ""
        echo "📱 Your application is now accessible at:"
        echo "   HTTPS: https://dev.meziani.org"
        echo "   HTTP: http://dev.meziani.org (redirects to HTTPS)"
        echo ""
        echo "🔒 SSL Certificate details:"
        docker-compose exec nginx openssl x509 -in /etc/letsencrypt/live/dev.meziani.org/fullchain.pem -noout -dates
        echo ""
    else
        print_warning "HTTPS configuration may need adjustment"
        echo "Application is running but HTTPS test failed"
    fi
else
    print_error "Failed to generate SSL certificates"
    print_warning "Continuing with HTTP-only configuration"
    
    # Keep HTTP-only config active
    echo ""
    echo "📱 Your application is accessible at:"
    echo "   HTTP: http://dev.meziani.org"
    echo ""
    echo "🔧 To retry certificate generation, run this script again"
fi

echo ""
echo "🔧 Services status:"
docker-compose ps
echo ""
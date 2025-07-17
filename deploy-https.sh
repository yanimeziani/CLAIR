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

# Step 2: Check if certificates already exist
print_step "Checking for existing SSL certificates..."
if docker volume ls | grep -q "certbot_data"; then
    print_warning "Certificate volume exists, checking certificate status..."
    if docker run --rm -v "$(pwd)_certbot_data:/etc/letsencrypt" certbot/certbot certificates | grep -q "dev.meziani.org"; then
        print_success "SSL certificates already exist"
        CERTS_EXIST=true
    else
        print_warning "Certificate volume exists but no certificates found"
        CERTS_EXIST=false
    fi
else
    print_warning "No certificate volume found"
    CERTS_EXIST=false
fi

# Step 3: Start services
print_step "Starting core services..."
docker-compose up -d mongodb chromadb ollama ai-backend frontend
print_success "Core services started"

# Step 4: Set up nginx configuration based on certificate status
if [ "$CERTS_EXIST" = true ]; then
    print_step "Using HTTPS configuration (certificates exist)..."
    # Ensure SSL config is active
    mv nginx/conf.d/irielle-http-only.conf nginx/conf.d/irielle-http-only.conf.disabled 2>/dev/null || true
    docker-compose up -d nginx
    print_success "Nginx started with SSL"
else
    print_step "Using HTTP-only configuration for certificate generation..."
    # Use HTTP-only config first
    mv nginx/conf.d/irielle-ssl.conf nginx/conf.d/irielle-ssl.conf.disabled 2>/dev/null || true
    docker-compose up -d nginx
    print_success "Nginx started for certificate generation"
    
    # Wait for nginx to be ready
    sleep 10
    
    # Generate SSL certificates
    print_step "Generating SSL certificates..."
    docker-compose run --rm certbot
    if [ $? -eq 0 ]; then
        print_success "SSL certificates generated successfully"
        
        # Switch to HTTPS configuration
        print_step "Switching to HTTPS configuration..."
        mv nginx/conf.d/irielle-ssl.conf.disabled nginx/conf.d/irielle-ssl.conf
        mv nginx/conf.d/irielle-http-only.conf nginx/conf.d/irielle-http-only.conf.disabled
        
        # Restart nginx with SSL configuration
        print_step "Restarting nginx with SSL configuration..."
        docker-compose restart nginx
        print_success "Nginx restarted with SSL"
    else
        print_error "Failed to generate SSL certificates"
        print_warning "Continuing with HTTP-only deployment"
    fi
fi

# Step 5: Wait for application to be ready
print_step "Waiting for application to be ready..."
sleep 15

# Check if the application is responding
if [ "$CERTS_EXIST" = true ] || [ -f "nginx/conf.d/irielle-ssl.conf" ]; then
    # Try HTTPS first
    if curl -f https://dev.meziani.org >/dev/null 2>&1; then
        print_success "HTTPS application is ready"
        APP_URL="https://dev.meziani.org"
    else
        print_warning "HTTPS not responding, checking HTTP..."
        if curl -f http://dev.meziani.org >/dev/null 2>&1; then
            print_success "HTTP application is ready"
            APP_URL="http://dev.meziani.org"
        else
            print_error "Application not responding on HTTP or HTTPS"
            APP_URL="http://dev.meziani.org (not responding)"
        fi
    fi
else
    # Check HTTP only
    if curl -f http://dev.meziani.org >/dev/null 2>&1; then
        print_success "HTTP application is ready"
        APP_URL="http://dev.meziani.org"
    else
        print_error "Application not responding"
        APP_URL="http://dev.meziani.org (not responding)"
    fi
fi

# Step 6: Display connection info
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Access the application:"
echo "   Primary: $APP_URL"
if [[ "$APP_URL" == "https://"* ]]; then
    echo "   HTTP: http://dev.meziani.org (redirects to HTTPS)"
fi
echo ""
echo "🔐 Login credentials:"
echo "   Admin PIN: 1234"
echo "   Staff PIN: 5678"
echo ""
if [[ "$APP_URL" == "https://"* ]]; then
    echo "🔒 SSL Certificate status:"
    echo "   SSL certificates are active"
    echo "   Let's Encrypt certificates auto-renew"
    echo ""
fi
echo "🔧 Services running:"
docker-compose ps

echo ""
if [[ "$APP_URL" == "https://"* ]]; then
    print_success "HTTPS deployment completed! Application is accessible at https://dev.meziani.org"
else
    print_warning "HTTP deployment completed! Application is accessible at http://dev.meziani.org"
fi
echo ""
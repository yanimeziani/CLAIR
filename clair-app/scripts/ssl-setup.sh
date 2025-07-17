#!/bin/bash

# SSL Setup Script for IRIELLE Platform
# Automatically handles SSL certificate generation and nginx configuration

set -e

DOMAIN="dev.meziani.org"
NGINX_CONF_DIR="./nginx/conf.d"
DOCKER_COMPOSE_FILE="docker-compose.yml"

echo "🔧 Starting SSL setup for $DOMAIN..."

# Function to check if certificates exist
check_certificates() {
    if docker run --rm -v $(pwd)/nginx/certbot_data:/etc/letsencrypt certbot/certbot certificates --domain $DOMAIN > /dev/null 2>&1; then
        echo "✅ SSL certificates already exist for $DOMAIN"
        return 0
    else
        echo "⚠️  SSL certificates not found for $DOMAIN"
        return 1
    fi
}

# Function to switch to HTTP-only mode
enable_http_only() {
    echo "🔄 Switching to HTTP-only mode..."
    
    # Disable SSL config
    if [ -f "$NGINX_CONF_DIR/irielle-ssl.conf" ]; then
        mv "$NGINX_CONF_DIR/irielle-ssl.conf" "$NGINX_CONF_DIR/irielle-ssl.conf.disabled"
    fi
    
    # Enable HTTP-only config
    if [ -f "$NGINX_CONF_DIR/irielle-http-only.conf.disabled" ]; then
        mv "$NGINX_CONF_DIR/irielle-http-only.conf.disabled" "$NGINX_CONF_DIR/irielle-http-only.conf"
    fi
    
    echo "✅ HTTP-only mode enabled"
}

# Function to switch to SSL mode
enable_ssl() {
    echo "🔄 Switching to SSL mode..."
    
    # Disable HTTP-only config
    if [ -f "$NGINX_CONF_DIR/irielle-http-only.conf" ]; then
        mv "$NGINX_CONF_DIR/irielle-http-only.conf" "$NGINX_CONF_DIR/irielle-http-only.conf.disabled"
    fi
    
    # Enable SSL config
    if [ -f "$NGINX_CONF_DIR/irielle-ssl.conf.disabled" ]; then
        mv "$NGINX_CONF_DIR/irielle-ssl.conf.disabled" "$NGINX_CONF_DIR/irielle-ssl.conf"
    fi
    
    echo "✅ SSL mode enabled"
}

# Function to generate SSL certificates
generate_certificates() {
    echo "🔐 Generating SSL certificates..."
    
    # Start services in HTTP-only mode
    docker-compose up -d nginx
    
    # Wait for nginx to be ready
    echo "⏳ Waiting for nginx to be ready..."
    sleep 10
    
    # Test if nginx is accessible
    if ! curl -f http://localhost/.well-known/acme-challenge/test 2>/dev/null; then
        echo "⚠️  Nginx not accessible, checking container status..."
        docker-compose logs nginx
    fi
    
    # Generate certificates
    echo "🚀 Requesting SSL certificate from Let's Encrypt..."
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email support@meziani.org \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        --domains $DOMAIN
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificates generated successfully"
        return 0
    else
        echo "❌ Failed to generate SSL certificates"
        return 1
    fi
}

# Main execution
main() {
    # Check if certificates already exist
    if check_certificates; then
        echo "🎉 SSL certificates already exist, enabling SSL mode..."
        enable_ssl
        docker-compose restart nginx
        echo "✅ SSL setup completed successfully!"
        return 0
    fi
    
    # Start fresh SSL setup
    echo "🚀 Starting fresh SSL certificate generation..."
    
    # Stop services
    docker-compose down
    
    # Enable HTTP-only mode
    enable_http_only
    
    # Generate certificates
    if generate_certificates; then
        # Switch to SSL mode
        enable_ssl
        
        # Restart nginx with SSL
        docker-compose restart nginx
        
        echo "🎉 SSL setup completed successfully!"
        echo "🌐 Your site is now available at: https://$DOMAIN"
        
        # Test SSL
        echo "🔍 Testing SSL configuration..."
        if curl -f -s https://$DOMAIN > /dev/null; then
            echo "✅ SSL is working correctly!"
        else
            echo "⚠️  SSL test failed, check nginx logs"
        fi
    else
        echo "❌ SSL certificate generation failed"
        exit 1
    fi
}

# Run main function
main "$@"
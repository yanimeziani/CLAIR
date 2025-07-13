#!/bin/bash

# init-letsencrypt.sh - Initialize Let's Encrypt certificates for Nginx

set -e

# Configuration
domains=${1:-"localhost"}
email=${2:-"admin@example.com"}  # Replace with your email
staging=${3:-1}  # Set to 0 for production certificates

# Paths
data_path="./certbot_data"
nginx_conf_path="./docker/nginx/conf.d/default.conf"

# Create necessary directories
mkdir -p "$data_path/conf/live/$domains"
mkdir -p "$data_path/www"
mkdir -p "./docker/nginx/ssl"

echo "### Creating dummy certificate for $domains ..."
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
  -keyout "./docker/nginx/ssl/dummy.key" \
  -out "./docker/nginx/ssl/dummy.crt" \
  -subj "/CN=$domains"

echo "### Starting nginx ..."
docker compose up --force-recreate -d nginx

echo "### Deleting dummy certificate for $domains ..."
rm -f "./docker/nginx/ssl/dummy.crt" "./docker/nginx/ssl/dummy.key"

echo "### Requesting Let's Encrypt certificate for $domains ..."

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    -d $domains \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot

echo "### Updating nginx configuration for SSL ..."

# Update nginx configuration to use the real certificates
cat > "$nginx_conf_path" << 'EOF'
# Default server configuration
server {
    listen 80;
    server_name _;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP traffic to HTTPS (except ACME challenges)
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server configuration
server {
    listen 443 ssl http2;
    server_name _;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req zone=main burst=20 nodelay;

    # Proxy settings for Next.js
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase proxy timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Proxy API backend routes
    location /api/ai/ {
        proxy_pass http://ai-backend:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase proxy timeouts for AI operations
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Replace domain placeholder in the config
sed -i "s/DOMAIN_PLACEHOLDER/$domains/g" "$nginx_conf_path"

echo "### Reloading nginx ..."
docker compose exec nginx nginx -s reload

echo "### SSL certificate setup complete!"
echo "Your site should now be available at https://$domains"
#!/bin/bash

# SSL Certificate Renewal Script
# This script renews Let's Encrypt certificates and reloads Nginx

set -e

DOMAIN="dev.meziani.org"

echo "🔄 Renewing SSL certificates for $DOMAIN"

# Renew certificates
docker-compose run --rm certbot renew --quiet

# Reload Nginx to use new certificates
echo "🔁 Reloading Nginx configuration..."
docker-compose exec nginx nginx -s reload

echo "✅ SSL certificate renewal completed!"
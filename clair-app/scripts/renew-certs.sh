#!/bin/bash

# Certificate Renewal Script for Irielle Platform
# Run this script via cron: 0 12 * * * /path/to/renew-certs.sh

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"

echo "🔄 $(date): Starting certificate renewal for dev.meziani.org"

# Check if certificates need renewal (30 days before expiry)
if docker-compose run --rm certbot renew --dry-run --quiet; then
    echo "✅ $(date): Certificate renewal check passed"
    
    # Perform actual renewal
    if docker-compose run --rm certbot renew --quiet; then
        echo "🔄 $(date): Certificates renewed successfully, reloading Nginx"
        
        # Reload Nginx to use new certificates
        if docker-compose exec nginx nginx -s reload; then
            echo "✅ $(date): Nginx reloaded successfully"
        else
            echo "❌ $(date): Failed to reload Nginx"
            exit 1
        fi
    else
        echo "⚠️  $(date): No certificates needed renewal"
    fi
else
    echo "❌ $(date): Certificate renewal check failed"
    exit 1
fi

echo "🎉 $(date): Certificate renewal process completed"
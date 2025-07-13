# SSL Setup with Let's Encrypt

This directory contains scripts and configuration for setting up SSL certificates with Let's Encrypt for the Irielle platform.

## Quick Start

### For Development/Testing (Staging Certificates)
```bash
# Use staging certificates (recommended for testing)
./docker/certbot/init-letsencrypt.sh your-domain.com your-email@example.com 1
```

### For Production (Real Certificates)
```bash
# Use production certificates (only after testing with staging)
./docker/certbot/init-letsencrypt.sh your-domain.com your-email@example.com 0
```

## Manual Setup Steps

1. **Update your domain**: Replace `your-domain.com` and `your-email@example.com` with actual values
2. **DNS Configuration**: Ensure your domain points to your server's IP address
3. **Firewall**: Make sure ports 80 and 443 are open
4. **Run the initialization script**: This will:
   - Create a dummy SSL certificate for initial nginx startup
   - Start the nginx container
   - Request a real Let's Encrypt certificate
   - Update nginx configuration to use the real certificate
   - Reload nginx

## Certificate Renewal

Certificates are automatically renewed by the certbot container, which runs renewal checks every 12 hours.

## Troubleshooting

- **Rate Limits**: Let's Encrypt has rate limits. Use staging certificates for testing.
- **DNS Issues**: Ensure your domain resolves to the correct IP address
- **Firewall**: Make sure ports 80 and 443 are accessible from the internet
- **Logs**: Check nginx and certbot container logs for detailed error information

## Files

- `init-letsencrypt.sh`: Main initialization script
- `../nginx/nginx.conf`: Main nginx configuration
- `../nginx/conf.d/default.conf`: Site-specific nginx configuration
# Docker Setup Guide

This guide covers the complete Docker setup for the Irielle Healthcare Platform with Nginx reverse proxy, SSL termination, and Let's Encrypt certificates.

## Architecture

The platform consists of multiple Docker containers orchestrated via Docker Compose:

```
Internet → Nginx (80/443) → Next.js Frontend (3000)
                          → FastAPI Backend (8000)
                          
MongoDB (27017) ← Backend Services
ChromaDB (8000) ← AI Backend
```

## Services Overview

| Service | Container | Internal Port | External Port | Description |
|---------|-----------|---------------|---------------|-------------|
| `nginx` | irielle-nginx | 80/443 | 80/443 | Reverse proxy with SSL |
| `frontend` | irielle-frontend | 3000 | - | Next.js application |
| `ai-backend` | irielle-ai-backend | 8000 | - | FastAPI AI service |
| `mongodb` | irielle-mongodb | 27017 | 27017 | MongoDB database |
| `chromadb` | irielle-chromadb | 8000 | 8000 | Vector database |
| `certbot` | irielle-certbot | - | - | SSL certificate management |

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- Domain name pointing to your server (for SSL)
- Ports 80 and 443 open in firewall

## Quick Start

### 1. Environment Configuration

Create your environment file:

```bash
cp .env.production.example .env.production
```

Edit the file with your actual values:

```env
NODE_ENV=production
NEXTAUTH_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=mongodb://admin:securepassword@mongodb:27017/irielle?authSource=admin

# Optional: AI service configuration
OLLAMA_HOST=host.docker.internal:11434
```

### 2. Start Services

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 3. SSL Setup

For **production** with real domain:
```bash
./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 0
```

For **testing** with staging certificates:
```bash
./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 1
```

## Detailed Setup

### Step 1: DNS Configuration

Ensure your domain points to your server:
```bash
# Test DNS resolution
nslookup yourdomain.com
dig yourdomain.com A
```

### Step 2: Firewall Configuration

```bash
# Ubuntu/Debian with UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable

# CentOS/RHEL with firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Step 3: Docker Compose Services

Start services in order:

```bash
# Start core services first
docker compose up -d mongodb chromadb

# Wait for databases to be ready
sleep 30

# Start application services
docker compose up -d ai-backend frontend

# Start reverse proxy
docker compose up -d nginx

# Start certificate management
docker compose up -d certbot
```

### Step 4: SSL Certificate Setup

The `init-letsencrypt.sh` script handles the complete SSL setup:

1. Creates dummy certificates for initial nginx startup
2. Starts nginx with dummy certificates
3. Requests real certificates from Let's Encrypt
4. Updates nginx configuration to use real certificates
5. Reloads nginx

**For staging/testing:**
```bash
chmod +x docker/certbot/init-letsencrypt.sh
./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 1
```

**For production:**
```bash
./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 0
```

## Nginx Configuration

### Main Configuration (`docker/nginx/nginx.conf`)

- Optimized worker processes
- Gzip compression
- Rate limiting
- Security headers
- Docker DNS resolver

### Site Configuration (`docker/nginx/conf.d/default.conf`)

- HTTP to HTTPS redirect
- SSL termination
- Reverse proxy to Next.js frontend
- API routing to FastAPI backend
- Error handling
- Health checks

### SSL Configuration

- TLS 1.2 and 1.3 support
- Strong cipher suites
- HSTS headers
- Security headers (XSS, CSRF protection)

## Certificate Management

### Automatic Renewal

Certificates are automatically renewed by the certbot container every 12 hours.

### Manual Renewal

```bash
# Test renewal (dry run)
docker compose exec certbot certbot renew --dry-run

# Force renewal
docker compose exec certbot certbot renew --force-renewal

# Reload nginx after renewal
docker compose exec nginx nginx -s reload
```

## Monitoring and Troubleshooting

### Health Checks

```bash
# Nginx health check
curl -k https://yourdomain.com/health

# Service status
docker compose ps

# Service logs
docker compose logs nginx
docker compose logs frontend
docker compose logs ai-backend
```

### Common Issues

**1. Nginx fails to start - "upstream not found"**
```bash
# Check if frontend container is running
docker compose ps frontend

# Restart in correct order
docker compose up -d frontend
docker compose restart nginx
```

**2. SSL certificate errors**
```bash
# Check certificate status
docker compose exec certbot certbot certificates

# Check nginx SSL configuration
docker compose exec nginx nginx -t
```

**3. Rate limiting by Let's Encrypt**
```bash
# Use staging certificates for testing
./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 1

# Wait and try production later
./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 0
```

**4. Frontend build issues**
```bash
# Rebuild frontend image
docker compose build --no-cache frontend
docker compose up -d frontend
```

## Security Considerations

### Nginx Security

- Rate limiting configured (10 req/s)
- Security headers enabled
- SSL only (HSTS)
- Secure cipher suites

### Container Security

- Non-root users in containers
- Read-only mounts where possible
- Minimal base images (Alpine)
- Regular image updates

### Network Security

- Internal container network
- No direct external access to backend services
- Firewall rules for public ports only

## Backup and Recovery

### Database Backup

```bash
# MongoDB backup
docker compose exec mongodb mongodump --out /data/backup

# Copy backup from container
docker cp irielle-mongodb:/data/backup ./mongodb-backup
```

### Certificate Backup

```bash
# Backup Let's Encrypt data
docker run --rm -v irielle_certbot_data:/data -v $(pwd):/backup alpine tar czf /backup/certbot-backup.tar.gz -C /data .
```

### Configuration Backup

```bash
# Backup nginx and docker configs
tar czf irielle-config-backup.tar.gz docker/ docker-compose.yml .env.production
```

## Performance Optimization

### Nginx Tuning

- Worker processes set to `auto`
- Gzip compression enabled
- Keep-alive connections
- Proxy buffering
- Static file caching

### Container Resources

Add resource limits to docker-compose.yml:

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Development vs Production

### Development

- Use staging SSL certificates
- Enable debug logging
- Mount source code for live reload
- Expose additional ports for debugging

### Production

- Use production SSL certificates
- Minimize logging
- Use built images only
- Restrict network access
- Enable automatic restarts

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Check service health
   - Review logs for errors
   - Verify SSL certificate status

2. **Monthly:**
   - Update Docker images
   - Backup databases and configurations
   - Review security updates

3. **Quarterly:**
   - Security audit
   - Performance review
   - Disaster recovery testing

### Updates

```bash
# Update images
docker compose pull

# Restart with new images
docker compose up -d

# Clean up old images
docker image prune -f
```

## Support

For issues and questions:

1. Check the logs: `docker compose logs [service]`
2. Verify configuration: `docker compose config`
3. Test connectivity: `curl` commands
4. Review this documentation
5. Check GitHub issues for similar problems
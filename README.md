# CLAIR Healthcare System with LUCIDE Analytics

Complete healthcare management platform with integrated analytics for DI-TSA residences in Quebec.

## 🏗️ System Architecture

This system consists of two main applications deployed together:

### 📱 CLAIR (Centre Logiciel d'Aide aux Interventions Résidentielles)
- **Location**: `./clair-app/`
- **Purpose**: Main healthcare management platform
- **Tech Stack**: Next.js 15, TypeScript, MongoDB, TailwindCSS
- **Features**: PIN-based authentication, resident management, AI-powered text assistance, Bristol Scale tracking

### 📊 LUCIDE Analytics
- **Location**: `./lucide-analytics/`
- **Purpose**: Web analytics with heatmap and live visitor intelligence
- **Tech Stack**: Next.js 14, TypeScript, Socket.io, Recharts
- **Features**: Real-time visitor tracking, heatmap visualization, analytics dashboard

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)

### Deployment
```bash
# Deploy the complete system
./deploy.sh

# Or manually with docker-compose
docker-compose up -d
```

### Development
```bash
# CLAIR development
cd clair-app
npm install
npm run dev

# LUCIDE development (in another terminal)
cd lucide-analytics
npm install
npm run dev
```

## 🌐 Access URLs

### Production
- **CLAIR Main App**: `http://89.116.170.202:3000` or `https://dev.meziani.org`
- **LUCIDE Analytics**: `http://89.116.170.202:3000/analytics` or `https://dev.meziani.org/analytics`

### Development
- **CLAIR (direct)**: `http://localhost:3000`
- **LUCIDE (direct)**: `http://localhost:3001`
- **Nginx Proxy**: `http://localhost`
- **LUCIDE via Proxy**: `http://localhost/analytics`

## 🐳 Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| `clair-frontend` | 3000 | CLAIR Next.js application |
| `lucide-analytics` | 3001 | LUCIDE Analytics application |
| `ai-backend` | 8001 | Python FastAPI for AI features |
| `mongodb` | 27017 | Primary database |
| `chromadb` | 8000 | Vector database for AI |
| `ollama` | 11434 | Local AI model service |
| `nginx` | 80/443 | Reverse proxy with SSL |

## 🔧 Deployment Commands

```bash
# Deploy everything
./deploy.sh

# Check service status
./deploy.sh status

# View logs
./deploy.sh logs [service-name]

# Restart services
./deploy.sh restart

# Stop everything
./deploy.sh stop

# Clean up
./deploy.sh cleanup

# Set up SSL certificates
./deploy.sh ssl
```

## 📁 Directory Structure

```
CLAIR/
├── clair-app/              # Main CLAIR application
│   ├── src/               # Next.js source code
│   ├── public/            # Static assets
│   ├── ai-backend/        # Python AI service
│   ├── docker/            # Docker configurations
│   ├── nginx/             # Nginx configurations (moved to root)
│   ├── scripts/           # Deployment scripts
│   └── package.json       # CLAIR dependencies
├── lucide-analytics/       # LUCIDE Analytics application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/               # Analytics utilities
│   ├── types/             # TypeScript definitions
│   └── package.json       # LUCIDE dependencies
├── nginx/                 # Nginx configuration (root level)
│   ├── nginx.conf         # Main nginx config
│   └── conf.d/            # Site configurations
├── docker-compose.yml     # Complete system orchestration
├── deploy.sh              # Deployment script
└── README.md              # This file
```

## 🔐 SSL Configuration

The system supports SSL certificates via Let's Encrypt:

```bash
# Set up SSL certificates
./deploy.sh ssl

# Manual SSL setup
cd clair-app/scripts
./ssl-setup.sh
```

## 🛠️ Configuration

### Environment Variables
- Copy `.env.production.example` to `.env.production`
- Update database URLs and API endpoints as needed

### Nginx Configuration
- **SSL Config**: `nginx/conf.d/irielle-ssl.conf`
- **HTTP Config**: `nginx/conf.d/irielle-http-only.conf`
- Routes:
  - `/` → CLAIR Frontend
  - `/analytics` → LUCIDE Analytics
  - `/api/ai/` → AI Backend

## 📊 Monitoring

### Service Health Checks
```bash
# Check all services
./deploy.sh status

# Individual service logs
docker-compose logs clair-frontend
docker-compose logs lucide-analytics
docker-compose logs ai-backend
```

### Database Access
```bash
# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p securepassword

# ChromaDB API
curl http://localhost:8000/api/v1/heartbeat
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Update CLAIR
cd clair-app
git pull
npm install
docker-compose build clair-frontend
docker-compose restart clair-frontend

# Update LUCIDE
cd lucide-analytics
git pull
npm install
docker-compose build lucide-analytics
docker-compose restart lucide-analytics
```

### Certificate Renewal
```bash
# Manual renewal
docker-compose run --rm certbot renew
docker-compose restart nginx

# Auto-renewal (add to crontab)
0 12 * * * /path/to/project/deploy.sh ssl
```

## 📝 Default Credentials

### CLAIR System
- **Admin PIN**: 1234
- **Staff PIN**: 5678

### Database
- **MongoDB**: admin/securepassword

## 🆘 Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   ./deploy.sh cleanup
   ./deploy.sh
   ```

2. **SSL certificate issues**
   ```bash
   ./deploy.sh ssl
   ```

3. **Database connection errors**
   ```bash
   docker-compose logs mongodb
   docker-compose restart mongodb
   ```

4. **Analytics not loading**
   ```bash
   docker-compose logs lucide-analytics
   curl http://localhost/analytics
   ```

### Log Locations
- **Application logs**: `docker-compose logs [service]`
- **Nginx logs**: `docker-compose logs nginx`
- **SSL logs**: `docker-compose logs certbot`

## 📚 Additional Resources

- **CLAIR Documentation**: `./clair-app/README.md`
- **LUCIDE Documentation**: `./lucide-analytics/README.md`
- **API Documentation**: Available at runtime endpoints

## 🤝 Support

For issues and support:
1. Check service logs: `./deploy.sh logs`
2. Verify service status: `./deploy.sh status`
3. Review configuration files
4. Check firewall and DNS settings for SSL issues
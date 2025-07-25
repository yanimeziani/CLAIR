# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLAIR is a comprehensive healthcare management system for DI-TSA (Intellectual Disability - Autism Spectrum Disorder) residences in Quebec. The platform is a unified Next.js application running in a containerized microservices architecture with local AI processing for healthcare compliance.

**Production Environment:** https://dev.meziani.org
**System Components:** CLAIR (unified healthcare management with integrated analytics)
**Architecture:** Docker Compose microservices with Nginx reverse proxy

## Core Application

### CLAIR Healthcare Platform (`/clair-app/`)
- **Purpose**: Unified healthcare management system with integrated analytics dashboard
- **Tech Stack**: Next.js 15, TypeScript, MongoDB, FastAPI, Ollama AI
- **Features**: PIN-based auth, AI text assistance, Bristol Scale tracking, resident management, user journey analytics
- **Port**: 3000 (development), routed through Nginx in production

## Development Commands

### Primary Development Workflow
```bash
# Start full development environment
docker-compose up -d

# Individual application development
cd clair-app && npm run dev        # CLAIR with Turbopack

# Production builds
cd clair-app && npm run build

# Database operations
cd clair-app && npm run db:reset   # Reset MongoDB with seed data
```

### System Deployment
```bash
# Full system deployment with health checks
./deploy.sh

# System status and health monitoring
./deploy.sh status

# SSL certificate management
./deploy.sh ssl

# Individual service management
docker-compose up -d mongodb       # Database only
docker-compose up -d clair-frontend lucide-analytics # Apps only
```

### Development Utilities
```bash
# Linting and type checking
cd clair-app && npm run lint && npm run typecheck

# Test deployment locally
cd clair-app && npm run test:deployment
```

## Architecture Overview

### Microservices Infrastructure
The platform runs as a complete Docker Compose ecosystem with the following services:

1. **CLAIR Frontend** (Next.js) - Unified healthcare management interface with analytics dashboard
2. **MongoDB** (Port 27017) - Primary database with auto-seeded data
3. **FastAPI AI Backend** (Port 8001) - Python service for AI text processing
4. **Ollama** (Port 11434) - Local AI model service (Gemma3:4b)
5. **ChromaDB** (Port 8000) - Vector database for AI features
6. **Nginx** (Ports 80/443) - Reverse proxy with SSL termination
7. **Certbot** - Automated Let's Encrypt SSL management

### Database Models (`/clair-app/src/lib/models/`)
- **User.ts**: Staff authentication with role hierarchy (admin/standard/viewer)
- **Patient.ts**: Resident profiles with medical information and emergency contacts
- **DailyReport.ts**: Shift reports with AI-enhanced rich text content
- **Communication.ts**: Team messaging with urgency flags and read tracking
- **BristolEntry.ts**: Bristol Scale tracking for specialized healthcare needs
- **ObservationNote.ts**: Medical observations with timestamps
- **ReportTemplate.ts**: Admin-configurable report templates
- **AuditLog.ts**: Comprehensive system activity tracking

### Authentication System
- **PIN-based Authentication**: 4-digit PINs optimized for healthcare environments
- **Session Management**: Browser-based sessions (no JWT tokens)
- **Role-based Access Control**: Granular permissions across three user levels
- **Default Development Credentials**: Admin PIN: 1234, Staff PIN: 5678

### AI Integration Architecture
- **Local Processing**: Ollama deployment keeps all data on-premises for compliance
- **Model**: Gemma3:4b optimized for French medical terminology
- **Services**: Real-time text correction, summarization, terminology assistance
- **Integration**: TipTap rich text editor with AI suggestion modals
- **Privacy**: Zero external AI API calls, full data sovereignty

### Network Architecture & Routing
```
Internet → Nginx (SSL) → CLAIR:3000
                      ↓
              [MongoDB | AI Backend | Ollama]
```

**Production URLs:**
- Main Platform: `https://dev.meziani.org` (CLAIR with integrated analytics)
- Direct Access: `http://89.116.170.202:3000` (CLAIR)

**Development URLs:**
- CLAIR: `http://localhost:3000`
- AI Backend: `http://localhost:8001`

## Key Development Considerations

### Healthcare-Specific Requirements
- **Language**: All user-facing content in French with medical terminology
- **Compliance**: HIPAA-conscious data handling with local AI processing
- **Security**: PIN-based authentication suitable for shared healthcare devices
- **Accessibility**: Mobile-first responsive design with touch-friendly interfaces
- **Specialized Features**: Bristol Scale integration for bowel movement tracking

### Database Seeding & Test Data
MongoDB is automatically seeded with comprehensive test data:
- 5 test users (1 admin, 4 staff with different roles)
- 5 sample residents with complete medical profiles
- 3 daily shift reports with rich content
- 4 team communications with various urgency levels
- Bristol tracking entries for demonstration

### Build & Deployment Pipeline
- **CI/CD**: GitHub Actions with artifact caching between test and deploy phases
- **Docker Builds**: Multi-stage builds with health checks
- **SSL Automation**: Let's Encrypt certificate generation and renewal
- **Health Monitoring**: Comprehensive service status checking
- **Rollback Capability**: Graceful shutdown with SSL preservation

### Frontend Architecture (Next.js 15 App Router)
- **App Router**: All pages use `/src/app/` directory structure
- **Component Organization**: Radix UI primitives with custom Tailwind styling
- **State Management**: React patterns with no external state library
- **Rich Text**: TipTap editor integration with AI assistance
- **Charts & Visualization**: Recharts for analytics, Framer Motion for interactions

### AI Backend Communication
- **API Design**: RESTful endpoints for text correction and summarization
- **Error Handling**: Graceful fallbacks when AI services are unavailable
- **Performance**: Async processing with real-time UI feedback
- **Language Support**: French medical terminology optimization

### Environment Configuration
```bash
# Development
MONGODB_URI=mongodb://admin:securepassword@localhost:27017/clair?authSource=admin
AI_BACKEND_URL=http://localhost:8001

# Production
MONGODB_URI=mongodb://admin:securepassword@mongodb:27017/clair?authSource=admin
AI_BACKEND_URL=http://ai-backend:8000
NEXTAUTH_SECRET=[generated-secret]
NEXTAUTH_URL=https://dev.meziani.org
```

## Unique Platform Characteristics

1. **Unified Architecture**: Single Next.js application with integrated analytics dashboard
2. **Local AI Processing**: On-premises Ollama deployment for data privacy
3. **Healthcare-Optimized UX**: PIN authentication, French interface, specialized tracking
4. **Integrated Analytics**: Built-in user journey analytics for healthcare workflow optimization
5. **Containerized Deployment**: Complete microservices ecosystem with health monitoring
6. **SSL Automation**: Production-ready certificate management
7. **Role-Based Dashboards**: Different UI experiences per user permission level with analytics insights

This platform demonstrates healthcare software best practices with emphasis on data privacy, user experience, and regulatory compliance while maintaining modern development workflows.
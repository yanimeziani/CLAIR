# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Irielle is a specialized healthcare management platform for DI-TSA (Intellectual Disability - Autism Spectrum Disorder) residences in Quebec. The platform features a multilingual (French) interface with AI-powered text assistance, PIN-based authentication, and comprehensive resident management tools.

**Production Environment:** http://89.116.170.202:3000
**Tech Stack:** Next.js 15, TypeScript, MongoDB, FastAPI (Python AI backend), Ollama AI, TailwindCSS, Radix UI

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Production server
npm start

# Linting
npm run lint

# Full stack development (requires Docker)
docker-compose up -d
```

## Architecture Overview

### Frontend Architecture (Next.js App Router)
- **App Router Structure:** All pages use `/src/app/` directory structure
- **Role-based Access:** Admin, Standard, and Viewer roles with different dashboard experiences
- **Authentication:** PIN-based system stored in browser sessions (no traditional tokens)
- **UI Framework:** Radix UI primitives with custom Tailwind styling
- **State Management:** React useState/useEffect patterns, no external state library

### Backend Services Architecture
The platform runs as a microservices architecture via Docker Compose:

1. **Next.js Frontend** (Port 3000) - Main application
2. **MongoDB** (Port 27017) - Primary database with seeded test data
3. **FastAPI AI Backend** (Port 8001) - Handles AI text correction and summarization
4. **Ollama** (Port 11434) - Local AI model service (gemma3:4b)
5. **ChromaDB** (Port 8000) - Vector database for AI features
6. **Nginx** (Ports 80/443) - Reverse proxy with SSL termination

### Database Models Location
All Mongoose models are in `/src/lib/models/`:
- `User.ts` - Staff authentication and roles
- `Patient.ts` - Resident profiles and medical information
- `DailyReport.ts` - Shift reports with rich text content
- `Communication.ts` - Team messaging with urgency flags
- `BristolEntry.ts` - Bristol Scale tracking for bowel movements
- `ObservationNote.ts` - Medical observations
- `ReportTemplate.ts` - Admin-configurable report templates

### Authentication System
- **PIN-based:** 4-digit PINs hashed with bcrypt
- **Session Storage:** Browser-based sessions (no JWT)
- **Role Hierarchy:** Admin → Standard → Viewer
- **Default PINs:** Admin: 1234, Staff: 5678 (development)

### AI Integration
- **Text Correction:** Real-time grammar and medical terminology correction
- **Summarization:** Automatic report summaries
- **Model:** Gemma3:4b via Ollama
- **Languages:** Optimized for French medical terminology
- **Integration:** TipTap rich text editor with AI suggestion modals

### Key Features by User Role

**Admin Dashboard:**
- User management (create/edit/deactivate staff)
- Report template configuration
- Data exports (CSV with metadata)
- System statistics and analytics

**Standard Dashboard:**
- Full CRUD for residents, reports, communications
- Bristol Scale tracking
- AI-powered text assistance
- Real-time team messaging

**Viewer Dashboard:**
- Read-only access to reports and communications
- Limited patient information viewing

### Critical File Locations

**Authentication:** `/src/lib/auth/auth.ts`
**Database Connection:** `/src/lib/database.ts`
**API Routes:** `/src/app/api/` (organized by feature)
**UI Components:** `/src/components/ui/` (shadcn/ui based)
**Rich Text Editor:** `/src/components/ui/rich-text-editor.tsx` (TipTap with AI)

### Mobile Responsiveness
The platform is fully mobile-optimized with:
- Mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- Touch-friendly 44px minimum targets
- Responsive grids and navigation
- Horizontal scroll solutions for complex layouts (Bristol calendar)

### Development Environment Variables
```bash
MONGODB_URI=mongodb://admin:securepassword@localhost:27017/irielle?authSource=admin
AI_BACKEND_URL=http://localhost:8001
```

### Data Seeding
MongoDB is automatically seeded with:
- Test users (admin/staff accounts)
- Sample residents
- Report templates
- Demo data for all features

### Styling System
- **Design System:** Custom Tailwind with CSS variables for theming
- **Components:** Radix UI primitives with Tailwind styling
- **Typography:** Poppins (headings) + Inter (body text)
- **Colors:** Healthcare-optimized palette in `/src/app/globals.css`
- **Responsive:** Mobile-first approach with consistent breakpoints

### API Architecture
- **RESTful patterns** in `/src/app/api/`
- **Route handlers** follow Next.js 13+ App Router conventions
- **Error handling** with French language responses
- **CORS configured** for AI backend communication
- **PIN validation** on protected routes

### Special Considerations
- **French Language:** All user-facing text in French
- **Medical Context:** Bristol Scale integration, medical terminology
- **Security:** PIN-based auth suitable for healthcare environment
- **Compliance:** HIPAA-conscious data handling patterns
- **AI Privacy:** Local Ollama deployment keeps data on-premises
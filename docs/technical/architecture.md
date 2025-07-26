# Architecture Technique - CLAIR

## Vue d'ensemble du système

CLAIR est une plateforme de gestion des soins de santé conçue selon une architecture microservices moderne avec traitement IA local. Le système privilégie la sécurité, la performance et la conformité aux normes de santé.

## Architecture Générale

### Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NIVEAU PRÉSENTATION                      │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 15 Frontend (TypeScript + TailwindCSS + Radix UI)     │
│  • Interface utilisateur responsive                             │
│  • Authentification PIN                                        │
│  • Éditeur de texte enrichi avec IA                           │
│  • Dashboards par rôle utilisateur                            │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                          NIVEAU API                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (App Router)                               │
│  • Routes RESTful (/api/*)                                     │
│  • Middleware d'authentification                               │
│  • Validation des données                                      │
│  • Gestion des erreurs                                        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   DONNÉES       │ │   SERVICES IA   │ │   INFRASTRUCTURE│
│                 │ │                 │ │                 │
│ MongoDB         │ │ FastAPI Backend │ │ Nginx Proxy     │
│ • Collections   │ │ • Correction    │ │ • SSL/TLS       │
│ • Index         │ │ • Résumés       │ │ • Load Balancer │
│ • Réplication   │ │ • Suggestions   │ │ • Cache         │
│                 │ │                 │ │                 │
│                 │ │ Ollama + Gemma  │ │ Docker Compose  │
│                 │ │ • IA Locale     │ │ • Orchestration │
│                 │ │ • Confidentialité│ │ • Monitoring    │
│                 │ │                 │ │                 │
│                 │ │ ChromaDB        │ │ Let's Encrypt   │
│                 │ │ • Vecteurs      │ │ • Certificats   │
│                 │ │ • Embeddings    │ │ • Auto-renewal  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Stack Technologique Détaillé

### Frontend (Next.js 15)

**Framework et Outils**
- **Next.js 15**: App Router avec React 18
- **TypeScript**: Typage strict pour la robustesse
- **TailwindCSS**: Système de design responsive
- **Radix UI**: Composants primitifs accessibles
- **shadcn/ui**: Collection de composants pré-stylés

**Fonctionnalités Spécialisées**
- **TipTap**: Éditeur WYSIWYG avec extensions personnalisées
- **Framer Motion**: Animations fluides et micro-interactions
- **Recharts**: Visualisations de données médicales
- **React Hook Form**: Gestion avancée des formulaires

### Backend et APIs

**API Routes Next.js**
```
/api/
├── auth/
│   ├── login           # Authentification PIN
│   ├── logout          # Déconnexion
│   └── session         # Validation session
├── patients/           # Gestion usagers
│   ├── [id]/
│   │   ├── status      # Activation/désactivation
│   │   └── route       # CRUD usager
│   └── route           # Liste et création
├── reports/            # Rapports quotidiens
├── communications/     # Messages équipe
├── bristol/            # Échelle Bristol
├── observations/       # Notes médicales
├── ai/                 # Services IA
│   ├── correct-text    # Correction grammaticale
│   ├── generate-summary # Résumés automatiques
│   ├── enhance-text    # Amélioration de style
│   └── analyze-text    # Analyse sémantique
├── admin/              # Administration
│   ├── users/          # Gestion utilisateurs
│   ├── audit-logs/     # Journaux d'audit
│   └── templates/      # Modèles de rapports
└── export/             # Exports CSV
```

### Services d'Intelligence Artificielle

**Architecture IA Locale**
```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 8001)             │
├─────────────────────────────────────────────────────────────┤
│  Endpoints:                                                 │
│  • POST /correct-text    - Correction français médical     │
│  • POST /summarize       - Génération résumés              │
│  • POST /enhance         - Amélioration style              │
│  • GET  /health          - Status santé service            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Ollama Server (Port 11434)                 │
├─────────────────────────────────────────────────────────────┤
│  Modèle: Gemma3:4b                                         │
│  • Optimisé terminologie médicale française                │
│  • Traitement local (zéro données externes)               │
│  • Fine-tuning pour contexte DI-TSA                       │
│  • Performance: ~2-4 tokens/seconde                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  ChromaDB (Port 8000)                      │
├─────────────────────────────────────────────────────────────┤
│  Base vectorielle:                                         │
│  • Embeddings de terminologie médicale                    │
│  • Recherche sémantique                                   │
│  • Contextualisation des corrections                      │
│  • Persistance locale                                     │
└─────────────────────────────────────────────────────────────┘
```

### Base de Données MongoDB

**Structure des Collections**

```javascript
// Collection: users
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  employeeNumber: String(6), // Optionnel, unique
  role: Enum(['admin', 'standard', 'viewer']),
  pinHash: String,           // bcrypt
  isActive: Boolean,
  createdAt: Date
}

// Collection: patients
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  profileImageURL: String,
  allergies: [String],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String
  }],
  medicalNotes: String,
  isActive: Boolean
}

// Collection: dailyreports
{
  _id: ObjectId,
  shift: Enum(['day', 'evening', 'night']),
  reportDate: Date,
  shiftSupervisor: String,    // userId
  regularEmployees: [String], // userIds
  replacementEmployees: [{
    name: String,
    role: String,
    notes: String
  }],
  patientReports: [{
    patientId: String,
    summary: String,
    customFields: Object,      // Champs configurables
    authorId: String
  }],
  shiftSummary: String,
  incidents: [String],
  createdAt: Date,
  updatedAt: Date
}

// Collection: communications
{
  _id: ObjectId,
  title: String,
  content: String,
  priority: Enum(['low', 'normal', 'high', 'urgent']),
  authorId: String,
  readBy: [{
    userId: String,
    readAt: Date
  }],
  createdAt: Date
}

// Collection: bristolentries
{
  _id: ObjectId,
  patientId: String,
  bristolType: Number(1-7),
  entryDate: Date,
  notes: String,
  recordedBy: String,        // userId
  createdAt: Date
}

// Collection: observationnotes
{
  _id: ObjectId,
  patientId: String,
  content: String,
  category: Enum(['medical', 'behavioral', 'social', 'other']),
  authorId: String,
  createdAt: Date
}

// Collection: auditlogs
{
  _id: ObjectId,
  userId: String,
  action: String,
  resource: String,
  resourceId: String,
  details: Object,
  timestamp: Date,
  ipAddress: String,
  userAgent: String
}
```

**Index de Performance**

```javascript
// Index composites pour optimiser les requêtes fréquentes
db.dailyreports.createIndex({ "shift": 1, "reportDate": 1 }, { unique: true })
db.dailyreports.createIndex({ "reportDate": -1 })
db.dailyreports.createIndex({ "shiftSupervisor": 1 })

db.communications.createIndex({ "priority": 1, "createdAt": -1 })
db.communications.createIndex({ "authorId": 1 })

db.bristolentries.createIndex({ "patientId": 1, "entryDate": -1 })
db.bristolentries.createIndex({ "entryDate": -1 })

db.observationnotes.createIndex({ "patientId": 1, "createdAt": -1 })
db.observationnotes.createIndex({ "category": 1, "createdAt": -1 })

db.auditlogs.createIndex({ "userId": 1, "timestamp": -1 })
db.auditlogs.createIndex({ "resource": 1, "timestamp": -1 })
```

## Infrastructure et Déploiement

### Architecture Docker

```yaml
# docker-compose.yml structure
services:
  # Frontend Application
  clair-frontend:
    image: node:18-alpine
    ports: ["3000:3000"]
    environment:
      - MONGODB_URI
      - AI_BACKEND_URL
      - NEXTAUTH_SECRET
    
  # Base de données principale
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=securepassword
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d

  # Service IA Python
  ai-backend:
    build: ./ai-backend
    ports: ["8001:8000"]
    environment:
      - OLLAMA_URL=http://ollama:11434
      - CHROMADB_URL=http://chromadb:8000

  # Serveur IA local
  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes:
      - ollama_models:/root/.ollama

  # Base vectorielle
  chromadb:
    image: chromadb/chroma:latest
    ports: ["8000:8000"]
    volumes:
      - chromadb_data:/chroma/chroma

  # Proxy et SSL
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - certbot_www:/var/www/certbot
      - certbot_data:/etc/letsencrypt

  # Gestion certificats SSL
  certbot:
    image: certbot/certbot
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_data:/etc/letsencrypt
```

### Configuration Nginx

```nginx
# Configuration SSL et proxy
server {
    listen 443 ssl http2;
    server_name dev.meziani.org;
    
    ssl_certificate /etc/letsencrypt/live/dev.meziani.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev.meziani.org/privkey.pem;
    
    # Sécurité SSL renforcée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;
    
    # Proxy vers CLAIR
    location / {
        proxy_pass http://clair-frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Proxy vers AI Backend
    location /api/ai/ {
        proxy_pass http://ai-backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Sécurité et Authentification

### Système d'Authentification PIN

```typescript
// Architecture d'authentification
interface AuthSystem {
  // Stockage sécurisé des PINs
  pinStorage: {
    algorithm: 'bcrypt',
    saltRounds: 12,
    hashStorage: 'mongodb.users.pinHash'
  },
  
  // Gestion des sessions
  sessionManagement: {
    storage: 'browser-cookies',
    duration: '8 hours',
    renewal: 'activity-based',
    security: 'httpOnly + secure + sameSite'
  },
  
  // Protection contre force brute
  bruteForceProtection: {
    maxAttempts: 5,
    lockoutDuration: '15 minutes',
    progressiveDelay: true
  }
}
```

### Audit et Traçabilité

```typescript
// Système d'audit complet
interface AuditSystem {
  loggedActions: [
    'user_login', 'user_logout',
    'patient_create', 'patient_update', 'patient_view',
    'report_create', 'report_update', 'report_view',
    'communication_send', 'communication_read',
    'bristol_entry', 'observation_create',
    'admin_user_create', 'admin_config_change'
  ],
  
  auditEntry: {
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    timestamp: Date,
    ipAddress: string,
    userAgent: string,
    details: object
  }
}
```

## Performance et Monitoring

### Optimisations Frontend

```typescript
// Stratégies de performance
interface PerformanceOptimizations {
  // Lazy loading des composants
  lazyComponents: [
    'Charts', 'Calendar', 'RichTextEditor', 'ReportTemplates'
  ],
  
  // Mise en cache intelligente
  caching: {
    staticData: 'SWR with 5min stale-while-revalidate',
    userSessions: 'Browser localStorage',
    apiResponses: 'React Query with background updates'
  },
  
  // Optimisation images
  imageOptimization: {
    format: 'WebP with JPEG fallback',
    responsive: 'Next.js Image component',
    lazy: 'Intersection Observer'
  }
}
```

### Monitoring et Métriques

```yaml
# Métriques de santé système
healthChecks:
  frontend:
    endpoint: "/_health"
    checks: ["database_connection", "ai_service_availability"]
  
  ai_backend:
    endpoint: "/health"
    checks: ["ollama_status", "chromadb_connection", "model_loaded"]
  
  database:
    command: "db.adminCommand('ping')"
    checks: ["connection", "replica_status", "disk_space"]

# Monitoring automatisé
monitoring:
  logs: "docker-compose logs with rotation"
  metrics: "Custom health endpoints"
  alerts: "Log-based error detection"
```

## Évolutivité et Maintenance

### Architecture Modulaire

```
src/
├── app/                    # Pages Next.js (App Router)
├── components/
│   ├── ui/                # Composants base (shadcn/ui)
│   ├── forms/             # Formulaires spécialisés
│   ├── charts/            # Visualisations données
│   └── layout/            # Composants layout
├── lib/
│   ├── models/            # Modèles MongoDB (Mongoose)
│   ├── utils/             # Fonctions utilitaires
│   ├── auth/              # Logique authentification
│   ├── database.ts        # Connexion et configuration DB
│   └── constants.ts       # Constantes système
└── middleware.ts          # Middleware Next.js
```

### Stratégie de Déploiement

```bash
# Pipeline de déploiement automatisé
deployment_pipeline:
  1. "Tests automatisés (ESLint + TypeScript)"
  2. "Build optimisé des applications"
  3. "Build et tag des images Docker"
  4. "Déploiement rolling avec health checks"
  5. "Vérification post-déploiement"
  6. "Rollback automatique si échec"

# Gestion des versions
versioning:
  strategy: "Semantic Versioning (semver)"
  branches: "main (production), develop (staging)"
  releases: "Tagged releases with changelog"
```

## Considérations de Conformité

### Protection des Données de Santé

- **Chiffrement**: Toutes les communications HTTPS/TLS 1.3
- **Isolation**: IA locale sans transmission externe
- **Audit**: Traçabilité complète de tous les accès
- **Anonymisation**: Options d'export avec données anonymisées
- **Rétention**: Politiques de conservation configurables

### Normes et Standards

- **PIPEDA**: Conformité loi canadienne sur la protection des renseignements personnels
- **HIPAA**: Pratiques inspirées des standards américains
- **ISO 27001**: Principes de sécurité de l'information
- **WCAG 2.1**: Accessibilité niveau AA pour interfaces utilisateur

Cette architecture technique assure un système robuste, sécurisé et évolutif pour la gestion des soins de santé spécialisés en résidence DI-TSA.
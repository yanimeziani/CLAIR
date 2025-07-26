# Structure de Projet CLAIR - Clean Architecture

## 🏗️ Architecture Générale Nettoyée

Après nettoyage et optimisation, CLAIR utilise une architecture clean avec uniquement les composants fonctionnels et nécessaires.

## 📁 Structure Racine

```
CLAIR/
├── .github/workflows/      # GitHub Actions (déploiement automatisé)
├── clair-app/              # Application Next.js principale
├── docker-compose.yml      # Orchestration microservices
├── deploy.sh              # Script de déploiement
├── docs/                  # Documentation complète
├── README.md              # Documentation principale française
└── CLAUDE.md              # Instructions Claude Code
```

## 🎯 Application CLAIR (`/clair-app/`)

### Structure Clean Next.js 15

```
clair-app/
├── src/
│   ├── app/                    # App Router Next.js 15
│   │   ├── api/               # API Routes organisées par domaine
│   │   │   ├── auth/          # Authentification PIN
│   │   │   ├── patients/      # CRUD usagers
│   │   │   ├── reports/       # Rapports quotidiens
│   │   │   ├── communications/# Messages équipe
│   │   │   ├── bristol/       # Échelle Bristol
│   │   │   ├── observations/  # Notes médicales
│   │   │   ├── ai/           # Services IA locaux
│   │   │   ├── admin/        # Administration
│   │   │   └── export/       # Exports CSV
│   │   ├── dashboard/         # Tableaux de bord par rôle
│   │   ├── patients/          # Pages gestion usagers
│   │   ├── reports/           # Interface rapports
│   │   ├── communications/    # Messages équipe
│   │   ├── bristol/           # Interface Bristol
│   │   ├── observations/      # Notes médicales
│   │   ├── admin/            # Administration
│   │   ├── login/            # Authentification
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Page d'accueil
│   │   └── globals.css       # Styles globaux
│   ├── components/            # Composants réutilisables
│   │   ├── ui/               # Composants shadcn/ui + IA
│   │   ├── charts/           # Graphiques Recharts
│   │   ├── observations/     # Composants observations
│   │   └── providers/        # Providers React
│   ├── lib/                  # Logique métier
│   │   ├── models/           # Modèles MongoDB
│   │   ├── auth/             # Authentification
│   │   ├── constants/        # Constantes
│   │   ├── database.ts       # Connexion MongoDB
│   │   ├── utils.ts          # Utilitaires
│   │   └── audit-logger.ts   # Journalisation
│   ├── hooks/                # Hooks React personnalisés
│   ├── config/               # Configuration
│   └── middleware.ts         # Middleware routes
├── ai-backend/               # Service IA FastAPI
├── docker/                   # Scripts Docker
├── nginx/                    # Configuration Nginx
├── scripts/                  # Scripts SSL et maintenance
├── public/                   # Assets statiques (nettoyés)
├── package.json              # Dépendances Node.js
├── tsconfig.json            # Configuration TypeScript
├── tailwind.config.js       # Configuration Tailwind
├── next.config.ts           # Configuration Next.js
├── Dockerfile               # Image Docker
└── docker-compose.yml       # Services locaux
```

## 🔧 Composants Principaux

### 1. API Routes (`/src/app/api/`)

**Authentification** (`/auth/`)
- `login/route.ts` - Connexion PIN
- `logout/route.ts` - Déconnexion
- `session/route.ts` - Vérification session

**Gestion Usagers** (`/patients/`)
- `route.ts` - CRUD usagers
- `[id]/route.ts` - Usager spécifique
- `[id]/status/route.ts` - Activation/désactivation

**Rapports** (`/reports/`)
- `route.ts` - CRUD rapports quotidiens

**Communications** (`/communications/`)
- `route.ts` - CRUD messages équipe
- `[id]/read/route.ts` - Marquer comme lu

**Échelle Bristol** (`/bristol/`)
- `route.ts` - CRUD entrées Bristol

**IA Services** (`/ai/`)
- `correct-text/route.ts` - Correction texte
- `generate-summary/route.ts` - Résumés automatiques
- `enhance-text/route.ts` - Amélioration texte
- `analyze-text/route.ts` - Analyse contextuelle

**Administration** (`/admin/`)
- `users/route.ts` - Gestion utilisateurs
- `audit-logs/route.ts` - Journaux audit
- `templates/route.ts` - Templates rapports

**Exports** (`/export/`)
- `patients/route.ts` - Export usagers CSV
- `reports/route.ts` - Export rapports CSV
- `bristol/route.ts` - Export Bristol CSV

### 2. Modèles de Données (`/src/lib/models/`)

**Modèles Core**
- `User.ts` - Utilisateurs avec rôles hiérarchiques
- `Patient.ts` - Usagers avec profils médicaux
- `DailyReport.ts` - Rapports quotidiens par quart
- `Communication.ts` - Messages équipe avec urgences
- `BristolEntry.ts` - Échelle Bristol spécialisée
- `ObservationNote.ts` - Notes médicales horodatées
- `ReportTemplate.ts` - Templates configurables
- `AuditLog.ts` - Journalisation complète

### 3. Composants UI (`/src/components/`)

**Composants shadcn/ui avec IA**
- `rich-text-editor.tsx` - Éditeur TipTap avec IA
- `ai-suggestion-modal.tsx` - Suggestions IA contextuelles
- `ai-enhanced-input.tsx` - Champs avec assistance IA
- `ai-assistance-toolbar.tsx` - Barre d'outils IA

**Composants Métier**
- `charts/index.tsx` - Graphiques analytics
- `observations/` - Composants notes médicales
- `ui/` - Composants interface utilisateur

### 4. Services IA (`/ai-backend/`)

**Architecture FastAPI**
- `main.py` - Serveur principal
- `ai_service.py` - Services IA Ollama
- `vector_store.py` - ChromaDB pour contexte
- `database.py` - Connexion base vectorielle
- `requirements.txt` - Dépendances Python

## 🗄️ Base de Données MongoDB

### Collections Principales
```javascript
// Collections avec index optimisés
clair.users              // Utilisateurs système
clair.patients           // Usagers résidences
clair.dailyreports       // Rapports quotidiens
clair.communications     // Messages équipe
clair.bristolentries     // Échelle Bristol
clair.observationnotes   // Notes médicales
clair.reporttemplates    // Templates configurables
clair.auditlogs          // Journaux audit
```

### Index de Performance
```javascript
// Index optimisés pour requêtes fréquentes
db.patients.createIndex({ firstName: 1, lastName: 1 });
db.dailyreports.createIndex({ date: -1, shift: 1 });
db.bristolentries.createIndex({ patientId: 1, date: -1 });
db.communications.createIndex({ createdAt: -1, urgency: 1 });
db.auditlogs.createIndex({ timestamp: -1, userId: 1 });

// Index de recherche textuelle
db.patients.createIndex({ 
  firstName: "text", 
  lastName: "text" 
});
```

## 🐳 Architecture Docker

### Services Microservices
```yaml
# docker-compose.yml
services:
  clair-frontend:     # Next.js (Port 3000)
  mongodb:            # Base de données (Port 27017)
  ai-backend:         # FastAPI IA (Port 8001)
  ollama:             # Modèles IA (Port 11434)
  chromadb:           # Base vectorielle (Port 8000)
  nginx:              # Proxy inverse (Ports 80/443)
  certbot:            # SSL automatique
```

### Volumes Persistants
- `mongodb_data` - Données MongoDB
- `chromadb_data` - Données vectorielles
- `certbot_data` - Certificats SSL
- `certbot_www` - Validation Let's Encrypt

## 🎨 Interface Utilisateur

### Design System
- **Framework**: TailwindCSS 4 avec CSS variables
- **Composants**: Radix UI + shadcn/ui
- **Icônes**: Lucide React
- **Animations**: Framer Motion
- **Graphiques**: Recharts
- **Thème**: Mode sombre/clair automatique

### Responsive Design
```css
/* Breakpoints mobile-first */
sm: 640px   // Téléphones horizontaux
md: 768px   // Tablettes
lg: 1024px  // Ordinateurs portables
xl: 1280px  // Écrans larges
```

### Typographie
- **Headings**: Poppins (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Monospace**: Fira Code pour code

## 🔒 Sécurité

### Authentification
- **Méthode**: PIN 4 chiffres + bcrypt
- **Sessions**: Côté serveur avec cookies sécurisés
- **Middleware**: Protection routes automatique
- **Rôles**: Admin > Standard > Viewer

### Audit et Conformité
- **Journalisation**: Toutes actions utilisateur
- **Données**: Traitement local uniquement
- **IA**: Ollama on-premise (pas d'API externe)
- **SSL**: Certificats Let's Encrypt automatiques

## 📊 API Documentation

### OpenAPI 3.1 Complète
- **Spécification**: `/docs/api/openapi-3.1.yaml`
- **Endpoints**: 25+ routes documentées
- **Schémas**: Modèles complets avec validation
- **Exemples**: Requêtes/réponses détaillées
- **Sécurité**: Authentification session

### Endpoints Principaux
```
GET  /api/patients           # Liste usagers
POST /api/reports            # Nouveau rapport
GET  /api/communications     # Messages équipe
POST /api/bristol            # Entrée Bristol
POST /api/ai/correct-text    # Correction IA
GET  /api/admin/audit-logs   # Journaux audit
```

## 🚀 Déploiement

### CI/CD GitHub Actions
1. **Test** - Ubuntu runner (lint, build, tests)
2. **Deploy** - Self-hosted runner (production)
3. **SSL** - Renouvellement automatique
4. **Health** - Vérifications post-déploiement

### Environnements
- **Production**: https://dev.meziani.org
- **Direct**: http://89.116.170.202:3000
- **Local**: http://localhost:3000

## 📈 Performance

### Optimisations Next.js 15
- **App Router**: SSR/SSG optimisé
- **Turbopack**: Build ultra-rapide
- **Code Splitting**: Chargement différé
- **Image Optimization**: Compression automatique

### Base de Données
- **Index**: Requêtes sub-100ms
- **Connection Pool**: Gestion efficace
- **Aggregation**: Pipelines optimisés

## 🧪 Tests et Validation

### Validation Runtime
- **Zod**: Schémas TypeScript stricts
- **MongoDB**: Validation documents
- **API**: Tests automatiques endpoints
- **UI**: Tests composants essentiels

### Monitoring Production
- **Health Checks**: Endpoints santé
- **Logs**: Journalisation structurée
- **Metrics**: Performance temps réel
- **Alerts**: Notifications erreurs

---

**CLAIR v1.0.0** - Architecture Clean et Production Ready  
Structure optimisée pour maintenabilité et performance maximales
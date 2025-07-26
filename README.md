# CLAIR - Centre Logiciel d'Aide aux Interventions Résidentielles

![CLAIR Logo](https://img.shields.io/badge/CLAIR-Système_de_Gestion_de_Santé-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)

**CLAIR** est une plateforme complète de gestion des soins de santé spécialement conçue pour les résidences DI-TSA (Déficience Intellectuelle - Trouble du Spectre de l'Autisme) au Québec. Le système offre une interface unifiée en français avec assistance IA intégrée, authentification PIN et outils complets de gestion des résidents.

## 🌐 Accès Production

- **URL Principale**: https://dev.meziani.org
- **Accès Direct**: http://89.116.170.202:3000
- **Développement Local**: http://localhost:3000

## 🔑 Identifiants de Démonstration

| Rôle | PIN | Permissions |
|------|-----|-------------|
| **Administrateur** | `1234` | Accès complet, gestion utilisateurs, configuration système |
| **Personnel Standard** | `5678` | Gestion complète des soins, rapports, communications |
| **Visualiseur** | `0000` | Accès en lecture seule aux rapports et communications |

## ✨ Fonctionnalités Principales

### 🏥 Gestion des Usagers
- **Profils Complets**: Informations médicales, allergies, contacts d'urgence
- **Suivi Médical**: Notes d'observation avec catégorisation
- **Gestion des Statuts**: Activation/désactivation des profils
- **Photos de Profil**: Support d'images pour identification visuelle

### 📋 Rapports Quotidiens
- **Rapports de Quart**: Documentation détaillée par équipe (jour/soir/nuit)
- **Rapports d'Usagers**: Suivi individuel avec champs personnalisables
- **Équipe Présente**: Suivi du personnel régulier et de remplacement
- **Incidents**: Documentation des événements particuliers
- **Templates Configurables**: Modèles personnalisables par l'administration

### 🩺 Échelle de Bristol
- **Suivi Spécialisé**: Enregistrement des types Bristol (1-7)
- **Calendrier Visuel**: Interface intuitive pour consultation
- **Historique Complet**: Suivi longitudinal par usager
- **Analyse Temporelle**: Visualisation des tendances

### 💬 Communications d'Équipe
- **Messages Prioritaires**: Système d'urgence avec code couleur
- **Suivi de Lecture**: Indication des messages lus/non lus
- **Communications Persistantes**: Historique complet des échanges
- **Notifications Visuelles**: Alertes pour messages urgents

### 🤖 Assistance IA Intégrée
- **Correction Automatique**: Grammaire et terminologie médicale française
- **Génération de Résumés**: Synthèse automatique des rapports
- **Suggestions Contextuelles**: Aide à la rédaction médicale
- **Traitement Local**: IA sur site (Ollama + Gemma3:4b) pour confidentialité

### 👥 Gestion Utilisateurs (Admin)
- **Gestion des Rôles**: Admin, Standard, Visualiseur
- **Authentification PIN**: Sécurité adaptée aux environnements médicaux
- **Audit Complet**: Journal détaillé de toutes les actions
- **Numéros d'Employés**: Gestion des identifiants du personnel

### 📊 Exports et Rapports
- **Formats CSV**: Export des données avec métadonnées complètes
- **Filtres Avancés**: Par date, quart, usager, etc.
- **Données Complètes**: Tous les champs disponibles pour analyse

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Backend**: API Routes Next.js, FastAPI (Python)
- **Base de Données**: MongoDB avec index optimisés
- **IA**: Ollama (Gemma3:4b) + ChromaDB
- **UI**: Radix UI + composants shadcn/ui
- **Éditeur**: TipTap avec assistance IA intégrée

### Architecture Microservices
```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   CLAIR Next.js │────│    MongoDB   │    │   FastAPI IA    │
│   Port: 3000    │    │  Port: 27017 │    │   Port: 8001    │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │                    │
         └───────────────────────┼────────────────────┘
                                 │
         ┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
         │     Ollama      │────│   ChromaDB   │    │     Nginx       │
         │  Port: 11434    │    │  Port: 8000  │    │  Ports: 80/443  │
         └─────────────────┘    └──────────────┘    └─────────────────┘
```

### Sécurité et Conformité
- **Authentification PIN**: Système à 4 chiffres avec hachage bcrypt
- **Sessions Sécurisées**: Gestion des sessions navigateur
- **Audit Complet**: Traçabilité de toutes les actions
- **IA Locale**: Aucune donnée envoyée vers des services externes
- **Conformité HIPAA**: Pratiques de protection des données de santé

## 🚀 Installation et Déploiement

### Prérequis
- **Node.js**: Version 18 ou supérieure
- **Docker & Docker Compose**: Pour l'environnement complet
- **Git**: Pour le clonage du repository

### Installation Rapide

```bash
# Cloner le repository
git clone https://github.com/yanimeziani/CLAIR.git
cd CLAIR

# Démarrer l'environnement complet
docker-compose up -d

# Accéder à l'application
# http://localhost:3000
```

### Développement Local

```bash
# Installation des dépendances
cd clair-app
npm install

# Démarrer MongoDB et les services IA
docker-compose up -d mongodb ai-backend ollama chromadb

# Démarrer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:3000
```

### Variables d'Environnement

```bash
# Base de données
MONGODB_URI=mongodb://admin:securepassword@localhost:27017/clair?authSource=admin

# Services IA
AI_BACKEND_URL=http://localhost:8001

# Authentification (production)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://dev.meziani.org
```

### Commandes de Développement

```bash
# Démarrage avec Turbopack (recommandé)
npm run dev

# Build de production
npm run build

# Serveur production
npm start

# Linting et vérification types
npm run lint
npm run typecheck

# Reset de la base de données avec données de test
npm run db:reset
```

## 📁 Structure du Projet

```
CLAIR/
├── clair-app/                    # Application Next.js principale
│   ├── src/
│   │   ├── app/                  # App Router Next.js 15
│   │   │   ├── api/              # Routes API
│   │   │   │   ├── auth/         # Authentification
│   │   │   │   ├── patients/     # Gestion usagers
│   │   │   │   ├── reports/      # Rapports quotidiens
│   │   │   │   ├── communications/ # Messages équipe
│   │   │   │   ├── bristol/      # Échelle Bristol
│   │   │   │   ├── ai/           # Services IA
│   │   │   │   └── admin/        # Administration
│   │   │   ├── dashboard/        # Tableaux de bord par rôle
│   │   │   ├── patients/         # Pages usagers
│   │   │   └── auth/            # Pages authentification
│   │   ├── components/           # Composants réutilisables
│   │   │   ├── ui/              # Composants shadcn/ui
│   │   │   ├── forms/           # Formulaires
│   │   │   └── charts/          # Graphiques
│   │   ├── lib/                 # Utilitaires
│   │   │   ├── models/          # Modèles MongoDB
│   │   │   ├── utils/           # Fonctions utilitaires
│   │   │   └── database.ts      # Connexion DB
│   │   └── middleware.ts        # Middleware de route
├── ai-backend/                   # Service IA FastAPI
├── nginx/                       # Configuration proxy
├── docker-compose.yml           # Orchestration services
├── docs/                        # Documentation
│   ├── api/                     # Documentation API
│   ├── deployment/              # Guides déploiement
│   └── user-guide/              # Guide utilisateur
└── scripts/                     # Scripts utilitaires
```

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

## 📄 Licence

Ce projet est propriétaire et destiné à un usage spécialisé dans le domaine des soins de santé DI-TSA au Québec.

## 📞 Contact

- **Développement**: yani.meziani@outlook.com
- **Support**: support@meziani.org
- **Documentation**: https://dev.meziani.org/docs

---

**CLAIR v1.0.0** - Système de Gestion de Santé pour Résidences DI-TSA  
Développé avec ❤️ pour améliorer la qualité des soins au Québec
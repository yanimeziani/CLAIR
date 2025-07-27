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

## 🚀 Installation et déploiement

### Installation rapide
```bash
git clone https://github.com/yanimeziani/CLAIR.git
cd CLAIR
docker-compose up -d
```

Application disponible sur http://localhost:3000

### Déploiement production
```bash
./deploy.sh           # Déploiement complet
./deploy.sh status     # Vérification services
./deploy.sh ssl        # Configuration SSL
```

## 📊 Services Docker

| Service | Port | Description |
|---------|------|-------------|
| CLAIR App | 3000 | Application principale Next.js |
| MongoDB | 27017 | Base de données |
| IA Service | 8001 | FastAPI + Ollama (Gemma3:4b) |
| Nginx | 80/443 | Proxy inverse avec SSL |

## 📚 Documentation

- **[Guide développement](./docs/guide-developpement.md)** - Documentation technique
- **[Diagrammes architecture](./docs/README.md)** - Diagrammes Mermaid complets
- **[CLAUDE.md](./CLAUDE.md)** - Instructions pour développement

## 📄 Licence

**Licence commerciale propriétaire** - Voir [LICENSE.md](./LICENSE.md) pour les détails complets.

### Modèle de licensing
- **Pilote** : Licence gratuite 12 mois pour résidence test
- **Commercial** : 15 000$ CAD par résidence + 3 000$ CAD/an maintenance
- **Support** : Formation incluse + support technique

## 📞 Contact

**Yani Meziani** - Auteur et Propriétaire  
📧 mezianiyani0@gmail.com  
📱 +1 581-978-3122  
🌐 https://meziani.org

---

**© 2025 Yani Meziani. Tous droits réservés.**  
**CLAIR v1.0.0** - Solution de gestion spécialisée pour résidences DI-TSA
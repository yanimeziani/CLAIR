# Guide de développement CLAIR

Documentation technique pour les développeurs travaillant sur CLAIR.

## 🚀 Démarrage rapide

### Installation locale
```bash
git clone https://github.com/yanimeziani/CLAIR.git
cd CLAIR
docker-compose up -d
```

Application disponible sur http://localhost:3000

### Identifiants de test
- **Admin** : PIN 1234
- **Personnel** : PIN 5678  
- **Consultation** : PIN 0000

## 🏗️ Architecture

### Services principaux
- **CLAIR App** (3000) - Application Next.js
- **MongoDB** (27017) - Base de données
- **IA Service** (8001) - FastAPI + Ollama
- **Nginx** (80/443) - Proxy inverse

### Technologies
- Next.js 15 + TypeScript
- MongoDB + Mongoose
- Radix UI + TailwindCSS
- Ollama (Gemma3:4b)

## 📝 Développement

### Commandes essentielles
```bash
cd clair-app

# Développement
npm run dev

# Build production  
npm run build

# Tests et validation
npm run lint
npm run typecheck
```

### Structure des dossiers
```
src/
├── app/                 # Pages et API routes
├── components/          # Composants réutilisables
├── lib/                # Modèles et utilitaires
└── middleware.ts       # Authentification
```

## 🔐 Sécurité

### Authentification
- PIN 4 chiffres hashés (bcrypt)
- Sessions navigateur
- Rôles : Admin/Standard/Viewer

### Données de santé
- IA locale (aucune donnée externe)
- Audit complet des actions
- Chiffrement des sauvegardes

## 📊 Base de données

### Modèles principaux
- **User** - Personnel et authentification
- **Patient** - Profils résidents
- **DailyReport** - Rapports de quart
- **Observation** - Notes d'observation
- **Communication** - Messages d'équipe

### Connexion
```javascript
MONGODB_URI=mongodb://admin:securepassword@localhost:27017/clair
```

## 🤖 Intégration IA

### Service local
- Modèle Gemma3:4b via Ollama
- Correction de texte français
- Terminologie médicale DI-TSA
- API FastAPI sur port 8001

### Utilisation
```javascript
// Correction de texte
const response = await fetch('/api/ai/correct-text', {
  method: 'POST',
  body: JSON.stringify({ text: 'texte à corriger' })
});
```

## 🚢 Déploiement

### Production
```bash
./deploy.sh          # Déploiement complet
./deploy.sh status    # Vérification services
./deploy.sh ssl       # Configuration SSL
```

### Variables d'environnement
```bash
MONGODB_URI=mongodb://...
AI_BACKEND_URL=http://ai-backend:8000
NEXTAUTH_SECRET=secret-key
NEXTAUTH_URL=https://domaine.com
```

## 🔧 Maintenance

### Logs
```bash
docker-compose logs clair-frontend
docker-compose logs mongodb
docker-compose logs ai-backend
```

### Sauvegardes
```bash
# Sauvegarde automatique quotidienne
./scripts/backup-automated.sh

# Restauration
./scripts/restore-backup.sh backup-file.tar.gz
```

## 📞 Support

Pour toute question technique :
- 📧 mezianiyani0@gmail.com
- 📱 +1 581-978-3122

---

**Propriété de Yani Meziani - Licence commerciale**
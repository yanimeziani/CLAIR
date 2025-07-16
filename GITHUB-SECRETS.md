# Configuration des Secrets GitHub Actions

Ce document explique comment configurer les secrets GitHub pour le déploiement automatique avec reset de base de données.

## 📋 Secrets Requis

Vous devez configurer ces secrets dans votre repository GitHub :

### Aller à : `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 1. `NEXTAUTH_SECRET`
```
Description: Clé secrète pour l'authentification
Valeur: [Générer une clé aléatoire de 32 caractères]
Exemple: 7f9c8e5d2a1b4f6e8c3d9a7b5e2f8c1d4a6b9e3f7c2d5a8b1e4f7c9d2a5b8e1f4
```

**Générer une clé :**
```bash
openssl rand -hex 32
```

### 2. Secrets du serveur (si utilisation d'un serveur distant)

Si vous déployez sur un serveur distant via SSH, ajoutez aussi :

#### `HOST`
```
Description: Adresse IP du serveur
Valeur: 89.116.170.202
```

#### `USERNAME` 
```
Description: Nom d'utilisateur SSH
Valeur: [votre-username]
```

#### `SSH_PRIVATE_KEY`
```
Description: Clé privée SSH pour connexion au serveur
Valeur: [contenu de votre clé privée SSH]
```

#### `PORT`
```
Description: Port SSH (optionnel, par défaut 22)
Valeur: 22
```

## 🔧 Configuration Self-Hosted Runner

Votre workflow actuel utilise `runs-on: self-hosted`, ce qui signifie qu'il s'exécute directement sur votre serveur.

### Pour configurer un self-hosted runner :

1. **Sur votre serveur :**
```bash
# Aller dans le dossier du projet
cd /home/irielle/irielle-platform

# Télécharger le runner GitHub
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

2. **Configurer le runner :**
```bash
# Obtenir le token depuis GitHub Settings -> Actions -> Runners
./config.sh --url https://github.com/[USERNAME]/irielle-platform --token [TOKEN]
```

3. **Démarrer le runner comme service :**
```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

## 🚀 Comment Déclencher un Déploiement

### Déploiement Automatique
Chaque `git push` sur la branche `main` déclenche automatiquement :
1. ✅ Tests et build
2. 🗄️ Reset complet de la base de données  
3. 🌱 Seeding avec données fraîches
4. 🚀 Déploiement de tous les services

### Déploiement Manuel
Depuis l'interface GitHub :
1. Aller dans `Actions`
2. Sélectionner `Deploy to Dev Server with DB Reset`
3. Cliquer `Run workflow`
4. Sélectionner la branche `main`
5. Cliquer `Run workflow`

## 📊 Que fait le workflow ?

### Phase 1: Tests
- ✅ Setup Node.js
- 📦 Installation des dépendances  
- 🔍 Linting du code
- 🔨 Build de l'application

### Phase 2: Déploiement avec Reset DB
- 🧹 Nettoyage de l'environnement
- 🗄️ **Suppression complète des volumes DB**
- 🔨 Rebuild des images Docker
- 🗄️ Démarrage et attente de MongoDB
- 🌱 **Seeding avec données fraîches**
- 🚀 Démarrage de tous les services
- 🤖 Initialisation du modèle IA
- ✅ Vérification du déploiement

### Phase 3: Vérification
- 📊 Statut des containers
- 🔍 Health checks
- 📋 Affichage des credentials
- 🌐 URLs d'accès

## 🔐 Résultat après Déploiement

Après chaque déploiement, vous aurez :

```
🔐 LOGIN CREDENTIALS (FRESH RESET):
   👑 Admin PIN: 1234
   👥 Staff PIN: 5678

🌐 ACCESS URLS:
   🔗 Production: http://89.116.170.202:3000
   🏠 Local: http://localhost:3000

📊 FRESH DATA AVAILABLE:
   👤 5 Users (1 admin, 4 staff)
   🏥 5 Patients with complete medical records
   📋 3 Daily reports
   💬 4 Team communications
   📈 Bristol tracking entries
```

## ⚠️ Important pour la Démo

- **Database reset automatique** à chaque déploiement
- **Credentials toujours identiques** : Admin 1234, Staff 5678
- **Données fraîches** pour chaque démonstration
- **Optimisé mobile** prêt pour présentation

## 🔧 Dépannage

### Si le déploiement échoue :
1. Vérifier les logs dans Actions
2. S'assurer que le runner est actif
3. Vérifier les secrets configurés
4. Tester manuellement sur le serveur

### Si MongoDB ne démarre pas :
```bash
docker-compose down --volumes
docker volume prune -f
```

### Si l'application ne répond pas :
```bash
docker-compose logs -f app
```

---

**Statut :** Configuration prête pour déploiement automatique
**Demo :** Optimisée mobile avec reset DB automatique
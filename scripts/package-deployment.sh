#!/bin/bash

# CLAIR Commercial Deployment Package Creator
# Crée un package commercial ready-to-deploy pour CLAIR
# © 2025 Yani Meziani - Tous droits réservés

set -e

echo "🚀 CLAIR Commercial Deployment Package Creator"
echo "=================================================="

# Configuration
PROJECT_NAME="CLAIR"
VERSION="v1.0.0"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="CLAIR_${VERSION}_${TIMESTAMP}"
BUILD_DIR="/tmp/clair_package_${TIMESTAMP}"
FINAL_ZIP="${PROJECT_NAME}_Commercial_${VERSION}_${TIMESTAMP}.zip"

# Créer le répertoire de build
echo "📁 Création du répertoire de package..."
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# 1. Créer l'archive source
echo "📦 Création de l'archive source..."
cd /Users/yanimeziani/Desktop/Current\ projects/CLAIR
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='coverage' \
    --exclude='.env*' \
    --exclude='*.tmp' \
    --exclude='volumes' \
    -czf "$BUILD_DIR/CLAIR_Source_${VERSION}.tar.gz" .

echo "✅ Archive source créée: CLAIR_Source_${VERSION}.tar.gz"

# 2. Build et export des images Docker
echo "🐳 Build et export des images Docker..."
cd /Users/yanimeziani/Desktop/Current\ projects/CLAIR

# Build toutes les images
echo "Building CLAIR frontend..."
docker-compose build clair-frontend

echo "Building AI backend..."
docker-compose build ai-backend

# Export des images Docker
echo "📤 Export des images Docker..."
docker save \
    clair-clair-frontend:latest \
    clair-ai-backend:latest \
    mongo:7.0 \
    nginx:alpine \
    ollama/ollama:latest \
    chromadb/chroma:latest \
    certbot/certbot:latest \
    -o "$BUILD_DIR/CLAIR_Docker_Images_${VERSION}.tar"

echo "✅ Images Docker exportées: CLAIR_Docker_Images_${VERSION}.tar"

# 3. Créer la documentation de déploiement
echo "📚 Création de la documentation de déploiement..."
cat > "$BUILD_DIR/GUIDE_DEPLOIEMENT.md" << 'EOF'
# CLAIR - Guide de Déploiement Commercial

## 🚀 Installation Rapide

### Prérequis
- Ubuntu 20.04+ ou CentOS 8+
- Docker et Docker Compose installés
- 4GB RAM minimum, 8GB recommandé
- 50GB espace disque minimum

### 1. Extraction du package
```bash
# Extraire le code source
tar -xzf CLAIR_Source_v1.0.0.tar.gz

# Charger les images Docker
docker load -i CLAIR_Docker_Images_v1.0.0.tar
```

### 2. Configuration
```bash
cd CLAIR

# Copier le fichier d'environnement
cp .env.production.example .env.production

# Modifier les variables selon votre environnement
nano .env.production
```

### 3. Déploiement
```bash
# Démarrer tous les services
./deploy.sh

# Vérifier le statut
./deploy.sh status

# Configuration SSL (optionnel)
./deploy.sh ssl
```

### 4. Accès système
- **URL**: http://votre-serveur:3000
- **Admin PIN**: 1234 (à changer)
- **Personnel PIN**: 5678

## 🔧 Configuration Avancée

### Variables d'environnement importantes
```
MONGODB_URI=mongodb://admin:securepassword@mongodb:27017/clair
AI_BACKEND_URL=http://ai-backend:8000
NEXTAUTH_SECRET=votre-secret-securise
NEXTAUTH_URL=https://votre-domaine.com
```

### Ports utilisés
- 3000: Application CLAIR
- 27017: MongoDB
- 8001: Service IA
- 80/443: Nginx (HTTP/HTTPS)

## 📞 Support Commercial

**Yani Meziani** - Auteur et Propriétaire
📧 mezianiyani0@gmail.com
📱 +1 581-978-3122
🌐 https://meziani.org

**Licence commerciale** - Voir LICENSE.md
EOF

# 4. Créer le script d'installation automatique
echo "🔧 Création du script d'installation..."
cat > "$BUILD_DIR/install.sh" << 'EOF'
#!/bin/bash

# CLAIR Commercial - Script d'installation automatique
# © 2025 Yani Meziani

set -e

echo "🏥 CLAIR Commercial Installation"
echo "==============================="

# Vérifications prérequis
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Extraction du code source
echo "📦 Extraction du code source..."
if [ -f "CLAIR_Source_v1.0.0.tar.gz" ]; then
    tar -xzf CLAIR_Source_v1.0.0.tar.gz
    cd CLAIR
else
    echo "❌ Archive source non trouvée"
    exit 1
fi

# Chargement des images Docker
echo "🐳 Chargement des images Docker..."
if [ -f "../CLAIR_Docker_Images_v1.0.0.tar" ]; then
    docker load -i ../CLAIR_Docker_Images_v1.0.0.tar
else
    echo "❌ Images Docker non trouvées"
    exit 1
fi

# Configuration environnement
echo "⚙️ Configuration de l'environnement..."
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production
    echo "📝 Fichier .env.production créé. Veuillez le modifier selon vos besoins."
fi

# Démarrage des services
echo "🚀 Démarrage de CLAIR..."
chmod +x deploy.sh
./deploy.sh

echo ""
echo "✅ Installation terminée !"
echo ""
echo "🌐 CLAIR est maintenant accessible sur: http://localhost:3000"
echo "🔑 PIN Admin par défaut: 1234"
echo "🔑 PIN Personnel par défaut: 5678"
echo ""
echo "⚠️  N'oubliez pas de:"
echo "   - Changer les PINs par défaut"
echo "   - Configurer votre domaine dans .env.production"
echo "   - Exécuter './deploy.sh ssl' pour HTTPS"
echo ""
echo "📞 Support: mezianiyani0@gmail.com"
EOF

chmod +x "$BUILD_DIR/install.sh"

# 5. Copier les fichiers essentiels
echo "📋 Copie des fichiers essentiels..."
cp /Users/yanimeziani/Desktop/Current\ projects/CLAIR/LICENSE.md "$BUILD_DIR/"
cp /Users/yanimeziani/Desktop/Current\ projects/CLAIR/README.md "$BUILD_DIR/"

# 6. Créer le fichier de vérification d'intégrité
echo "🔐 Création des checksums..."
cd "$BUILD_DIR"
sha256sum *.tar.gz *.tar > CHECKSUMS.txt

# 7. Créer le package final
echo "📦 Création du package final..."
zip -r "$FINAL_ZIP" \
    CLAIR_Source_${VERSION}.tar.gz \
    CLAIR_Docker_Images_${VERSION}.tar \
    GUIDE_DEPLOIEMENT.md \
    install.sh \
    LICENSE.md \
    README.md \
    CHECKSUMS.txt

# Statistiques du package
PACKAGE_SIZE=$(du -h "$FINAL_ZIP" | cut -f1)
echo ""
echo "🎉 Package commercial CLAIR créé avec succès !"
echo "================================================"
echo "📁 Fichier: $FINAL_ZIP"
echo "📏 Taille: $PACKAGE_SIZE"
echo "📂 Emplacement: $BUILD_DIR"
echo ""
echo "📋 Contenu du package:"
echo "  ✅ Code source complet (tar.gz)"
echo "  ✅ Images Docker pré-buildées (tar)"
echo "  ✅ Script d'installation automatique"
echo "  ✅ Guide de déploiement"
echo "  ✅ Licence commerciale"
echo "  ✅ Documentation"
echo "  ✅ Checksums de vérification"
echo ""
echo "🚀 Ready for commercial deployment!"
echo ""
echo "📤 Vous pouvez maintenant:"
echo "  1. Télécharger le package sur Google Drive"
echo "  2. L'envoyer aux clients/partenaires"
echo "  3. Le déployer sur n'importe quel serveur"
echo ""
echo "📞 Support commercial: mezianiyani0@gmail.com"

# Ouvrir le répertoire dans Finder (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$BUILD_DIR"
fi
EOF
#!/bin/bash

# CLAIR Commercial Package Creator - Version simplifiée
# © 2025 Yani Meziani - Tous droits réservés

set -e

echo "🚀 CLAIR Commercial Package Creator"
echo "===================================="

# Configuration
VERSION="v1.0.0"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="CLAIR_Commercial_${VERSION}_${TIMESTAMP}"
BUILD_DIR="/tmp/clair_commercial_${TIMESTAMP}"
PROJECT_DIR="/Users/yanimeziani/Desktop/Current projects/CLAIR"

echo "📁 Création du répertoire de package: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 1. Créer l'archive source (sans node_modules, .git, etc.)
echo "📦 Création de l'archive source..."
cd "$PROJECT_DIR"
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='coverage' \
    --exclude='.env*' \
    --exclude='*.tmp' \
    --exclude='volumes' \
    --exclude='.DS_Store' \
    -czf "$BUILD_DIR/CLAIR_Source_${VERSION}.tar.gz" .

echo "✅ Archive source créée ($(du -h "$BUILD_DIR/CLAIR_Source_${VERSION}.tar.gz" | cut -f1))"

# 2. Créer un script d'installation simple
echo "🔧 Création du script d'installation..."
cat > "$BUILD_DIR/install.sh" << 'EOF'
#!/bin/bash
set -e

echo "🏥 CLAIR Commercial - Installation"
echo "=================================="

# Vérifications
if ! command -v docker &> /dev/null; then
    echo "❌ Docker requis. Installez Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose requis."
    exit 1
fi

# Extraction
echo "📦 Extraction du code source..."
tar -xzf CLAIR_Source_v1.0.0.tar.gz
cd CLAIR

# Configuration
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production
    echo "📝 Fichier .env.production créé. Modifiez-le selon vos besoins."
fi

# Build et démarrage
echo "🚀 Build et démarrage de CLAIR..."
docker-compose up -d --build

echo "✅ Installation terminée!"
echo "🌐 CLAIR accessible sur: http://localhost:3000"
echo "🔑 PIN Admin: 1234 | PIN Personnel: 5678"
echo "📞 Support: mezianiyani0@gmail.com"
EOF

chmod +x "$BUILD_DIR/install.sh"

# 3. Documentation de déploiement
echo "📚 Création de la documentation..."
cat > "$BUILD_DIR/DEPLOIEMENT.md" << 'EOF'
# CLAIR - Guide de Déploiement Commercial

## Installation Rapide

1. **Extraire et installer**
   ```bash
   ./install.sh
   ```

2. **Configuration** (optionnel)
   - Modifiez `.env.production` selon vos besoins
   - Configurez votre domaine pour SSL

3. **Accès**
   - URL: http://localhost:3000
   - Admin PIN: 1234
   - Personnel PIN: 5678

## Support

**Yani Meziani**
📧 mezianiyani0@gmail.com
📱 +1 581-978-3122

© 2025 Yani Meziani - Licence commerciale
EOF

# 4. Copier fichiers essentiels
echo "📋 Copie des fichiers..."
cp "$PROJECT_DIR/LICENSE.md" "$BUILD_DIR/" 2>/dev/null || echo "⚠️ LICENSE.md non trouvé"
cp "$PROJECT_DIR/README.md" "$BUILD_DIR/" 2>/dev/null || echo "⚠️ README.md non trouvé"

# 5. Créer le package final
echo "📦 Création du package final..."
cd "$BUILD_DIR"
FINAL_ZIP="${PACKAGE_NAME}.zip"
zip -r "$FINAL_ZIP" . -x "*.zip"

# Statistiques
PACKAGE_SIZE=$(du -h "$FINAL_ZIP" | cut -f1)
SOURCE_SIZE=$(du -h "CLAIR_Source_${VERSION}.tar.gz" | cut -f1)

echo ""
echo "🎉 Package commercial créé avec succès!"
echo "======================================="
echo "📁 Package: $FINAL_ZIP"
echo "📏 Taille totale: $PACKAGE_SIZE"
echo "📦 Code source: $SOURCE_SIZE"
echo "📂 Emplacement: $BUILD_DIR"
echo ""
echo "📋 Contenu:"
echo "  ✅ Code source complet (CLAIR_Source_${VERSION}.tar.gz)"
echo "  ✅ Script d'installation automatique (install.sh)"
echo "  ✅ Guide de déploiement (DEPLOIEMENT.md)"
echo "  ✅ Licence commerciale (LICENSE.md)"
echo "  ✅ Documentation (README.md)"
echo ""
echo "🚀 Ready for Google Drive upload!"
echo ""
echo "📤 Prochaines étapes:"
echo "  1. Testez l'installation sur un serveur propre"
echo "  2. Uploadez sur Google Drive"
echo "  3. Partagez avec les clients/partenaires"
echo ""
echo "📞 Support: mezianiyani0@gmail.com"

# Ouvrir le dossier sur macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$BUILD_DIR"
fi

echo "📂 Dossier ouvert dans Finder"
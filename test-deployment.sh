#!/bin/bash

# Script de test rapide du déploiement
echo "🧪 Test rapide du déploiement IRIELLE..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Vérifier que les containers sont en marche
echo "📋 1. Vérification des containers..."
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Des containers sont en marche${NC}"
else
    echo -e "${RED}❌ Aucun container actif${NC}"
    exit 1
fi

# Test 2: Vérifier MongoDB
echo "📋 2. Test MongoDB..."
if docker exec irielle-mongodb mongosh --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB répond${NC}"
else
    echo -e "${RED}❌ MongoDB ne répond pas${NC}"
    exit 1
fi

# Test 3: Vérifier la base de données seedée
echo "📋 3. Vérification des données admin..."
USER_COUNT=$(docker exec irielle-mongodb mongosh --quiet --eval "db.users.countDocuments({role: 'admin'})" irielle 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "1" ]; then
    echo -e "${GREEN}✅ Admin user présent (PIN: 1234)${NC}"
else
    echo -e "${RED}❌ Admin user manquant - relancer le seeding${NC}"
    echo "💡 Commande: npm run db:reset"
fi

# Test 4: Vérifier l'application
echo "📋 4. Test de l'application..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application répond sur http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Application ne répond pas encore (peut être en cours de démarrage)${NC}"
fi

# Test 5: Vérifier les données patients
echo "📋 5. Vérification des données patients..."
PATIENT_COUNT=$(docker exec irielle-mongodb mongosh --quiet --eval "db.patients.countDocuments({})" irielle 2>/dev/null | tail -1)
if [ "$PATIENT_COUNT" = "5" ]; then
    echo -e "${GREEN}✅ $PATIENT_COUNT patients de démonstration présents${NC}"
else
    echo -e "${YELLOW}⚠️  Seulement $PATIENT_COUNT patients trouvés${NC}"
fi

echo ""
echo "🎯 ============================================="
echo "🎯 RÉSUMÉ DU TEST"
echo "🎯 ============================================="
echo "🔐 Credentials de connexion :"
echo "   👑 Admin PIN: 1234"
echo "   👥 Staff PIN: 5678"
echo ""
echo "🌐 URLs d'accès :"
echo "   🏠 Local: http://localhost:3000"
echo "   🔗 Production: http://89.116.170.202:3000"
echo ""
echo "📊 Containers actifs :"
docker-compose ps | grep -E "(Name|------|Up)" || docker-compose ps
echo ""
echo "✅ Test terminé !"
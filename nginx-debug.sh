#!/bin/bash

# Script de diagnostic Nginx pour IRIELLE
echo "🔍 Diagnostic Nginx IRIELLE..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 1. État des containers...${NC}"
docker-compose ps

echo -e "\n${BLUE}📋 2. Logs Nginx (dernières 20 lignes)...${NC}"
docker logs irielle-nginx --tail=20 2>/dev/null || echo -e "${RED}❌ Impossible d'accéder aux logs Nginx${NC}"

echo -e "\n${BLUE}📋 3. Configuration Nginx active...${NC}"
if docker exec irielle-nginx nginx -t 2>/dev/null; then
    echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
else
    echo -e "${RED}❌ Configuration Nginx invalide${NC}"
fi

echo -e "\n${BLUE}📋 4. Test de connectivité aux services backend...${NC}"

# Test frontend service
if docker exec irielle-nginx wget -q --spider http://frontend:3000 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend accessible depuis Nginx${NC}"
else
    echo -e "${RED}❌ Frontend non accessible depuis Nginx${NC}"
fi

# Test AI backend service  
if docker exec irielle-nginx wget -q --spider http://ai-backend:8000 2>/dev/null; then
    echo -e "${GREEN}✅ AI Backend accessible depuis Nginx${NC}"
else
    echo -e "${YELLOW}⚠️  AI Backend non accessible depuis Nginx (normal si pas encore démarré)${NC}"
fi

echo -e "\n${BLUE}📋 5. Test accès externe...${NC}"
if curl -f http://localhost:80 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application accessible via Nginx${NC}"
else
    echo -e "${RED}❌ Application non accessible via Nginx${NC}"
fi

echo -e "\n${BLUE}📋 6. Ports en écoute...${NC}"
docker exec irielle-nginx netstat -tlnp 2>/dev/null || docker exec irielle-nginx ss -tlnp 2>/dev/null || echo "Impossible de lister les ports"

echo -e "\n${BLUE}📋 7. Fichiers de configuration présents...${NC}"
docker exec irielle-nginx ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "Impossible de lister les configs"

echo -e "\n${BLUE}🔧 Solutions recommandées:${NC}"
echo "1. Redémarrer Nginx: docker-compose restart nginx"
echo "2. Utiliser config simple: cp nginx/conf.d/irielle-demo.conf nginx/conf.d/irielle.conf"
echo "3. Rebuild complet: npm run deploy:dev"
echo "4. Vérifier les logs: docker logs irielle-nginx -f"
# Guide de Déploiement et Maintenance - CLAIR

## Vue d'ensemble

Ce guide détaille les procédures de déploiement, maintenance et résolution de problèmes pour la plateforme CLAIR. Il s'adresse aux administrateurs système et équipes DevOps.

## Prérequis Système

### Serveur de Production

**Spécifications minimales recommandées :**
- **CPU**: 4 cœurs (Intel/AMD x64)
- **RAM**: 8 GB minimum, 16 GB recommandé
- **Stockage**: 100 GB SSD (croissance ~2GB/mois en usage normal)
- **Réseau**: Connexion stable, ports 80/443 accessibles
- **OS**: Ubuntu 20.04+ ou CentOS 8+ (Docker compatible)

**Logiciels requis :**
```bash
# Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git pour récupération du code
sudo apt-get update && sudo apt-get install -y git

# Utilitaires de monitoring
sudo apt-get install -y htop iotop nethogs
```

### Configuration Réseau

**Ports à configurer :**
- **Port 80**: HTTP (redirection vers HTTPS)
- **Port 443**: HTTPS (SSL/TLS)
- **Port 22**: SSH (administration)

**Configuration firewall (UFW) :**
```bash
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## Installation Initiale

### 1. Clonage du Repository

```bash
# Créer répertoire de travail
sudo mkdir -p /opt/clair
sudo chown $(whoami):$(whoami) /opt/clair
cd /opt/clair

# Cloner le projet
git clone https://github.com/yanimeziani/CLAIR.git .
```

### 2. Configuration Environnement

**Créer le fichier d'environnement :**
```bash
# Copier le template
cp .env.production.example .env.production

# Éditer avec vos valeurs
nano .env.production
```

**Variables d'environnement critiques :**
```bash
# Base de données
MONGODB_URI=mongodb://admin:VOTRE_MOT_DE_PASSE@mongodb:27017/clair?authSource=admin

# Services IA
AI_BACKEND_URL=http://ai-backend:8000

# Authentification
NEXTAUTH_SECRET=VOTRE_SECRET_ALEATOIRE_64_CARACTERES
NEXTAUTH_URL=https://votre-domaine.com

# URL publique
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### 3. Configuration SSL/DNS

**Configuration DNS :**
```bash
# Pointer votre domaine vers l'IP du serveur
# A    votre-domaine.com    IP_SERVEUR
# AAAA votre-domaine.com    IPv6_SERVEUR (optionnel)
```

**Génération certificats SSL :**
```bash
# Le script automatisé gère Let's Encrypt
./deploy.sh ssl
```

### 4. Déploiement Initial

```bash
# Déploiement complet automatisé
./deploy.sh

# Le script exécute :
# 1. Build des images Docker
# 2. Initialisation base de données
# 3. Configuration SSL
# 4. Démarrage services
# 5. Vérifications santé
```

---

## Scripts de Déploiement

### Script Principal `deploy.sh`

Le script principal automatise toutes les opérations :

```bash
# Déploiement complet
./deploy.sh

# Vérification statut
./deploy.sh status

# Redémarrage services
./deploy.sh restart

# Arrêt système
./deploy.sh stop

# Nettoyage complet
./deploy.sh cleanup

# Configuration SSL
./deploy.sh ssl

# Affichage logs
./deploy.sh logs [service]
```

### Déploiement via GitHub Actions

**Déclenchement automatique :**
- Push sur branche `main`
- Déclenchement manuel via GitHub

**Pipeline de déploiement :**
1. **Phase Test** (ubuntu-latest):
   - Installation dépendances
   - Tests linting
   - Build de production
   - Upload artifacts

2. **Phase Deploy** (self-hosted):
   - Download artifacts de build
   - Déploiement si builds disponibles
   - Fallback vers build fresh si nécessaire
   - Configuration SSL automatique
   - Vérifications post-déploiement

**Configuration secrets GitHub :**
```bash
# Dans GitHub → Settings → Secrets
NEXTAUTH_SECRET=votre_secret_production
```

---

## Architecture Docker Détaillée

### Services et Dépendances

```yaml
# docker-compose.yml - Services principaux
services:
  # Application Next.js
  clair-frontend:
    depends_on: [mongodb, ai-backend]
    environment:
      - MONGODB_URI
      - AI_BACKEND_URL
      - NEXTAUTH_SECRET
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/_health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Base de données MongoDB
  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: securepassword
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]

  # Service IA Python
  ai-backend:
    depends_on: [ollama, chromadb]
    environment:
      - OLLAMA_URL=http://ollama:11434
      - CHROMADB_URL=http://chromadb:8000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]

  # IA locale Ollama
  ollama:
    volumes:
      - ollama_models:/root/.ollama
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/version"]

  # Base vectorielle ChromaDB
  chromadb:
    volumes:
      - chromadb_data:/chroma/chroma
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/heartbeat"]

  # Proxy Nginx
  nginx:
    depends_on: [clair-frontend]
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - certbot_www:/var/www/certbot
      - certbot_data:/etc/letsencrypt

  # Gestion SSL Certbot
  certbot:
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_data:/etc/letsencrypt
```

### Volumes de Données

```bash
# Volumes persistants
docker volume ls | grep clair

# Sauvegarde volumes critiques
docker run --rm -v clair_mongodb_data:/data -v $(pwd):/backup ubuntu tar czf /backup/mongodb-backup-$(date +%Y%m%d).tar.gz /data

# Restauration
docker run --rm -v clair_mongodb_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/mongodb-backup-YYYYMMDD.tar.gz -C /
```

---

## Monitoring et Maintenance

### Surveillance Système

**Monitoring des services :**
```bash
# Status général
docker-compose ps

# Utilisation ressources
docker stats

# Logs en temps réel
docker-compose logs -f --tail=100

# Logs spécifique service
docker-compose logs -f clair-frontend
```

**Métriques de santé :**
```bash
# Health checks automatiques
curl -f http://localhost:3000/_health
curl -f http://localhost:8001/health
curl -f http://localhost:8000/api/v1/heartbeat

# Status MongoDB
docker exec clair-mongodb mongosh --eval "db.adminCommand('ping')"

# Status Ollama
docker exec clair-ollama ollama list
```

### Maintenance Préventive

**Tâches quotidiennes automatisées :**
```bash
# Script de maintenance quotidienne
#!/bin/bash
# /opt/clair/scripts/daily-maintenance.sh

# Nettoyage logs Docker (garde 7 jours)
docker system prune -f --filter "until=168h"

# Vérification santé services
./deploy.sh status > /var/log/clair/health-$(date +%Y%m%d).log

# Sauvegarde base de données
docker exec clair-mongodb mongodump --db clair --out /backup/daily-$(date +%Y%m%d)

# Nettoyage anciennes sauvegardes (garde 30 jours)
find /backup -name "daily-*" -type d -mtime +30 -exec rm -rf {} \;
```

**Cron configuration :**
```bash
# Ajouter au crontab
crontab -e

# Maintenance quotidienne à 2h00
0 2 * * * /opt/clair/scripts/daily-maintenance.sh

# Renouvellement SSL mensuel
0 3 1 * * /opt/clair/deploy.sh ssl

# Redémarrage hebdomadaire (dimanche 4h00)
0 4 * * 0 /opt/clair/deploy.sh restart
```

### Gestion des Logs

**Configuration rotation des logs :**
```bash
# /etc/logrotate.d/clair
/var/log/clair/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 clair clair
    postrotate
        docker kill -s USR1 $(docker ps -q --filter name=clair)
    endscript
}
```

**Monitoring des erreurs :**
```bash
# Erreurs critiques dernières 24h
docker-compose logs --since 24h | grep -i error

# Alertes sur erreurs fréquentes
watch -n 300 'docker-compose logs --since 5m | grep -c ERROR'
```

---

## Procédures de Sauvegarde

### Sauvegarde Complète

**Script de sauvegarde :**
```bash
#!/bin/bash
# /opt/clair/scripts/backup-complete.sh

BACKUP_DIR="/backup/clair-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# 1. Sauvegarde base de données
echo "Sauvegarde MongoDB..."
docker exec clair-mongodb mongodump --db clair --out $BACKUP_DIR/mongodb

# 2. Sauvegarde configuration
echo "Sauvegarde configuration..."
cp -r /opt/clair/nginx $BACKUP_DIR/
cp /opt/clair/.env.production $BACKUP_DIR/
cp /opt/clair/docker-compose.yml $BACKUP_DIR/

# 3. Sauvegarde volumes Docker
echo "Sauvegarde volumes..."
docker run --rm -v clair_mongodb_data:/data -v $BACKUP_DIR:/backup ubuntu tar czf /backup/mongodb-volume.tar.gz /data
docker run --rm -v clair_certbot_data:/data -v $BACKUP_DIR:/backup ubuntu tar czf /backup/certbot-volume.tar.gz /data
docker run --rm -v clair_ollama_models:/data -v $BACKUP_DIR:/backup ubuntu tar czf /backup/ollama-volume.tar.gz /data

# 4. Archive finale
echo "Création archive..."
tar czf /backup/clair-complete-$(date +%Y%m%d-%H%M%S).tar.gz -C /backup $(basename $BACKUP_DIR)
rm -rf $BACKUP_DIR

echo "Sauvegarde terminée: /backup/clair-complete-$(date +%Y%m%d-%H%M%S).tar.gz"
```

### Restauration

**Procédure de restauration complète :**
```bash
#!/bin/bash
# /opt/clair/scripts/restore-complete.sh

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 /path/to/backup.tar.gz"
    exit 1
fi

# 1. Arrêt services
./deploy.sh stop

# 2. Extraction sauvegarde
RESTORE_DIR="/tmp/clair-restore-$(date +%s)"
mkdir -p $RESTORE_DIR
tar xzf $BACKUP_FILE -C $RESTORE_DIR

# 3. Restauration configuration
cp -r $RESTORE_DIR/*/nginx /opt/clair/
cp $RESTORE_DIR/*/.env.production /opt/clair/
cp $RESTORE_DIR/*/docker-compose.yml /opt/clair/

# 4. Restauration volumes
docker run --rm -v clair_mongodb_data:/data -v $RESTORE_DIR:/backup ubuntu tar xzf /backup/*/mongodb-volume.tar.gz -C /
docker run --rm -v clair_certbot_data:/data -v $RESTORE_DIR:/backup ubuntu tar xzf /backup/*/certbot-volume.tar.gz -C /
docker run --rm -v clair_ollama_models:/data -v $RESTORE_DIR:/backup ubuntu tar xzf /backup/*/ollama-volume.tar.gz -C /

# 5. Restauration base de données
./deploy.sh
sleep 30
docker exec clair-mongodb mongorestore --db clair $RESTORE_DIR/*/mongodb/clair

# 6. Nettoyage
rm -rf $RESTORE_DIR

echo "Restauration terminée. Vérifiez le statut avec: ./deploy.sh status"
```

---

## Gestion des Mises à Jour

### Mise à Jour de Production

**Procédure standard :**
```bash
# 1. Sauvegarde pré-mise à jour
./scripts/backup-complete.sh

# 2. Récupération dernière version
git fetch origin
git checkout main
git pull origin main

# 3. Vérification changements breaking
git log --oneline HEAD~10..HEAD

# 4. Mise à jour avec tests
./deploy.sh

# 5. Vérification post-déploiement
./deploy.sh status
curl -f https://votre-domaine.com/_health
```

**Rollback si nécessaire :**
```bash
# Retour version précédente
git log --oneline -5
git checkout COMMIT_PRECEDENT
./deploy.sh

# Ou restauration complète
./scripts/restore-complete.sh /backup/clair-complete-YYYYMMDD-HHMMSS.tar.gz
```

### Mise à Jour des Dépendances

**Mise à jour images Docker :**
```bash
# Vérifier nouvelles versions
docker-compose pull

# Rebuild avec nouvelles images
docker-compose build --no-cache

# Redémarrage avec nouvelles images
./deploy.sh restart
```

**Mise à jour modèle IA :**
```bash
# Vérifier modèles disponibles
docker exec clair-ollama ollama list

# Mise à jour Gemma (si nouvelle version)
docker exec clair-ollama ollama pull gemma3:4b

# Redémarrage service IA
docker-compose restart ai-backend
```

---

## Résolution de Problèmes

### Problèmes Fréquents

#### 1. Service ne démarre pas

**Symptômes :**
- Container en état "Exited" ou "Restarting"
- Logs d'erreur au démarrage

**Diagnostic :**
```bash
# Vérifier status et logs
docker-compose ps
docker-compose logs service-problematique

# Vérifier ressources système
df -h    # Espace disque
free -h  # Mémoire
```

**Solutions courantes :**
```bash
# Problème de permissions
sudo chown -R $(whoami):$(whoami) /opt/clair

# Manque d'espace disque
docker system prune -a -f

# Problème de réseau
docker network prune
docker-compose down && docker-compose up -d
```

#### 2. SSL/HTTPS ne fonctionne pas

**Diagnostic :**
```bash
# Vérifier certificats
docker run --rm -v clair_certbot_data:/certs alpine ls -la /certs/live/

# Tester configuration nginx
docker exec clair-nginx nginx -t

# Vérifier ouverture ports
netstat -tlnp | grep :443
```

**Solutions :**
```bash
# Régénération certificats
./deploy.sh ssl

# Vérification DNS
nslookup votre-domaine.com

# Redémarrage Nginx
docker-compose restart nginx
```

#### 3. Base de données corrompue

**Symptômes :**
- Erreurs de connexion MongoDB
- Données manquantes ou incohérentes

**Récupération :**
```bash
# Vérification intégrité
docker exec clair-mongodb mongosh --eval "db.runCommand({dbStats: 1})"

# Réparation si nécessaire
docker-compose stop mongodb
docker run --rm -v clair_mongodb_data:/data/db mongo:7 mongod --repair
docker-compose start mongodb

# Restauration si échec
./scripts/restore-complete.sh /backup/derniere-sauvegarde.tar.gz
```

#### 4. Performance dégradée

**Diagnostic :**
```bash
# Utilisation ressources
docker stats --no-stream
htop

# Performance base de données
docker exec clair-mongodb mongosh --eval "db.stats()"

# Logs d'erreurs performance
docker-compose logs | grep -i "slow\|timeout\|performance"
```

**Optimisations :**
```bash
# Nettoyage base de données
docker exec clair-mongodb mongosh --eval "db.runCommand({compact: 'collection_name'})"

# Réindexation
docker exec clair-mongodb mongosh --eval "db.collection.reIndex()"

# Augmentation ressources Docker
# Éditer docker-compose.yml - section deploy.resources
```

### Debugging Avancé

**Mode debug pour services :**
```bash
# Debug Next.js
docker-compose exec clair-frontend npm run dev

# Debug Python AI backend
docker-compose exec ai-backend python -m debugpy --listen 0.0.0.0:5678 main.py

# Logs détaillés MongoDB
docker exec clair-mongodb mongosh --eval "db.setLogLevel(2)"
```

**Outils de diagnostic :**
```bash
# Performance réseau entre containers
docker-compose exec clair-frontend ping mongodb
docker-compose exec clair-frontend curl -v http://ai-backend:8000/health

# Analyse ressources
docker exec clair-frontend top
docker exec clair-mongodb mongostat
```

---

## Sécurité et Conformité

### Durcissement Sécurité

**Configuration serveur :**
```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Configuration SSH sécurisée
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# Port 2222 (changement port par défaut)

# Fail2ban pour protection brute force
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

**Monitoring sécurité :**
```bash
# Surveillance logs d'accès
tail -f /var/log/auth.log

# Monitoring connexions réseau
sudo netstat -tuln

# Vérification intégrité fichiers
find /opt/clair -type f -name "*.js" -o -name "*.py" | xargs sha256sum > /var/log/clair/integrity.sha256
```

### Audit et Conformité

**Journalisation étendue :**
```bash
# Configuration rsyslog pour CLAIR
echo '$template CLAIRLogFormat,"%timestamp% %hostname% clair[%procid%]: %msg%\n"
:programname, isequal, "clair" /var/log/clair/application.log;CLAIRLogFormat
& stop' | sudo tee /etc/rsyslog.d/50-clair.conf

sudo systemctl restart rsyslog
```

**Rapports de conformité :**
```bash
# Script génération rapport mensuel
#!/bin/bash
# /opt/clair/scripts/compliance-report.sh

REPORT_DIR="/var/log/clair/compliance/$(date +%Y-%m)"
mkdir -p $REPORT_DIR

# Extraction logs audit
docker exec clair-mongodb mongosh --eval "
db.auditlogs.find({
    timestamp: {
        \$gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        \$lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    }
}).forEach(printjson)
" > $REPORT_DIR/audit-$(date +%Y%m).json

# Statistiques d'utilisation
echo "Rapport mensuel CLAIR - $(date +%B\ %Y)" > $REPORT_DIR/summary.txt
echo "=======================================" >> $REPORT_DIR/summary.txt
docker exec clair-mongodb mongosh --eval "
db.users.countDocuments({isActive: true})
" >> $REPORT_DIR/summary.txt
```

---

## Contact et Support

### Escalade des Problèmes

**Niveaux de support :**
1. **Niveau 1** - Problèmes utilisateur : Guide utilisateur
2. **Niveau 2** - Problèmes technique : Ce guide de déploiement  
3. **Niveau 3** - Problèmes critique : support@meziani.org

**Informations à fournir pour support niveau 3 :**
```bash
# Génération rapport de debug complet
./scripts/generate-debug-report.sh

# Le rapport inclut :
# - Versions logicielles (docker, compose, OS)
# - Configuration système (CPU, RAM, disque)
# - Status et logs des services
# - Configuration réseau
# - Dernières sauvegardes disponibles
```

### Ressources Complémentaires

- **Documentation technique** : `/docs/technical/architecture.md`
- **Guide utilisateur** : `/docs/user-guide/guide-utilisateur.md`
- **Documentation API** : `/docs/api/swagger.yaml`
- **Repository GitHub** : https://github.com/yanimeziani/CLAIR

---

**Version du Guide** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Maintenu par** : Équipe DevOps CLAIR
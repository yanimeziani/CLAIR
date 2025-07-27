# Documentation de Transfert - CLAIR
## Centre Intégré Universitaire de Santé et de Services Sociaux de la Capitale-Nationale (CIUSSSCN)

---

## Table des Matières

1. [Vue d'ensemble du système](#vue-densemble-du-système)
2. [Architecture technique](#architecture-technique)
3. [Installation et déploiement](#installation-et-déploiement)
4. [Sécurité et conformité](#sécurité-et-conformité)
5. [Maintenance et surveillance](#maintenance-et-surveillance)
6. [Formation et support](#formation-et-support)
7. [Procédures de sauvegarde](#procédures-de-sauvegarde)
8. [Contacts et ressources](#contacts-et-ressources)

---

## Vue d'ensemble du système

### Description générale
**CLAIR** (Centre Logiciel d'Aide aux Interventions Résidentielles) est une plateforme de gestion de santé spécialisée pour les résidences DI-TSA (Déficience Intellectuelle - Trouble du Spectre de l'Autisme) au Québec.

### Caractéristiques principales
- **Interface multilingue** : Interface complète en français avec terminologie médicale adaptée
- **Authentification PIN** : Système d'authentification par code PIN 4 chiffres adapté aux environnements de soins
- **IA locale** : Traitement de l'intelligence artificielle sur site pour la conformité aux données de santé
- **Architecture microservices** : Système modulaire containerisé avec Docker
- **Gestion complète des résidents** : Profils médicaux, rapports de quarts, communications d'équipe
- **Audit complet** : Traçabilité de toutes les actions utilisateurs

### Environnement de production actuel
- **URL principale** : https://dev.meziani.org
- **Infrastructure** : VPS dédié avec SSL automatisé
- **Base de données** : MongoDB avec données de test préchargées
- **IA** : Modèle Gemma3:4b via Ollama (local)

---

## Architecture technique

### Stack technologique
```
Frontend: Next.js 15 (App Router) + TypeScript + TailwindCSS
Backend: Next.js API Routes + FastAPI (Python)
Base de données: MongoDB
IA: Ollama (Gemma3:4b)
Conteneurisation: Docker Compose
Proxy: Nginx avec SSL Let's Encrypt
Monitoring: Logs d'audit intégrés
```

### Services et ports
```
┌─────────────────┬──────────┬─────────────────────────────────┐
│ Service         │ Port     │ Description                     │
├─────────────────┼──────────┼─────────────────────────────────┤
│ CLAIR Frontend  │ 3000     │ Application principale Next.js  │
│ MongoDB         │ 27017    │ Base de données primaire        │
│ FastAPI AI      │ 8001     │ Service IA Python               │
│ Ollama          │ 11434    │ Modèle IA local                │
│ ChromaDB        │ 8000     │ Base vectorielle IA            │
│ Nginx           │ 80/443   │ Proxy inverse avec SSL         │
└─────────────────┴──────────┴─────────────────────────────────┘
```

### Modèles de données principaux
- **User** : Authentification staff avec hiérarchie des rôles
- **Patient** : Profils résidents avec informations médicales
- **DailyReport** : Rapports de quarts avec contenu enrichi IA
- **Communication** : Messagerie équipe avec niveaux d'urgence
- **BristolEntry** : Suivi échelle de Bristol spécialisé
- **AuditLog** : Journalisation complète des activités
- **ReportTemplate** : Templates configurables par admin

---

## Installation et déploiement

### Prérequis système
- **OS** : Ubuntu 20.04+ ou CentOS 8+
- **Docker** : Version 20.10+
- **Docker Compose** : Version 2.0+
- **RAM** : Minimum 8GB (recommandé 16GB pour IA)
- **Stockage** : Minimum 50GB SSD
- **Réseau** : Ports 80, 443, 22 ouverts

### Procédure de déploiement complet

#### 1. Clonage et préparation
```bash
# Cloner le dépôt
git clone [URL_DEPOT] /opt/clair
cd /opt/clair

# Configurer les permissions
sudo chown -R $USER:docker /opt/clair
chmod +x deploy.sh
```

#### 2. Configuration environnement
```bash
# Copier et configurer les variables d'environnement
cp .env.example .env

# Variables critiques à configurer :
MONGODB_URI=mongodb://admin:MOTDEPASSE_SECURISE@mongodb:27017/clair?authSource=admin
NEXTAUTH_SECRET=CLE_SECRETE_GENEREE_64_CARACTERES
NEXTAUTH_URL=https://VOTRE_DOMAINE.ciussscn.ca
AI_BACKEND_URL=http://ai-backend:8001
```

#### 3. Déploiement automatisé
```bash
# Déploiement complet avec SSL
./deploy.sh

# Vérification du statut
./deploy.sh status

# Configuration SSL automatique
./deploy.sh ssl
```

#### 4. Vérification post-déploiement
```bash
# Vérifier tous les services
docker-compose ps

# Vérifier les logs
docker-compose logs -f clair-frontend
docker-compose logs -f mongodb

# Test connectivité base de données
docker-compose exec mongodb mongosh -u admin -p
```

### Configuration Nginx pour CIUSSSCN
```nginx
# /etc/nginx/sites-available/clair.ciussscn.ca
server {
    listen 80;
    server_name clair.ciussscn.ca;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clair.ciussscn.ca;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/clair.ciussscn.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clair.ciussscn.ca/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Sécurité et conformité

### Mesures de sécurité implémentées

#### Authentification et autorisation
- **Authentification PIN** : Codes 4 chiffres hachés avec bcrypt
- **Sessions sécurisées** : Stockage en navigateur sans transmission de tokens
- **Hiérarchie des rôles** : Admin → Standard → Viewer
- **Expiration de session** : Déconnexion automatique après inactivité

#### Protection des données
- **IA locale** : Aucune donnée envoyée à des services externes
- **Chiffrement** : TLS 1.3 pour toutes les communications
- **Audit complet** : Traçabilité de toutes les actions avec horodatage
- **Isolation réseau** : Services isolés par Docker networks

#### Conformité HIPAA/PIPEDA
- **Minimisation des données** : Collecte limitée au nécessaire médical
- **Consentement** : Gestion des autorisations par niveaux
- **Portabilité** : Export données en formats standards (CSV/JSON)
- **Droit à l'oubli** : Fonctions de suppression sécurisée

### Checklist de sécurité pour CIUSSSCN
```
□ Changer tous les mots de passe par défaut
□ Générer nouvelles clés de chiffrement
□ Configurer firewall (ports 22, 80, 443 uniquement)
□ Activer fail2ban pour SSH
□ Configurer sauvegarde automatique chiffrée
□ Mettre en place monitoring de sécurité
□ Former les utilisateurs aux bonnes pratiques
□ Documenter les procédures d'incident
```

---

## Maintenance et surveillance

### Surveillance système

#### Logs et monitoring
```bash
# Surveillance des logs d'application
docker-compose logs -f --tail=100 clair-frontend

# Monitoring base de données
docker-compose exec mongodb mongosh --eval "db.stats()"

# Vérification espace disque
df -h

# Monitoring processus
htop
```

#### Points de surveillance critiques
- **Utilisation CPU/RAM** : Seuils à 80% pour alertes
- **Espace disque** : Alert à 85% d'utilisation
- **Logs d'erreur** : Surveillance automatique des erreurs 5xx
- **Base de données** : Temps de réponse et connexions actives
- **Services IA** : Disponibilité Ollama et temps de traitement

### Maintenance préventive

#### Tâches quotidiennes (automatisées)
- Sauvegarde base de données
- Rotation des logs
- Vérification status services
- Monitoring sécurité

#### Tâches hebdomadaires
```bash
# Nettoyage logs anciens
find /var/log -name "*.log" -mtime +7 -delete

# Vérification intégrité base
docker-compose exec mongodb mongosh --eval "db.runCommand({validate: 'users'})"

# Analyse utilisation disque
docker system df
docker system prune -f
```

#### Tâches mensuelles
- Mise à jour sécurité système
- Révision des logs d'audit
- Test procédures de restauration
- Analyse performance

### Procédures d'urgence

#### En cas de panne service
```bash
# Redémarrage service spécifique
docker-compose restart clair-frontend

# Redémarrage complet
docker-compose down
docker-compose up -d

# Vérification logs erreur
docker-compose logs --tail=50 clair-frontend | grep ERROR
```

#### En cas de corruption base données
```bash
# Arrêt sécurisé
docker-compose stop mongodb

# Restauration dernière sauvegarde
./scripts/restore-database.sh YYYY-MM-DD

# Redémarrage et vérification
docker-compose start mongodb
docker-compose exec mongodb mongosh --eval "db.users.count()"
```

---

## Formation et support

### Formation utilisateurs finaux

#### Rôles et accès
- **Administrateurs** : Gestion utilisateurs, templates, exports, audit
- **Personnel standard** : CRUD complet résidents, rapports, communications
- **Observateurs** : Lecture seule rapports et communications

#### Modules de formation recommandés
1. **Authentification et sécurité** (30 min)
   - Utilisation codes PIN
   - Bonnes pratiques sécurité
   - Déconnexion appropriée

2. **Gestion des résidents** (45 min)
   - Création/modification profils
   - Historique médical
   - Contacts d'urgence

3. **Rapports de quarts** (60 min)
   - Rédaction avec assistance IA
   - Templates personnalisés
   - Validation et signatures

4. **Communications d'équipe** (30 min)
   - Messagerie interne
   - Niveaux d'urgence
   - Notifications

5. **Échelle de Bristol** (20 min)
   - Saisie données spécialisées
   - Calendrier visuel
   - Historique trends

### Formation administrateurs système

#### Compétences requises
- **Docker/Containerisation** : Gestion services, logs, débogage
- **MongoDB** : Requêtes, sauvegarde, restauration
- **Nginx** : Configuration proxy, SSL, performance
- **Linux** : Administration système, sécurité, monitoring

#### Formation technique (16h)
1. **Architecture et déploiement** (4h)
2. **Base de données et sauvegarde** (4h)
3. **Sécurité et conformité** (4h)
4. **Monitoring et maintenance** (4h)

---

## Procédures de sauvegarde

### Stratégie de sauvegarde 3-2-1
- **3 copies** : Production + 2 sauvegardes
- **2 supports** : Local + Cloud/Remote
- **1 hors site** : Stockage géographiquement séparé

### Sauvegarde automatisée

#### Script de sauvegarde quotidienne
```bash
#!/bin/bash
# /opt/clair/scripts/backup-daily.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/clair"
S3_BUCKET="ciussscn-clair-backups"

# Sauvegarde MongoDB
docker-compose exec -T mongodb mongodump --authenticationDatabase admin \
  --username admin --password $MONGO_PASSWORD \
  --out /data/backup/mongo_$DATE

# Compression
tar -czf $BACKUP_DIR/clair_backup_$DATE.tar.gz \
  /opt/clair/data/mongo_$DATE \
  /opt/clair/.env \
  /opt/clair/docker-compose.yml

# Upload vers stockage distant (optionnel)
aws s3 cp $BACKUP_DIR/clair_backup_$DATE.tar.gz \
  s3://$S3_BUCKET/daily/

# Nettoyage ancien (garde 30 jours)
find $BACKUP_DIR -name "clair_backup_*.tar.gz" -mtime +30 -delete

# Log de la sauvegarde
echo "$(date): Sauvegarde terminée - clair_backup_$DATE.tar.gz" >> /var/log/clair-backup.log
```

#### Configuration cron
```bash
# /etc/crontab
# Sauvegarde quotidienne à 2h du matin
0 2 * * * root /opt/clair/scripts/backup-daily.sh

# Sauvegarde hebdomadaire dimanche 1h
0 1 * * 0 root /opt/clair/scripts/backup-weekly.sh

# Vérification intégrité mensuelle
0 3 1 * * root /opt/clair/scripts/backup-verify.sh
```

### Procédure de restauration

#### Restauration complète
```bash
#!/bin/bash
# Arrêt des services
docker-compose down

# Extraction sauvegarde
cd /opt/clair
tar -xzf /backup/clair/clair_backup_YYYYMMDD_HHMMSS.tar.gz

# Restauration base données
docker-compose up -d mongodb
sleep 30

docker-compose exec mongodb mongorestore \
  --authenticationDatabase admin \
  --username admin --password $MONGO_PASSWORD \
  --drop /data/backup/mongo_YYYYMMDD_HHMMSS

# Redémarrage complet
docker-compose up -d

# Vérification
docker-compose ps
docker-compose logs clair-frontend | tail -20
```

#### Test de restauration (mensuel)
```bash
#!/bin/bash
# /opt/clair/scripts/test-restore.sh

# Environnement de test isolé
TEST_DIR="/tmp/clair-restore-test"
mkdir -p $TEST_DIR
cd $TEST_DIR

# Copie dernière sauvegarde
cp /backup/clair/clair_backup_$(date +%Y%m%d)*.tar.gz .

# Test extraction et restauration
# [Procédure complète en environnement isolé]

# Rapport de test
echo "Test restauration $(date): STATUS" >> /var/log/clair-restore-test.log
```

---

## Contacts et ressources

### Équipe de développement
- **Développeur principal** : [Nom] - [email] - [téléphone]
- **Support technique** : [Nom] - [email] - [téléphone]
- **Architecture système** : [Nom] - [email] - [téléphone]

### Contacts CIUSSSCN
- **Responsable TI** : [À compléter]
- **Sécurité informatique** : [À compléter]
- **Conformité données santé** : [À compléter]

### Documentation technique
- **Code source** : [URL repository git]
- **Documentation API** : https://[domaine]/api/docs
- **Logs d'audit** : Interface admin -> Logs d'audit
- **Monitoring** : https://[domaine]/admin/monitoring

### Ressources externes
- **Next.js** : https://nextjs.org/docs
- **MongoDB** : https://docs.mongodb.com
- **Docker** : https://docs.docker.com
- **Ollama** : https://ollama.ai/docs

---

## Annexes

### A. Environnement de développement
```bash
# Setup local pour développement
git clone [REPO_URL]
cd clair
npm install
docker-compose -f docker-compose.dev.yml up -d
npm run dev
```

### B. Procédures de mise à jour
```bash
# Mise à jour application
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# Mise à jour base données (migrations)
npm run db:migrate
```

### C. Configuration réseau CIUSSSCN
```
# Exemple configuration firewall
iptables -A INPUT -p tcp --dport 22 -s [IP_ADMIN_CIUSSSCN] -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

---

## Annexe D. Licence et Propriété Intellectuelle

### Modèle de Licence Commerciale
CLAIR est développé sous une **licence commerciale propriétaire** permettant :

#### Déploiement Pilote (Gratuit)
- Licence pilote de 12 mois pour validation du concept
- Usage limité à la résidence initiale
- Support technique inclus

#### Expansion Commerciale
- **Licence d'installation** : 15 000$ CAD/résidence (50+ lits)
- **Redevances annuelles** : 3 000$ CAD/résidence
- **Licence provinciale** : 250 000$ CAD pour le réseau CIUSSSCN complet

#### Protection de la Propriété Intellectuelle
- Code source propriétaire
- Marque déposée "CLAIR"
- Brevets possibles sur les innovations techniques
- Restriction de rétro-ingénierie

**Contact Licensing :**  
[Auteur] - [Email] - [Téléphone]

Pour plus de détails, consulter `LICENSE.md` dans le répertoire racine.

---

**Document préparé pour le transfert vers le CIUSSSCN**  
**Version 1.1 - Date : [Date actuelle]**  
**Dernière mise à jour : [Date]**

*Ce document contient toutes les informations nécessaires pour le transfert, l'exploitation et la maintenance de la plateforme CLAIR au sein de l'infrastructure du CIUSSSCN, incluant les aspects de propriété intellectuelle et de licensing commercial.*
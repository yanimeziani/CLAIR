# Guide de Déploiement Production - CLAIR

## 🚀 Déploiement en 1 Semaine - Plan d'Action

### Vue d'Ensemble
CLAIR est maintenant configuré avec un runner GitHub Actions auto-hébergé pour un déploiement automatisé vers la production sur `dev.meziani.org`.

## 📋 Checklist Production Ready

### ✅ Infrastructure Complète
- **Serveur VPS**: srv723879.hstgr.cloud (89.116.170.202)
- **Runner GitHub Actions**: Configuré et fonctionnel
- **Docker & Docker Compose**: Installés et configurés
- **SSL/TLS**: Certificats Let's Encrypt automatisés
- **Nginx**: Proxy inverse avec configuration HTTPS

### ✅ Applications
- **CLAIR Frontend**: Next.js 15 avec App Router
- **Base de Données**: MongoDB avec données de démonstration
- **IA Backend**: FastAPI + Ollama (Gemma3:4b) local
- **ChromaDB**: Base vectorielle pour l'IA
- **Nginx**: Serveur web avec SSL

### 🔧 Corrections Appliquées
1. **Workspace GitHub Actions**: Configuration correcte du répertoire de travail
2. **Permissions**: Accès sudo pour le runner
3. **Docker**: Installation automatique si manquant
4. **Répertoires**: Création automatique de la structure workspace

## 🛠️ Processus de Déploiement

### Déploiement Automatique
```bash
# Déclencher le déploiement
git add .
git commit -m "Deploy: votre message"
git push origin main
```

### Surveillance du Déploiement
```bash
# Vérifier le statut du runner
ssh root@89.116.170.202 "systemctl status actions.runner.yanimeziani-CLAIR.srv723879-runner.service"

# Voir les logs de déploiement
ssh root@89.116.170.202 "journalctl -f -u actions.runner.yanimeziani-CLAIR.srv723879-runner.service"
```

### Accès Production
- **URL Principale**: https://dev.meziani.org
- **URL Directe**: http://89.116.170.202:3000
- **Identifiants Demo**:
  - Admin: PIN `1234`
  - Personnel: PIN `5678`

## 🔒 Sécurité Production

### Certificats SSL
- **Génération Automatique**: Let's Encrypt via Certbot
- **Renouvellement**: GitHub Actions quotidien
- **Domaines**: dev.meziani.org

### Variables d'Environnement
```bash
NODE_ENV=production
MONGODB_URI=mongodb://admin:securepassword@mongodb:27017/clair?authSource=admin
AI_BACKEND_URL=http://ai-backend:8000
NEXTAUTH_SECRET=[configuré dans GitHub Secrets]
NEXTAUTH_URL=https://dev.meziani.org
```

### Authentification
- **Méthode**: PIN à 4 chiffres avec hachage bcrypt
- **Sessions**: Gestion sécurisée côté serveur
- **Audit**: Traçabilité complète des actions

## 📊 Monitoring Production

### Vérification Santé Services
```bash
# Statut des conteneurs
docker-compose ps

# Logs application
docker-compose logs clair-frontend --tail=50

# Logs base de données
docker-compose logs mongodb --tail=20

# Logs IA
docker-compose logs ai-backend --tail=20
```

### Métriques Clés
- **Disponibilité**: 99.9% objectif
- **Temps de Réponse**: < 2s pour l'interface
- **Base de Données**: MongoDB avec réplication
- **Stockage**: Volumes Docker persistants

## 🔄 Maintenance et Mises à Jour

### Mises à Jour Automatiques
- **Code**: Push vers main déclenche le déploiement
- **Base de Données**: Reset avec données demo (environnement dev)
- **SSL**: Renouvellement automatique quotidien
- **Modèles IA**: Conservation entre déploiements

### Sauvegarde et Restauration
```bash
# Sauvegarde base de données
docker exec clair-mongodb mongodump --out /backup

# Sauvegarde volumes
docker run --rm -v clair_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz /data
```

## 🚨 Dépannage

### Problèmes Courants

#### Déploiement Échoue
```bash
# Vérifier le runner
systemctl status actions.runner.yanimeziani-CLAIR.srv723879-runner.service

# Redémarrer le runner
sudo systemctl restart actions.runner.yanimeziani-CLAIR.srv723879-runner.service
```

#### Application Non Accessible
```bash
# Vérifier nginx
docker-compose logs nginx

# Redémarrer tous les services
docker-compose restart
```

#### Base de Données Indisponible
```bash
# Vérifier MongoDB
docker exec clair-mongodb mongosh --eval "db.adminCommand('ping')"

# Redémarrer MongoDB
docker-compose restart mongodb
```

### Contacts Support
- **Développement**: yani.meziani@outlook.com
- **Infrastructure**: support@meziani.org
- **Urgences**: Voir logs GitHub Actions

## 📈 Roadmap Production (7 jours)

### Jour 1-2: Stabilisation
- [x] Correction pipeline déploiement
- [x] Configuration runner auto-hébergé
- [ ] Tests charge basiques

### Jour 3-4: Documentation
- [x] Guide déploiement français
- [ ] Documentation code complète
- [ ] Manuel utilisateur mis à jour

### Jour 5-6: Validation
- [ ] Tests acceptation utilisateur
- [ ] Validation sécurité
- [ ] Performance benchmarks

### Jour 7: Go-Live
- [ ] Formation équipe
- [ ] Mise en production finale
- [ ] Monitoring post-déploiement

---

**CLAIR v1.0.0** - Système de Gestion de Santé Production Ready  
Infrastructure automatisée pour déploiement continu sécurisé
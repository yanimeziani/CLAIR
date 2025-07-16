# Guide de Déploiement - Serveur de Développement

## 🚨 Configuration Spéciale Dev Server

Ce serveur est configuré pour **RESET automatiquement la base de données** à chaque déploiement. Ceci est volontaire pour les démonstrations et tests.

## 🔐 Identifiants de Connexion (Toujours identiques après reset)

- **Admin PIN:** `1234`
- **Staff PIN:** `5678`

Ces identifiants sont restaurés à chaque déploiement.

## 📋 Commandes de Déploiement

### Déploiement Complet avec Reset DB
```bash
npm run deploy:dev
```
ou
```bash
./deploy-dev.sh
```

### Reset de la Base de Données Uniquement
```bash
npm run db:reset
```

### Démarrage Standard (sans reset)
```bash
docker-compose up -d
```

## 🔄 Que fait le script de déploiement ?

1. **Arrête tous les services Docker**
2. **Supprime les volumes de base de données** (force le reset)
3. **Reconstruit les images Docker** (fresh build)
4. **Démarre MongoDB** et attend qu'il soit prêt
5. **Exécute le seeding** avec données de démonstration
6. **Démarre tous les autres services**
7. **Vérifie que l'application répond**

## 📊 Données de Démonstration Incluses

Après chaque reset, vous aurez :

### Utilisateurs (5)
- **1 Admin:** Admin Principal (PIN: 1234)
- **2 Infirmières:** Dr. Marie Dubois, Jean Tremblay (PIN: 5678)
- **2 Aides:** Sophie Martin, Claire Bergeron (PIN: 5678)

### Patients (5)
- Marie Lavoie (TSA niveau 2, DI légère)
- Pierre Gagnon (DI modérée, Trouble bipolaire)
- Julie Bouchard (TSA niveau 1, Anxiété)
- Marc Leblanc (DI légère)
- Sylvie Roy (DI modérée, Trouble bipolaire)

### Données Médicales
- **3 Rapports quotidiens** avec contenu détaillé
- **4 Communications** d'équipe (2 urgentes, 2 normales)
- **3 Entrées Bristol** avec observations
- **3 Notes d'observation** (positives et significatives)
- **1 Template de rapport** avec champs personnalisés

## 🌐 URLs d'Accès

- **Local:** http://localhost:3000
- **Production:** http://89.116.170.202:3000

## ⚠️ Avertissements Importants

### 🔴 POUR DÉVELOPPEMENT UNIQUEMENT
- La base de données est SUPPRIMÉE à chaque déploiement
- Toutes les données sont perdues et recréées
- Ne JAMAIS utiliser en production

### 🔄 Cycle de Démonstration
1. Déployez avec `npm run deploy:dev`
2. Connectez-vous avec PIN 1234 (admin) ou 5678 (staff)
3. Démontrez les fonctionnalités
4. Redéployez quand vous voulez repartir à zéro

## 🔧 Dépannage

### Si MongoDB ne démarre pas
```bash
docker-compose down --volumes
docker volume prune -f
npm run deploy:dev
```

### Si l'application ne répond pas
```bash
docker-compose logs -f
```

### Pour vérifier l'état des services
```bash
docker-compose ps
```

### Pour voir les logs en temps réel
```bash
docker-compose logs -f app
```

## 📱 Test Mobile

L'application est optimisée pour mobile. Testez sur :
- Chrome DevTools (mode mobile)
- Safari (iOS)
- Chrome mobile (Android)

Les tailles de boutons, navigation et formulaires sont adaptés pour l'usage tactile.

---

**Dernière mise à jour:** Préparation démo mobile
**Statut:** Prêt pour démonstration
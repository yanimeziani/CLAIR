# Documentation CLAIR - Diagrammes Mermaid

Cette documentation présente l'essence du projet CLAIR à travers des diagrammes Mermaid essentiels pour la compréhension et la présentation du système.

## 📋 Vue d'ensemble des documents

### 🏗️ [Architecture Diagrams](./architecture-diagrams.md)
Diagrammes techniques fondamentaux du système CLAIR

- **Vue d'ensemble système** - Architecture microservices complète
- **Microservices** - Services Docker avec ports et interconnexions
- **Flux d'authentification PIN** - Processus de connexion healthcare-optimized
- **Modèle de données** - Relations entre entités MongoDB
- **Flux d'observation** - Processus de création unifié
- **Rôles et permissions** - Hiérarchie Admin/Standard/Viewer
- **Déploiement et sauvegarde** - Pipeline automatisé
- **Intégration IA** - Traitement local HIPAA-compliant
- **Données de santé** - Mindmap de l'écosystème complet

### 👥 [User Journey Diagrams](./user-journey-diagrams.md)
Parcours utilisateur et flux d'interaction métier

- **Journey par rôle** - Expérience quotidienne Admin/Standard/Viewer
- **Flux d'interaction** - Navigation entre fonctionnalités
- **Création d'observation** - Processus détaillé mode dual
- **Communication équipe** - Flux temps réel asynchrone
- **Rapport de quart** - Workflow complet avec assistance IA
- **Bristol Scale** - Parcours spécialisé DI-TSA
- **Audit et conformité** - Traçabilité réglementaire

### ⚙️ [Technical Diagrams](./technical-diagrams.md)
Diagrammes techniques avancés pour équipes IT

- **Stack technologique** - Écosystème complet Next.js/MongoDB/IA
- **Pipeline CI/CD** - Déploiement automatisé GitHub Actions
- **Sécurité données** - Architecture protection healthcare
- **Performance** - Optimisations multi-niveaux
- **Monitoring** - Observabilité et alerting système
- **Temps réel** - Flux de données synchrones/asynchrones
- **Backup/Recovery** - Stratégie sauvegarde entreprise

### 🎯 [Presentation Diagrams](./presentation-diagrams.md)
Diagrammes stratégiques pour décideurs et investisseurs

- **Vue stratégique** - Mindmap vision et valeur
- **Proposition de valeur** - Problèmes → Solutions → Bénéfices
- **Roadmap déploiement** - Planning structuré 3 phases
- **Modèle économique** - Revenus et segments clients
- **Positionnement concurrentiel** - Quadrant d'analyse
- **Impact organisationnel** - Transformation équipes soignantes
- **KPI de succès** - Métriques mesurables
- **Stratégie croissance** - Expansion 4 ans
- **Vision long terme** - Timeline 2025-2030

## 🎨 Utilisation des diagrammes

### Pour les présentations
```markdown
# Insérer un diagramme dans une présentation
![Architecture CLAIR](./docs/architecture-diagrams.md#vue-densemble-du-système)
```

### Pour le développement
Les diagrammes techniques servent de référence pour :
- Architecture système et choix technologiques
- Flux de données et intégrations
- Processus de déploiement et monitoring
- Sécurité et conformité

### Pour les parties prenantes
- **Décideurs métier** → Presentation Diagrams
- **Équipes techniques** → Technical Diagrams  
- **Utilisateurs finaux** → User Journey Diagrams
- **Architectes système** → Architecture Diagrams

## 🔄 Maintenance des diagrammes

Ces diagrammes sont maintenus à jour avec l'évolution du projet CLAIR. Lors de modifications majeures :

1. Mettre à jour les diagrammes concernés
2. Valider la cohérence entre documents
3. Versionner les changements avec Git
4. Communiquer les mises à jour aux équipes

## 📊 Formats supportés

Tous les diagrammes utilisent la syntaxe **Mermaid** qui peut être rendue dans :
- GitHub/GitLab (natif)
- Documentation Markdown
- Outils de présentation (Notion, Confluence)
- Exportation PNG/SVG via CLI

## 🚀 Projet CLAIR

**CLAIR** (Centre Logiciel d'Aide aux Interventions Résidentielles) est une plateforme de gestion healthcare spécialisée pour les résidences DI-TSA au Québec, intégrant :

- ✅ Interface française optimisée healthcare
- ✅ IA locale Ollama (conformité HIPAA/PIPEDA)
- ✅ Authentification PIN pour environnements partagés
- ✅ Architecture microservices containerisée
- ✅ Système d'audit complet et traçabilité
- ✅ Déploiement automatisé avec SSL
- ✅ Support mobile responsive
- ✅ Intégration Échelle Bristol spécialisée

---

*Documentation générée pour présenter l'essence du projet CLAIR aux parties prenantes techniques et métier.*
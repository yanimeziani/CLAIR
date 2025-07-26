# Guide Utilisateur CLAIR

## Introduction

CLAIR (Centre Logiciel d'Aide aux Interventions Résidentielles) est votre outil quotidien pour la gestion des soins en résidence DI-TSA. Ce guide vous accompagne dans l'utilisation de toutes les fonctionnalités de la plateforme.

## Connexion à CLAIR

### Accès à la Plateforme

- **URL Web**: https://dev.meziani.org
- **Accès Direct**: http://89.116.170.202:3000
- **Compatible**: Ordinateurs, tablettes et téléphones

### Se Connecter

1. **Saisir votre PIN**: Entrez votre code à 4 chiffres
2. **Validation**: Appuyez sur "Se connecter"
3. **Accès**: Vous êtes dirigé vers votre tableau de bord personnalisé

> 💡 **Astuce**: Si vous oubliez votre PIN, contactez un administrateur pour le réinitialiser.

---

## Interface Générale

### Navigation Principale

La barre de navigation contient :
- **🏠 Accueil**: Retour au tableau de bord
- **👥 Usagers**: Gestion des résidents
- **📋 Rapports**: Rapports de quarts
- **💬 Communications**: Messages d'équipe
- **🩺 Bristol**: Suivi échelle Bristol
- **⚙️ Administration**: (Admins uniquement)

### Tableaux de Bord par Rôle

#### Tableau de Bord Administrateur
- **Statistiques système**: Nombre d'usagers, rapports récents
- **Gestion utilisateurs**: Création et modification du personnel
- **Configuration**: Templates de rapports, paramètres système
- **Exports**: Téléchargement des données en CSV
- **Audit**: Consultation des journaux d'activité

#### Tableau de Bord Personnel Standard
- **Vue d'ensemble**: Usagers actifs, rapports en cours
- **Actions rapides**: Nouveau rapport, message urgent
- **Bristol du jour**: Entrées récentes à compléter
- **Communications**: Messages non lus et prioritaires

#### Tableau de Bord Visualiseur
- **Consultation**: Rapports récents en lecture seule
- **Communications**: Messages d'équipe
- **Données Bristol**: Consultation des tendances
- **Recherche**: Filtres pour trouver l'information

---

## Gestion des Usagers

### Consulter un Usager

1. **Accès**: Menu "Usagers" → Sélectionner un résident
2. **Informations disponibles**:
   - **Profil**: Photo, nom, date de naissance
   - **Médical**: Allergies, notes médicales
   - **Contacts**: Personnes d'urgence avec téléphones
   - **Historique**: Rapports et observations récentes

### Ajouter un Nouvel Usager (Admin/Standard)

1. **Navigation**: Menu "Usagers" → "Nouvel Usager"
2. **Informations requises**:
   - Prénom et nom
   - Date de naissance
   - Photo de profil (optionnelle)
3. **Informations médicales**:
   - Liste des allergies
   - Notes médicales importantes
4. **Contacts d'urgence**:
   - Nom, lien de parenté, téléphone
   - Plusieurs contacts possibles
5. **Validation**: Cliquer "Enregistrer"

### Modifier un Usager

1. **Sélection**: Usager → Bouton "Modifier"
2. **Édition**: Tous les champs sont modifiables
3. **Sauvegarde**: Bouton "Mettre à jour"

> ⚠️ **Important**: Seuls les admins et le personnel standard peuvent modifier les profils d'usagers.

---

## Rapports Quotidiens

### Comprendre les Rapports

Les rapports de quart documentent :
- **Équipe présente**: Personnel régulier + remplacements
- **État des usagers**: Rapport individuel pour chaque résident
- **Résumé du quart**: Vue d'ensemble de la période
- **Incidents**: Événements particuliers à signaler

### Créer un Rapport de Quart

#### 1. Informations Générales
- **Quart**: Jour (7h-15h), Soir (15h-23h), Nuit (23h-7h)
- **Date**: Sélection automatique (modifiable)
- **Superviseur**: Votre nom (pré-rempli)

#### 2. Équipe Présente
- **Personnel régulier**: Sélection dans la liste des employés
- **Remplacements**: Ajout manuel avec nom, rôle et notes

#### 3. Rapports d'Usagers
Pour chaque résident :
- **Résumé**: Description de l'état et des soins prodigués
- **Assistance IA disponible**: Correction et suggestions
- **Champs personnalisés**: Selon les templates configurés

#### 4. Résumé et Incidents
- **Résumé général**: Vue d'ensemble du quart
- **Incidents**: Liste des événements particuliers

#### 5. Validation
- **Vérification**: Relecture des informations
- **Enregistrement**: Sauvegarde définitive

### Utiliser l'Assistance IA

L'IA intégrée vous aide à :

#### Correction de Texte
- **Activation**: Icône "✨" dans l'éditeur
- **Fonction**: Correction grammaticale et terminologie médicale
- **Usage**: Sélectionnez le texte → Clic sur l'icône IA

#### Génération de Résumés
- **Utilisation**: Après rédaction d'un rapport détaillé
- **Résultat**: Résumé concis et professionnel
- **Édition**: Le résumé peut être modifié manuellement

#### Suggestions Contextuelles
- **Aide**: Suggestions de formulations médicales appropriées
- **Terminologie**: Vocabulaire spécialisé DI-TSA
- **Confidentialité**: Tout traitement reste local (aucune donnée externe)

---

## Communications d'Équipe

### Types de Messages

#### Niveaux de Priorité
- **🔴 Urgent**: Attention immédiate requise
- **🟠 Élevée**: Important, à lire rapidement
- **🟢 Normale**: Information standard
- **⚪ Faible**: Information générale

### Envoyer un Message

1. **Accès**: Menu "Communications" → "Nouveau Message"
2. **Composition**:
   - **Titre**: Sujet clair et concis
   - **Contenu**: Message détaillé avec éditeur enrichi
   - **Priorité**: Sélection du niveau d'urgence
3. **Envoi**: Validation et diffusion à toute l'équipe

### Consulter les Messages

1. **Liste**: Messages triés par priorité puis date
2. **Indicateurs visuels**:
   - **●** : Message non lu
   - **○** : Message lu
   - Couleur selon priorité
3. **Lecture**: Clic sur le message pour l'ouvrir
4. **Marquage automatique**: Lecture = marqué comme lu

---

## Suivi Échelle Bristol

### Comprendre l'Échelle Bristol

L'échelle Bristol classifie les selles selon 7 types :
- **Type 1-2**: Constipation sévère à modérée
- **Type 3-4**: Selles normales et idéales
- **Type 5-6**: Tendance diarrhéique
- **Type 7**: Diarrhée liquide

### Enregistrer une Entrée Bristol

1. **Navigation**: Menu "Bristol" → "Nouvelle Entrée"
2. **Sélection usager**: Choix dans la liste déroulante
3. **Type Bristol**: Sélection de 1 à 7 avec descriptions visuelles
4. **Date et heure**: Moment de l'observation
5. **Notes optionnelles**: Observations complémentaires
6. **Enregistrement**: Sauvegarde de l'entrée

### Consulter l'Historique Bristol

#### Vue Calendrier
- **Navigation mensuelle**: Flèches pour changer de mois
- **Codes couleur**: Types Bristol représentés visuellement
- **Filtres**: Par usager ou période

#### Vue Graphique
- **Tendances**: Évolution sur plusieurs semaines/mois
- **Analyse**: Identification de patterns ou changements
- **Export**: Données téléchargeables pour suivi médical

---

## Notes d'Observation

### Types d'Observations

- **🩺 Médicale**: État de santé, symptômes, traitements
- **🧠 Comportementale**: Interactions, humeur, activités
- **👥 Sociale**: Relations, communications, participations
- **📝 Autre**: Observations générales

### Créer une Observation

1. **Accès**: Profil usager → "Nouvelle Observation"
2. **Catégorie**: Sélection du type d'observation
3. **Contenu**: Description détaillée avec assistance IA
4. **Horodatage**: Automatique (date/heure courante)
5. **Sauvegarde**: Enregistrement dans l'historique

### Consulter les Observations

- **Chronologie**: Ordre chronologique inverse (plus récent d'abord)
- **Filtrage**: Par catégorie, période ou auteur
- **Recherche**: Mots-clés dans le contenu

---

## Administration (Admins uniquement)

### Gestion des Utilisateurs

#### Créer un Utilisateur
1. **Navigation**: Administration → "Utilisateurs" → "Nouvel Utilisateur"
2. **Informations**:
   - Prénom, nom, numéro d'employé (optionnel)
   - Rôle : Admin, Standard ou Visualiseur
   - PIN à 4 chiffres
3. **Validation**: Création du compte

#### Modifier un Utilisateur
- **Statut**: Activer/désactiver un compte
- **Rôle**: Changer les permissions
- **PIN**: Réinitialisation si nécessaire

### Configuration des Templates

#### Templates de Rapports
- **Champs personnalisés**: Ajout de champs spécifiques à votre résidence
- **Validation**: Champs obligatoires ou optionnels
- **Ordre**: Organisation des sections du rapport

### Journaux d'Audit

#### Consultation des Logs
- **Activités**: Toutes les actions système
- **Filtres**: Par utilisateur, action ou période
- **Export**: Téléchargement pour archivage

#### Informations Disponibles
- Qui a fait quoi et quand
- Adresses IP et navigateurs
- Détails des modifications

### Exports de Données

#### Types d'Exports Disponibles
- **Usagers**: Profils complets avec contacts
- **Rapports**: Rapports de quarts avec filtres
- **Bristol**: Données complètes d'échelle Bristol
- **Audit**: Journaux d'activité système

#### Format CSV
- **Compatibilité**: Excel, Google Sheets, etc.
- **Métadonnées**: Informations complètes incluses
- **Anonymisation**: Option pour retirer données personnelles

---

## Bonnes Pratiques

### Sécurité

- **PIN privé**: Ne partagez jamais votre code d'accès
- **Déconnexion**: Toujours se déconnecter après usage
- **Écrans verrouillés**: Sur appareils partagés
- **Mises à jour**: Garder navigateur à jour

### Rédaction Professionnelle

- **Objectivité**: Facts observés, pas d'interprétations personnelles
- **Clarté**: Langage simple et précis
- **Exhaustivité**: Informations complètes et pertinentes
- **Respect**: Dignité et confidentialité des usagers

### Utilisation de l'IA

- **Assistance**: L'IA aide mais ne remplace pas votre jugement
- **Vérification**: Toujours relire les suggestions IA
- **Confidentialité**: Données traitées localement uniquement
- **Apprentissage**: Plus vous l'utilisez, plus elle s'améliore

### Communication d'Équipe

- **Priorités**: Utilisez les niveaux appropriés
- **Clarté**: Titres explicites et contenu structuré
- **Réactivité**: Répondez aux messages urgents rapidement
- **Respect**: Ton professionnel en toutes circonstances

---

## Résolution de Problèmes

### Problèmes de Connexion

**Symptôme**: PIN refusé
- **Solution**: Vérifiez la saisie, contactez admin si persistant

**Symptôme**: Page ne charge pas
- **Solution**: Rafraîchir (F5), vérifier connexion internet

### Problèmes d'Interface

**Symptôme**: Boutons non cliquables
- **Solution**: Recharger la page, essayer navigateur différent

**Symptôme**: Sauvegarde impossible
- **Solution**: Vérifier tous champs requis, connexion stable

### Problèmes IA

**Symptôme**: IA non disponible
- **Solution**: Service peut être temporairement indisponible, réessayer plus tard

**Symptôme**: Corrections inappropriées
- **Solution**: Signaler à l'administration pour amélioration du modèle

---

## Support Technique

### Contacts
- **Support technique**: support@meziani.org
- **Formation**: Demander session de formation personnalisée
- **Suggestions**: feedback@meziani.org

### Ressources
- **Documentation complète**: Disponible dans l'interface
- **Mises à jour**: Annonces via communications système
- **Formation**: Sessions régulières pour nouvelles fonctionnalités

---

## Conclusion

CLAIR est conçu pour simplifier et améliorer la documentation des soins en résidence DI-TSA. L'utilisation régulière et l'adoption des bonnes pratiques garantissent une meilleure qualité de soins et une communication d'équipe optimale.

Pour toute question ou suggestion d'amélioration, n'hésitez pas à contacter l'équipe de support technique.

**Version du Guide**: 1.0.0  
**Dernière mise à jour**: Janvier 2025
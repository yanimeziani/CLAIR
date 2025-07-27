# CLAIR - Diagrammes de parcours utilisateur

## Parcours utilisateur par rôle

```mermaid
journey
    title Parcours Administrateur CLAIR
    section Connexion
      Saisie PIN admin: 5: Admin
      Authentification: 4: Admin
      Accès tableau de bord: 5: Admin
    section Gestion quotidienne
      Consultation statistiques: 5: Admin
      Vérification communications urgentes: 4: Admin
      Création nouvelle observation: 5: Admin
    section Administration système
      Gestion utilisateurs: 5: Admin
      Configuration templates: 4: Admin
      Consultation logs audit: 5: Admin
      Paramètres système: 4: Admin
    section Opérations critiques
      Sauvegarde manuelle: 3: Admin
      Export données: 4: Admin
      Monitoring système: 5: Admin
```

```mermaid
journey
    title Parcours Intervenant Standard
    section Début de quart
      Connexion PIN: 5: Intervenant
      Consultation communications: 5: Intervenant
      Vérification usagers assignés: 5: Intervenant
    section Interventions quotidiennes
      Création observations: 5: Intervenant
      Saisie échelle Bristol: 4: Intervenant
      Rédaction rapport de quart: 5: Intervenant
      Communication équipe: 4: Intervenant
    section Suivi médical
      Consultation historique usager: 5: Intervenant
      Mise à jour informations: 4: Intervenant
      Signalement incidents: 3: Intervenant
    section Fin de quart
      Finalisation rapports: 4: Intervenant
      Transmission équipe suivante: 5: Intervenant
      Déconnexion: 5: Intervenant
```

## Flux d'interaction par fonctionnalité

```mermaid
flowchart TD
    Login[Connexion PIN] --> Dashboard{Rôle utilisateur}
    
    Dashboard -->|Admin| AdminFlow[Flux Administrateur]
    Dashboard -->|Standard| StandardFlow[Flux Intervenant]
    Dashboard -->|Viewer| ViewerFlow[Flux Consultation]
    
    subgraph AdminFlow["🔧 Flux Administrateur"]
        AdminDash[Tableau de bord admin]
        UserMgmt[Gestion utilisateurs]
        SystemOps[Opérations système]
        AuditLogs[Logs d'audit]
        Settings[Paramètres]
        
        AdminDash --> UserMgmt
        AdminDash --> SystemOps
        AdminDash --> AuditLogs
        AdminDash --> Settings
    end
    
    subgraph StandardFlow["👩‍⚕️ Flux Intervenant"]
        StandardDash[Tableau de bord intervenant]
        Patients[Gestion usagers]
        Reports[Rapports de quart]
        Obs[Observations]
        Comms[Communications]
        Bristol[Échelle Bristol]
        
        StandardDash --> Patients
        StandardDash --> Reports
        StandardDash --> Obs
        StandardDash --> Comms
        StandardDash --> Bristol
    end
    
    subgraph ViewerFlow["👁️ Flux Consultation"]
        ViewerDash[Tableau de bord consultation]
        ViewReports[Lecture rapports]
        ViewPatients[Consultation usagers]
        ViewComms[Lecture communications]
        
        ViewerDash --> ViewReports
        ViewerDash --> ViewPatients
        ViewerDash --> ViewComms
    end

    classDef admin fill:#ff5722
    classDef standard fill:#2196f3
    classDef viewer fill:#4caf50
    classDef shared fill:#9c27b0

    class AdminFlow,AdminDash,UserMgmt,SystemOps,AuditLogs,Settings admin
    class StandardFlow,StandardDash,Patients,Reports,Obs,Comms,Bristol standard
    class ViewerFlow,ViewerDash,ViewReports,ViewPatients,ViewComms viewer
    class Login,Dashboard shared
```

## Parcours de création d'observation détaillé

```mermaid
stateDiagram-v2
    [*] --> ChoixAccès
    
    ChoixAccès --> ActionsRapides : Dashboard - Actions rapides
    ChoixAccès --> PageUsager : Page usagers - Menu déroulant
    
    state ActionsRapides {
        [*] --> SélectionUsager
        SélectionUsager --> SaisieContenu : Usager choisi
        SaisieContenu --> ValidationRapide
        ValidationRapide --> [*] : Observation créée
    }
    
    state PageUsager {
        [*] --> UsagerPréSélectionné
        UsagerPréSélectionné --> TypeObservation
        TypeObservation --> ÉvénementSignificatif
        ÉvénementSignificatif --> SaisieContenuDétaillée
        SaisieContenuDétaillée --> SignatureÉlectronique
        SignatureÉlectronique --> ValidationComplète
        ValidationComplète --> [*] : Observation signée
    }
    
    ActionsRapides --> [*]
    PageUsager --> [*]
    
    note right of ActionsRapides
        Mode simplifié
        Sélection usager
        Contenu minimal
    end note
    
    note right of PageUsager
        Mode avancé
        Usager contextualisé
        Signature électronique
        Événement significatif
    end note
```

## Flux de communication d'équipe

```mermaid
sequenceDiagram
    participant I1 as Intervenant 1
    participant UI as Interface CLAIR
    participant API as API Backend
    participant DB as MongoDB
    participant I2 as Intervenant 2
    participant I3 as Intervenant 3

    I1->>UI: Nouveau message d'équipe
    UI->>I1: Sélection destinataires
    I1->>UI: Choix urgence + contenu
    UI->>API: POST /api/communications
    API->>DB: Sauvegarde message
    DB-->>API: Confirmation
    API-->>UI: Message créé
    UI-->>I1: Confirmation envoi

    par Notifications temps réel
        API->>I2: Notification (si connecté)
        API->>I3: Notification (si connecté)
    end

    I2->>UI: Consultation messages
    UI->>API: GET /api/communications
    API->>DB: Récupération messages
    DB-->>API: Messages + statuts lecture
    API-->>UI: Affichage avec badges
    UI-->>I2: Messages avec urgence visuelle

    I2->>UI: Marquer comme lu
    UI->>API: POST /api/communications/{id}/read
    API->>DB: Mise à jour statut
    DB-->>API: Confirmation
    API-->>UI: Statut mis à jour

    Note over I1,I3: Communication asynchrone<br/>Traçabilité complète<br/>Niveaux d'urgence
```

## Parcours de rapport de quart

```mermaid
flowchart TD
    Start([Début de quart]) --> CheckExisting{Rapport existant?}
    
    CheckExisting -->|Oui| EditMode[Mode édition]
    CheckExisting -->|Non| CreateMode[Mode création]
    
    CreateMode --> SelectShift[Sélection équipe<br/>Jour/Soir/Nuit]
    SelectShift --> TeamComposition[Composition équipe<br/>Titulaires + Remplaçants]
    TeamComposition --> PatientReports[Rapports par usager]
    
    EditMode --> PatientReports
    
    PatientReports --> PatientLoop{Pour chaque usager}
    PatientLoop --> IndividualReport[Rapport individuel]
    IndividualReport --> AIAssist[Assistance IA<br/>Correction + Suggestions]
    AIAssist --> NextPatient{Usager suivant?}
    NextPatient -->|Oui| PatientLoop
    NextPatient -->|Non| ShiftSummary[Résumé général du quart]
    
    ShiftSummary --> Incidents[Signalement incidents<br/>Si applicable]
    Incidents --> FinalReview[Révision finale]
    FinalReview --> Submit[Soumission rapport]
    Submit --> Validation{Validation}
    
    Validation -->|Erreurs| FinalReview
    Validation -->|OK| Archive[Archivage automatique]
    Archive --> Notification[Notification équipe suivante]
    Notification --> End([Rapport finalisé])

    classDef process fill:#e3f2fd
    classDef decision fill:#fff3e0
    classDef ai fill:#f3e5f5
    classDef final fill:#e8f5e8

    class CreateMode,EditMode,SelectShift,TeamComposition,IndividualReport,ShiftSummary,Incidents,FinalReview,Submit,Archive,Notification process
    class CheckExisting,PatientLoop,NextPatient,Validation decision
    class AIAssist ai
    class End final
```

## Écosystème Bristol Scale - Parcours spécialisé DI-TSA

```mermaid
flowchart LR
    subgraph "Saisie quotidienne"
        Entry[Nouvelle entrée Bristol]
        Scale[Sélection échelle 1-7]
        Notes[Notes contextuelles]
        Time[Horodatage précis]
    end
    
    subgraph "Validation"
        Check[Vérification cohérence]
        Confirm[Confirmation saisie]
    end
    
    subgraph "Analyse"
        Trends[Analyse tendances]
        Patterns[Détection patterns]
        Alerts[Alertes déviations]
    end
    
    subgraph "Reporting"
        Daily[Rapport quotidien]
        Weekly[Rapport hebdomadaire]
        Medical[Rapport médical]
    end
    
    Entry --> Scale
    Scale --> Notes
    Notes --> Time
    Time --> Check
    Check --> Confirm
    Confirm --> Trends
    Trends --> Patterns
    Patterns --> Alerts
    Alerts --> Daily
    Daily --> Weekly
    Weekly --> Medical

    classDef input fill:#e3f2fd
    classDef validation fill:#fff3e0
    classDef analysis fill:#f3e5f5
    classDef output fill:#e8f5e8

    class Entry,Scale,Notes,Time input
    class Check,Confirm validation
    class Trends,Patterns,Alerts analysis
    class Daily,Weekly,Medical output
```

## Parcours d'audit et conformité

```mermaid
graph TB
    subgraph "Génération automatique"
        Actions[Actions utilisateurs]
        Capture[Capture automatique]
        Metadata[Métadonnées complètes]
    end
    
    subgraph "Stockage sécurisé"
        Encrypt[Chiffrement]
        Store[Stockage MongoDB]
        Backup[Sauvegarde audit]
    end
    
    subgraph "Consultation admin"
        Filter[Filtres avancés]
        Search[Recherche textuelle]
        Export[Export conformité]
    end
    
    subgraph "Conformité réglementaire"
        Retention[Rétention 7 ans]
        Privacy[Protection données]
        Trace[Traçabilité complète]
    end
    
    Actions --> Capture
    Capture --> Metadata
    Metadata --> Encrypt
    Encrypt --> Store
    Store --> Backup
    
    Store --> Filter
    Filter --> Search
    Search --> Export
    
    Store --> Retention
    Retention --> Privacy
    Privacy --> Trace

    classDef auto fill:#4caf50
    classDef secure fill:#ff9800
    classDef admin fill:#2196f3
    classDef compliance fill:#9c27b0

    class Actions,Capture,Metadata auto
    class Encrypt,Store,Backup secure
    class Filter,Search,Export admin
    class Retention,Privacy,Trace compliance
```

Ces diagrammes illustrent les parcours utilisateur essentiels de CLAIR :

1. **Journeys par rôle** - Expérience quotidienne Admin/Standard/Viewer
2. **Flux d'interaction** - Navigation entre fonctionnalités
3. **Création d'observation** - Processus détaillé dual
4. **Communication équipe** - Flux temps réel asynchrone
5. **Rapport de quart** - Workflow complet avec IA
6. **Bristol Scale** - Parcours spécialisé DI-TSA
7. **Audit** - Conformité et traçabilité

Parfait pour démontrer l'UX et les processus métier aux parties prenantes.
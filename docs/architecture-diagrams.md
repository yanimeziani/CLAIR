# CLAIR - Diagrammes d'Architecture

## Vue d'ensemble du système

```mermaid
graph TB
    subgraph "Interface Utilisateur"
        UI[Frontend Next.js 15]
        Dashboard[Tableau de bord]
        Patients[Gestion Usagers]
        Reports[Rapports de quart]
        Comms[Communications]
        Bristol[Échelle Bristol]
        Admin[Interface Admin]
    end

    subgraph "Services Backend"
        API[API Routes Next.js]
        Auth[Authentification PIN]
        AI[Service IA FastAPI]
        Ollama[Modèle Ollama Gemma3:4b]
    end

    subgraph "Stockage de données"
        MongoDB[(MongoDB)]
        ChromaDB[(ChromaDB Vectoriel)]
        Files[Fichiers/Sauvegardes]
    end

    subgraph "Infrastructure"
        Docker[Docker Compose]
        Nginx[Nginx Reverse Proxy]
        SSL[Certificats SSL Let's Encrypt]
    end

    UI --> API
    Dashboard --> UI
    Patients --> UI
    Reports --> UI
    Comms --> UI
    Bristol --> UI
    Admin --> UI

    API --> Auth
    API --> MongoDB
    API --> AI
    AI --> Ollama
    AI --> ChromaDB

    Docker --> Nginx
    Nginx --> SSL
    Nginx --> UI
    
    API --> Files

    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef infra fill:#fff3e0

    class UI,Dashboard,Patients,Reports,Comms,Bristol,Admin frontend
    class API,Auth,AI,Ollama backend
    class MongoDB,ChromaDB,Files data
    class Docker,Nginx,SSL infra
```

## Architecture des microservices

```mermaid
graph LR
    subgraph "Port 80/443"
        Nginx[Nginx Reverse Proxy]
    end

    subgraph "Port 3000"
        CLAIR[Application CLAIR<br/>Next.js 15]
    end

    subgraph "Port 27017"
        MongoDB[(MongoDB<br/>Base de données principale)]
    end

    subgraph "Port 8001"
        FastAPI[Service IA<br/>FastAPI Python]
    end

    subgraph "Port 11434"
        Ollama[Ollama<br/>Modèle Gemma3:4b]
    end

    subgraph "Port 8000"
        ChromaDB[(ChromaDB<br/>Base vectorielle)]
    end

    Internet --> Nginx
    Nginx --> CLAIR
    CLAIR --> MongoDB
    CLAIR --> FastAPI
    FastAPI --> Ollama
    FastAPI --> ChromaDB

    classDef proxy fill:#ff9800
    classDef app fill:#2196f3
    classDef db fill:#4caf50
    classDef ai fill:#9c27b0

    class Nginx proxy
    class CLAIR app
    class MongoDB,ChromaDB db
    class FastAPI,Ollama ai
```

## Flux d'authentification PIN

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant API as API Auth
    participant DB as MongoDB
    participant S as Session

    U->>UI: Saisie PIN (4 chiffres)
    UI->>API: POST /api/auth/login
    API->>DB: Vérification PIN hashé
    DB-->>API: Utilisateur validé
    API->>S: Création session navigateur
    API-->>UI: Réponse authentification
    UI->>UI: Redirection tableau de bord
    
    Note over U,S: Session healthcare-optimized<br/>8h d'expiration par défaut
```

## Modèle de données principal

```mermaid
erDiagram
    USER {
        string userId PK
        string firstName
        string lastName
        string pin
        string role
        string employeeNumber
        boolean isActive
        boolean isReplacement
    }

    PATIENT {
        string _id PK
        string firstName
        string lastName
        date dateOfBirth
        string roomNumber
        array emergencyContacts
        array medicalInfo
        array assignedTemplates
        boolean isActive
    }

    DAILY_REPORT {
        string _id PK
        string shift
        date reportDate
        string shiftSupervisor FK
        array regularEmployees
        array replacementEmployees
        array patientReports
        string shiftSummary
        array incidents
        string templateId FK
    }

    OBSERVATION {
        string _id PK
        string patientId FK
        string content
        boolean isSignificant
        string authorName
        string authorEmployeeNumber
        object signature
        date createdAt
    }

    COMMUNICATION {
        string _id PK
        string senderId FK
        array recipientIds
        string subject
        string message
        string urgency
        array readBy
        date createdAt
    }

    BRISTOL_ENTRY {
        string _id PK
        string patientId FK
        number scale
        string notes
        string recordedBy FK
        date timestamp
    }

    AUDIT_LOG {
        string _id PK
        string userId FK
        string action
        string resource
        object details
        string ipAddress
        date timestamp
    }

    USER ||--o{ DAILY_REPORT : supervises
    USER ||--o{ OBSERVATION : creates
    USER ||--o{ COMMUNICATION : sends
    USER ||--o{ BRISTOL_ENTRY : records
    USER ||--o{ AUDIT_LOG : generates
    
    PATIENT ||--o{ OBSERVATION : has
    PATIENT ||--o{ BRISTOL_ENTRY : has
    PATIENT ||--o{ DAILY_REPORT : featured_in
```

## Flux de création d'observation

```mermaid
flowchart TD
    Start([Démarrage]) --> Mode{Mode d'observation}
    
    Mode -->|Actions rapides| Quick[Mode Quick]
    Mode -->|Page usager| Detailed[Mode Détaillé]
    
    Quick --> SelectPatient[Sélection usager<br/>depuis dropdown]
    Detailed --> PreSelected[Usager pré-sélectionné]
    
    SelectPatient --> Content[Saisie contenu]
    PreSelected --> SignificanceToggle[Toggle événement significatif]
    SignificanceToggle --> Content
    
    Content --> Validate{Validation}
    Validate -->|Erreur| Content
    Validate -->|OK| AI[Traitement IA optionnel]
    
    AI --> Save[Sauvegarde MongoDB]
    Save --> Audit[Log audit]
    Audit --> Notify[Notification succès]
    Notify --> End([Fin])

    classDef mode fill:#e3f2fd
    classDef process fill:#f3e5f5
    classDef decision fill:#fff3e0
    classDef storage fill:#e8f5e8

    class Quick,Detailed mode
    class SelectPatient,PreSelected,Content,AI,Save,Audit,Notify process
    class Mode,Validate decision
    class Save,Audit storage
```

## Architecture des rôles et permissions

```mermaid
graph TD
    subgraph "Hiérarchie des rôles"
        Admin[Admin]
        Standard[Standard]
        Viewer[Viewer]
    end

    subgraph "Permissions Admin"
        UserMgmt[Gestion utilisateurs]
        Templates[Templates de rapports]
        SystemOps[Opérations système]
        DataExport[Exports de données]
        AuditView[Visualisation audit]
        Settings[Paramètres système]
    end

    subgraph "Permissions Standard"
        CreateReports[Création rapports]
        EditPatients[Modification usagers]
        Observations[Observations]
        Communications[Communications]
        Bristol[Échelle Bristol]
    end

    subgraph "Permissions Viewer"
        ViewReports[Lecture rapports]
        ViewPatients[Lecture usagers]
        ViewComms[Lecture communications]
    end

    Admin --> UserMgmt
    Admin --> Templates
    Admin --> SystemOps
    Admin --> DataExport
    Admin --> AuditView
    Admin --> Settings
    Admin --> CreateReports
    Admin --> EditPatients
    Admin --> Observations
    Admin --> Communications
    Admin --> Bristol
    Admin --> ViewReports
    Admin --> ViewPatients
    Admin --> ViewComms

    Standard --> CreateReports
    Standard --> EditPatients
    Standard --> Observations
    Standard --> Communications
    Standard --> Bristol
    Standard --> ViewReports
    Standard --> ViewPatients
    Standard --> ViewComms

    Viewer --> ViewReports
    Viewer --> ViewPatients
    Viewer --> ViewComms

    classDef admin fill:#f44336
    classDef standard fill:#ff9800
    classDef viewer fill:#4caf50
    classDef permission fill:#e1f5fe

    class Admin admin
    class Standard standard
    class Viewer viewer
    class UserMgmt,Templates,SystemOps,DataExport,AuditView,Settings,CreateReports,EditPatients,Observations,Communications,Bristol,ViewReports,ViewPatients,ViewComms permission
```

## Flux de déploiement et sauvegarde

```mermaid
flowchart TD
    Deploy[./deploy.sh] --> Health{Health Check}
    Health -->|OK| Backup[Sauvegarde automatique]
    Health -->|Échec| Rollback[Rollback]
    
    Backup --> Schedule[Cron quotidien]
    Schedule --> Retention[Rétention 90 jours]
    
    subgraph "Types de sauvegarde"
        Full[Sauvegarde complète]
        Incremental[Sauvegarde incrémentale]
        Config[Configuration système]
    end
    
    Backup --> Full
    Backup --> Incremental
    Backup --> Config
    
    Full --> Storage[Stockage local + distant]
    Incremental --> Storage
    Config --> Storage
    
    Storage --> Monitor[Monitoring espace disque]
    Monitor --> Alert{Seuil 85%}
    Alert -->|Dépassé| Cleanup[Nettoyage automatique]
    Alert -->|OK| Continue[Fonctionnement normal]
    
    Cleanup --> Continue
    Rollback --> Manual[Intervention manuelle]

    classDef deploy fill:#2196f3
    classDef backup fill:#4caf50
    classDef monitor fill:#ff9800
    classDef alert fill:#f44336

    class Deploy,Health deploy
    class Backup,Schedule,Retention,Full,Incremental,Config,Storage backup
    class Monitor,Continue monitor
    class Alert,Cleanup,Rollback,Manual alert
```

## Intégration IA et traitement de texte

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant Editor as Éditeur TipTap
    participant API as API CLAIR
    participant FastAPI as Service IA
    participant Ollama as Modèle Gemma3:4b
    participant Chroma as ChromaDB

    U->>Editor: Saisie texte médical
    Editor->>API: Demande correction IA
    API->>FastAPI: POST /correct-text
    FastAPI->>Ollama: Traitement modèle français
    Ollama-->>FastAPI: Texte corrigé
    FastAPI->>Chroma: Stockage contexte vectoriel
    FastAPI-->>API: Réponse avec suggestions
    API-->>Editor: Suggestions intégrées
    Editor->>U: Affichage corrections

    Note over U,Chroma: Traitement local<br/>Conformité HIPAA/PIPEDA<br/>Terminologie DI-TSA
```

## Vue d'ensemble des données de santé

```mermaid
mindmap
  root((CLAIR Healthcare Data))
    Résidents
      Profils personnels
      Contacts d'urgence
      Informations médicales
      Historique observations
    Rapports de quart
      Équipe jour/soir/nuit
      Résumés par usager
      Incidents signalés
      Templates configurables
    Communications
      Messages d'équipe
      Niveaux d'urgence
      Statuts de lecture
      Horodatage complet
    Échelle Bristol
      Tracking quotidien
      Tendances temporelles
      Notes contextuelles
      Conformité DI-TSA
    Audit et conformité
      Traçabilité complète
      Signatures électroniques
      Rétention réglementaire
      Rapports d'activité
```

Ces diagrammes capturent l'essence du projet CLAIR en montrant :

1. **Architecture système** - Infrastructure microservices avec Docker
2. **Modèle de données** - Relations entre entités healthcare
3. **Flux utilisateur** - Processus d'authentification et d'observation  
4. **Permissions** - Hiérarchie des rôles Admin/Standard/Viewer
5. **Déploiement** - Pipeline automatisé avec sauvegardes
6. **IA locale** - Traitement privé pour conformité HIPAA
7. **Vue holistique** - Écosystème complet de données de santé

Parfait pour présenter le projet aux parties prenantes techniques et métier.
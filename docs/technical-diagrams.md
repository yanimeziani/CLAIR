# CLAIR - Diagrammes techniques avancés

## Stack technologique complet

```mermaid
graph TB
    subgraph "Frontend Layer"
        NextJS[Next.js 15 App Router]
        React[React 18 + TypeScript]
        TailwindCSS[TailwindCSS + Radix UI]
        Tiptap[TipTap Rich Editor]
        Charts[Recharts + Framer Motion]
    end

    subgraph "API Layer"
        APIRoutes[API Routes Next.js]
        Middleware[Authentication Middleware]
        Validation[Zod Validation]
        CORS[CORS Configuration]
    end

    subgraph "AI Services"
        FastAPI[FastAPI Python Service]
        Ollama[Ollama Runtime]
        Gemma[Gemma3:4b Model]
        ChromaDB[ChromaDB Vector Store]
        Embeddings[Text Embeddings]
    end

    subgraph "Data Layer"
        MongoDB[(MongoDB 7.0)]
        Mongoose[Mongoose ODM]
        Indexes[Optimized Indexes]
        GridFS[GridFS File Storage]
    end

    subgraph "Infrastructure"
        Docker[Docker Compose]
        Nginx[Nginx + SSL]
        Certbot[Let's Encrypt]
        Cron[Automated Backups]
        Health[Health Monitoring]
    end

    subgraph "Security"
        PIN[PIN Authentication]
        BCrypt[BCrypt Hashing]
        Sessions[Browser Sessions]
        HIPAA[HIPAA Compliance]
        Audit[Audit Logging]
    end

    NextJS --> APIRoutes
    React --> NextJS
    TailwindCSS --> React
    Tiptap --> React
    Charts --> React

    APIRoutes --> Middleware
    Middleware --> Validation
    Validation --> MongoDB
    APIRoutes --> FastAPI

    FastAPI --> Ollama
    Ollama --> Gemma
    FastAPI --> ChromaDB
    ChromaDB --> Embeddings

    MongoDB --> Mongoose
    Mongoose --> Indexes
    MongoDB --> GridFS

    Docker --> Nginx
    Nginx --> Certbot
    Docker --> Cron
    Docker --> Health

    Middleware --> PIN
    PIN --> BCrypt
    PIN --> Sessions
    Sessions --> HIPAA
    APIRoutes --> Audit

    classDef frontend fill:#61dafb
    classDef api fill:#68217a
    classDef ai fill:#ff6b35
    classDef data fill:#00ed64
    classDef infra fill:#0052cc
    classDef security fill:#ff5722

    class NextJS,React,TailwindCSS,Tiptap,Charts frontend
    class APIRoutes,Middleware,Validation,CORS api
    class FastAPI,Ollama,Gemma,ChromaDB,Embeddings ai
    class MongoDB,Mongoose,Indexes,GridFS data
    class Docker,Nginx,Certbot,Cron,Health infra
    class PIN,BCrypt,Sessions,HIPAA,Audit security
```

## Pipeline de déploiement CI/CD

```mermaid
flowchart TD
    subgraph "Development"
        Code[Code Changes]
        Commit[Git Commit]
        Push[Git Push]
    end

    subgraph "GitHub Actions"
        Trigger[Workflow Trigger]
        Test[Run Tests]
        Build[Docker Build]
        Cache[Layer Caching]
    end

    subgraph "Production Server"
        Pull[Pull Latest Images]
        Stop[Stop Current Services]
        Update[Update Containers]
        Health[Health Checks]
        SSL[SSL Renewal Check]
    end

    subgraph "Monitoring"
        Logs[Container Logs]
        Metrics[System Metrics]
        Alerts[Alert System]
        Backup[Automated Backup]
    end

    Code --> Commit
    Commit --> Push
    Push --> Trigger
    Trigger --> Test
    Test --> Build
    Build --> Cache
    Cache --> Pull
    Pull --> Stop
    Stop --> Update
    Update --> Health
    Health --> SSL
    SSL --> Logs
    Logs --> Metrics
    Metrics --> Alerts
    Alerts --> Backup

    classDef dev fill:#28a745
    classDef ci fill:#17a2b8
    classDef prod fill:#fd7e14
    classDef monitor fill:#6f42c1

    class Code,Commit,Push dev
    class Trigger,Test,Build,Cache ci
    class Pull,Stop,Update,Health,SSL prod
    class Logs,Metrics,Alerts,Backup monitor
```

## Architecture de sécurité des données

```mermaid
graph TB
    subgraph "Data Input Layer"
        UserInput[User Input]
        Validation[Input Validation]
        Sanitization[Data Sanitization]
        CSRF[CSRF Protection]
    end

    subgraph "Authentication Layer"
        PINAuth[PIN Authentication]
        SessionMgmt[Session Management]
        RoleCheck[Role-Based Access]
        RateLimit[Rate Limiting]
    end

    subgraph "Processing Layer"
        APIGateway[API Gateway]
        BusinessLogic[Business Logic]
        DataTransform[Data Transformation]
        AuditLog[Audit Logging]
    end

    subgraph "Storage Layer"
        Encryption[Data Encryption]
        MongoDB[(Encrypted MongoDB)]
        Backup[Encrypted Backups]
        Retention[Data Retention]
    end

    subgraph "AI Processing"
        LocalAI[Local AI Processing]
        NoExternal[No External APIs]
        PrivateModel[Private Model Data]
        SecureVectors[Secure Vector Store]
    end

    UserInput --> Validation
    Validation --> Sanitization
    Sanitization --> CSRF
    CSRF --> PINAuth
    PINAuth --> SessionMgmt
    SessionMgmt --> RoleCheck
    RoleCheck --> RateLimit
    RateLimit --> APIGateway
    APIGateway --> BusinessLogic
    BusinessLogic --> DataTransform
    DataTransform --> AuditLog
    AuditLog --> Encryption
    Encryption --> MongoDB
    MongoDB --> Backup
    Backup --> Retention

    BusinessLogic --> LocalAI
    LocalAI --> NoExternal
    NoExternal --> PrivateModel
    PrivateModel --> SecureVectors

    classDef input fill:#007bff
    classDef auth fill:#28a745
    classDef process fill:#ffc107
    classDef storage fill:#dc3545
    classDef ai fill:#6f42c1

    class UserInput,Validation,Sanitization,CSRF input
    class PINAuth,SessionMgmt,RoleCheck,RateLimit auth
    class APIGateway,BusinessLogic,DataTransform,AuditLog process
    class Encryption,MongoDB,Backup,Retention storage
    class LocalAI,NoExternal,PrivateModel,SecureVectors ai
```

## Performance et optimisation

```mermaid
graph LR
    subgraph "Frontend Optimization"
        SSG[Static Site Generation]
        ISR[Incremental Static Regeneration]
        CodeSplit[Code Splitting]
        LazyLoad[Lazy Loading]
        ImageOpt[Image Optimization]
    end

    subgraph "API Optimization"
        Caching[Response Caching]
        Pagination[Smart Pagination]
        Indexes[Database Indexes]
        Connection[Connection Pooling]
        Compression[Response Compression]
    end

    subgraph "Database Optimization"
        Aggregation[MongoDB Aggregation]
        Sharding[Collection Sharding]
        Replication[Read Replicas]
        Indexing[Compound Indexes]
        TTL[TTL Indexes]
    end

    subgraph "Infrastructure Optimization"
        CDN[CDN Distribution]
        LoadBalance[Load Balancing]
        HTTP2[HTTP/2 Support]
        Gzip[Gzip Compression]
        Minification[Asset Minification]
    end

    SSG --> ISR
    ISR --> CodeSplit
    CodeSplit --> LazyLoad
    LazyLoad --> ImageOpt

    Caching --> Pagination
    Pagination --> Indexes
    Indexes --> Connection
    Connection --> Compression

    Aggregation --> Sharding
    Sharding --> Replication
    Replication --> Indexing
    Indexing --> TTL

    CDN --> LoadBalance
    LoadBalance --> HTTP2
    HTTP2 --> Gzip
    Gzip --> Minification

    classDef frontend fill:#61dafb
    classDef api fill:#28a745
    classDef database fill:#ff6b35
    classDef infra fill:#6f42c1

    class SSG,ISR,CodeSplit,LazyLoad,ImageOpt frontend
    class Caching,Pagination,Indexes,Connection,Compression api
    class Aggregation,Sharding,Replication,Indexing,TTL database
    class CDN,LoadBalance,HTTP2,Gzip,Minification infra
```

## Système de monitoring et observabilité

```mermaid
flowchart TD
    subgraph "Application Metrics"
        AppLogs[Application Logs]
        ErrorTracking[Error Tracking]
        Performance[Performance Metrics]
        UserActions[User Action Analytics]
    end

    subgraph "Infrastructure Metrics"
        ContainerStats[Container Statistics]
        ResourceUsage[Resource Usage]
        NetworkMetrics[Network Metrics]
        DiskSpace[Disk Space Monitoring]
    end

    subgraph "Database Metrics"
        QueryPerf[Query Performance]
        ConnectionPool[Connection Pool Stats]
        IndexUsage[Index Usage Statistics]
        ReplicationLag[Replication Lag]
    end

    subgraph "AI Service Metrics"
        ModelLatency[Model Response Time]
        ProcessingQueue[Processing Queue Length]
        ErrorRates[AI Error Rates]
        ResourceConsumption[GPU/CPU Usage]
    end

    subgraph "Alert System"
        Thresholds[Alert Thresholds]
        NotificationChannels[Notification Channels]
        Escalation[Escalation Policies]
        Dashboard[Monitoring Dashboard]
    end

    AppLogs --> Thresholds
    ErrorTracking --> Thresholds
    Performance --> Thresholds
    UserActions --> Dashboard

    ContainerStats --> Thresholds
    ResourceUsage --> Thresholds
    NetworkMetrics --> Dashboard
    DiskSpace --> Thresholds

    QueryPerf --> Thresholds
    ConnectionPool --> Dashboard
    IndexUsage --> Dashboard
    ReplicationLag --> Thresholds

    ModelLatency --> Thresholds
    ProcessingQueue --> Thresholds
    ErrorRates --> Thresholds
    ResourceConsumption --> Dashboard

    Thresholds --> NotificationChannels
    NotificationChannels --> Escalation
    Escalation --> Dashboard

    classDef app fill:#28a745
    classDef infra fill:#17a2b8
    classDef db fill:#ff6b35
    classDef ai fill:#6f42c1
    classDef alert fill:#dc3545

    class AppLogs,ErrorTracking,Performance,UserActions app
    class ContainerStats,ResourceUsage,NetworkMetrics,DiskSpace infra
    class QueryPerf,ConnectionPool,IndexUsage,ReplicationLag db
    class ModelLatency,ProcessingQueue,ErrorRates,ResourceConsumption ai
    class Thresholds,NotificationChannels,Escalation,Dashboard alert
```

## Flux de données en temps réel

```mermaid
sequenceDiagram
    participant C as Client Browser
    participant N as Next.js Server
    participant M as MongoDB
    participant A as AI Service
    participant O as Ollama Model

    Note over C,O: Création d'observation avec IA

    C->>N: POST /api/observations (with content)
    N->>N: Validate session & permissions
    N->>A: POST /ai/enhance-text (content)
    A->>O: Process text with Gemma3:4b
    O-->>A: Enhanced text response
    A-->>N: AI-enhanced content
    N->>M: Save observation to MongoDB
    M-->>N: Confirm save + generate _id
    N->>N: Create audit log entry
    N->>M: Save audit log
    M-->>N: Audit log confirmed
    N-->>C: Success response with observation

    Note over C,O: Real-time communication notification

    par
        C->>N: POST /api/communications (new message)
        N->>M: Save message to MongoDB
        M-->>N: Message saved
    and
        N->>N: Get all active sessions
        N->>C: Broadcast notification (if real-time enabled)
    end

    Note over C,O: Bristol scale trending analysis

    C->>N: POST /api/bristol (new entry)
    N->>M: Save Bristol entry
    M-->>N: Entry saved
    N->>M: Aggregate last 30 days for patient
    M-->>N: Trending data
    N->>A: Analyze trends for patterns
    A-->>N: Pattern analysis results
    N-->>C: Success + trend insights
```

## Architecture de sauvegarde et récupération

```mermaid
graph TD
    subgraph "Backup Strategy"
        Full[Full Daily Backup]
        Incremental[Incremental Hourly]
        Config[Configuration Backup]
        Code[Code Repository Backup]
    end

    subgraph "Backup Storage"
        Local[Local Storage]
        Remote[Remote Storage]
        Cloud[Cloud Backup]
        Encryption[Encrypted Archives]
    end

    subgraph "Recovery Procedures"
        PointInTime[Point-in-Time Recovery]
        Selective[Selective Restoration]
        FullRestore[Full System Restore]
        Testing[Recovery Testing]
    end

    subgraph "Monitoring"
        Validation[Backup Validation]
        Integrity[Data Integrity Checks]
        Alerts[Backup Failure Alerts]
        Reporting[Backup Reports]
    end

    Full --> Local
    Incremental --> Local
    Config --> Local
    Code --> Remote

    Local --> Encryption
    Remote --> Encryption
    Cloud --> Encryption

    Encryption --> PointInTime
    Encryption --> Selective
    Encryption --> FullRestore
    FullRestore --> Testing

    Local --> Validation
    Remote --> Validation
    Validation --> Integrity
    Integrity --> Alerts
    Alerts --> Reporting

    classDef backup fill:#28a745
    classDef storage fill:#17a2b8
    classDef recovery fill:#ffc107
    classDef monitor fill:#dc3545

    class Full,Incremental,Config,Code backup
    class Local,Remote,Cloud,Encryption storage
    class PointInTime,Selective,FullRestore,Testing recovery
    class Validation,Integrity,Alerts,Reporting monitor
```

Ces diagrammes techniques avancés couvrent :

1. **Stack technologique** - Écosystème complet des technologies
2. **Pipeline CI/CD** - Déploiement automatisé avec GitHub Actions
3. **Sécurité** - Architecture de protection des données healthcare
4. **Performance** - Optimisations multi-niveaux
5. **Monitoring** - Observabilité et alerting système
6. **Temps réel** - Flux de données synchrones/asynchrones
7. **Backup/Recovery** - Stratégie de sauvegarde entreprise

Parfait pour présenter la robustesse technique aux équipes IT et décideurs.
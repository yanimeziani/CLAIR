# Documentation Technique CLAIR - Français

## 🏗️ Architecture Générale

### Vue d'Ensemble du Système
CLAIR (Centre Logiciel d'Aide aux Interventions Résidentielles) est une plateforme complète de gestion de soins de santé développée spécifiquement pour les résidences DI-TSA au Québec.

### Stack Technologique
```
Frontend: Next.js 15 (App Router) + TypeScript + TailwindCSS
Backend: API Routes Next.js + FastAPI (Python)
Base de Données: MongoDB avec index optimisés
IA: Ollama (Gemma3:4b) + ChromaDB
UI: Radix UI + composants shadcn/ui
```

## 📁 Structure du Code

### Répertoires Principaux
```
clair-app/
├── src/
│   ├── app/                  # App Router Next.js 15
│   │   ├── api/              # Routes API
│   │   ├── dashboard/        # Tableaux de bord
│   │   ├── patients/         # Gestion usagers
│   │   └── auth/            # Authentification
│   ├── components/           # Composants réutilisables
│   │   ├── ui/              # Composants shadcn/ui
│   │   ├── forms/           # Formulaires
│   │   └── charts/          # Graphiques
│   ├── lib/                 # Utilitaires et modèles
│   │   ├── models/          # Modèles MongoDB
│   │   └── utils/           # Fonctions utilitaires
│   └── middleware.ts        # Middleware de route
```

## 🔐 Système d'Authentification

### Modèle Utilisateur (`/src/lib/models/User.ts`)
```typescript
interface User {
  _id: ObjectId;
  employeeNumber: string;    // Numéro d'employé unique
  pin: string;               // PIN haché avec bcrypt
  role: 'admin' | 'standard' | 'viewer';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Authentification PIN
- **Méthode**: PIN à 4 chiffres optimisé pour environnements médicaux
- **Hachage**: bcrypt avec salt pour sécurité
- **Sessions**: Gestion côté serveur avec cookies sécurisés
- **Middleware**: Protection automatique des routes

### Rôles et Permissions
```typescript
// Hiérarchie des rôles
'admin'    // Accès complet, gestion utilisateurs
'standard' // Gestion soins, rapports, communications
'viewer'   // Lecture seule rapports et communications
```

## 🏥 Gestion des Usagers

### Modèle Usager (`/src/lib/models/Patient.ts`)
```typescript
interface Patient {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  medicalInfo: {
    allergies: string[];
    medications: string[];
    medicalHistory: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  isActive: boolean;
  profilePicture?: string;   // Base64 ou URL
  createdAt: Date;
  updatedAt: Date;
}
```

### Fonctionnalités Principales
- **Profils Complets**: Informations médicales, allergies, contacts
- **Photos de Profil**: Support d'images pour identification
- **Statut Actif/Inactif**: Gestion du cycle de vie
- **Historique Médical**: Suivi longitudinal

## 📋 Système de Rapports

### Rapports Quotidiens (`/src/lib/models/DailyReport.ts`)
```typescript
interface DailyReport {
  _id: ObjectId;
  date: Date;
  shift: 'day' | 'evening' | 'night';
  staffPresent: {
    regular: string[];         // Personnel régulier
    replacement: string[];     // Personnel de remplacement
  };
  incidents: Array<{
    time: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  generalNotes: string;        // Contenu riche TipTap avec IA
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Rapports d'Usagers
```typescript
interface PatientReport {
  _id: ObjectId;
  patientId: ObjectId;
  date: Date;
  shift: 'day' | 'evening' | 'night';
  template: string;            // Template configurable par admin
  content: Record<string, any>; // Champs dynamiques selon template
  aiSummary?: string;          // Résumé généré par IA
  createdBy: ObjectId;
  createdAt: Date;
}
```

## 🩺 Échelle de Bristol

### Modèle Bristol (`/src/lib/models/BristolEntry.ts`)
```typescript
interface BristolEntry {
  _id: ObjectId;
  patientId: ObjectId;
  date: Date;
  time: string;
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7; // Types Bristol standard
  notes?: string;
  recordedBy: ObjectId;
  createdAt: Date;
}
```

### Interface Utilisateur
- **Calendrier Visuel**: Interface intuitive pour consultation
- **Sélection Graphique**: Types Bristol avec descriptions
- **Historique**: Visualisation des tendances temporelles
- **Export**: Données exportables pour analyse

## 💬 Communications d'Équipe

### Modèle Communication (`/src/lib/models/Communication.ts`)
```typescript
interface Communication {
  _id: ObjectId;
  title: string;
  content: string;             // Contenu riche avec IA
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  readBy: Array<{
    userId: ObjectId;
    readAt: Date;
  }>;
  isPersistent: boolean;       // Messages permanents
  expiresAt?: Date;           // Expiration automatique
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Fonctionnalités
- **Niveaux d'Urgence**: Code couleur pour priorisation
- **Suivi de Lecture**: Statut lu/non lu par utilisateur
- **Messages Persistants**: Communications importantes permanentes
- **Notifications Visuelles**: Alertes pour nouveaux messages

## 🤖 Intégration IA

### Architecture IA Locale
```
CLAIR Frontend → FastAPI Backend → Ollama (Gemma3:4b) → ChromaDB
```

### Services IA (`/ai-backend/`)
```python
# Correction de texte
@app.post("/correct-text")
async def correct_text(request: TextRequest):
    # Correction grammaire et terminologie médicale française
    
# Génération de résumés
@app.post("/summarize")
async def summarize_text(request: SummaryRequest):
    # Résumé intelligent de rapports longs
    
# Suggestions contextuelles
@app.post("/suggest")
async def suggest_content(request: SuggestionRequest):
    # Suggestions basées sur le contexte médical
```

### Éditeur Riche TipTap
```typescript
// Configuration éditeur avec IA
const editor = useEditor({
  extensions: [
    StarterKit,
    AIAssistant,        // Extension personnalisée IA
    MedicalTerms,       // Terminologie médicale française
  ],
  content: initialContent,
});
```

## 📊 Base de Données MongoDB

### Configuration et Index
```javascript
// Index de performance
db.patients.createIndex({ firstName: 1, lastName: 1 });
db.dailyReports.createIndex({ date: -1, shift: 1 });
db.bristolEntries.createIndex({ patientId: 1, date: -1 });
db.communications.createIndex({ createdAt: -1, urgency: 1 });

// Index de recherche textuelle
db.patients.createIndex({ 
  firstName: "text", 
  lastName: "text" 
});
```

### Données de Démonstration
```javascript
// Données auto-générées pour démonstration
- 5 utilisateurs (1 admin, 4 personnel)
- 5 usagers avec profils complets
- 3 rapports quotidiens
- 4 communications d'équipe
- Entrées Bristol pour démonstration
```

## 🎨 Interface Utilisateur

### Composants UI (`/src/components/ui/`)
Basés sur Radix UI et shadcn/ui pour:
- **Accessibilité**: Support complet ARIA
- **Thème**: Mode sombre/clair automatique
- **Responsive**: Mobile-first design
- **Performance**: Composants optimisés

### Formulaires Dynamiques
```typescript
// Génération automatique de formulaires
interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'time';
  label: string;
  required: boolean;
  validation?: ZodSchema;
}
```

### Graphiques et Visualisations
- **Recharts**: Graphiques interactifs
- **Framer Motion**: Animations fluides
- **Lucide Icons**: Iconographie cohérente

## 🔄 API Routes Next.js

### Structure API (`/src/app/api/`)
```
api/
├── auth/              # Authentification PIN
├── patients/          # CRUD usagers
├── reports/           # Gestion rapports
├── communications/    # Messages équipe
├── bristol/           # Échelle Bristol
├── admin/            # Administration
└── ai/               # Services IA
```

### Middleware de Sécurité
```typescript
// Protection automatique des routes
export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Vérification des permissions par rôle
  if (!hasPermission(session.user.role, request.nextUrl.pathname)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}
```

## 🛠️ Utilitaires et Helpers

### Validation de Données (Zod)
```typescript
// Schémas de validation
export const PatientSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  dateOfBirth: z.date().max(new Date(), "Date invalide"),
  medicalInfo: z.object({
    allergies: z.array(z.string()),
    medications: z.array(z.string()),
  }),
});
```

### Formatage Dates/Heures
```typescript
// Utilitaires français
export const formatDateFr = (date: Date): string => {
  return date.toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

### Gestion d'État
```typescript
// Patterns React sans bibliothèque externe
const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  
  // CRUD operations avec optimistic updates
};
```

## 🔒 Sécurité et Conformité

### Pratiques de Sécurité
- **Validation**: Toutes les entrées validées côté client et serveur
- **Sanitisation**: Nettoyage des données avant stockage
- **HTTPS**: Chiffrement complet en production
- **Audit**: Traçabilité complète des actions utilisateur

### Conformité Santé
- **Données Locales**: Aucune donnée envoyée vers services externes
- **IA On-Premise**: Modèles Ollama locaux
- **Sessions Sécurisées**: Pas de tokens JWT, sessions serveur
- **Logging**: Journalisation complète pour audit

## 📈 Performance et Optimisation

### Next.js 15 Optimisations
- **App Router**: Routage optimisé
- **Server Components**: Rendu côté serveur
- **Image Optimization**: Optimisation automatique images
- **Code Splitting**: Chargement différé des composants

### Base de Données
- **Index MongoDB**: Requêtes optimisées
- **Connexion Pool**: Gestion efficace des connexions
- **Aggregation**: Pipelines optimisés pour analytics

### Bundle et Build
```bash
# Analyse du bundle
npm run build
npm run analyze

# Optimisations Turbopack en développement
npm run dev  # Utilise Turbopack automatiquement
```

---

**CLAIR v1.0.0** - Documentation Technique Française  
Architecture moderne pour soins de santé DI-TSA au Québec
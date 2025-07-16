// Comprehensive database seeding script for Irielle Platform
// Authenticate as admin user first
db = db.getSiblingDB('admin');
db.auth('admin', 'securepassword');

// Switch to irielle database
db = db.getSiblingDB('irielle');

// Clear existing data
db.users.deleteMany({});
db.patients.deleteMany({});
db.communications.deleteMany({});
db.daily_reports.deleteMany({});
db.bristol_entries.deleteMany({});
db.report_templates.deleteMany({});
db.observationnotes.deleteMany({});

// Insert users with proper PINs
const users = [
  {
    _id: ObjectId(),
    firstName: "Admin",
    lastName: "Principal",
    role: "admin",
    pinHash: "$2b$10$Rdf9YDjwAXS12Ge7EClEr.AhNBLzxTOLHEIhnldatCrgZB5RQLHZG", // PIN: 1234
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    firstName: "Dr. Marie",
    lastName: "Dubois",
    role: "nurse",
    pinHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // PIN: 5678
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    firstName: "Sophie",
    lastName: "Martin",
    role: "aide",
    pinHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // PIN: 5678
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    firstName: "Jean",
    lastName: "Tremblay",
    role: "nurse",
    pinHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // PIN: 5678
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    firstName: "Claire",
    lastName: "Bergeron",
    role: "aide",
    pinHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // PIN: 5678
    isActive: true,
    createdAt: new Date()
  }
];

const insertedUsers = db.users.insertMany(users);
const userIds = Object.values(insertedUsers.insertedIds);

// Insert patients with new structure
const patients = [
  {
    _id: ObjectId(),
    firstName: "Marie",
    lastName: "Lavoie",
    dateOfBirth: new Date("1985-03-15"),
    allergies: ["Pénicilline", "Fruits à coque"],
    emergencyContacts: [
      {
        name: "Pierre Lavoie",
        relationship: "Frère",
        phone: "514-555-0101"
      },
      {
        name: "Lucie Lavoie",
        relationship: "Mère",
        phone: "514-555-0201"
      }
    ],
    medicalNotes: "<p><strong>Diagnostics:</strong> TSA niveau 2, DI légère</p><p><strong>Besoins spéciaux:</strong> Routine stricte, transitions graduelles</p><p><strong>Médicaments:</strong> Risperdal 2mg matin, Ativan 0.5mg PRN</p><p><strong>Allergies:</strong> Pénicilline - éruption cutanée, fruits à coque - œdème</p>",
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    firstName: "Pierre",
    lastName: "Gagnon",
    dateOfBirth: new Date("1978-11-22"),
    allergies: [],
    emergencyContacts: [
      {
        name: "Lucie Gagnon",
        relationship: "Épouse",
        phone: "514-555-0102"
      }
    ],
    medicalNotes: "<p><strong>Diagnostics:</strong> DI modérée, Trouble bipolaire stabilisé</p><p><strong>Médicaments:</strong> Quetiapine 100mg le soir, Lamotrigine 50mg matin et soir</p><p><strong>Supervision:</strong> Médication sous surveillance, autonome pour les activités quotidiennes</p>",
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    firstName: "Julie",
    lastName: "Bouchard",
    dateOfBirth: new Date("1990-07-08"),
    allergies: ["Latex"],
    emergencyContacts: [
      {
        name: "Robert Bouchard",
        relationship: "Père",
        phone: "514-555-0103"
      },
      {
        name: "Carole Bouchard",
        relationship: "Mère",
        phone: "514-555-0303"
      }
    ],
    medicalNotes: "<p><strong>Diagnostics:</strong> TSA niveau 1, Trouble anxieux généralisé</p><p><strong>Sensibilités:</strong> Hypersensibilité auditive et tactile</p><p><strong>Médicaments:</strong> Sertraline 50mg le matin</p><p><strong>Stratégies:</strong> Environnement calme, prévenir les changements</p>",
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    firstName: "Marc",
    lastName: "Leblanc",
    dateOfBirth: new Date("1982-09-14"),
    allergies: [],
    emergencyContacts: [
      {
        name: "Diane Leblanc",
        relationship: "Mère",
        phone: "514-555-0104"
      }
    ],
    medicalNotes: "<p><strong>Diagnostics:</strong> DI légère</p><p><strong>Autonomie:</strong> Très autonome pour les activités de la vie quotidienne</p><p><strong>Médicaments:</strong> Olanzapine 10mg le soir</p><p><strong>Objectifs:</strong> Maintien de l'autonomie, socialisation</p>",
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    firstName: "Sylvie",
    lastName: "Roy",
    dateOfBirth: new Date("1975-12-03"),
    allergies: ["Aspirine"],
    emergencyContacts: [
      {
        name: "Michel Roy",
        relationship: "Frère",
        phone: "514-555-0105"
      }
    ],
    medicalNotes: "<p><strong>Diagnostics:</strong> DI modérée, Trouble bipolaire</p><p><strong>Médicaments:</strong> Lithium 300mg matin et soir, Lorazepam PRN</p><p><strong>Surveillance:</strong> Humeur, signes de rechute</p><p><strong>Allergies:</strong> Aspirine - réaction gastrique sévère</p>",
    isActive: true,
    createdAt: new Date()
  }
];

const insertedPatients = db.patients.insertMany(patients);
const patientIds = Object.values(insertedPatients.insertedIds);

// Insert communications (some urgent, some normal)
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const communications = [
  {
    _id: ObjectId(),
    authorId: userIds[1], // Dr. Marie Dubois
    authorDisplayName: "Dr. Marie Dubois",
    recipientIds: userIds.slice(2), // Sophie, Jean, Claire
    content: "<p><strong>URGENT - Modification protocole médication</strong></p><p>Patient: Pierre Gagnon (Chambre 15)</p><p>Le patient a présenté des <em>effets secondaires</em> avec la dose actuelle de Quetiapine:</p><ul><li>Somnolence excessive</li><li>Vertiges matinaux</li></ul><p><strong>Nouvelle posologie:</strong> Réduction à 75mg le soir</p><p>Surveillance accrue les 3 prochains jours. Merci de noter tout changement d'humeur ou de comportement.</p>",
    isUrgent: true,
    creationDate: today.toISOString(),
    destinationDates: [today.toISOString().split('T')[0]],
    patientId: patientIds[1], // Pierre Gagnon
    readBy: [],
    requireAcknowledgment: true,
    targetStaffMembers: ["Sophie Martin", "Jean Tremblay"]
  },
  {
    _id: ObjectId(),
    authorId: userIds[2], // Sophie Martin
    authorDisplayName: "Sophie Martin",
    recipientIds: [userIds[3]], // Jean Tremblay
    content: "<p><strong>Changement d'horaire - Réunion d'équipe</strong></p><p>La réunion hebdomadaire est <em>déplacée à 14h00</em> aujourd'hui (salle de conférence)</p><p><strong>Ordre du jour:</strong></p><ol><li>Révision des plans d'intervention individualisés</li><li>Mise à jour protocoles COVID-19</li><li>Discussion nouvelles admissions</li><li>Formation continue - gestion des crises</li></ol><p>Merci de confirmer votre présence 📅</p>",
    isUrgent: false,
    creationDate: today.toISOString(),
    destinationDates: [today.toISOString().split('T')[0]],
    readBy: [],
    requireAcknowledgment: false,
    targetStaffMembers: []
  },
  {
    _id: ObjectId(),
    authorId: userIds[3], // Jean Tremblay
    authorDisplayName: "Jean Tremblay",
    recipientIds: userIds.slice(1), // Tous sauf admin
    content: "<p><strong>NOUVELLE RÉSIDENTE - Accueil spécialisé requis</strong></p><p><strong>Patiente:</strong> Marie Lavoie, 38 ans</p><p><strong>Chambre:</strong> 8</p><p><strong>Diagnostic:</strong> TSA niveau 2 avec DI légère</p><p><strong>⚠️ Points d'attention critiques:</strong></p><ul><li><strong>Routine stricte</strong> - changements à annoncer 24h à l'avance</li><li><strong>Transitions graduelles</strong> - éviter les modifications brusques</li><li><strong>Hypersensibilité</strong> - environnement calme nécessaire</li></ul><p>Le plan d'intervention détaillé est disponible dans le dossier. <em>Première semaine critique pour l'adaptation.</em></p>",
    isUrgent: true,
    creationDate: yesterday.toISOString(),
    destinationDates: [yesterday.toISOString().split('T')[0], today.toISOString().split('T')[0]],
    patientId: patientIds[0], // Marie Lavoie
    readBy: [
      { userId: userIds[1], timestamp: today.toISOString() }
    ],
    requireAcknowledgment: true,
    targetStaffMembers: ["Dr. Marie Dubois", "Sophie Martin", "Claire Bergeron"]
  },
  {
    _id: ObjectId(),
    authorId: userIds[4], // Claire Bergeron
    authorDisplayName: "Claire Bergeron",
    recipientIds: [userIds[1], userIds[2]], // Dr. Marie et Sophie
    content: "<p><strong>Observation comportementale - Julie Bouchard</strong></p><p><strong>Chambre:</strong> 22</p><p><strong>Observations ce matin:</strong></p><ul><li>Anxiété élevée dès le réveil</li><li>Refus du petit-déjeuner</li><li>Hypersensibilité sensorielle <em>plus marquée</em> qu'habituellement</li><li>Evitement du contact visuel</li></ul><p><strong>Recommandations:</strong></p><ul><li>Évaluation pour médication PRN (Lorazepam)</li><li>Environnement encore plus calme</li><li>Surveillance accrue aujourd'hui</li></ul><p>Je reste disponible pour discussion. - Claire</p>",
    isUrgent: false,
    creationDate: today.toISOString(),
    destinationDates: [today.toISOString().split('T')[0]],
    patientId: patientIds[2], // Julie Bouchard
    readBy: [],
    requireAcknowledgment: false,
    targetStaffMembers: []
  }
];

const insertedCommunications = db.communications.insertMany(communications);

// Insert daily reports
const reports = [
  {
    _id: ObjectId(),
    patientId: patientIds[0], // Marie Lavoie
    authorId: userIds[2], // Sophie Martin
    shift: "day",
    reportDate: today.toISOString().split('T')[0],
    summary: "Première journée de Marie. Adaptation difficile au nouvel environnement. A montré des signes de stress lors des transitions. Routine du matin respectée. Besoin de plus de temps pour s'habituer.",
    customFields: {
      "Humeur générale": "Préoccupé",
      "Appétit": "Moyen",
      "Mobilité": "Autonome"
    },
    staffRegular: "Sophie Martin",
    staffReplacement: "",
    medicationResponsible: "Dr. Marie Dubois",
    bedtimeResponsible: "Jean Tremblay",
    cotationResponsible: "Sophie Martin",
    emotionalTension: "Agité",
    observationNotes: "Première adaptation. Besoin de routine stricte. Réagit bien aux explications claires et à l'anticipation des changements.",
    prnAdministration: false,
    prnDetails: "",
    objectifsRespected: true,
    activitiesSpontaneous: "A organisé ses affaires personnelles selon un ordre précis. Montre de l'intérêt pour les puzzles.",
    informationsJour: "Accueil réussi malgré le stress initial. Importance de maintenir la même routine demain.",
    informationsSoir: "",
    bristolObservation: "",
    createdAt: today.toISOString()
  },
  {
    _id: ObjectId(),
    patientId: patientIds[1], // Pierre Gagnon
    authorId: userIds[1], // Dr. Marie Dubois
    shift: "evening",
    reportDate: today.toISOString().split('T')[0],
    summary: "Journée stable pour Pierre. Nouvelle médication bien tolérée. Participation active aux activités de groupe. Bonne interaction avec les autres résidents.",
    customFields: {
      "Humeur générale": "Bien",
      "Appétit": "Bon",
      "Mobilité": "Autonome"
    },
    staffRegular: "Dr. Marie Dubois",
    staffReplacement: "",
    medicationResponsible: "Dr. Marie Dubois",
    bedtimeResponsible: "Jean Tremblay",
    cotationResponsible: "Dr. Marie Dubois",
    emotionalTension: "Stable",
    observationNotes: "Réduction de médication bien acceptée. Pas d'effets secondaires observés. Humeur stable.",
    prnAdministration: false,
    prnDetails: "",
    objectifsRespected: true,
    activitiesSpontaneous: "A participé à l'activité peinture. Montre de la fierté dans ses créations.",
    informationsJour: "",
    informationsSoir: "Médication réduite selon protocole. Surveillance continue nécessaire.",
    bristolObservation: "Type 4 Bristol observé à 14h30, taille moyenne, pas de difficultés.",
    createdAt: today.toISOString()
  },
  {
    _id: ObjectId(),
    patientId: patientIds[2], // Julie Bouchard
    authorId: userIds[4], // Claire Bergeron
    shift: "day",
    reportDate: yesterday.toISOString().split('T')[0],
    summary: "Julie a eu une journée difficile avec plusieurs épisodes d'anxiété. Sensibilité sensorielle très élevée. A nécessité plusieurs pauses dans un environnement calme.",
    customFields: {
      "Humeur générale": "Préoccupé",
      "Appétit": "Faible",
      "Mobilité": "Autonome"
    },
    staffRegular: "Claire Bergeron",
    staffReplacement: "",
    medicationResponsible: "Dr. Marie Dubois",
    bedtimeResponsible: "Sophie Martin",
    cotationResponsible: "Claire Bergeron",
    emotionalTension: "Très agité",
    observationNotes: "Hypersensibilité sensorielle marquée aujourd'hui. Bruits normaux causent de l'inconfort. Stratégies d'apaisement utilisées.",
    prnAdministration: true,
    prnDetails: "Lorazepam 0.5mg donné à 11h suite à crise d'anxiété. Effet apaisant observé après 30 minutes. FADM complété.",
    objectifsRespected: false,
    activitiesSpontaneous: "A choisi de rester dans sa chambre la plupart du temps. Écoute de musique douce.",
    informationsJour: "Journée difficile. Recommande révision du plan d'intervention pour gérer la sensibilité sensorielle.",
    informationsSoir: "",
    bristolObservation: "",
    createdAt: yesterday.toISOString()
  }
];

const insertedReports = db.daily_reports.insertMany(reports);

// Insert Bristol entries
const bristolEntries = [
  {
    _id: ObjectId(),
    patientId: patientIds[1], // Pierre Gagnon
    authorId: userIds[1], // Dr. Marie Dubois
    shift: "day",
    entryDate: today.toISOString().split('T')[0],
    type: "bowel",
    value: "4",
    size: "M",
    notes: "Normal, pas de difficultés",
    createdAt: today.toISOString()
  },
  {
    _id: ObjectId(),
    patientId: patientIds[0], // Marie Lavoie
    authorId: userIds[2], // Sophie Martin
    shift: "evening",
    entryDate: yesterday.toISOString().split('T')[0],
    type: "bowel",
    value: "3",
    size: "P",
    notes: "Un peu dur, probablement lié au stress du déménagement",
    createdAt: yesterday.toISOString()
  },
  {
    _id: ObjectId(),
    patientId: patientIds[2], // Julie Bouchard
    authorId: userIds[4], // Claire Bergeron
    shift: "day",
    entryDate: yesterday.toISOString().split('T')[0],
    type: "bowel",
    value: "2",
    size: "P",
    notes: "Constipation liée à l'anxiété et à la réduction d'appétit",
    createdAt: yesterday.toISOString()
  }
];

const insertedBristolEntries = db.bristol_entries.insertMany(bristolEntries);

// Insert report template with numeric field
const reportTemplate = {
  _id: ObjectId(),
  templateName: "Rapport Standard Modernisé",
  fields: [
    {
      fieldName: "Humeur générale",
      fieldType: "dropdown",
      options: ["Très bien", "Bien", "Neutre", "Préoccupé", "Agité"]
    },
    {
      fieldName: "Appétit",
      fieldType: "dropdown", 
      options: ["Excellent", "Bon", "Moyen", "Faible", "Très faible"]
    },
    {
      fieldName: "Niveau de douleur (0-10)",
      fieldType: "number",
      options: []
    },
    {
      fieldName: "Heures de sommeil",
      fieldType: "number",
      options: []
    },
    {
      fieldName: "Mobilité",
      fieldType: "dropdown",
      options: ["Autonome", "Aide partielle", "Aide complète", "Alité"]
    },
    {
      fieldName: "Participation aux activités",
      fieldType: "checkbox",
      options: []
    },
    {
      fieldName: "Médicaments donnés",
      fieldType: "text",
      options: []
    },
    {
      fieldName: "Observations particulières",
      fieldType: "textarea",
      options: []
    }
  ],
  isActive: true,
  createdAt: new Date()
};

db.report_templates.insertOne(reportTemplate);

// Insert sample observation notes
const observationNotes = [
  {
    _id: ObjectId(),
    patientId: patientIds[0], // Marie Lavoie
    authorId: userIds[2], // Sophie Martin
    authorName: "Sophie Martin",
    content: "<p><strong>Observation positive - Adaptation progressive</strong></p><p>Marie s'adapte mieux que prévu à sa nouvelle chambre. Ce matin, elle a organisé spontanément ses affaires personnelles selon un schéma logique et personnel.</p><p><strong>Points positifs:</strong></p><ul><li>Initiative personnelle dans l'organisation</li><li>Moins de signes de stress qu'hier</li><li>A accepté le changement de menu sans résistance</li></ul><p>La routine commence à s'installer. Très encourageant pour la suite.</p>",
    isPositive: true,
    isSignificant: false,
    signature: {
      signedAt: new Date(),
      ipAddress: "192.168.1.45",
      userAgent: "Mozilla/5.0 (compatible; Irielle-Demo)"
    },
    createdAt: today
  },
  {
    _id: ObjectId(),
    patientId: patientIds[2], // Julie Bouchard
    authorId: userIds[1], // Dr. Marie Dubois
    authorName: "Dr. Marie Dubois",
    content: "<p><strong>Événement significatif - Crise d'anxiété sévère</strong></p><p>Julie a présenté une crise d'anxiété sévère vers 11h00 ce matin, déclenchée par un bruit inattendu (camion de livraison).</p><p><strong>Manifestations observées:</strong></p><ul><li>Hyperventilation</li><li>Tremblements</li><li>Repli en position fœtale</li><li>Refus de communication verbale pendant 20 minutes</li></ul><p><strong>Intervention:</strong> Protocole d'apaisement appliqué, environnement sensoriel adapté, Lorazepam 0.5mg administré selon prescription PRN.</p><p><strong>Récupération:</strong> Retour au calme après 45 minutes. Plan d'intervention à réviser pour améliorer la prévention.</p>",
    isPositive: false,
    isSignificant: true,
    signature: {
      signedAt: new Date(),
      ipAddress: "192.168.1.23",
      userAgent: "Mozilla/5.0 (compatible; Irielle-Demo)"
    },
    createdAt: today
  },
  {
    _id: ObjectId(),
    patientId: patientIds[3], // Marc Leblanc
    authorId: userIds[4], // Claire Bergeron
    authorName: "Claire Bergeron",
    content: "<p><strong>Observation positive - Progrès social remarquable</strong></p><p>Marc a spontanément aidé Pierre (chambre 15) à régler un problème avec sa télévision ce matin. Première fois qu'on observe cette initiative d'entraide.</p><p><strong>Détails:</strong></p><ul><li>A perçu la difficulté de Pierre</li><li>S'est approché sans sollicitation</li><li>A expliqué patiemment la solution</li><li>A manifesté de la fierté après avoir aidé</li></ul><p>Excellent progrès dans les habiletés sociales et l'empathie. À encourager et valoriser.</p>",
    isPositive: true,
    isSignificant: true,
    signature: {
      signedAt: new Date(),
      ipAddress: "192.168.1.67",
      userAgent: "Mozilla/5.0 (compatible; Irielle-Demo)"
    },
    createdAt: yesterday
  }
];

db.observationnotes.insertMany(observationNotes);

print('=== DATABASE SEEDED SUCCESSFULLY ===');
print('Users created: ' + users.length);
print('Patients created: ' + patients.length);
print('Communications created: ' + communications.length);
print('Reports created: ' + reports.length);
print('Bristol entries created: ' + bristolEntries.length);
print('Observation notes created: ' + observationNotes.length);
print('Report template created: 1');
print('');
print('=== LOGIN CREDENTIALS ===');
print('Admin: PIN 1234');
print('Staff: PIN 5678');
print('');
print('=== SAMPLE DATA OVERVIEW ===');
print('- 5 users (1 admin, 2 nurses, 2 aides)');
print('- 5 active patients with detailed medical notes (rich text)');
print('- 4 communications with rich text content (2 urgent, 2 normal)');
print('- 3 daily reports from different shifts');
print('- 3 Bristol tracking entries');
print('- 3 observation notes (2 positive, 1 significant negative)');
print('- 1 comprehensive report template with numeric fields');
print('');
print('=== RICH TEXT FEATURES DEMONSTRATED ===');
print('- Patient medical notes with HTML formatting');
print('- Communication messages with lists, emphasis, and structure');
print('- Observation notes with detailed professional documentation');
print('- Digital signatures with metadata tracking');
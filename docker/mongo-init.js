// MongoDB initialization script
db = db.getSiblingDB('irielle');

// Create collections
db.createCollection('users');
db.createCollection('patients');
db.createCollection('communications');
db.createCollection('daily_reports');
db.createCollection('bristol_entries');
db.createCollection('report_templates');

// Create indexes for better performance
db.users.createIndex({ "pinHash": 1 });
db.users.createIndex({ "isActive": 1 });
db.patients.createIndex({ "isActive": 1 });
db.communications.createIndex({ "destinationDates": 1 });
db.communications.createIndex({ "authorId": 1 });
db.communications.createIndex({ "creationDate": -1 });
db.daily_reports.createIndex({ "patientId": 1, "reportDate": -1 });
db.bristol_entries.createIndex({ "patientId": 1, "entryDate": -1 });

// Insert default admin user (PIN: 1234)
db.users.insertOne({
  firstName: "Admin",
  lastName: "Principal",
  role: "admin",
  pinHash: "$2b$10$Rdf9YDjwAXS12Ge7EClEr.AhNBLzxTOLHEIhnldatCrgZB5RQLHZG", // bcrypt hash for "1234"
  isActive: true,
  createdAt: new Date()
});

// Insert default report template
db.report_templates.insertOne({
  templateName: "Rapport Standard",
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
      fieldName: "Mobilité",
      fieldType: "dropdown",
      options: ["Autonome", "Aide partielle", "Aide complète", "Alité"]
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
  isActive: true
});

print('Database initialized successfully');
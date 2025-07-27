import mongoose, { Document, Schema } from 'mongoose';

export interface IReplacementEmployee {
  name: string;
  role?: string;
  notes?: string;
}

export interface IPatientReport {
  patientId: string;
  summary: string;
  customFields: Record<string, any>; // Données des templates assignés à l'usager
  templateId?: string; // Template utilisé pour ce rapport
  authorId?: string; // Qui a rédigé ce rapport d'usager spécifique
}

export interface IDailyReport extends Document {
  _id: string;
  shift: 'day' | 'evening' | 'night';
  reportDate: Date;
  
  // Équipe présente sur le quart
  shiftSupervisor: string; // authorId du superviseur du quart
  regularEmployees: string[]; // IDs des employés réguliers présents
  replacementEmployees: IReplacementEmployee[]; // Employés de remplacement
  
  // Rapports de tous les usagers
  patientReports: IPatientReport[];
  
  // Résumé général du quart
  shiftSummary: string;
  incidents: string[]; // Événements particuliers du quart
  
  createdAt: Date;
  updatedAt: Date;
}

const ReplacementEmployeeSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
});

const PatientReportSchema: Schema = new Schema({
  patientId: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  customFields: {
    type: Schema.Types.Mixed,
    default: {},
  },
  templateId: {
    type: String,
    ref: 'ReportTemplate',
    required: false,
  },
  authorId: {
    type: String,
    required: false,
  },
});

const DailyReportSchema: Schema = new Schema({
  shift: {
    type: String,
    enum: ['day', 'evening', 'night'],
    required: true,
  },
  reportDate: {
    type: Date,
    required: true,
  },
  
  // Équipe présente
  shiftSupervisor: {
    type: String,
    required: true,
  },
  regularEmployees: {
    type: [String],
    default: [],
  },
  replacementEmployees: {
    type: [ReplacementEmployeeSchema],
    default: [],
  },
  
  // Rapports des usagers
  patientReports: {
    type: [PatientReportSchema],
    required: true,
    validate: {
      validator: function(v: any) {
        return v && v.length > 0;
      },
      message: 'Au moins un rapport d\'usager est requis'
    }
  },
  
  // Résumé du quart
  shiftSummary: {
    type: String,
    required: true,
  },
  incidents: {
    type: [String],
    default: [],
  },
  
}, {
  timestamps: true,
});

// Index pour optimiser les requêtes
DailyReportSchema.index({ shift: 1, reportDate: 1 }, { unique: true });
DailyReportSchema.index({ reportDate: -1 });
DailyReportSchema.index({ shiftSupervisor: 1 });

export default mongoose.models.DailyReport || mongoose.model<IDailyReport>('DailyReport', DailyReportSchema);
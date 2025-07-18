import mongoose, { Document, Schema } from 'mongoose';

export interface IReplacementEmployee {
  name: string;
  role?: string;
  notes?: string;
}

export interface IPatientReport {
  patientId: string;
  summary: string;
  customFields: Record<string, any>;
  authorId?: string;
}

export interface IDailyReport extends Document {
  _id: string;
  shift: 'day' | 'evening' | 'night';
  reportDate: Date;
  shiftSupervisor: string;
  regularEmployees: string[];
  replacementEmployees: IReplacementEmployee[];
  patientReports: IPatientReport[];
  shiftSummary: string;
  incidents: string[];
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

DailyReportSchema.index({ shift: 1, reportDate: 1 }, { unique: true });
DailyReportSchema.index({ reportDate: -1 });
DailyReportSchema.index({ shiftSupervisor: 1 });

export default mongoose.models.DailyReport || mongoose.model<IDailyReport>('DailyReport', DailyReportSchema);
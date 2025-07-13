import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyReport extends Document {
  _id: string;
  patientId: string;
  authorId: string;
  shift: 'day' | 'evening' | 'night';
  reportDate: Date;
  summary: string;
  customFields: Record<string, any>;
  createdAt: Date;
}

const DailyReportSchema: Schema = new Schema({
  patientId: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  shift: {
    type: String,
    enum: ['day', 'evening', 'night'],
    required: true,
  },
  reportDate: {
    type: Date,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.DailyReport || mongoose.model<IDailyReport>('DailyReport', DailyReportSchema);
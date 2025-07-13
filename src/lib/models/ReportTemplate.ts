import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplateField {
  fieldName: string;
  fieldType: 'text' | 'textarea' | 'dropdown' | 'checkbox';
  options: string[];
}

export interface IReportTemplate extends Document {
  _id: string;
  templateName: string;
  fields: ITemplateField[];
  isActive: boolean;
}

const TemplateFieldSchema: Schema = new Schema({
  fieldName: {
    type: String,
    required: true,
  },
  fieldType: {
    type: String,
    enum: ['text', 'textarea', 'dropdown', 'checkbox'],
    required: true,
  },
  options: [{
    type: String,
  }],
});

const ReportTemplateSchema: Schema = new Schema({
  templateName: {
    type: String,
    required: true,
  },
  fields: [TemplateFieldSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.ReportTemplate || mongoose.model<IReportTemplate>('ReportTemplate', ReportTemplateSchema);
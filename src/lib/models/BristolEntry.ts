import mongoose, { Document, Schema } from 'mongoose';

export interface IBristolEntry extends Document {
  _id: string;
  patientId: string;
  authorId: string;
  shift: 'day' | 'evening' | 'night';
  entryDate: Date;
  type: 'bowel' | 'bladder';
  value: string;
  size?: 'G' | 'M' | 'P';
  createdAt: Date;
}

const BristolEntrySchema: Schema = new Schema({
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
  entryDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['bowel', 'bladder'],
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    enum: ['G', 'M', 'P'],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.BristolEntry || mongoose.model<IBristolEntry>('BristolEntry', BristolEntrySchema);
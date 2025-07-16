import mongoose, { Document, Schema } from 'mongoose';

export interface IObservationNote extends Document {
  _id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  authorEmployeeNumber?: string;
  content: string;
  isPositive: boolean;
  isSignificant: boolean;
  createdAt: Date;
  updatedAt: Date;
  signature: {
    signedAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
}

const SignatureSchema: Schema = new Schema({
  signedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
});

const ObservationNoteSchema: Schema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorEmployeeNumber: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: true,
  },
  isPositive: {
    type: Boolean,
    required: true,
  },
  isSignificant: {
    type: Boolean,
    required: true,
    default: false,
  },
  signature: {
    type: SignatureSchema,
    required: true,
  },
}, {
  timestamps: true,
});

ObservationNoteSchema.index({ patientId: 1, createdAt: -1 });
ObservationNoteSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.models.ObservationNote || mongoose.model<IObservationNote>('ObservationNote', ObservationNoteSchema);
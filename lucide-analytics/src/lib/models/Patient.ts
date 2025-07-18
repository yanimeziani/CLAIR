import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IPatient extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  profileImageURL?: string;
  allergies: string[];
  emergencyContacts: IEmergencyContact[];
  medicalNotes?: string;
  isActive: boolean;
}

const EmergencyContactSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  relationship: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const PatientSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  profileImageURL: {
    type: String,
    default: '',
  },
  allergies: [{
    type: String,
  }],
  emergencyContacts: [EmergencyContactSchema],
  medicalNotes: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
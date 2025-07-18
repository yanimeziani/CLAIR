import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  role: 'admin' | 'standard' | 'viewer';
  pinHash: string;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  employeeNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    minlength: 6,
    maxlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'standard', 'viewer'],
    required: true,
  },
  pinHash: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
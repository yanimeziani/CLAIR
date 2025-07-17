import mongoose, { Document, Schema } from 'mongoose';

export interface IReadBy {
  userId: string;
  timestamp: Date;
}

export interface ICommunication extends Document {
  _id: string;
  authorId: string;
  authorDisplayName: string;
  recipientIds: string[];
  content: string;
  isUrgent: boolean;
  creationDate: Date;
  destinationDates: Date[];
  patientId?: string;
  readBy: IReadBy[];
}

const ReadBySchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const CommunicationSchema: Schema = new Schema({
  authorId: {
    type: String,
    required: true,
  },
  authorDisplayName: {
    type: String,
    required: true,
  },
  recipientIds: [{
    type: String,
    required: true,
  }],
  content: {
    type: String,
    required: true,
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  destinationDates: [{
    type: Date,
    required: true,
  }],
  patientId: {
    type: String,
    default: null,
  },
  readBy: [ReadBySchema],
});

export default mongoose.models.Communication || mongoose.model<ICommunication>('Communication', CommunicationSchema);
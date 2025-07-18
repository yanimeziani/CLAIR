import mongoose, { Document, Schema } from 'mongoose';

export interface IHeatmapPoint extends Document {
  _id: string;
  sessionId: string;
  type: 'click' | 'mousemove' | 'scroll' | 'touch' | 'form_input';
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  intensity: number;
  timestamp: Date;
  url: string;
  path: string;
  viewport: {
    width: number;
    height: number;
  };
  scroll: {
    x: number;
    y: number;
    percentage?: number;
  };
  element?: {
    tagName: string;
    id?: string;
    className?: string;
    textContent?: string;
    xpath?: string;
    selector?: string;
  };
  userAgent: string;
  referrer?: string;
  metadata?: any;
}

export interface IAnalyticsSession extends Document {
  _id: string;
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  totalClicks: number;
  totalScrolls: number;
  totalMouseMoves: number;
  formInteractions: number;
  buttonClicks: number;
  linkClicks: number;
  rageClicks: number;
  deadClicks: number;
  attentionTime: number;
  userAgent: string;
  referrer?: string;
  viewport: {
    width: number;
    height: number;
  };
  screen: {
    width: number;
    height: number;
  };
  performance?: {
    loadTime: number;
    domContentLoaded: number;
    firstByte: number;
  };
  lastActivity: Date;
  isActive: boolean;
}

export interface IAnalyticsEvent extends Document {
  _id: string;
  sessionId: string;
  type: string;
  timestamp: Date;
  url: string;
  path: string;
  data: any;
  userAgent: string;
}

const HeatmapPointSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['click', 'mousemove', 'scroll', 'touch', 'form_input'],
    index: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  pageX: {
    type: Number,
    required: true,
  },
  pageY: {
    type: Number,
    required: true,
  },
  intensity: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  url: {
    type: String,
    required: true,
    index: true,
  },
  path: {
    type: String,
    required: true,
    index: true,
  },
  viewport: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  scroll: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    percentage: { type: Number },
  },
  element: {
    tagName: { type: String },
    id: { type: String },
    className: { type: String },
    textContent: { type: String },
    xpath: { type: String },
    selector: { type: String },
  },
  userAgent: {
    type: String,
    required: true,
  },
  referrer: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
});

const AnalyticsSessionSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    index: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
  },
  pageViews: {
    type: Number,
    default: 0,
  },
  totalClicks: {
    type: Number,
    default: 0,
  },
  totalScrolls: {
    type: Number,
    default: 0,
  },
  totalMouseMoves: {
    type: Number,
    default: 0,
  },
  formInteractions: {
    type: Number,
    default: 0,
  },
  buttonClicks: {
    type: Number,
    default: 0,
  },
  linkClicks: {
    type: Number,
    default: 0,
  },
  rageClicks: {
    type: Number,
    default: 0,
  },
  deadClicks: {
    type: Number,
    default: 0,
  },
  attentionTime: {
    type: Number,
    default: 0,
  },
  userAgent: {
    type: String,
    required: true,
  },
  referrer: {
    type: String,
  },
  viewport: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  screen: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  performance: {
    loadTime: { type: Number },
    domContentLoaded: { type: Number },
    firstByte: { type: Number },
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
});

const AnalyticsEventSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  url: {
    type: String,
    required: true,
    index: true,
  },
  path: {
    type: String,
    required: true,
    index: true,
  },
  data: {
    type: Schema.Types.Mixed,
  },
  userAgent: {
    type: String,
    required: true,
  },
});

// Create compound indexes for better query performance
HeatmapPointSchema.index({ path: 1, timestamp: -1 });
HeatmapPointSchema.index({ sessionId: 1, timestamp: -1 });
HeatmapPointSchema.index({ type: 1, timestamp: -1 });
HeatmapPointSchema.index({ url: 1, type: 1, timestamp: -1 });

AnalyticsSessionSchema.index({ startTime: -1 });
AnalyticsSessionSchema.index({ isActive: 1, lastActivity: -1 });

AnalyticsEventSchema.index({ sessionId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ type: 1, timestamp: -1 });

export const HeatmapPoint = mongoose.models.HeatmapPoint || mongoose.model<IHeatmapPoint>('HeatmapPoint', HeatmapPointSchema);
export const AnalyticsSession = mongoose.models.AnalyticsSession || mongoose.model<IAnalyticsSession>('AnalyticsSession', AnalyticsSessionSchema);
export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
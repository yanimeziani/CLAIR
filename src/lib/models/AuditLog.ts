import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  _id: string;
  
  // Action details
  action: string; // 'create', 'update', 'delete', 'login', 'logout', 'view', 'export', etc.
  entity: string; // 'user', 'patient', 'report', 'communication', 'observation', etc.
  entityId?: string; // ID of the affected entity
  
  // User information
  userId?: string; // ID of the user performing the action
  userRole: string; // Role of the user
  userName: string; // Name of the user (for display)
  userEmployeeNumber?: string; // Employee number if available
  isReplacement: boolean; // Whether it's a replacement user
  
  // Session information
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Action context
  description: string; // Human-readable description of the action
  module: string; // Which part of the app: 'dashboard', 'reports', 'patients', etc.
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Data changes (for audit trail)
  previousData?: Record<string, any>; // Data before change
  newData?: Record<string, any>; // Data after change
  changedFields?: string[]; // List of fields that were modified
  
  // Metadata
  timestamp: Date;
  success: boolean; // Whether the action was successful
  errorMessage?: string; // Error message if action failed
  duration?: number; // Time taken for the action in milliseconds
  
  // Additional context
  metadata?: Record<string, any>; // Extra contextual information
}

const AuditLogSchema: Schema = new Schema({
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'update', 'delete', 'view', 'export', 'import',
      'login', 'logout', 'login_attempt', 'password_reset',
      'bulk_update', 'bulk_delete', 'archive', 'restore',
      'generate_report', 'send_communication', 'approve', 'reject'
    ]
  },
  entity: {
    type: String,
    required: true,
    enum: [
      'user', 'patient', 'report', 'communication', 'observation', 
      'bristol_entry', 'template', 'system', 'auth', 'export'
    ]
  },
  entityId: {
    type: String,
    required: false,
  },
  
  // User information
  userId: {
    type: String,
    required: false, // May be null for system actions
  },
  userRole: {
    type: String,
    required: true,
    enum: ['admin', 'standard', 'viewer', 'system', 'replacement']
  },
  userName: {
    type: String,
    required: true,
  },
  userEmployeeNumber: {
    type: String,
    required: false,
  },
  isReplacement: {
    type: Boolean,
    default: false,
  },
  
  // Session information
  sessionId: {
    type: String,
    required: false,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
  
  // Action context
  description: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
    enum: [
      'dashboard', 'patients', 'reports', 'communications', 
      'observations', 'bristol', 'admin', 'auth', 'export', 
      'maintenance', 'system'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  
  // Data changes
  previousData: {
    type: Schema.Types.Mixed,
    required: false,
  },
  newData: {
    type: Schema.Types.Mixed,
    required: false,
  },
  changedFields: {
    type: [String],
    default: [],
  },
  
  // Metadata
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
  errorMessage: {
    type: String,
    required: false,
  },
  duration: {
    type: Number,
    required: false,
  },
  
  // Additional context
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
});

// Indexes for efficient querying
AuditLogSchema.index({ timestamp: -1 }); // Most recent first
AuditLogSchema.index({ userId: 1, timestamp: -1 }); // User activity
AuditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 }); // Entity history
AuditLogSchema.index({ action: 1, timestamp: -1 }); // Action type
AuditLogSchema.index({ module: 1, timestamp: -1 }); // Module activity
AuditLogSchema.index({ severity: 1, timestamp: -1 }); // Severity filtering
AuditLogSchema.index({ success: 1, timestamp: -1 }); // Success/failure filtering

// Compound indexes for common queries
AuditLogSchema.index({ userRole: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ entity: 1, action: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
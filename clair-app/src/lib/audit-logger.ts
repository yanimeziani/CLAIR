import AuditLog, { IAuditLog } from './models/AuditLog';
import { headers } from 'next/headers';

export interface LogActionParams {
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  module: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface UserContext {
  userId?: string;
  userRole: string;
  userName: string;
  userEmployeeNumber?: string;
  isReplacement?: boolean;
  sessionId?: string;
}

export class AuditLogger {
  /**
   * Log an action performed by a user
   */
  static async logAction(
    userContext: UserContext, 
    actionParams: LogActionParams,
    request?: Request
  ): Promise<void> {
    try {
      // Extract request information
      let ipAddress: string | undefined;
      let userAgent: string | undefined;

      if (request) {
        // Get IP address from various headers
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const cfConnectingIp = request.headers.get('cf-connecting-ip');
        
        ipAddress = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
        userAgent = request.headers.get('user-agent') || 'unknown';
      }

      // Determine changed fields if we have before/after data
      let changedFields: string[] = [];
      if (actionParams.previousData && actionParams.newData) {
        changedFields = this.getChangedFields(actionParams.previousData, actionParams.newData);
      }

      // Create audit log entry
      const auditLog = new AuditLog({
        // Action details
        action: actionParams.action,
        entity: actionParams.entity,
        entityId: actionParams.entityId,
        
        // User information
        userId: userContext.userId,
        userRole: userContext.userRole,
        userName: userContext.userName,
        userEmployeeNumber: userContext.userEmployeeNumber,
        isReplacement: userContext.isReplacement || false,
        
        // Session information
        sessionId: userContext.sessionId,
        ipAddress,
        userAgent,
        
        // Action context
        description: actionParams.description,
        module: actionParams.module,
        severity: actionParams.severity || 'low',
        
        // Data changes
        previousData: actionParams.previousData,
        newData: actionParams.newData,
        changedFields,
        
        // Metadata
        timestamp: new Date(),
        success: actionParams.success !== false,
        errorMessage: actionParams.errorMessage,
        duration: actionParams.duration,
        metadata: actionParams.metadata || {},
      });

      await auditLog.save();
    } catch (error) {
      // Log to console but don't throw to avoid breaking the main application flow
      console.error('Failed to log audit action:', error);
    }
  }

  /**
   * Log authentication events
   */
  static async logAuth(
    action: 'login' | 'logout' | 'login_attempt',
    userName: string,
    userRole: string = 'unknown',
    success: boolean = true,
    errorMessage?: string,
    request?: Request
  ): Promise<void> {
    await this.logAction(
      {
        userName,
        userRole,
        isReplacement: userRole === 'replacement'
      },
      {
        action,
        entity: 'auth',
        description: `${action === 'login' ? 'Connexion' : action === 'logout' ? 'Déconnexion' : 'Tentative de connexion'} - ${userName}`,
        module: 'auth',
        severity: success ? 'low' : 'medium',
        success,
        errorMessage
      },
      request
    );
  }

  /**
   * Log system events
   */
  static async logSystem(
    action: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      {
        userName: 'System',
        userRole: 'system'
      },
      {
        action,
        entity: 'system',
        description,
        module: 'system',
        severity,
        metadata
      }
    );
  }

  /**
   * Log data access (view operations)
   */
  static async logDataAccess(
    userContext: UserContext,
    entity: string,
    entityId: string,
    description: string,
    request?: Request
  ): Promise<void> {
    await this.logAction(
      userContext,
      {
        action: 'view',
        entity,
        entityId,
        description,
        module: entity, // Use entity as module for data access
        severity: 'low'
      },
      request
    );
  }

  /**
   * Log bulk operations
   */
  static async logBulkOperation(
    userContext: UserContext,
    action: string,
    entity: string,
    affectedIds: string[],
    description: string,
    module: string,
    request?: Request
  ): Promise<void> {
    await this.logAction(
      userContext,
      {
        action: `bulk_${action}`,
        entity,
        description,
        module,
        severity: 'medium',
        metadata: {
          affectedIds,
          count: affectedIds.length
        }
      },
      request
    );
  }

  /**
   * Get logs with filtering
   */
  static async getLogs(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    userRole?: string;
    action?: string;
    entity?: string;
    module?: string;
    severity?: string;
    success?: boolean;
    limit?: number;
    skip?: number;
  } = {}): Promise<{ logs: IAuditLog[]; total: number }> {
    try {
      const query: any = {};

      // Date range filter
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.timestamp.$lte = filters.endDate;
        }
      }

      // Other filters
      if (filters.userId) query.userId = filters.userId;
      if (filters.userRole) query.userRole = filters.userRole;
      if (filters.action) query.action = filters.action;
      if (filters.entity) query.entity = filters.entity;
      if (filters.module) query.module = filters.module;
      if (filters.severity) query.severity = filters.severity;
      if (filters.success !== undefined) query.success = filters.success;

      // Get total count
      const total = await AuditLog.countDocuments(query);

      // Get logs with pagination
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0)
        .lean();

      return { logs: logs as unknown as IAuditLog[], total };
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get activity summary statistics
   */
  static async getActivitySummary(dateRange?: { start: Date; end: Date }) {
    try {
      const matchStage: any = {};
      if (dateRange) {
        matchStage.timestamp = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            successfulActions: {
              $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
            },
            failedActions: {
              $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
            },
            actionsByModule: {
              $push: '$module'
            },
            actionsByUser: {
              $push: '$userName'
            },
            severityBreakdown: {
              $push: '$severity'
            }
          }
        }
      ];

      const result = await AuditLog.aggregate(pipeline);
      return result[0] || {
        totalActions: 0,
        successfulActions: 0,
        failedActions: 0,
        actionsByModule: [],
        actionsByUser: [],
        severityBreakdown: []
      };
    } catch (error) {
      console.error('Failed to get activity summary:', error);
      return null;
    }
  }

  /**
   * Compare objects and return changed fields
   */
  private static getChangedFields(oldData: Record<string, any>, newData: Record<string, any>): string[] {
    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }
}

// Helper function to extract user context from session
export function getUserContextFromSession(session: any): UserContext {
  return {
    userId: session?.userId || session?.user?.userId,
    userRole: session?.user?.role || 'unknown',
    userName: session?.user?.name || 'Unknown User',
    userEmployeeNumber: session?.user?.employeeNumber,
    isReplacement: session?.user?.isReplacement || false,
    sessionId: session?.sessionId
  };
}
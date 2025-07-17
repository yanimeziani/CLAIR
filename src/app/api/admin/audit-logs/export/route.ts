import { NextResponse } from 'next/server';
import { AuditLogger, getUserContextFromSession } from '@/lib/audit-logger';

// POST /api/admin/audit-logs/export - Export audit logs
export async function POST(request: Request) {
  try {
    // Check authentication and admin role
    const sessionResponse = await fetch(new URL('/api/auth/session', request.url), {
      headers: request.headers
    });
    const sessionData = await sessionResponse.json();

    if (!sessionData.authenticated || sessionData.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 403 });
    }

    const body = await request.json();
    const { filters = {}, format = 'csv' } = body;

    // Set a reasonable limit for exports
    const exportFilters = {
      ...filters,
      limit: Math.min(filters.limit || 10000, 10000) // Max 10k records
    };

    // Get logs for export
    const { logs, total } = await AuditLogger.getLogs(exportFilters);

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Timestamp',
        'Action',
        'Entity',
        'Entity ID',
        'User Name',
        'User Role',
        'Module',
        'Severity',
        'Success',
        'Description',
        'IP Address',
        'Changed Fields',
        'Error Message'
      ];

      const csvRows = logs.map(log => [
        log.timestamp.toISOString(),
        log.action,
        log.entity,
        log.entityId || '',
        log.userName,
        log.userRole,
        log.module,
        log.severity,
        log.success ? 'Oui' : 'Non',
        `"${log.description.replace(/"/g, '""')}"`, // Escape quotes in description
        log.ipAddress || '',
        log.changedFields?.join(', ') || '',
        log.errorMessage ? `"${log.errorMessage.replace(/"/g, '""')}"` : ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Log the export action
      const userContext = getUserContextFromSession(sessionData);
      await AuditLogger.logAction(
        userContext,
        {
          action: 'export',
          entity: 'audit_logs',
          description: `Export CSV de ${logs.length} logs d'audit`,
          module: 'admin',
          severity: 'medium',
          metadata: { 
            exportFormat: 'csv',
            recordCount: logs.length,
            totalAvailable: total,
            filters: exportFilters
          }
        },
        request
      );

      // Return CSV file
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
          'Cache-Control': 'no-cache'
        }
      });

    } else if (format === 'json') {
      // Return JSON format
      const jsonData = {
        exportDate: new Date().toISOString(),
        filters: exportFilters,
        totalRecords: logs.length,
        totalAvailable: total,
        logs: logs.map(log => ({
          timestamp: log.timestamp,
          action: log.action,
          entity: log.entity,
          entityId: log.entityId,
          user: {
            name: log.userName,
            role: log.userRole,
            employeeNumber: log.userEmployeeNumber,
            isReplacement: log.isReplacement
          },
          session: {
            ipAddress: log.ipAddress,
            userAgent: log.userAgent
          },
          details: {
            module: log.module,
            severity: log.severity,
            success: log.success,
            description: log.description,
            changedFields: log.changedFields,
            errorMessage: log.errorMessage
          },
          data: {
            previousData: log.previousData,
            newData: log.newData
          },
          metadata: log.metadata
        }))
      };

      // Log the export action
      const userContext = getUserContextFromSession(sessionData);
      await AuditLogger.logAction(
        userContext,
        {
          action: 'export',
          entity: 'audit_logs',
          description: `Export JSON de ${logs.length} logs d'audit`,
          module: 'admin',
          severity: 'medium',
          metadata: { 
            exportFormat: 'json',
            recordCount: logs.length,
            totalAvailable: total,
            filters: exportFilters
          }
        },
        request
      );

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`,
          'Cache-Control': 'no-cache'
        }
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Format d\'export non supporté'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'export des logs'
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/audit-logger';
import { getUserContextFromSession } from '@/lib/audit-logger';

// GET /api/admin/audit-logs - Retrieve audit logs with filtering
export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse query parameters
    const filters: any = {};
    
    // Date filters
    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }
    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    // Other filters
    if (searchParams.get('userId')) filters.userId = searchParams.get('userId');
    if (searchParams.get('userRole')) filters.userRole = searchParams.get('userRole');
    if (searchParams.get('action')) filters.action = searchParams.get('action');
    if (searchParams.get('entity')) filters.entity = searchParams.get('entity');
    if (searchParams.get('module')) filters.module = searchParams.get('module');
    if (searchParams.get('severity')) filters.severity = searchParams.get('severity');
    if (searchParams.get('success') !== null) {
      filters.success = searchParams.get('success') === 'true';
    }

    // Pagination
    if (searchParams.get('limit')) {
      filters.limit = parseInt(searchParams.get('limit')!);
    }
    if (searchParams.get('skip')) {
      filters.skip = parseInt(searchParams.get('skip')!);
    }

    // Get logs
    const { logs, total } = await AuditLogger.getLogs(filters);

    // Log this access
    const userContext = getUserContextFromSession(sessionData);
    await AuditLogger.logAction(
      userContext,
      {
        action: 'view',
        entity: 'audit_logs',
        description: `Consultation des logs d'audit avec filtres: ${JSON.stringify(filters)}`,
        module: 'admin',
        severity: 'low',
        metadata: { filtersApplied: filters, resultCount: logs.length }
      },
      request
    );

    return NextResponse.json({
      success: true,
      logs,
      total,
      pagination: {
        limit: filters.limit || 50,
        skip: filters.skip || 0,
        hasMore: (filters.skip || 0) + (filters.limit || 50) < total
      }
    });

  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des logs'
    }, { status: 500 });
  }
}

// GET /api/admin/audit-logs/summary - Get activity summary
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
    const { action, dateRange } = body;

    if (action === 'summary') {
      // Get activity summary
      const summary = await AuditLogger.getActivitySummary(dateRange);

      // Log this access
      const userContext = getUserContextFromSession(sessionData);
      await AuditLogger.logAction(
        userContext,
        {
          action: 'view',
          entity: 'audit_summary',
          description: 'Consultation du résumé d\'activité',
          module: 'admin',
          severity: 'low',
          metadata: { dateRange }
        },
        request
      );

      return NextResponse.json({
        success: true,
        summary
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Action non reconnue'
    }, { status: 400 });

  } catch (error) {
    console.error('Error processing audit logs request:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du traitement de la requête'
    }, { status: 500 });
  }
}
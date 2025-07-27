import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Patient from '@/lib/models/Patient';
import DailyReport from '@/lib/models/DailyReport';
import Communication from '@/lib/models/Communication';
import BristolEntry from '@/lib/models/BristolEntry';
import ObservationNote from '@/lib/models/ObservationNote';
import ReportTemplate from '@/lib/models/ReportTemplate';
import AuditLog from '@/lib/models/AuditLog';
import { AuditLogger, getUserContextFromSession } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
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

    await connectDB();

    const body = await request.json();
    const { exportType, format, includeUsers, includeAuditLogs, dateRange } = body;

    // Build export data
    const exportData: any = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        exportedBy: sessionData.user.name,
        version: '1.0',
        type: exportType
      }
    };

    let totalRecords = 0;

    // Build date filter if provided
    const dateFilter = dateRange ? {
      createdAt: {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      }
    } : {};

    // Export patients (always included)
    const patients = await Patient.find({ isActive: true }).lean();
    exportData.patients = patients.map(cleanMongoDoc);
    totalRecords += patients.length;

    // Export templates (always included)
    const templates = await ReportTemplate.find({ isActive: true }).lean();
    exportData.templates = templates.map(cleanMongoDoc);
    totalRecords += templates.length;

    // Export reports with date filter
    const reportFilter = dateRange ? {
      reportDate: {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      }
    } : {};
    const reports = await DailyReport.find(reportFilter).lean();
    exportData.reports = reports.map(cleanMongoDoc);
    totalRecords += reports.length;

    // Export communications with date filter
    const communications = await Communication.find(dateFilter).lean();
    exportData.communications = communications.map(cleanMongoDoc);
    totalRecords += communications.length;

    // Export Bristol entries with date filter
    const bristolFilter = dateRange ? {
      date: {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      }
    } : {};
    const bristolEntries = await BristolEntry.find(bristolFilter).lean();
    exportData.bristolEntries = bristolEntries.map(cleanMongoDoc);
    totalRecords += bristolEntries.length;

    // Export observations with date filter
    const observationFilter = dateRange ? {
      timestamp: {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      }
    } : {};
    const observations = await ObservationNote.find(observationFilter).lean();
    exportData.observations = observations.map(cleanMongoDoc);
    totalRecords += observations.length;

    // Export users (optional, without sensitive data)
    if (includeUsers) {
      const users = await User.find({ isActive: true })
        .select('-pin -__v')
        .lean();
      exportData.users = users.map(cleanMongoDoc);
      totalRecords += users.length;
    }

    // Export audit logs (optional)
    if (includeAuditLogs) {
      const auditFilter = dateRange ? {
        timestamp: {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        }
      } : {};
      const auditLogs = await AuditLog.find(auditFilter)
        .sort({ timestamp: -1 })
        .limit(10000) // Limit to last 10k entries
        .lean();
      exportData.auditLogs = auditLogs.map(cleanMongoDoc);
      totalRecords += auditLogs.length;
    }

    // Log the export action
    const userContext = getUserContextFromSession(sessionData);
    await AuditLogger.logAction(
      userContext,
      {
        action: 'export',
        entity: 'data',
        description: `Export complet des données - Format: ${format}`,
        module: 'admin',
        severity: 'medium',
        metadata: {
          exportType,
          format,
          includeUsers,
          includeAuditLogs,
          dateRange,
          totalRecords
        }
      },
      request
    );

    // Return data based on format
    if (format === 'json') {
      const filename = `clair_export_${new Date().toISOString().split('T')[0]}.json`;
      
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    } else if (format === 'csv') {
      // For CSV, export the most important data (patients)
      const csvContent = convertToCSV(exportData.patients, 'patients');
      const filename = `clair_patients_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Format non supporté'
    }, { status: 400 });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'export'
    }, { status: 500 });
  }
}

// Clean MongoDB documents for export
function cleanMongoDoc(doc: any) {
  const cleaned = { ...doc };
  
  // Convert ObjectId to string
  if (cleaned._id) {
    cleaned.id = cleaned._id.toString();
    delete cleaned._id;
  }
  
  // Remove MongoDB version field
  delete cleaned.__v;
  
  // Convert dates to ISO strings
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] instanceof Date) {
      cleaned[key] = cleaned[key].toISOString();
    }
  });
  
  return cleaned;
}

// Convert data to CSV format
function convertToCSV(data: any[], type: string): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      // Skip complex objects for CSV
      if (typeof item[key] !== 'object' || item[key] === null) {
        allKeys.add(key);
      }
    });
  });

  const headers = Array.from(allKeys);
  
  // Create CSV content
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(item => 
      headers.map(header => {
        const value = item[header];
        // Handle null/undefined values
        if (value === null || value === undefined) {
          return '';
        }
        // Escape commas and quotes in values
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}
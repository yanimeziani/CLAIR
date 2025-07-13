import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import DailyReport from '@/lib/models/DailyReport';
import Patient from '@/lib/models/Patient';
import User from '@/lib/models/User';

async function checkAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('irielle-session');
  
  if (!sessionCookie) {
    return { authenticated: false };
  }
  
  try {
    const sessionData = JSON.parse(sessionCookie.value);
    return { 
      authenticated: true,
      user: sessionData
    };
  } catch {
    return { authenticated: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const patientId = searchParams.get('patientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const shift = searchParams.get('shift');
    
    // Build query
    const query: any = {};
    if (patientId) query.patientId = patientId;
    if (shift) query.shift = shift;
    if (startDate) query.reportDate = { $gte: startDate };
    if (endDate) {
      if (query.reportDate) {
        query.reportDate.$lte = endDate;
      } else {
        query.reportDate = { $lte: endDate };
      }
    }
    
    const reports = await DailyReport.find(query).sort({ reportDate: -1, patientId: 1 });
    
    // Get patient and user names for reference
    const patientIds = [...new Set(reports.map(r => r.patientId))];
    const authorIds = [...new Set(reports.map(r => r.authorId))];
    
    const [patients, authors] = await Promise.all([
      Patient.find({ _id: { $in: patientIds } }),
      User.find({ _id: { $in: authorIds } })
    ]);
    
    const patientMap = new Map(patients.map(p => [p._id.toString(), `${p.firstName} ${p.lastName}`]));
    const authorMap = new Map(authors.map(u => [u._id.toString(), `${u.firstName} ${u.lastName}`]));
    
    if (format === 'csv') {
      // Dynamically collect all custom field names used across all reports
      const allCustomFields = new Set<string>();
      for (const report of reports) {
        if (report.customFields) {
          Object.keys(report.customFields).forEach(field => allCustomFields.add(field));
        }
      }
      
      // Build headers dynamically - core fields + all custom fields found
      const coreHeaders = [
        'Date du rapport',
        'Résident',
        'Équipe',
        'Auteur',
        'Résumé'
      ];
      
      const customFieldHeaders = Array.from(allCustomFields).sort();
      const headers = [...coreHeaders, ...customFieldHeaders, 'Date de création'];
      
      const csvRows = [headers.join(',')];
      
      const shiftLabels = {
        'day': 'Jour (6h-14h)',
        'evening': 'Soir (14h-22h)',
        'night': 'Nuit (22h-6h)'
      };
      
      for (const report of reports) {
        const patientName = patientMap.get(report.patientId) || 'Résident inconnu';
        const authorName = authorMap.get(report.authorId) || 'Auteur inconnu';
        
        // Build core row data
        const coreData = [
          report.reportDate || '',
          `"${patientName}"`,
          `"${shiftLabels[report.shift as keyof typeof shiftLabels] || report.shift}"`,
          `"${authorName}"`,
          `"${(report.summary || '').replace(/"/g, '""')}"`
        ];
        
        // Add custom field data in the same order as headers
        const customData = customFieldHeaders.map(fieldName => {
          const value = report.customFields?.[fieldName];
          if (value === undefined || value === null) return '""';
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        
        const row = [...coreData, ...customData, new Date(report.createdAt).toLocaleString('fr-CA')];
        csvRows.push(row.join(','));
      }
      
      const csvContent = csvRows.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rapports-quotidiens-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // Default JSON response with protected field access
    return NextResponse.json({
      success: true,
      reports: reports.map(r => {
        // Create a safe object with all available fields
        const safeReport: any = {
          reportDate: r.reportDate || '',
          patientName: patientMap.get(r.patientId) || 'Résident inconnu',
          shift: r.shift || '',
          authorName: authorMap.get(r.authorId) || 'Auteur inconnu',
          summary: r.summary || '',
          createdAt: r.createdAt
        };
        
        // Safely add custom fields if they exist
        if (r.customFields && typeof r.customFields === 'object') {
          Object.entries(r.customFields).forEach(([key, value]) => {
            safeReport[key] = value;
          });
        }
        
        return safeReport;
      })
    });
    
  } catch (error) {
    console.error('Error exporting reports:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'exportation' },
      { status: 500 }
    );
  }
}
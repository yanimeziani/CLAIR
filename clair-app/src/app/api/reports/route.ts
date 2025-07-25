import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import DailyReport from '@/lib/models/DailyReport';
import Patient from '@/lib/models/Patient';
import User from '@/lib/models/User';

async function checkAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('clair-session');
  
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const shift = searchParams.get('shift');
    const date = searchParams.get('date');
    
    // Build query
    let query: any = {};
    if (shift) {
      query.shift = shift;
    }
    if (date) {
      query.reportDate = date;
    }
    
    // Get shift reports based on filters
    const reports = await DailyReport.find(query)
      .sort({ reportDate: -1, createdAt: -1 })
      .limit(100);

    console.log('Found reports:', reports.length, 'for query:', query);

    // Populate supervisor and patient information
    const populatedReports = await Promise.all(reports.map(async (report) => {
      let supervisor = null;
      
      try {
        supervisor = await User.findById(report.shiftSupervisor).select('firstName lastName');
      } catch (error) {
        console.error('Error finding supervisor:', report.shiftSupervisor, error);
      }
      
      // Populate patient names for each patient report
      const populatedPatientReports = await Promise.all(
        report.patientReports.map(async (patientReport: any) => {
          try {
            const patient = await Patient.findById(patientReport.patientId).select('firstName lastName');
            return {
              ...patientReport,
              patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Usager inconnu'
            };
          } catch (error) {
            console.error('Error finding patient:', patientReport.patientId, error);
            return {
              ...patientReport,
              patientName: 'Usager inconnu'
            };
          }
        })
      );
      
      return {
        ...report.toObject(),
        supervisorName: supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Superviseur inconnu',
        patientReports: populatedPatientReports
      };
    }));
    
    return NextResponse.json({ 
      success: true, 
      reports: populatedReports 
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des rapports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const requestBody = await request.json();
    console.log('Received request body:', requestBody);
    
    // Handle both individual patient reports and full shift reports
    const { 
      patientId, shift, reportDate, summary, customFields,
      shiftSummary, incidents, regularEmployees, replacementEmployees, patientReports
    } = requestBody;
    
    // Individual patient report creation
    if (patientId && summary && !shiftSummary) {
      if (!shift) {
        return NextResponse.json(
          { success: false, error: 'Équipe requise' },
          { status: 400 }
        );
      }

      if (!['day', 'evening', 'night'].includes(shift)) {
        return NextResponse.json(
          { success: false, error: 'Équipe invalide' },
          { status: 400 }
        );
      }

      await connectDB();
      
      // Validate patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return NextResponse.json(
          { success: false, error: 'Usager introuvable' },
          { status: 404 }
        );
      }

      const reportDateStr = reportDate || new Date().toISOString().split('T')[0];
      
      // Check if a shift report already exists for this date and shift
      let existingShiftReport = await DailyReport.findOne({
        shift,
        reportDate: reportDateStr
      });

      const patientReport = {
        patientId,
        summary: summary.trim(),
        customFields: customFields || {},
        authorId: auth.user.userId
      };

      if (existingShiftReport) {
        // Add patient report to existing shift report
        const existingPatientReportIndex = existingShiftReport.patientReports.findIndex(
          (report: any) => report.patientId === patientId
        );

        if (existingPatientReportIndex >= 0) {
          // Update existing patient report
          existingShiftReport.patientReports[existingPatientReportIndex] = patientReport;
        } else {
          // Add new patient report
          existingShiftReport.patientReports.push(patientReport);
        }

        await existingShiftReport.save();
        
        return NextResponse.json({ 
          success: true, 
          report: existingShiftReport,
          message: 'Rapport d\'usager ajouté au rapport de quart existant'
        });
      } else {
        // Create new shift report with this patient report
        const newShiftReport = new DailyReport({
          shift,
          reportDate: reportDateStr,
          shiftSupervisor: auth.user.userId,
          regularEmployees: [],
          replacementEmployees: [],
          patientReports: [patientReport],
          shiftSummary: `Rapport créé automatiquement pour l'usager ${patient.firstName} ${patient.lastName}`,
          incidents: []
        });
        
        await newShiftReport.save();
        
        return NextResponse.json({ 
          success: true, 
          report: newShiftReport,
          message: 'Nouveau rapport de quart créé avec le rapport d\'usager'
        });
      }
    }
    
    // Full shift report creation (existing logic)
    if (!shift || !shiftSummary?.trim() || !patientReports?.length) {
      return NextResponse.json(
        { success: false, error: 'Quart de travail, résumé général et rapports d\'usagers sont requis' },
        { status: 400 }
      );
    }

    if (!['day', 'evening', 'night'].includes(shift)) {
      return NextResponse.json(
        { success: false, error: 'Équipe invalide' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Check if report already exists for this shift and date
    const existingShiftReport = await DailyReport.findOne({
      shift,
      reportDate: reportDate || new Date().toISOString().split('T')[0]
    });

    if (existingShiftReport) {
      return NextResponse.json(
        { success: false, error: 'Un rapport existe déjà pour ce quart de travail à cette date' },
        { status: 400 }
      );
    }
    
    // Validate all patients exist
    const patientIds = patientReports.map((report: any) => report.patientId);
    const patients = await Patient.find({ _id: { $in: patientIds } });
    
    if (patients.length !== patientIds.length) {
      return NextResponse.json(
        { success: false, error: 'Un ou plusieurs usagers sont introuvables' },
        { status: 404 }
      );
    }
    
    const newShiftReport = new DailyReport({
      shift,
      reportDate: reportDate || new Date().toISOString().split('T')[0],
      shiftSupervisor: auth.user.userId,
      regularEmployees: regularEmployees || [],
      replacementEmployees: replacementEmployees || [],
      patientReports,
      shiftSummary: shiftSummary.trim(),
      incidents: incidents || []
    });
    
    await newShiftReport.save();
    
    return NextResponse.json({ 
      success: true, 
      report: newShiftReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du rapport' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { 
      reportId, shift, reportDate, shiftSummary, incidents,
      regularEmployees, replacementEmployees, patientReports
    } = await request.json();
    
    if (!reportId || !shift || !shiftSummary?.trim() || !patientReports?.length) {
      return NextResponse.json(
        { success: false, error: 'ID du rapport, quart de travail, résumé et rapports d\'usagers sont requis' },
        { status: 400 }
      );
    }

    if (!['day', 'evening', 'night'].includes(shift)) {
      return NextResponse.json(
        { success: false, error: 'Équipe invalide' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find the existing report
    const existingReport = await DailyReport.findById(reportId);
    if (!existingReport) {
      return NextResponse.json(
        { success: false, error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }

    // Validate all patients exist
    const patientIds = patientReports.map((report: any) => report.patientId);
    const patients = await Patient.find({ _id: { $in: patientIds } });
    
    if (patients.length !== patientIds.length) {
      return NextResponse.json(
        { success: false, error: 'Un ou plusieurs usagers sont introuvables' },
        { status: 404 }
      );
    }

    // Update the report
    const updatedReport = await DailyReport.findByIdAndUpdate(
      reportId,
      {
        shift,
        reportDate: reportDate || existingReport.reportDate,
        shiftSummary: shiftSummary.trim(),
        incidents: incidents || [],
        regularEmployees: regularEmployees || [],
        replacementEmployees: replacementEmployees || [],
        patientReports,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du rapport' },
      { status: 500 }
    );
  }
}
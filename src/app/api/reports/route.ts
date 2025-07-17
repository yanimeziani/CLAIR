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

export async function GET() {
  try {
    const auth = await checkAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    await connectDB();
    
    // Get all shift reports
    const reports = await DailyReport.find({})
      .sort({ reportDate: -1, createdAt: -1 })
      .limit(100);

    console.log('Found reports:', reports.length);

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
    
    const { 
      shift, reportDate, shiftSummary, incidents, 
      regularEmployees, replacementEmployees, patientReports
    } = requestBody;
    
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
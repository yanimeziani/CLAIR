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
    
    // Get all reports (for development/demo purposes)
    // In production, you might want to limit to recent reports
    const reports = await DailyReport.find({})
      .sort({ reportDate: -1, createdAt: -1 })
      .limit(100); // Limit to latest 100 reports

    console.log('Found reports:', reports.length);

    // Populate patient and author information with error handling
    const populatedReports = await Promise.all(reports.map(async (report) => {
      let patient = null;
      let author = null;
      
      try {
        if (report.patientId) {
          patient = await Patient.findById(report.patientId).select('firstName lastName');
        }
      } catch (error) {
        console.error('Error finding patient:', report.patientId, error);
      }
      
      try {
        if (report.authorId) {
          author = await User.findById(report.authorId).select('firstName lastName');
        }
      } catch (error) {
        console.error('Error finding author:', report.authorId, error);
      }
      
      return {
        ...report.toObject(),
        patient,
        authorName: author ? `${author.firstName} ${author.lastName}` : 'Utilisateur inconnu'
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
    
    // Check if this is a new-style complete shift report or old-style single patient report
    if (requestBody.patientReports && Array.isArray(requestBody.patientReports)) {
      // New-style complete shift report
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
      
    } else {
      // Old-style single patient report (backward compatibility)
      const { 
        patientId, shift, reportDate, summary, customFields
      } = requestBody;
      
      if (!patientId || !shift || !summary?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Usager, équipe et résumé sont requis' },
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
      
      // Check if patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return NextResponse.json(
          { success: false, error: 'Usager non trouvé' },
          { status: 404 }
        );
      }

      // Check if report already exists for this patient, date, and shift
      const existingReport = await DailyReport.findOne({
        patientId,
        shift,
        reportDate: reportDate || new Date().toISOString().split('T')[0]
      });

      if (existingReport) {
        return NextResponse.json(
          { success: false, error: 'Un rapport existe déjà pour cet usager à cette date et ce quart de travail' },
          { status: 400 }
        );
      }
      
      // Create old-style report with backward compatibility fields
      const newReport = new DailyReport({
        // New fields
        shift,
        reportDate: reportDate || new Date().toISOString().split('T')[0],
        shiftSupervisor: auth.user.userId,
        regularEmployees: [],
        replacementEmployees: [],
        patientReports: [{
          patientId,
          summary: summary.trim(),
          customFields: customFields || {},
          authorId: auth.user.userId
        }],
        shiftSummary: summary.trim(),
        incidents: [],
        
        // Old fields for backward compatibility
        patientId,
        authorId: auth.user.userId,
        summary: summary.trim(),
        customFields: customFields || {}
      });
      
      await newReport.save();
      
      return NextResponse.json({ 
        success: true, 
        report: newReport
      });
    }
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
      reportId, patientId, shift, reportDate, summary, customFields
    } = await request.json();
    
    if (!reportId || !patientId || !shift || !summary?.trim()) {
      return NextResponse.json(
        { success: false, error: 'ID du rapport, usager, équipe et résumé sont requis' },
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

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Usager non trouvé' },
        { status: 404 }
      );
    }

    // Update the report
    const updatedReport = await DailyReport.findByIdAndUpdate(
      reportId,
      {
        patientId,
        shift,
        reportDate: reportDate || existingReport.reportDate,
        summary: summary.trim(),
        customFields: customFields || {},
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
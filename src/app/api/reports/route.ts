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

    // Populate patient and author information
    const populatedReports = await Promise.all(reports.map(async (report) => {
      const patient = await Patient.findById(report.patientId).select('firstName lastName');
      const author = await User.findById(report.authorId).select('firstName lastName');
      
      return {
        ...report.toObject(),
        patient,
        authorName: author ? `${author.firstName} ${author.lastName}` : null
      };
    }));
    
    return NextResponse.json({ 
      success: true, 
      reports: populatedReports 
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
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

    const { 
      patientId, shift, reportDate, summary, customFields
    } = await request.json();
    
    if (!patientId || !shift || !summary?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Résident, équipe et résumé sont requis' },
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
        { success: false, error: 'Résident non trouvé' },
        { status: 404 }
      );
    }

    // Check if report already exists for this patient and date (one report per patient per day)
    const existingReport = await DailyReport.findOne({
      patientId,
      reportDate: reportDate || new Date().toISOString().split('T')[0]
    });

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: 'Un rapport existe déjà pour ce résident à cette date' },
        { status: 400 }
      );
    }
    
    const newReport = new DailyReport({
      patientId,
      authorId: auth.user.userId,
      shift,
      reportDate: reportDate || new Date().toISOString().split('T')[0],
      summary: summary.trim(),
      customFields: customFields || {}
    });
    
    await newReport.save();
    
    return NextResponse.json({ 
      success: true, 
      report: newReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
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
        { success: false, error: 'ID du rapport, résident, équipe et résumé sont requis' },
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
        { success: false, error: 'Résident non trouvé' },
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
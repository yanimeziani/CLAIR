import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import ObservationNote from '@/lib/models/ObservationNote';
import Patient from '@/lib/models/Patient';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const withPatientNames = searchParams.get('withPatientNames') === 'true';

    // If fetching for a specific patient
    if (patientId) {
      // Verify patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return NextResponse.json(
          { success: false, error: 'Patient non trouvé' },
          { status: 404 }
        );
      }

      // Fetch observations for the patient
      const observations = await ObservationNote.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return NextResponse.json({
        success: true,
        observations: observations || []
      });
    }

    // If fetching recent observations with patient names (for admin dashboard)
    if (withPatientNames) {
      const observations = await ObservationNote.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Get patient names for each observation
      const observationsWithPatientNames = await Promise.all(
        observations.map(async (obs) => {
          const patient = await Patient.findById(obs.patientId).lean() as { firstName: string; lastName: string } | null;
          return {
            ...obs,
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'
          };
        })
      );

      return NextResponse.json({
        success: true,
        observations: observationsWithPatientNames || []
      });
    }

    // Default: return error if no specific query
    return NextResponse.json(
      { success: false, error: 'Paramètres de requête requis' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      patientId,
      content,
      isPositive,
      isSignificant,
      authorName,
      signature
    } = body;

    // Validation
    if (!patientId || !content || !authorName || typeof isPositive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Données manquantes ou invalides' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Create observation note
    const observationNote = new ObservationNote({
      patientId,
      authorId: null, // Will be set when we have proper user session
      authorName,
      content,
      isPositive,
      isSignificant: isSignificant || false,
      signature: {
        signedAt: new Date(),
        ipAddress: ip,
        userAgent: signature?.userAgent || 'unknown'
      }
    });

    await observationNote.save();

    return NextResponse.json({
      success: true,
      observationNote: {
        _id: observationNote._id,
        content: observationNote.content,
        isPositive: observationNote.isPositive,
        isSignificant: observationNote.isSignificant,
        authorName: observationNote.authorName,
        createdAt: observationNote.createdAt,
        signature: observationNote.signature
      }
    });

  } catch (error) {
    console.error('Error creating observation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'observation' },
      { status: 500 }
    );
  }
}
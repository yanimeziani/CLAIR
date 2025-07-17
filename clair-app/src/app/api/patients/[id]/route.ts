import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import Patient from '@/lib/models/Patient';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
 
      allergies, 
      emergencyContacts, 
      medicalNotes 
    } = await request.json();
    
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prénom, nom et numéro de chambre sont requis' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Check if room number already exists for other patients
    const existingPatient = await Patient.findOne({ 
      isActive: true,
      _id: { $ne: (await params).id }
    });
    
    if (existingPatient) {
      return NextResponse.json(
        { success: false, error: 'Ce numéro de chambre est déjà utilisé' },
        { status: 400 }
      );
    }
    
    const { id } = await params;
    const patient = await Patient.findByIdAndUpdate(
      id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          allergies: allergies || [],
        emergencyContacts: emergencyContacts || [],
        medicalNotes: medicalNotes?.trim() || ''
      },
      { new: true }
    );
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Usager non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      patient 
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification de l\'usager' },
      { status: 500 }
    );
  }
}
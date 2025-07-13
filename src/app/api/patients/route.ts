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
    
    const patients = await Patient.find({})
      .sort({ lastName: 1, firstName: 1 });
    
    return NextResponse.json({ 
      success: true, 
      patients 
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des résidents' },
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
      firstName, 
      lastName, 
      dateOfBirth, 
      allergies, 
      emergencyContacts, 
      medicalNotes 
    } = await request.json();
    
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prénom et nom sont requis' },
        { status: 400 }
      );
    }

    await connectDB();
    
    
    const newPatient = new Patient({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
      allergies: allergies || [],
      emergencyContacts: emergencyContacts || [],
      medicalNotes: medicalNotes?.trim() || '',
      isActive: true
    });
    
    await newPatient.save();
    
    return NextResponse.json({ 
      success: true, 
      patient: newPatient
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du résident' },
      { status: 500 }
    );
  }
}
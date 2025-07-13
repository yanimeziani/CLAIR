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

export async function PATCH(
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

    const { isActive } = await request.json();
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Statut invalide' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const patient = await Patient.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Résident non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      patient 
    });
  } catch (error) {
    console.error('Error updating patient status:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du statut' },
      { status: 500 }
    );
  }
}
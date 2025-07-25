import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { hashPin } from '@/lib/auth/auth';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('clair-session');
  
  if (!sessionCookie) {
    return { authenticated: false };
  }
  
  try {
    const sessionData = JSON.parse(sessionCookie.value);
    return { 
      authenticated: sessionData.role === 'admin',
      user: sessionData
    };
  } catch {
    return { authenticated: false };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedPin = await hashPin(tempPin);
    
    await User.findByIdAndUpdate(id, { pinHash: hashedPin });
    
    return NextResponse.json({ 
      success: true, 
      tempPin 
    });
  } catch (error) {
    console.error('Error resetting PIN:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la réinitialisation du PIN' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';

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

export async function PATCH(
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

    const { isActive } = await request.json();
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Statut invalide' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('firstName lastName role isActive createdAt');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du statut' },
      { status: 500 }
    );
  }
}
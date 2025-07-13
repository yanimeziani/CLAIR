import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import Communication from '@/lib/models/Communication';

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

export async function POST(
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

    await connectDB();
    
    const { id } = await params;
    const communication = await Communication.findById(id);
    
    if (!communication) {
      return NextResponse.json(
        { success: false, error: 'Message non trouvé' },
        { status: 404 }
      );
    }
    
    // Check if already read by this user
    const alreadyRead = communication.readBy.some(
      (read: { userId: string }) => read.userId === auth.user.userId
    );
    
    if (!alreadyRead) {
      communication.readBy.push({
        userId: auth.user.userId,
        timestamp: new Date()
      });
      
      await communication.save();
    }
    
    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error('Error marking communication as read:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du marquage comme lu' },
      { status: 500 }
    );
  }
}
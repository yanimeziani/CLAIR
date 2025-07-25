import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import Communication from '@/lib/models/Communication';

async function checkAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('clair-session');
  
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
    
    // Get communications for today and recent dates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const communications = await Communication.find({
      $or: [
        { destinationDates: { $gte: thirtyDaysAgo.toISOString().split('T')[0] } },
        { recipientIds: { $in: [auth.user.userId] } }
      ]
    }).sort({ creationDate: -1 });
    
    return NextResponse.json({ 
      success: true, 
      communications 
    });
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des communications' },
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
      content, 
      recipientIds, 
      isUrgent, 
      destinationDates, 
      patientId,
      authorDisplayName
    } = await request.json();
    
    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le contenu du message est requis' },
        { status: 400 }
      );
    }
    
    if (!recipientIds || recipientIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Au moins un destinataire est requis' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const newCommunication = new Communication({
      authorId: auth.user.userId,
      authorDisplayName: authorDisplayName || auth.user.name,
      recipientIds,
      content: content.trim(),
      isUrgent: Boolean(isUrgent),
      destinationDates: destinationDates || [new Date().toISOString().split('T')[0]],
      patientId: patientId || null,
      readBy: []
    });
    
    await newCommunication.save();
    
    return NextResponse.json({ 
      success: true, 
      communication: newCommunication
    });
  } catch (error) {
    console.error('Error creating communication:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du message' },
      { status: 500 }
    );
  }
}
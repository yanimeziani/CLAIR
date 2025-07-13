import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import BristolEntry from '@/lib/models/BristolEntry';

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

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'ID du patient requis' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const query: Record<string, any> = { patientId };
    
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      query.entryDate = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      };
    }
    
    const entries = await BristolEntry.find(query)
      .sort({ entryDate: -1, createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      entries 
    });
  } catch (error) {
    console.error('Error fetching Bristol entries:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des données' },
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

    const { patientId, shift, entryDate, type, value, size } = await request.json();
    
    if (!patientId || !shift || !entryDate || !type || !value) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (!['bowel', 'bladder'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type d\'entrée invalide' },
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
    
    // Check if entry already exists for this patient, date, shift, and type
    const existingEntry = await BristolEntry.findOne({
      patientId,
      entryDate: entryDate.split('T')[0],
      shift,
      type
    });

    if (existingEntry) {
      // Update existing entry
      existingEntry.value = value;
      if (size) existingEntry.size = size;
      existingEntry.authorId = auth.user.userId;
      await existingEntry.save();
      
      return NextResponse.json({ 
        success: true, 
        entry: existingEntry,
        updated: true
      });
    } else {
      // Create new entry
      const newEntry = new BristolEntry({
        patientId,
        authorId: auth.user.userId,
        shift,
        entryDate: entryDate.split('T')[0],
        type,
        value,
        ...(size && { size })
      });
      
      await newEntry.save();
      
      return NextResponse.json({ 
        success: true, 
        entry: newEntry,
        updated: false
      });
    }
  } catch (error) {
    console.error('Error creating Bristol entry:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'entrée' },
      { status: 500 }
    );
  }
}
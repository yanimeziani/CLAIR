import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { hashPin } from '@/lib/auth/auth';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('irielle-session');
  
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

export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const users = await User.find({})
      .select('firstName lastName role isActive createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { firstName, lastName, role, tempPin } = await request.json();
    
    if (!firstName?.trim() || !lastName?.trim() || !role || !tempPin) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const hashedPin = await hashPin(tempPin);
    
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      pinHash: hashedPin,
      isActive: true
    });
    
    await newUser.save();
    
    return NextResponse.json({ 
      success: true, 
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      },
      tempPin 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const users = await User.find({ isActive: true })
      .sort({ firstName: 1 })
      .lean();
    
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
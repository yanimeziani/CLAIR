import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { pin, userId, replacementName } = await request.json();
    
    if (replacementName) {
      // Handle replacement user
      const sessionData = {
        userId: 'replacement',
        role: 'standard',
        name: `Remplacement: ${replacementName}`,
        isReplacement: true
      };
      
      const cookieStore = await cookies();
      cookieStore.set('irielle-session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60, // 8 hours
        path: '/'
      });
      
      return NextResponse.json({ 
        success: true, 
        user: sessionData 
      });
    }
    
    if (!pin) {
      return NextResponse.json(
        { success: false, error: 'PIN requis' },
        { status: 400 }
      );
    }
    
    const result = await authenticateUser(pin, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }
    
    const sessionData = {
      userId: result.user!._id,
      role: result.user!.role,
      name: `${result.user!.firstName} ${result.user!.lastName}`,
      isReplacement: false
    };
    
    const cookieStore = await cookies();
    cookieStore.set('irielle-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/'
    });
    
    return NextResponse.json({ 
      success: true, 
      user: sessionData 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
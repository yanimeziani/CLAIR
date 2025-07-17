import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('irielle-session');
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }
    
    const sessionData = JSON.parse(sessionCookie.value);
    
    return NextResponse.json({ 
      authenticated: true, 
      user: sessionData 
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
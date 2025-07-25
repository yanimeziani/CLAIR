import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import ReportTemplate from '@/lib/models/ReportTemplate';

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
    
    const templates = await ReportTemplate.find({})
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      templates 
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des modèles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Accès administrateur requis' },
        { status: 403 }
      );
    }

    const { templateName, fields } = await request.json();
    
    if (!templateName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nom du modèle requis' },
        { status: 400 }
      );
    }

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { success: false, error: 'Champs invalides' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Deactivate all existing templates
    await ReportTemplate.updateMany({}, { isActive: false });
    
    const newTemplate = new ReportTemplate({
      templateName: templateName.trim(),
      fields,
      isActive: true
    });
    
    await newTemplate.save();
    
    return NextResponse.json({ 
      success: true, 
      template: newTemplate
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du modèle' },
      { status: 500 }
    );
  }
}
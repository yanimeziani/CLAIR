import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import Patient from '@/lib/models/Patient';

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

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    // Build query
    const query = activeOnly ? { isActive: true } : {};
    
    const patients = await Patient.find(query).sort({ lastName: 1, firstName: 1 });
    
    if (format === 'csv') {
      // Generate CSV with protected field access
      const headers = [
        'Prénom',
        'Nom',
        'Date de naissance',
        'Allergies',
        'Contact d\'urgence',
        'Téléphone contact',
        'Notes médicales',
        'Statut',
        'Date de création'
      ];
      
      const csvRows = [headers.join(',')];
      
      for (const patient of patients) {
        // Protected field access with fallbacks
        const formatDate = (date: any) => {
          if (!date) return '';
          try {
            return new Date(date).toLocaleDateString('fr-CA');
          } catch {
            return '';
          }
        };
        
        const formatArray = (arr: any[], separator = '; ') => {
          if (!Array.isArray(arr)) return '';
          return arr.join(separator);
        };
        
        const formatText = (text: any) => {
          if (text === null || text === undefined) return '';
          return String(text).replace(/"/g, '""');
        };
        
        const row = [
          `"${formatText(patient.firstName)}"`,
          `"${formatText(patient.lastName)}"`,
          formatDate(patient.dateOfBirth),
          `"${formatArray(patient.allergies)}"`,
          `"${formatText(patient.emergencyContacts?.[0]?.name)}"`,
          `"${formatText(patient.emergencyContacts?.[0]?.phone)}"`,
          `"${formatText(patient.medicalNotes)}"`,
          patient.isActive ? 'Actif' : 'Inactif',
          formatDate(patient.createdAt)
        ];
        csvRows.push(row.join(','));
      }
      
      const csvContent = csvRows.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="residents-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // Default JSON response with protected field access
    return NextResponse.json({
      success: true,
      patients: patients.map(p => {
        // Create safe object with protected field access
        return {
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          dateOfBirth: p.dateOfBirth || null,
          allergies: Array.isArray(p.allergies) ? p.allergies : [],
          emergencyContacts: Array.isArray(p.emergencyContacts) ? p.emergencyContacts : [],
          medicalNotes: p.medicalNotes || '',
          isActive: Boolean(p.isActive),
          createdAt: p.createdAt || new Date()
        };
      })
    });
    
  } catch (error) {
    console.error('Error exporting patients:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'exportation' },
      { status: 500 }
    );
  }
}
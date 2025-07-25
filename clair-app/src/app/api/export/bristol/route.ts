import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import BristolEntry from '@/lib/models/BristolEntry';
import Patient from '@/lib/models/Patient';

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
    const patientId = searchParams.get('patientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build query
    const query: any = {};
    if (patientId) query.patientId = patientId;
    if (startDate) query.entryDate = { $gte: startDate };
    if (endDate) {
      if (query.entryDate) {
        query.entryDate.$lte = endDate;
      } else {
        query.entryDate = { $lte: endDate };
      }
    }
    
    const entries = await BristolEntry.find(query).sort({ entryDate: -1, patientId: 1 });
    
    // Get patient names for reference
    const patientIds = [...new Set(entries.map(e => e.patientId))];
    const patients = await Patient.find({ _id: { $in: patientIds } });
    const patientMap = new Map(patients.map(p => [p._id.toString(), `${p.firstName} ${p.lastName}`]));
    
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Date',
        'Usager',
        'Équipe',
        'Type',
        'Valeur',
        'Description',
        'Date de création'
      ];
      
      const csvRows = [headers.join(',')];
      
      const bristolDescriptions = {
        '1': 'Type 1 - Très dur (morceaux durs séparés)',
        '2': 'Type 2 - Dur (en forme de saucisse, grumeleux)',
        '3': 'Type 3 - Normal dur (en forme de saucisse, surface craquelée)',
        '4': 'Type 4 - Normal (en forme de saucisse, surface lisse)',
        '5': 'Type 5 - Normal mou (masses molles aux bords nets)',
        '6': 'Type 6 - Mou (morceaux mous, bords déchiquetés)',
        '7': 'Type 7 - Liquide (entièrement liquide)'
      };
      
      const bladderDescriptions = {
        'jaune_clair': 'Jaune clair',
        'jaune_fonce': 'Jaune foncé',
        'orange': 'Orange',
        'trouble': 'Trouble',
        'peu_abondant': 'Peu abondant',
        'abondant': 'Abondant',
        'sang': 'Présence de sang'
      };
      
      const shiftLabels = {
        'day': 'Jour (6h-14h)',
        'evening': 'Soir (14h-22h)',
        'night': 'Nuit (22h-6h)'
      };
      
      for (const entry of entries) {
        // Protected field access with fallbacks
        const patientName = patientMap.get(entry.patientId) || 'Usager inconnu';
        const entryType = entry.type || 'unknown';
        const entryValue = entry.value || '';
        const entryShift = entry.shift || '';
        
        const description = entryType === 'bowel' 
          ? bristolDescriptions[entryValue as keyof typeof bristolDescriptions] || entryValue
          : bladderDescriptions[entryValue as keyof typeof bladderDescriptions] || entryValue;
        
        const formatDate = (date: any) => {
          if (!date) return '';
          try {
            return new Date(date).toLocaleString('fr-CA');
          } catch {
            return '';
          }
        };
        
        const formatText = (text: any) => {
          if (text === null || text === undefined) return '';
          return String(text).replace(/"/g, '""');
        };
        
        const row = [
          entry.entryDate || '',
          `"${formatText(patientName)}"`,
          `"${formatText(shiftLabels[entryShift as keyof typeof shiftLabels] || entryShift)}"`,
          entryType === 'bowel' ? 'Selles' : entryType === 'bladder' ? 'Urines' : 'Inconnu',
          `"${formatText(entryValue)}"`,
          `"${formatText(description)}"`,
          formatDate(entry.createdAt)
        ];
        csvRows.push(row.join(','));
      }
      
      const csvContent = csvRows.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="bristol-tracking-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // Default JSON response with protected field access
    return NextResponse.json({
      success: true,
      entries: entries.map(e => ({
        entryDate: e.entryDate || '',
        patientName: patientMap.get(e.patientId) || 'Usager inconnu',
        shift: e.shift || '',
        type: e.type || '',
        value: e.value || '',
        createdAt: e.createdAt || new Date()
      }))
    });
    
  } catch (error) {
    console.error('Error exporting Bristol data:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'exportation' },
      { status: 500 }
    );
  }
}
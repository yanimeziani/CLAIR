import { NextResponse } from 'next/server';

// GET /api/maintenance - Check maintenance status
export async function GET() {
  try {
    const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    
    return NextResponse.json({
      success: true,
      maintenanceMode,
      status: maintenanceMode ? 'maintenance' : 'operational',
      message: maintenanceMode 
        ? 'Application en mode maintenance' 
        : 'Application opérationnelle',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la vérification du statut'
    }, { status: 500 });
  }
}

// POST /api/maintenance - Toggle maintenance mode (for internal use)
export async function POST(request: Request) {
  try {
    const { action, secret } = await request.json();
    
    // Simple secret check for internal API calls
    if (secret !== process.env.MAINTENANCE_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Non autorisé'
      }, { status: 401 });
    }
    
    let message = '';
    let status = '';
    
    switch (action) {
      case 'enable':
        // In a real implementation, you would update environment or database
        message = 'Mode maintenance activé';
        status = 'maintenance';
        break;
      case 'disable':
        message = 'Mode maintenance désactivé';
        status = 'operational';
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Action non valide'
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      action,
      status,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la modification du mode maintenance'
    }, { status: 500 });
  }
}
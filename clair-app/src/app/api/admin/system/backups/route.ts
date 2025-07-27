import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const sessionResponse = await fetch(new URL('/api/auth/session', request.url), {
      headers: request.headers
    });
    const sessionData = await sessionResponse.json();

    if (!sessionData.authenticated || sessionData.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 403 });
    }

    const backupDir = '/opt/clair/backups';
    
    try {
      const files = await readdir(backupDir);
      const backupFiles = files.filter(file => file.match(/^clair_backup_.*\.tar\.gz$/));
      
      const backups = await Promise.all(
        backupFiles.map(async (filename) => {
          const filePath = path.join(backupDir, filename);
          const stats = await stat(filePath);
          
          // Extract type and date from filename
          const typeMatch = filename.match(/clair_backup_([^_]+)_/);
          const type = typeMatch ? typeMatch[1] : 'unknown';
          
          return {
            filename,
            size: `${(stats.size / (1024 * 1024)).toFixed(1)} MB`,
            date: stats.mtime.toLocaleString('fr-CA'),
            type: type === 'auto' ? 'automatique' : 'manuelle'
          };
        })
      );

      // Sort by date (newest first)
      backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return NextResponse.json({
        success: true,
        backups
      });

    } catch (dirError) {
      // Backup directory doesn't exist or is empty
      return NextResponse.json({
        success: true,
        backups: []
      });
    }

  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des sauvegardes'
    }, { status: 500 });
  }
}
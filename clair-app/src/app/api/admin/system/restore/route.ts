import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { AuditLogger, getUserContextFromSession } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const type = formData.get('type') as string;
    
    let backupPath: string;
    let isTemporary = false;

    if (type === 'upload') {
      // Handle uploaded file
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({
          success: false,
          error: 'Aucun fichier fourni'
        }, { status: 400 });
      }

      // Save uploaded file temporarily
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      backupPath = path.join('/tmp', `restore_${Date.now()}_${file.name}`);
      await writeFile(backupPath, buffer);
      isTemporary = true;

    } else if (type === 'existing') {
      // Use existing backup file
      const backupFilename = formData.get('backup') as string;
      if (!backupFilename) {
        return NextResponse.json({
          success: false,
          error: 'Nom de sauvegarde requis'
        }, { status: 400 });
      }

      backupPath = path.join('/opt/clair/backups', backupFilename);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Type de restauration invalide'
      }, { status: 400 });
    }

    // Execute restore script
    const scriptPath = '/opt/clair/deploy.sh';
    const restoreProcess = spawn(scriptPath, ['restore', backupPath], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let error = '';

    restoreProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    restoreProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Wait for process to complete
    const exitCode = await new Promise((resolve) => {
      restoreProcess.on('close', resolve);
    });

    // Clean up temporary file if needed
    if (isTemporary) {
      try {
        await unlink(backupPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary file:', cleanupError);
      }
    }

    if (exitCode === 0) {
      // Log the restore action
      const userContext = getUserContextFromSession(sessionData);
      await AuditLogger.logAction(
        userContext,
        {
          action: 'restore',
          entity: 'system',
          description: `Restauration système depuis: ${path.basename(backupPath)}`,
          module: 'admin',
          severity: 'critical',
          metadata: {
            restoreType: type,
            backupFile: path.basename(backupPath),
            output: output.substring(0, 500)
          }
        },
        request
      );

      return NextResponse.json({
        success: true,
        message: 'Restauration terminée avec succès'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Erreur lors de la restauration: ${error}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'exécution de la restauration'
    }, { status: 500 });
  }
}
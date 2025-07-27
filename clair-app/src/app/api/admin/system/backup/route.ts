import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { AuditLogger, getUserContextFromSession } from '@/lib/audit-logger';

const execScript = promisify(spawn);

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

    const { type = 'manual' } = await request.json();

    // Execute backup script
    const scriptPath = '/opt/clair/deploy.sh';
    const backupProcess = spawn(scriptPath, ['backup'], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let error = '';

    backupProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    backupProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Wait for process to complete
    const exitCode = await new Promise((resolve) => {
      backupProcess.on('close', resolve);
    });

    if (exitCode === 0) {
      // Extract backup filename from output (assuming deploy.sh returns it)
      const filenameMatch = output.match(/clair_backup_[^\\s]+\\.tar\\.gz/);
      const filename = filenameMatch ? filenameMatch[0] : `backup_${new Date().toISOString().split('T')[0]}.tar.gz`;

      // Log the backup action
      const userContext = getUserContextFromSession(sessionData);
      await AuditLogger.logAction(
        userContext,
        {
          action: 'backup',
          entity: 'system',
          description: `Sauvegarde ${type} créée: ${filename}`,
          module: 'admin',
          severity: 'medium',
          metadata: {
            backupType: type,
            filename,
            output: output.substring(0, 500) // Limit output length
          }
        },
        request
      );

      return NextResponse.json({
        success: true,
        filename,
        message: 'Sauvegarde créée avec succès'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Erreur lors de la sauvegarde: ${error}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'exécution de la sauvegarde'
    }, { status: 500 });
  }
}
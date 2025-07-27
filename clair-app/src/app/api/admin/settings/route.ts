import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { AuditLogger, getUserContextFromSession } from '@/lib/audit-logger';

// In a production system, these would be stored in a dedicated Settings model
// For now, we'll use a simple in-memory storage with file persistence
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = '/opt/clair/config/system-settings.json';

const DEFAULT_SETTINGS = {
  systemName: 'CLAIR',
  organizationName: 'Résidence DI-TSA',
  adminEmail: 'admin@residence.ca',
  emergencyContact: '+1-418-xxx-xxxx',
  backupRetention: 90,
  backupFrequency: 'daily',
  maxBackupSize: 5,
  autoCleanupOldData: false,
  dataRetentionYears: 7,
  sessionTimeout: 480,
  maxFailedLogins: 5,
  auditLogRetention: 365,
  forcePasswordChange: false,
  maintenanceMode: false,
  maintenanceMessage: '',
  maxDiskUsage: 85,
  maxMemoryUsage: 80,
  aiServiceEnabled: true,
  aiModelName: 'gemma3:4b',
  maxConcurrentUsers: 50,
  healthCheckInterval: 300,
  alertEmail: '',
  diskSpaceAlerts: true,
  performanceAlerts: true
};

async function loadSettings() {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    // File doesn't exist or is invalid, return defaults
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: any) {
  try {
    // Ensure config directory exists
    const configDir = path.dirname(SETTINGS_FILE);
    await writeFile(configDir, '', { flag: 'a' }).catch(() => {}); // Create dir if needed
    
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

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

    const settings = await loadSettings();

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error loading settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des paramètres'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const newSettings = await request.json();
    
    // Validate critical settings
    if (newSettings.sessionTimeout < 30 || newSettings.sessionTimeout > 1440) {
      return NextResponse.json({
        success: false,
        error: 'Délai de session invalide (30-1440 minutes)'
      }, { status: 400 });
    }

    if (newSettings.dataRetentionYears < 3 || newSettings.dataRetentionYears > 20) {
      return NextResponse.json({
        success: false,
        error: 'Période de rétention invalide (3-20 années)'
      }, { status: 400 });
    }

    // Load current settings to compare
    const currentSettings = await loadSettings();
    
    // Merge with defaults to ensure all fields are present
    const settingsToSave = { ...DEFAULT_SETTINGS, ...newSettings };
    
    // Save settings
    const saved = await saveSettings(settingsToSave);
    
    if (!saved) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la sauvegarde des paramètres'
      }, { status: 500 });
    }

    // Log the settings change
    const userContext = getUserContextFromSession(sessionData);
    await AuditLogger.logAction(
      userContext,
      {
        action: 'update',
        entity: 'system_settings',
        description: 'Modification des paramètres système',
        module: 'admin',
        severity: 'high',
        previousData: currentSettings,
        newData: settingsToSave,
        metadata: {
          changedFields: Object.keys(newSettings).filter(
            key => JSON.stringify(currentSettings[key]) !== JSON.stringify(newSettings[key])
          )
        }
      },
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Paramètres sauvegardés avec succès'
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la sauvegarde des paramètres'
    }, { status: 500 });
  }
}
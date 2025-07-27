import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Patient from '@/lib/models/Patient';
import DailyReport from '@/lib/models/DailyReport';
import Communication from '@/lib/models/Communication';
import BristolEntry from '@/lib/models/BristolEntry';
import ObservationNote from '@/lib/models/ObservationNote';
import ReportTemplate from '@/lib/models/ReportTemplate';
import { AuditLogger, getUserContextFromSession } from '@/lib/audit-logger';

interface ImportStats {
  users: number;
  patients: number;
  reports: number;
  communications: number;
  bristolEntries: number;
  observations: number;
  templates: number;
  errors: string[];
}

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

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importType = formData.get('type') as string;
    const overwrite = formData.get('overwrite') === 'true';

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Aucun fichier fourni'
      }, { status: 400 });
    }

    const fileContent = await file.text();
    let importData: any;

    // Parse file based on type
    try {
      if (file.name.endsWith('.json')) {
        importData = JSON.parse(fileContent);
      } else if (file.name.endsWith('.csv')) {
        // For CSV, we'll focus on the most common case - patient data
        importData = parseCSV(fileContent, importType);
      } else {
        return NextResponse.json({
          success: false,
          error: 'Format de fichier non supporté. Utilisez JSON ou CSV.'
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'analyse du fichier'
      }, { status: 400 });
    }

    // Validate and import data
    const stats: ImportStats = {
      users: 0,
      patients: 0,
      reports: 0,
      communications: 0,
      bristolEntries: 0,
      observations: 0,
      templates: 0,
      errors: []
    };

    // Import based on data structure or type
    if (importType === 'full' || importData.users) {
      await importUsers(importData.users || [], overwrite, stats);
    }
    
    if (importType === 'full' || importType === 'patients' || importData.patients) {
      await importPatients(importData.patients || importData, overwrite, stats);
    }
    
    if (importType === 'full' || importData.reports) {
      await importReports(importData.reports || [], overwrite, stats);
    }
    
    if (importType === 'full' || importData.communications) {
      await importCommunications(importData.communications || [], overwrite, stats);
    }
    
    if (importType === 'full' || importData.bristolEntries) {
      await importBristolEntries(importData.bristolEntries || [], overwrite, stats);
    }
    
    if (importType === 'full' || importData.observations) {
      await importObservations(importData.observations || [], overwrite, stats);
    }
    
    if (importType === 'full' || importData.templates) {
      await importTemplates(importData.templates || [], overwrite, stats);
    }

    // Log the import action
    const userContext = getUserContextFromSession(sessionData);
    await AuditLogger.logAction(
      userContext,
      {
        action: 'import',
        entity: 'data',
        description: `Importation de données - Type: ${importType}, Fichier: ${file.name}`,
        module: 'admin',
        severity: 'high',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          importType,
          overwrite,
          stats
        }
      },
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Importation terminée',
      stats
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'importation'
    }, { status: 500 });
  }
}

// Parse CSV content based on type
function parseCSV(content: string, type: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj);
  }

  return data;
}

// Import functions for each data type
async function importUsers(users: any[], overwrite: boolean, stats: ImportStats) {
  for (const userData of users) {
    try {
      if (!userData.pin || !userData.name) {
        stats.errors.push(`Utilisateur invalide: PIN ou nom manquant`);
        continue;
      }

      const existingUser = await User.findOne({ pin: userData.pin });
      
      if (existingUser && !overwrite) {
        stats.errors.push(`Utilisateur ${userData.name} existe déjà (PIN: ${userData.pin})`);
        continue;
      }

      if (existingUser && overwrite) {
        await User.findByIdAndUpdate(existingUser._id, userData);
      } else {
        const user = new User(userData);
        await user.save();
      }
      
      stats.users++;
    } catch (error) {
      stats.errors.push(`Erreur utilisateur ${userData.name}: ${error}`);
    }
  }
}

async function importPatients(patients: any[], overwrite: boolean, stats: ImportStats) {
  for (const patientData of patients) {
    try {
      if (!patientData.firstName || !patientData.lastName) {
        stats.errors.push(`Patient invalide: nom ou prénom manquant`);
        continue;
      }

      const existingPatient = await Patient.findOne({
        firstName: patientData.firstName,
        lastName: patientData.lastName
      });
      
      if (existingPatient && !overwrite) {
        stats.errors.push(`Patient ${patientData.firstName} ${patientData.lastName} existe déjà`);
        continue;
      }

      // Convert date strings to Date objects
      if (patientData.dateOfBirth) {
        patientData.dateOfBirth = new Date(patientData.dateOfBirth);
      }

      if (existingPatient && overwrite) {
        await Patient.findByIdAndUpdate(existingPatient._id, patientData);
      } else {
        const patient = new Patient(patientData);
        await patient.save();
      }
      
      stats.patients++;
    } catch (error) {
      stats.errors.push(`Erreur patient ${patientData.firstName} ${patientData.lastName}: ${error}`);
    }
  }
}

async function importReports(reports: any[], overwrite: boolean, stats: ImportStats) {
  for (const reportData of reports) {
    try {
      if (!reportData.shift || !reportData.reportDate) {
        stats.errors.push(`Rapport invalide: quart ou date manquant`);
        continue;
      }

      // Convert date string to Date object
      reportData.reportDate = new Date(reportData.reportDate);

      const existingReport = await DailyReport.findOne({
        shift: reportData.shift,
        reportDate: reportData.reportDate
      });
      
      if (existingReport && !overwrite) {
        stats.errors.push(`Rapport ${reportData.shift} du ${reportData.reportDate} existe déjà`);
        continue;
      }

      if (existingReport && overwrite) {
        await DailyReport.findByIdAndUpdate(existingReport._id, reportData);
      } else {
        const report = new DailyReport(reportData);
        await report.save();
      }
      
      stats.reports++;
    } catch (error) {
      stats.errors.push(`Erreur rapport: ${error}`);
    }
  }
}

async function importCommunications(communications: any[], overwrite: boolean, stats: ImportStats) {
  for (const commData of communications) {
    try {
      if (!commData.subject || !commData.message) {
        stats.errors.push(`Communication invalide: sujet ou message manquant`);
        continue;
      }

      // Convert date strings to Date objects
      if (commData.createdAt) {
        commData.createdAt = new Date(commData.createdAt);
      }
      if (commData.updatedAt) {
        commData.updatedAt = new Date(commData.updatedAt);
      }

      const communication = new Communication(commData);
      await communication.save();
      
      stats.communications++;
    } catch (error) {
      stats.errors.push(`Erreur communication: ${error}`);
    }
  }
}

async function importBristolEntries(entries: any[], overwrite: boolean, stats: ImportStats) {
  for (const entryData of entries) {
    try {
      if (!entryData.patientId || !entryData.bristolType) {
        stats.errors.push(`Entrée Bristol invalide: patient ou type manquant`);
        continue;
      }

      // Convert date string to Date object
      if (entryData.date) {
        entryData.date = new Date(entryData.date);
      }

      const entry = new BristolEntry(entryData);
      await entry.save();
      
      stats.bristolEntries++;
    } catch (error) {
      stats.errors.push(`Erreur entrée Bristol: ${error}`);
    }
  }
}

async function importObservations(observations: any[], overwrite: boolean, stats: ImportStats) {
  for (const obsData of observations) {
    try {
      if (!obsData.patientId || !obsData.content) {
        stats.errors.push(`Observation invalide: patient ou contenu manquant`);
        continue;
      }

      // Convert date strings to Date objects
      if (obsData.timestamp) {
        obsData.timestamp = new Date(obsData.timestamp);
      }

      const observation = new ObservationNote(obsData);
      await observation.save();
      
      stats.observations++;
    } catch (error) {
      stats.errors.push(`Erreur observation: ${error}`);
    }
  }
}

async function importTemplates(templates: any[], overwrite: boolean, stats: ImportStats) {
  for (const templateData of templates) {
    try {
      if (!templateData.templateName || !templateData.fields) {
        stats.errors.push(`Template invalide: nom ou champs manquants`);
        continue;
      }

      const existingTemplate = await ReportTemplate.findOne({
        templateName: templateData.templateName
      });
      
      if (existingTemplate && !overwrite) {
        stats.errors.push(`Template ${templateData.templateName} existe déjà`);
        continue;
      }

      if (existingTemplate && overwrite) {
        await ReportTemplate.findByIdAndUpdate(existingTemplate._id, templateData);
      } else {
        const template = new ReportTemplate(templateData);
        await template.save();
      }
      
      stats.templates++;
    } catch (error) {
      stats.errors.push(`Erreur template: ${error}`);
    }
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Patient from '@/lib/models/Patient';
import DailyReport from '@/lib/models/DailyReport';
import Communication from '@/lib/models/Communication';
import AuditLog from '@/lib/models/AuditLog';

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

    await connectDB();

    // Get system statistics
    const [
      userCount,
      patientCount,
      reportCount,
      communicationCount,
      auditLogCount
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Patient.countDocuments({ isActive: true }),
      DailyReport.countDocuments(),
      Communication.countDocuments(),
      AuditLog.countDocuments()
    ]);

    // Mock system metrics (in production, these would come from actual system monitoring)
    const stats = {
      uptime: process.uptime() > 86400 
        ? `${Math.floor(process.uptime() / 86400)}j ${Math.floor((process.uptime() % 86400) / 3600)}h`
        : `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
      memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      diskUsage: 45, // This would come from actual disk monitoring
      cpuUsage: Math.floor(Math.random() * 30) + 10, // Mock CPU usage
      dbConnections: 5, // This would come from MongoDB metrics
      dbSize: '2.4GB', // This would come from MongoDB stats
      lastBackup: 'Il y a 6 heures',
      totalBackups: 15,
      servicesTotals: {
        users: userCount,
        patients: patientCount,
        reports: reportCount,
        communications: communicationCount,
        auditLogs: auditLogCount
      }
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    }, { status: 500 });
  }
}
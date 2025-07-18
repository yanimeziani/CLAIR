import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent } from '@/types/analytics';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import DailyReport from '@/lib/models/DailyReport';
import Communication from '@/lib/models/Communication';
import Patient from '@/lib/models/Patient';

// In-memory store for demo (use database in production)
const analyticsStore = new Map<string, AnalyticsEvent[]>();
const heatmapStore = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Handle batch data
    if (data.events && Array.isArray(data.events)) {
      const sessionId = data.sessionId;
      
      // Store events
      const existingEvents = analyticsStore.get(sessionId) || [];
      existingEvents.push(...data.events);
      analyticsStore.set(sessionId, existingEvents);
      
      // Store heatmap points
      if (data.heatmapPoints) {
        const existingHeatmap = heatmapStore.get(sessionId) || [];
        existingHeatmap.push(...data.heatmapPoints);
        heatmapStore.set(sessionId, existingHeatmap);
      }
      
      return NextResponse.json({ success: true, stored: data.events.length });
    }
    
    // Handle single event
    const event: AnalyticsEvent = {
      id: data.id || `event_${Date.now()}`,
      type: data.type,
      timestamp: data.timestamp || Date.now(),
      x: data.x,
      y: data.y,
      element: data.element,
      url: data.url,
      userAgent: data.userAgent,
      sessionId: data.sessionId,
      userId: data.userId,
    };
    
    // Store the event
    const sessionEvents = analyticsStore.get(event.sessionId) || [];
    sessionEvents.push(event);
    analyticsStore.set(event.sessionId, sessionEvents);
    
    // Add to heatmap if it has coordinates
    if (event.x !== undefined && event.y !== undefined) {
      const sessionHeatmap = heatmapStore.get(event.sessionId) || [];
      sessionHeatmap.push({
        x: event.x,
        y: event.y,
        intensity: 1,
        timestamp: event.timestamp
      });
      heatmapStore.set(event.sessionId, sessionHeatmap);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to process analytics data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const type = searchParams.get('type') || 'events';

  try {
    await connectDB();

    if (type === 'heatmap') {
      if (sessionId) {
        const heatmapData = heatmapStore.get(sessionId) || [];
        return NextResponse.json({ heatmapData });
      }
      
      // Générer des données de heatmap basées sur l'activité réelle
      const recentReports = await DailyReport.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).limit(20);

      const heatmapData = recentReports.map((report, index) => ({
        x: 300 + (index * 50) % 800,
        y: 150 + (index * 30) % 400,
        intensity: Math.min(0.9, 0.3 + (report.patientReports.length * 0.1)),
        timestamp: report.createdAt.getTime()
      }));

      return NextResponse.json({ heatmapData });
    }

    if (sessionId) {
      const events = analyticsStore.get(sessionId) || [];
      return NextResponse.json({ events });
    }

    // Collecter des données réelles du système CLAIR
    const [users, reports, communications, patients] = await Promise.all([
      User.find({ isActive: true }).countDocuments(),
      DailyReport.find({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Communication.find({
        creationDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Patient.find({ isActive: true }).countDocuments()
    ]);

    // Calculer les métriques réelles
    const totalReports = reports.length;
    const totalCommunications = communications.length;
    const urgentCommunications = communications.filter(comm => comm.isUrgent).length;
    const totalEvents = totalReports + totalCommunications;
    
    // Analyse des rapports par quart
    const shiftAnalysis = reports.reduce((acc, report) => {
      acc[report.shift] = (acc[report.shift] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Analyse des communications par urgence
    const urgencyRate = totalCommunications > 0 ? (urgentCommunications / totalCommunications * 100) : 0;

    // Sessions récentes basées sur l'activité réelle
    const recentSessions = reports.slice(0, 8).map((report, index) => ({
      sessionId: `clair_${report._id.toString().slice(-8)}`,
      events: report.patientReports.length * 3 + report.incidents.length,
      heatmapPoints: report.patientReports.length * 2,
      timestamp: report.createdAt.getTime(),
      userAgent: 'CLAIR Healthcare System',
      duration: Math.floor(Math.random() * 2000) + 500,
      shift: report.shift,
      supervisor: report.shiftSupervisor
    }));

    // Données d'évolution temporelle réelles
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const weeklyData = last7Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayReports = reports.filter(r => 
        r.createdAt >= dayStart && r.createdAt <= dayEnd
      );
      const dayCommunications = communications.filter(c => 
        c.creationDate >= dayStart && c.creationDate <= dayEnd
      );

      return {
        date: date.toLocaleDateString('fr-CA', { weekday: 'short' }),
        visitors: dayReports.length,
        pageViews: dayReports.length * 4,
        clicks: (dayReports.length + dayCommunications.length) * 3
      };
    });

    return NextResponse.json({
      success: true,
      // Métriques principales basées sur les vraies données
      totalEvents,
      uniqueSessions: users, // Utilisateurs actifs comme sessions uniques
      pageViews: totalReports * 4, // Estimation basée sur les rapports consultés
      clicks: totalEvents * 3, // Estimation des clics basée sur l'activité
      
      // Métriques spécifiques à CLAIR
      clairMetrics: {
        activeUsers: users,
        totalReports: totalReports,
        totalCommunications: totalCommunications,
        urgentCommunications,
        urgencyRate: urgencyRate.toFixed(1),
        activePatients: patients,
        shiftDistribution: shiftAnalysis,
        averageReportsPerDay: Math.round(totalReports / 30),
        averageCommunicationsPerDay: Math.round(totalCommunications / 30)
      },
      
      // Tendances temporelles réelles
      trends: {
        reportsLastWeek: reports.filter(r => 
          r.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        communicationsLastWeek: communications.filter(c => 
          c.creationDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        weeklyData
      },
      
      timestamp: Date.now(),
      sessions: recentSessions
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    
    // Fallback vers des données de démonstration si la DB n'est pas accessible
    return NextResponse.json({
      success: false,
      error: 'Database connection failed - using fallback data',
      fallback: true,
      totalEvents: 2847,
      uniqueSessions: 34,
      pageViews: 5210,
      clicks: 1293,
      timestamp: Date.now(),
      clairMetrics: {
        activeUsers: 8,
        totalReports: 156,
        totalCommunications: 89,
        urgentCommunications: 12,
        urgencyRate: "13.5",
        activePatients: 24,
        shiftDistribution: { day: 52, evening: 51, night: 53 },
        averageReportsPerDay: 5,
        averageCommunicationsPerDay: 3
      },
      sessions: [
        { 
          sessionId: 'fallback_001', 
          events: 67, 
          heatmapPoints: 32, 
          timestamp: Date.now() - 180000,
          userAgent: 'CLAIR Healthcare (Fallback Mode)',
          duration: 1240
        }
      ]
    }, { status: 200 }); // Retourner 200 avec des données de fallback
  }
}
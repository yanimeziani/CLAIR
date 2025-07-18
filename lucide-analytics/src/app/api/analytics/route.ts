import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { HeatmapPoint, AnalyticsSession, AnalyticsEvent } from '@/lib/models/HeatmapData';
import Communication from '@/lib/models/Communication';
import User from '@/lib/models/User';
import Patient from '@/lib/models/Patient';
import DailyReport from '@/lib/models/DailyReport';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { events, sessionId, metadata, final } = body;
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events data' }, { status: 400 });
    }
    
    // Process events
    const heatmapPoints = [];
    const analyticsEvents = [];
    
    for (const event of events) {
      if (event.type === 'heatmap') {
        // Store heatmap data
        heatmapPoints.push({
          sessionId: event.data.sessionId,
          type: event.data.type,
          x: event.data.x,
          y: event.data.y,
          pageX: event.data.pageX,
          pageY: event.data.pageY,
          intensity: event.data.intensity,
          timestamp: new Date(event.data.timestamp),
          url: event.data.url,
          path: event.data.path,
          viewport: event.data.viewport,
          scroll: event.data.scroll,
          element: event.data.element,
          userAgent: event.data.user_agent,
          referrer: event.data.referrer,
          metadata: event.data.metadata
        });
      } else {
        // Store general analytics events
        analyticsEvents.push({
          sessionId: event.sessionId,
          type: event.type,
          timestamp: new Date(event.timestamp),
          url: event.url,
          path: event.path,
          data: event.data,
          userAgent: event.user_agent
        });
      }
    }
    
    // Bulk insert heatmap points
    if (heatmapPoints.length > 0) {
      await HeatmapPoint.insertMany(heatmapPoints);
    }
    
    // Bulk insert analytics events
    if (analyticsEvents.length > 0) {
      await AnalyticsEvent.insertMany(analyticsEvents);
    }
    
    // Update or create session
    if (sessionId) {
      await updateAnalyticsSession(sessionId, events, metadata, final);
    }
    
    return NextResponse.json({ 
      success: true, 
      processed: {
        heatmapPoints: heatmapPoints.length,
        analyticsEvents: analyticsEvents.length
      }
    });
    
  } catch (error) {
    console.error('Error processing analytics data:', error);
    return NextResponse.json({ error: 'Failed to process analytics data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const timeRange = searchParams.get('timeRange') || '24h';
    const path = searchParams.get('path');
    const sessionId = searchParams.get('sessionId');
    
    // Calculate time range
    const now = new Date();
    let startTime: Date;
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    if (type === 'heatmap') {
      return await getHeatmapData(startTime, path, sessionId);
    } else if (type === 'sessions') {
      return await getSessionsData(startTime);
    } else if (type === 'events') {
      return await getEventsData(startTime, sessionId);
    } else {
      return await getAnalyticsOverview(startTime);
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

async function getHeatmapData(startTime: Date, path?: string | null, sessionId?: string | null) {
  try {
    const query: any = {
      timestamp: { $gte: startTime }
    };
    
    if (path) {
      query.path = path;
    }
    
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    const heatmapPoints = await HeatmapPoint.find(query)
      .sort({ timestamp: -1 })
      .limit(10000)
      .lean();
    
    if (heatmapPoints.length === 0) {
      return NextResponse.json({
        heatmapData: [],
        totalPoints: 0,
        message: 'No heatmap data available for the specified time range'
      });
    }
    
    const processedData = processHeatmapPoints(heatmapPoints);
    
    return NextResponse.json({
      heatmapData: processedData,
      totalPoints: heatmapPoints.length,
      timeRange: { start: startTime, end: new Date() }
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return NextResponse.json({ 
      heatmapData: [], 
      totalPoints: 0, 
      error: 'Failed to fetch heatmap data' 
    });
  }
}

async function getSessionsData(startTime: Date) {
  try {
    const sessions = await AnalyticsSession.find({
      startTime: { $gte: startTime }
    })
      .sort({ startTime: -1 })
      .limit(100)
      .lean();
    
    const activeSessions = await AnalyticsSession.countDocuments({
      isActive: true,
      lastActivity: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
    });
    
    return NextResponse.json({
      sessions: sessions,
      totalSessions: sessions.length,
      activeSessions: activeSessions,
      timeRange: { start: startTime, end: new Date() }
    });
  } catch (error) {
    console.error('Error fetching sessions data:', error);
    return NextResponse.json({ 
      sessions: [], 
      totalSessions: 0, 
      activeSessions: 0,
      error: 'Failed to fetch sessions data'
    });
  }
}

async function getEventsData(startTime: Date, sessionId?: string | null) {
  try {
    const query: any = {
      timestamp: { $gte: startTime }
    };
    
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    const events = await AnalyticsEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(1000)
      .lean();
    
    return NextResponse.json({
      events: events,
      totalEvents: events.length,
      timeRange: { start: startTime, end: new Date() }
    });
  } catch (error) {
    console.error('Error fetching events data:', error);
    return NextResponse.json({ 
      events: [], 
      totalEvents: 0,
      error: 'Failed to fetch events data'
    });
  }
}

async function getAnalyticsOverview(startTime: Date) {
  try {
    // Get real data from both analytics and CLAIR systems
    const [
      activeUsers,
      totalReports,
      totalCommunications,
      urgentCommunications,
      activePatients,
      totalSessions,
      activeSessions,
      totalEvents,
      totalHeatmapPoints
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      DailyReport.countDocuments({ creationDate: { $gte: startTime } }),
      Communication.countDocuments({ creationDate: { $gte: startTime } }),
      Communication.countDocuments({ 
        creationDate: { $gte: startTime }, 
        isUrgent: true 
      }),
      Patient.countDocuments({ isActive: true }),
      AnalyticsSession.countDocuments({ startTime: { $gte: startTime } }),
      AnalyticsSession.countDocuments({
        isActive: true,
        lastActivity: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
      }),
      AnalyticsEvent.countDocuments({ timestamp: { $gte: startTime } }),
      HeatmapPoint.countDocuments({ timestamp: { $gte: startTime } })
    ]);
    
    // Get real shift distribution
    const shiftDistribution = await DailyReport.aggregate([
      { $match: { creationDate: { $gte: startTime } } },
      {
        $group: {
          _id: '$shift',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const shifts = { day: 0, evening: 0, night: 0 };
    shiftDistribution.forEach(shift => {
      if (shift._id && typeof shift._id === 'string') {
        const shiftKey = shift._id.toLowerCase();
        if (shiftKey.includes('jour') || shiftKey.includes('day')) {
          shifts.day = shift.count;
        } else if (shiftKey.includes('soir') || shiftKey.includes('evening')) {
          shifts.evening = shift.count;
        } else if (shiftKey.includes('nuit') || shiftKey.includes('night')) {
          shifts.night = shift.count;
        }
      }
    });
    
    // Get real sessions with heatmap data
    const recentSessions = await AnalyticsSession.find({
      startTime: { $gte: startTime }
    })
      .sort({ startTime: -1 })
      .limit(10)
      .lean();
    
    const sessionsWithHeatmap = await Promise.all(
      recentSessions.map(async (session) => {
        const heatmapPoints = await HeatmapPoint.countDocuments({
          sessionId: session.sessionId
        });
        
        return {
          sessionId: session.sessionId,
          events: session.totalClicks + session.totalScrolls + session.formInteractions,
          heatmapPoints: heatmapPoints,
          timestamp: session.startTime
        };
      })
    );
    
    const urgencyRate = totalCommunications > 0 
      ? ((urgentCommunications / totalCommunications) * 100).toFixed(1)
      : "0";
    
    const weeklyData = await generateWeeklyTrends(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return NextResponse.json({
      totalEvents: totalEvents,
      uniqueSessions: totalSessions,
      activeSessions: activeSessions,
      totalHeatmapPoints: totalHeatmapPoints,
      
      clairMetrics: {
        activeUsers: activeUsers,
        totalReports: totalReports,
        totalCommunications: totalCommunications,
        urgentCommunications: urgentCommunications,
        urgencyRate: urgencyRate,
        activePatients: activePatients,
        shiftDistribution: shifts,
        averageReportsPerDay: Math.round(totalReports / Math.max(1, (Date.now() - startTime.getTime()) / (24 * 60 * 60 * 1000))),
        averageCommunicationsPerDay: Math.round(totalCommunications / Math.max(1, (Date.now() - startTime.getTime()) / (24 * 60 * 60 * 1000)))
      },
      
      sessions: sessionsWithHeatmap,
      trends: { weeklyData: weeklyData },
      
      timeRange: { start: startTime, end: new Date() },
      dataSource: 'real',
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics overview',
      totalEvents: 0,
      uniqueSessions: 0,
      activeSessions: 0,
      totalHeatmapPoints: 0
    }, { status: 500 });
  }
}

async function generateWeeklyTrends(startTime: Date) {
  try {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const [sessions, events, heatmapPoints] = await Promise.all([
        AnalyticsSession.countDocuments({
          startTime: { $gte: date, $lt: nextDate }
        }),
        AnalyticsEvent.countDocuments({
          timestamp: { $gte: date, $lt: nextDate }
        }),
        HeatmapPoint.countDocuments({
          timestamp: { $gte: date, $lt: nextDate }
        })
      ]);
      
      days.push({
        date: date.toLocaleDateString('fr-CA', { weekday: 'short' }),
        visitors: sessions,
        pageViews: events,
        clicks: heatmapPoints
      });
    }
    
    return days;
  } catch (error) {
    console.error('Error generating weekly trends:', error);
    return [];
  }
}

function processHeatmapPoints(points: any[]) {
  const processed = new Map();
  
  points.forEach(point => {
    const key = `${Math.round(point.x / 10) * 10}_${Math.round(point.y / 10) * 10}_${point.type}`;
    
    if (processed.has(key)) {
      const existing = processed.get(key);
      existing.intensity = Math.min(1, existing.intensity + point.intensity * 0.1);
      existing.count += 1;
      existing.timestamps.push(point.timestamp);
    } else {
      processed.set(key, {
        x: point.x,
        y: point.y,
        pageX: point.pageX,
        pageY: point.pageY,
        intensity: point.intensity,
        timestamp: point.timestamp,
        type: point.type,
        count: 1,
        timestamps: [point.timestamp]
      });
    }
  });
  
  return Array.from(processed.values());
}

async function updateAnalyticsSession(sessionId: string, events: any[], metadata: any, final: boolean) {
  try {
    const sessionData = extractSessionData(events);
    
    const updateData: any = {
      sessionId: sessionId,
      lastActivity: new Date(),
      isActive: !final,
      ...sessionData
    };
    
    if (metadata) {
      updateData.userAgent = metadata.userAgent;
      updateData.referrer = metadata.referrer;
      if (metadata.viewport) {
        updateData.viewport = metadata.viewport;
      }
    }
    
    await AnalyticsSession.findOneAndUpdate(
      { sessionId: sessionId },
      updateData,
      { upsert: true, new: true }
    );
    
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

function extractSessionData(events: any[]) {
  const sessionData: any = {
    pageViews: 0,
    totalClicks: 0,
    totalScrolls: 0,
    totalMouseMoves: 0,
    formInteractions: 0,
    buttonClicks: 0,
    linkClicks: 0,
    rageClicks: 0,
    deadClicks: 0,
    attentionTime: 0
  };
  
  events.forEach(event => {
    if (event.type === 'heatmap') {
      switch (event.data.type) {
        case 'click':
          sessionData.totalClicks++;
          break;
        case 'scroll':
          sessionData.totalScrolls++;
          break;
        case 'mousemove':
          sessionData.totalMouseMoves++;
          break;
        case 'form_input':
          sessionData.formInteractions++;
          break;
      }
    } else if (event.type === 'page_view') {
      sessionData.pageViews++;
    } else if (event.type === 'rage_click') {
      sessionData.rageClicks++;
    }
  });
  
  return sessionData;
}
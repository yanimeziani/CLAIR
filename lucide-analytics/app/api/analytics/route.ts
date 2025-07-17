import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent } from '@/types/analytics';

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
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const type = searchParams.get('type') || 'events';
    
    if (type === 'heatmap') {
      if (sessionId) {
        const heatmapData = heatmapStore.get(sessionId) || [];
        return NextResponse.json({ heatmapData });
      }
      
      // Return all heatmap data
      const allHeatmapData = Array.from(heatmapStore.values()).flat();
      return NextResponse.json({ heatmapData: allHeatmapData });
    }
    
    if (sessionId) {
      const events = analyticsStore.get(sessionId) || [];
      return NextResponse.json({ events });
    }
    
    // Return aggregated analytics
    const allEvents = Array.from(analyticsStore.values()).flat();
    const analytics = {
      totalEvents: allEvents.length,
      uniqueSessions: analyticsStore.size,
      pageViews: allEvents.filter(e => e.type === 'pageview').length,
      clicks: allEvents.filter(e => e.type === 'click').length,
      sessions: Array.from(analyticsStore.keys()).map(sessionId => ({
        sessionId,
        events: analyticsStore.get(sessionId)?.length || 0,
        heatmapPoints: heatmapStore.get(sessionId)?.length || 0
      }))
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics data' }, { status: 500 });
  }
}
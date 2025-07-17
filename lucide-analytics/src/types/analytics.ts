export interface AnalyticsEvent {
  id: string;
  type: 'click' | 'scroll' | 'hover' | 'pageview' | 'session';
  timestamp: number;
  x?: number;
  y?: number;
  element?: string;
  url: string;
  userAgent: string;
  ip?: string;
  sessionId: string;
  userId?: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  timestamp: number;
}

export interface LiveVisitor {
  id: string;
  sessionId: string;
  currentPage: string;
  lastActive: number;
  x: number;
  y: number;
  userAgent: string;
  location?: {
    country: string;
    city: string;
  };
}

export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number }>;
  trafficSources: Array<{ source: string; visitors: number }>;
}
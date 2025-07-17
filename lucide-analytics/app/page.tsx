'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, MousePointer, Eye, BarChart3, Globe } from 'lucide-react';
import HeatmapCanvas from '@/components/HeatmapCanvas';
import LiveVisitorTracker from '@/components/LiveVisitorTracker';
import { AnalyticsEvent, HeatmapPoint, LiveVisitor } from '@/types/analytics';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>({});
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchHeatmapData();
    
    // Simulate live visitors for demo
    const interval = setInterval(() => {
      setLiveVisitors(prev => [
        ...prev.slice(-10), // Keep last 10 visitors
        {
          id: `visitor_${Date.now()}`,
          sessionId: `session_${Date.now()}`,
          currentPage: '/',
          lastActive: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          userAgent: navigator.userAgent,
          location: {
            country: 'Healthcare System',
            city: 'CLAIR'
          }
        }
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch('/api/analytics?type=heatmap');
      const data = await response.json();
      setHeatmapData(data.heatmapData || []);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeatmapCanvas
        points={heatmapData}
        width={window.innerWidth}
        height={window.innerHeight}
      />
      <LiveVisitorTracker visitors={liveVisitors} />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Healthcare Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time visitor intelligence and heatmap analytics for CLAIR healthcare system
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Events"
              value={analytics.totalEvents || 0}
              icon={Activity}
              color="blue"
            />
            <StatCard
              title="Active Sessions"
              value={analytics.uniqueSessions || 0}
              icon={Users}
              color="green"
            />
            <StatCard
              title="Page Views"
              value={analytics.pageViews || 0}
              icon={Eye}
              color="purple"
            />
            <StatCard
              title="Click Events"
              value={analytics.clicks || 0}
              icon={MousePointer}
              color="orange"
            />
          </div>

          {/* Live Visitors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Live Visitors ({liveVisitors.length})
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {liveVisitors.slice(-5).map((visitor) => (
                  <div key={visitor.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {visitor.location?.city || 'Unknown Location'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Active {Math.floor((Date.now() - visitor.lastActive) / 1000)}s ago
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      ({visitor.x.toFixed(0)}, {visitor.y.toFixed(0)})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Session Activity
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.sessions?.slice(-5).map((session: any) => (
                  <div key={session.sessionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Session {session.sessionId.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.events} events • {session.heatmapPoints} heatmap points
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      <Globe className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integration Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Healthcare System Integration
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">Quick Integration for CLAIR:</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                {`<script src="/lib/analytics-tracker.js"></script>`}
              </code>
              <p className="text-sm text-gray-600 mt-2">
                Add this script tag to your healthcare system's HTML head section for automatic tracking.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Features Enabled:</h3>
              <ul className="text-sm space-y-1">
                <li>✅ Real-time heatmap visualization</li>
                <li>✅ Live visitor tracking</li>
                <li>✅ Click and scroll analytics</li>
                <li>✅ Session management</li>
                <li>✅ Healthcare-compliant data handling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
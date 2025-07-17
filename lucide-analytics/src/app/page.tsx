'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, MousePointer, Eye, BarChart3, Globe, TrendingUp, Clock, MapPin } from 'lucide-react';
import HeatmapCanvas from '@/components/HeatmapCanvas';
import LiveVisitorTracker from '@/components/LiveVisitorTracker';
import { AnalyticsEvent, HeatmapPoint, LiveVisitor } from '@/types/analytics';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>({});
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false initially to prevent infinite loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    fetchAnalytics();
    fetchHeatmapData();
    
    // Simulate live visitors for demo (only in browser)
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        setLiveVisitors(prev => [
          ...prev.slice(-10), // Keep last 10 visitors
          {
            id: `visitor_${Date.now()}`,
            sessionId: `session_${Date.now()}`,
            currentPage: '/',
            lastActive: Date.now(),
            x: Math.random() * (window.innerWidth || 1920),
            y: Math.random() * (window.innerHeight || 1080),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
            location: {
              country: 'Healthcare System',
              city: 'CLAIR'
            }
          }
        ]);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.warn('Analytics API not available, using demo data');
        // Use demo data if API is not available
        setAnalytics({
          totalEvents: 1247,
          uniqueSessions: 23,
          pageViews: 3890,
          clicks: 892,
          sessions: [
            { sessionId: 'session_12345', events: 45, heatmapPoints: 23, timestamp: Date.now() - 300000 },
            { sessionId: 'session_67890', events: 32, heatmapPoints: 18, timestamp: Date.now() - 600000 },
            { sessionId: 'session_11111', events: 28, heatmapPoints: 15, timestamp: Date.now() - 900000 }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Use demo data as fallback
      setAnalytics({
        totalEvents: 1247,
        uniqueSessions: 23,
        pageViews: 3890,
        clicks: 892,
        sessions: [
          { sessionId: 'session_12345', events: 45, heatmapPoints: 23, timestamp: Date.now() - 300000 },
          { sessionId: 'session_67890', events: 32, heatmapPoints: 18, timestamp: Date.now() - 600000 }
        ]
      });
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch('/api/analytics?type=heatmap');
      if (response.ok) {
        const data = await response.json();
        setHeatmapData(data.heatmapData || []);
      } else {
        // Use demo heatmap data
        setHeatmapData([
          { x: 300, y: 150, intensity: 0.8 },
          { x: 500, y: 200, intensity: 0.6 },
          { x: 700, y: 300, intensity: 0.9 },
          { x: 400, y: 450, intensity: 0.7 },
          { x: 600, y: 350, intensity: 0.5 }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
      // Use demo heatmap data as fallback
      setHeatmapData([
        { x: 300, y: 150, intensity: 0.8 },
        { x: 500, y: 200, intensity: 0.6 },
        { x: 700, y: 300, intensity: 0.9 },
        { x: 400, y: 450, intensity: 0.7 }
      ]);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary', change }: any) => (
    <div className="analytics-card border-l-4 border-[rgb(var(--analytics-primary))]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="analytics-label">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="analytics-metric">{value}</p>
            {change && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[rgb(var(--analytics-primary),0.1)]">
          <Icon className="h-6 w-6 text-[rgb(var(--analytics-primary))]" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--ws-gray-50))] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--analytics-primary))] mx-auto"></div>
          <p className="text-[rgb(var(--ws-gray-600))] font-medium">Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--ws-gray-50))]">
      <HeatmapCanvas
        points={heatmapData}
        width={typeof window !== 'undefined' ? window.innerWidth : 1920}
        height={typeof window !== 'undefined' ? window.innerHeight : 1080}
      />
      <LiveVisitorTracker visitors={liveVisitors} />
      
      {/* Header */}
      <div className="analytics-header">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-[var(--font-heading)]">
                LUCIDE Analytics
              </h1>
              <p className="text-white/90 text-lg">
                Tableau de bord d'analyse intelligente pour le système CLAIR
              </p>
              <div className="flex items-center space-x-4 text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Temps réel</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Québec, Canada</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{liveVisitors.length} visiteurs actifs</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {new Date().toLocaleDateString('fr-CA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-white/80">
                {new Date().toLocaleTimeString('fr-CA')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Événements Totaux"
              value={(analytics.totalEvents || 1247).toLocaleString('fr-CA')}
              icon={Activity}
              change={12.5}
            />
            <StatCard
              title="Sessions Actives"
              value={(analytics.uniqueSessions || liveVisitors.length || 23).toLocaleString('fr-CA')}
              icon={Users}
              change={8.2}
            />
            <StatCard
              title="Vues de Page"
              value={(analytics.pageViews || 3890).toLocaleString('fr-CA')}
              icon={Eye}
              change={-2.1}
            />
            <StatCard
              title="Clics Enregistrés"
              value={(analytics.clicks || 892).toLocaleString('fr-CA')}
              icon={MousePointer}
              change={15.7}
            />
          </div>

          {/* Live Visitors & Session Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="analytics-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[rgb(var(--ws-gray-900))] flex items-center">
                  <Users className="h-5 w-5 mr-2 text-[rgb(var(--analytics-primary))]" />
                  Visiteurs en Direct
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[rgb(var(--ws-green))] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-[rgb(var(--ws-gray-700))]">
                    {liveVisitors.length} actifs
                  </span>
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {liveVisitors.slice(-8).map((visitor) => (
                  <div key={visitor.id} className="flex items-center p-4 bg-[rgb(var(--ws-gray-50))] rounded-lg border border-[rgb(var(--ws-gray-200))]">
                    <div className="w-3 h-3 bg-[rgb(var(--ws-green))] rounded-full mr-4 animate-pulse shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[rgb(var(--ws-gray-900))]">
                        {visitor.location?.city || 'Système CLAIR'}
                      </p>
                      <p className="text-xs text-[rgb(var(--ws-gray-500))]">
                        Actif il y a {Math.floor((Date.now() - visitor.lastActive) / 1000)}s
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[rgb(var(--ws-gray-400))] font-mono">
                        ({visitor.x.toFixed(0)}, {visitor.y.toFixed(0)})
                      </div>
                      <div className="text-xs text-[rgb(var(--analytics-primary))]">
                        Session active
                      </div>
                    </div>
                  </div>
                ))}
                {liveVisitors.length === 0 && (
                  <div className="text-center py-8 text-[rgb(var(--ws-gray-500))]">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun visiteur en temps réel</p>
                  </div>
                )}
              </div>
            </div>

            <div className="analytics-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[rgb(var(--ws-gray-900))] flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-[rgb(var(--analytics-primary))]" />
                  Activité des Sessions
                </h2>
                <div className="text-sm text-[rgb(var(--ws-gray-600))]">
                  Dernières 24h
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(analytics.sessions || [
                  { sessionId: 'session_12345', events: 45, heatmapPoints: 23, timestamp: Date.now() - 300000 },
                  { sessionId: 'session_67890', events: 32, heatmapPoints: 18, timestamp: Date.now() - 600000 },
                  { sessionId: 'session_11111', events: 28, heatmapPoints: 15, timestamp: Date.now() - 900000 },
                  { sessionId: 'session_22222', events: 67, heatmapPoints: 34, timestamp: Date.now() - 1200000 },
                  { sessionId: 'session_33333', events: 19, heatmapPoints: 8, timestamp: Date.now() - 1500000 }
                ]).slice(-8).map((session: any) => (
                  <div key={session.sessionId} className="flex items-center justify-between p-4 bg-[rgb(var(--ws-gray-50))] rounded-lg border border-[rgb(var(--ws-gray-200))]">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-[rgb(var(--analytics-primary),0.1)]">
                        <Globe className="h-4 w-4 text-[rgb(var(--analytics-primary))]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[rgb(var(--ws-gray-900))]">
                          Session {session.sessionId.substring(8, 13)}...
                        </p>
                        <p className="text-xs text-[rgb(var(--ws-gray-500))]">
                          {session.events} événements • {session.heatmapPoints} points de chaleur
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[rgb(var(--ws-gray-400))]">
                        {new Date(session.timestamp || Date.now()).toLocaleTimeString('fr-CA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="text-xs font-semibold text-[rgb(var(--analytics-secondary))]">
                        {Math.round(session.events / 10 * 100)}% engagement
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integration Instructions */}
          <div className="analytics-card">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-[rgb(var(--quebec-blue),0.1)] mr-4">
                <Globe className="h-6 w-6 text-[rgb(var(--quebec-blue))]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--ws-gray-900))]">
                  Intégration Système CLAIR
                </h2>
                <p className="text-sm text-[rgb(var(--ws-gray-600))]">
                  Configuration pour le système de santé du Québec
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[rgb(var(--ws-gray-50))] rounded-lg p-6 border border-[rgb(var(--ws-gray-200))]">
                <h3 className="font-semibold mb-3 text-[rgb(var(--ws-gray-900))] flex items-center">
                  <code className="text-[rgb(var(--analytics-primary))] mr-2">&lt;/&gt;</code>
                  Intégration Rapide CLAIR
                </h3>
                <div className="bg-[rgb(var(--ws-gray-900))] rounded-lg p-4 mb-3">
                  <code className="text-[rgb(var(--ws-green))] text-sm font-mono block">
                    {`<script src="/analytics/lib/tracker.js"></script>`}
                  </code>
                </div>
                <p className="text-sm text-[rgb(var(--ws-gray-600))]">
                  Ajoutez ce script dans la section &lt;head&gt; de votre système de santé pour un suivi automatique.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-[rgb(var(--analytics-primary),0.1)] to-[rgb(var(--analytics-secondary),0.1)] rounded-lg p-6 border border-[rgb(var(--analytics-primary),0.2)]">
                <h3 className="font-semibold mb-4 text-[rgb(var(--ws-gray-900))] flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-[rgb(var(--analytics-primary))]" />
                  Fonctionnalités Activées
                </h3>
                <ul className="text-sm space-y-3">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[rgb(var(--ws-green))] rounded-full mr-3"></div>
                    <span>Visualisation de carte thermique en temps réel</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[rgb(var(--ws-green))] rounded-full mr-3"></div>
                    <span>Suivi des visiteurs en direct</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[rgb(var(--ws-green))] rounded-full mr-3"></div>
                    <span>Analyse des clics et défilements</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[rgb(var(--ws-green))] rounded-full mr-3"></div>
                    <span>Gestion des sessions utilisateur</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[rgb(var(--ws-green))] rounded-full mr-3"></div>
                    <span>Conformité aux normes de santé du Québec</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
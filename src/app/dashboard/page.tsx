'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Bell, Users, MessageSquare, FileText, Calendar, 
  Settings, LogOut, BarChart3, Plus, Search,
  Clock, User, Brain, Check, X, Eye, ExternalLink, Globe, Shield
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { QuickObservationForm } from '@/components/observations/quick-observation-form';
import { RecentObservationsView } from '@/components/observations/recent-observations-view';
import { toast } from 'sonner';

interface SessionUser {
  userId: string;
  role: string;
  name: string;
  isReplacement: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentCommunications, setRecentCommunications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkSession();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const communicationsRes = await fetch('/api/communications');

      if (communicationsRes.ok) {
        const communicationsData = await communicationsRes.json();
        const communications = communicationsData.communications || [];
        
        // Get recent communications for today
        const today = new Date().toISOString().split('T')[0];
        const todayCommunications = communications.filter((c: any) => 
          c.destinationDates?.some((date: string) => date.startsWith(today))
        ).slice(0, 3);
        setRecentCommunications(todayCommunications);

        // Get unread notifications (all unread communications)
        const unreadNotifications = communications.filter((c: any) => 
          !c.readBy?.some((r: any) => r.userId === user?.userId)
        ).slice(0, 5);
        setNotifications(unreadNotifications);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      
      setUser(data.user);
    } catch (error) {
      console.error('Session check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Déconnexion réussie');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/communications/${notificationId}/read`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        fetchDashboardData(); // Refresh data
        toast.success('Notification marquée comme lue');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erreur lors du marquage');
    }
  };

  const clearAllNotifications = async () => {
    try {
      const readPromises = notifications.map(notification =>
        fetch(`/api/communications/${notification._id}/read`, { method: 'POST' })
      );
      
      await Promise.all(readPromises);
      setNotifications([]);
      fetchDashboardData();
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ws-gradient-main">
      {/* Top Navigation - Mobile Optimized */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                <Image 
                  src="/logo.svg" 
                  alt="Logo CLAIR - Centre Logiciel d'Aide aux Interventions Résidentielles" 
                  width={32} 
                  height={32}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">CLAIR</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {user?.isReplacement ? `Remplacement: ${user.name.replace('Remplacement: ', '')}` : user?.name}
                  {user?.role && !user?.isReplacement && ` • ${user.role}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative p-2" aria-label={`Notifications - ${notifications.length} non lues`}>
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 sm:w-80 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {notifications.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                        <Check className="h-4 w-4 mr-1" />
                        Tout marquer lu
                      </Button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune nouvelle notification</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <DropdownMenuItem key={notification._id} className="p-0">
                        <div className="w-full p-3 hover:bg-muted/50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium text-sm">{notification.authorDisplayName}</span>
                              {notification.isUrgent && (
                                <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">URGENT</span>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(notification._id);
                              }}
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-foreground line-clamp-2 mb-1">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.creationDate).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit', 
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                  
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/communications')}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Voir toutes les communications
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2 sm:px-3 sm:py-2">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Bonjour {user?.isReplacement ? user.name.replace('Remplacement: ', '') : user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Voici un aperçu de vos activités importantes
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border p-4 sm:p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-2 rounded-lg mr-3">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Actions Rapides</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            <button 
              onClick={() => router.push('/reports/new')}
              className="flex flex-col items-center p-3 sm:p-4 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all duration-200 group min-h-[80px] sm:min-h-[auto]"
            >
              <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg mb-1 sm:mb-2">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="font-medium text-xs text-gray-700 text-center leading-tight">Nouveau Rapport</span>
            </button>
            
            <QuickObservationForm 
              trigger={
                <button className="flex flex-col items-center p-3 sm:p-4 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all duration-200 group w-full min-h-[80px] sm:min-h-[auto]">
                  <div className="bg-green-500 p-1.5 sm:p-2 rounded-lg mb-1 sm:mb-2">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-medium text-xs text-gray-700 text-center leading-tight">Nouvelle Observation</span>
                </button>
              }
            />
            
            <button 
              onClick={() => router.push('/bristol')}
              className="flex flex-col items-center p-3 sm:p-4 rounded-lg border-2 border-cyan-200 bg-cyan-50 hover:bg-cyan-100 transition-all duration-200 group min-h-[80px] sm:min-h-[auto]"
            >
              <div className="bg-cyan-500 p-1.5 sm:p-2 rounded-lg mb-1 sm:mb-2">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="font-medium text-xs text-gray-700 text-center leading-tight">Suivi Bristol</span>
            </button>
            
            <button 
              onClick={() => router.push('/communications/new')}
              className="flex flex-col items-center p-3 sm:p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 group min-h-[80px] sm:min-h-[auto]"
            >
              <div className="bg-yellow-500 p-1.5 sm:p-2 rounded-lg mb-1 sm:mb-2">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="font-medium text-xs text-gray-700 text-center leading-tight">Envoyer Message</span>
            </button>
            
            <button 
              onClick={() => router.push('/patients')}
              className="flex flex-col items-center p-3 sm:p-4 rounded-lg border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-all duration-200 group min-h-[80px] sm:min-h-[auto]"
            >
              <div className="bg-purple-500 p-1.5 sm:p-2 rounded-lg mb-1 sm:mb-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="font-medium text-xs text-gray-700 text-center leading-tight">Gérer Résidents</span>
            </button>
          </div>
        </div>

        {/* CIUSSS-CN External Tools - Compact */}
        <div className="bg-white rounded-lg border p-3 sm:p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className="bg-blue-500/10 p-1.5 rounded-lg mr-2">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Outils CIUSSS-CN</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">Accès rapide aux systèmes internes</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            <a 
              href="https://intranet.ciusss-cn.ca" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center p-2 sm:p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all duration-200 group"
            >
              <div className="bg-blue-500 p-1.5 rounded-lg mb-1">
                <Globe className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-xs text-gray-700 text-center leading-tight">Intranet CIUSSS</span>
              <ExternalLink className="h-2 w-2 text-gray-400 mt-0.5" />
            </a>
            
            <a 
              href="https://dossierpatient.ciusss-cn.ca" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center p-2 sm:p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-all duration-200 group"
            >
              <div className="bg-green-500 p-1.5 rounded-lg mb-1">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-xs text-gray-700 text-center leading-tight">Dossier Patient</span>
              <ExternalLink className="h-2 w-2 text-gray-400 mt-0.5" />
            </a>
            
            <a 
              href="https://formation.ciusss-cn.ca" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center p-2 sm:p-3 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-all duration-200 group"
            >
              <div className="bg-purple-500 p-1.5 rounded-lg mb-1">
                <Brain className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-xs text-gray-700 text-center leading-tight">Formation</span>
              <ExternalLink className="h-2 w-2 text-gray-400 mt-0.5" />
            </a>
            
            <a 
              href="https://securite.ciusss-cn.ca" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center p-2 sm:p-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-all duration-200 group"
            >
              <div className="bg-orange-500 p-1.5 rounded-lg mb-1">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-xs text-gray-700 text-center leading-tight">Sécurité</span>
              <ExternalLink className="h-2 w-2 text-gray-400 mt-0.5" />
            </a>
          </div>
          
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="bg-blue-500/10 p-1 rounded flex-shrink-0">
                <Shield className="h-2 w-2 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-xs text-blue-700 mb-0.5">Accès sécurisé</h4>
                <p className="text-xs text-blue-600 leading-tight">
                  Liens vers les systèmes officiels CIUSSS-CN. Authentification réseau requise.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - Communications */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Today's Important Messages */}
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Communications d'aujourd'hui</h3>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentCommunications.length > 0 ? recentCommunications.map((comm, index) => (
                  <div key={index} className={`p-4 rounded-lg border transition-all duration-200 ${
                    comm.isUrgent 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-1.5 rounded">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-sm text-foreground">{comm.authorDisplayName}</span>
                          {comm.isUrgent && (
                            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">URGENT</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-muted-foreground text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(comm.creationDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{comm.content}</p>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1 text-sm">Aucune communication aujourd'hui</h4>
                    <p className="text-xs text-muted-foreground">Les nouvelles communications apparaîtront ici</p>
                  </div>
                )}
                
                <button 
                  onClick={() => router.push('/communications')}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-medium py-2 px-4 rounded-lg w-full text-sm transition-colors duration-200"
                >
                  <MessageSquare className="h-4 w-4 mr-2 inline" />
                  Voir toutes les communications
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Residents & Admin */}
          <div className="space-y-4 sm:space-y-6">
            {/* Residents Quick View */}
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-success/10 p-2 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Résidents</h3>
                </div>
                <button 
                  onClick={() => router.push('/patients')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voir tout
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    placeholder="Rechercher un résident..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-foreground mb-1 text-sm">Accès aux résidents</h4>
                  <p className="text-xs text-muted-foreground mb-3">Cliquez sur "Voir tout" pour gérer les résidents</p>
                </div>
              </div>
            </div>

            {/* Admin Panel (only for admins) - Simplified */}
            {user?.role === 'admin' && (
              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-500/10 p-2 rounded-lg mr-3">
                    <Settings className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Administration</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button 
                    onClick={() => router.push('/admin/users')}
                    className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Users className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Utilisateurs</span>
                  </button>
                  <button 
                    onClick={() => router.push('/admin/templates')}
                    className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">Modèles</span>
                  </button>
                  <button 
                    onClick={() => router.push('/admin/exports')}
                    className="flex items-center justify-center p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-700">Statistiques</span>
                  </button>
                  <button 
                    onClick={() => router.push('/admin/settings')}
                    className="flex items-center justify-center p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm font-medium text-amber-700">Paramètres</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
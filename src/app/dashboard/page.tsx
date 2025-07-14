'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Bell, Users, MessageSquare, FileText, Calendar, 
  Settings, LogOut, BarChart3, Plus, Search,
  Clock, User, Brain, Check, X, Eye
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
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8">
                <Image 
                  src="/logo.svg" 
                  alt="Logo Irielle - Plateforme de gestion pour résidences DI-TSA" 
                  width={32} 
                  height={32}
                  className="h-full w-full"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Irielle</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.isReplacement ? `Remplacement: ${user.name.replace('Remplacement: ', '')}` : user?.name}
                  {user?.role && !user?.isReplacement && ` • ${user.role}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Irielle AI Button */}
              <button 
                onClick={() => router.push('/patient-query')}
                className="ws-button-outline !px-4 !py-2 bg-accent/5 border-accent/20 text-accent hover:bg-accent/10"
              >
                <Brain className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">IA Assistant</span>
              </button>

              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative" aria-label={`Notifications - ${notifications.length} non lues`}>
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
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

              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">Sortir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-semibold text-foreground mb-3">
            Bonjour {user?.isReplacement ? user.name.replace('Remplacement: ', '') : user?.name?.split(' ')[0]}
          </h2>
          <p className="text-xl text-muted-foreground">
            Voici un aperçu de vos activités importantes
          </p>
        </div>


        {/* Quick Actions */}
        <div className="ws-card mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 p-3 rounded-xl mr-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground">Actions Rapides</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <button 
              onClick={() => router.push('/reports/new')}
              className="flex flex-col items-center p-6 rounded-xl border-2 border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent/40 transition-all duration-200 group"
            >
              <div className="bg-accent p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <span className="font-medium text-sm text-foreground">Nouveau Rapport</span>
            </button>
            
            <QuickObservationForm 
              trigger={
                <button className="flex flex-col items-center p-6 rounded-xl border-2 border-success/20 bg-success/5 hover:bg-success/10 hover:border-success/40 transition-all duration-200 group w-full">
                  <div className="bg-success p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-sm text-foreground">Nouvelle Observation</span>
                </button>
              }
            />
            
            <button 
              onClick={() => router.push('/bristol')}
              className="flex flex-col items-center p-6 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 group"
            >
              <div className="bg-primary p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="font-medium text-sm text-foreground">Suivi Bristol</span>
            </button>
            
            <button 
              onClick={() => router.push('/communications/new')}
              className="flex flex-col items-center p-6 rounded-xl border-2 border-warning/20 bg-warning/5 hover:bg-warning/10 hover:border-warning/40 transition-all duration-200 group"
            >
              <div className="bg-warning p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
                <MessageSquare className="h-6 w-6 text-warning-foreground" />
              </div>
              <span className="font-medium text-sm text-foreground">Envoyer Message</span>
            </button>
            
            <button 
              onClick={() => router.push('/patients')}
              className="flex flex-col items-center p-6 rounded-xl border-2 border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent/40 transition-all duration-200 group"
            >
              <div className="bg-accent p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="font-medium text-sm text-foreground">Gérer Résidents</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Communications */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Important Messages */}
            <div className="ws-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-xl mr-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Communications d'aujourd'hui</h3>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {recentCommunications.length > 0 ? recentCommunications.map((comm, index) => (
                  <div key={index} className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                    comm.isUrgent 
                      ? 'border-destructive/30 bg-destructive/5' 
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{comm.authorDisplayName}</span>
                          {comm.isUrgent && (
                            <span className="ml-3 ws-status-error">URGENT</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(comm.creationDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <p className="text-foreground/90 leading-relaxed">{comm.content}</p>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <div className="bg-muted/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-2">Aucune communication aujourd'hui</h4>
                    <p className="text-sm text-muted-foreground">Les nouvelles communications apparaîtront ici</p>
                  </div>
                )}
                
                <button 
                  onClick={() => router.push('/communications')}
                  className="ws-button-primary w-full !h-12 mt-6"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Voir toutes les communications
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Residents & Admin */}
          <div className="space-y-8">
            {/* Residents Quick View */}
            <div className="ws-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-success/10 p-3 rounded-xl mr-4">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Résidents</h3>
                </div>
                <button 
                  onClick={() => router.push('/patients')}
                  className="ws-button-outline !px-3 !py-1.5 text-sm"
                >
                  Voir tout
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    placeholder="Rechercher un résident..." 
                    className="ws-input !pl-10"
                  />
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: "Marie Lavoie", status: "Nouvelle" },
                    { name: "Pierre Gagnon", status: "Suivi médical" },
                    { name: "Julie Bouchard", status: "Stable" }
                  ].map((resident, index) => (
                    <div key={index} className="ws-patient-card !p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{resident.name}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          resident.status === 'Nouvelle' ? 'bg-accent/10 text-accent border border-accent/20' :
                          resident.status === 'Suivi médical' ? 'bg-warning/10 text-warning border border-warning/20' :
                          'bg-success/10 text-success border border-success/20'
                        }`}>
                          {resident.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Observations (only for admins) */}
            {user?.role === 'admin' && (
              <RecentObservationsView 
                limit={5} 
                className="bg-card/50 backdrop-blur-sm border-primary/20" 
              />
            )}

            {/* Admin Panel (only for admins) */}
            {user?.role === 'admin' && (
              <Card className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-orange-200/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg mr-3">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    Administration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 bg-gradient-to-r from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-md" 
                    onClick={() => router.push('/admin/users')}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1.5 rounded mr-3">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    Gestion Utilisateurs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 bg-gradient-to-r from-green-500/10 to-green-600/5 hover:from-green-500/20 hover:to-green-600/10 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-md" 
                    onClick={() => router.push('/admin/templates')}
                  >
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-1.5 rounded mr-3">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    Modèles de Rapports
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 bg-gradient-to-r from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-md" 
                    onClick={() => router.push('/admin/exports')}
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1.5 rounded mr-3">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    Statistiques & Exports
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-md" 
                    onClick={() => router.push('/admin/settings')}
                  >
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-1.5 rounded mr-3">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    Paramètres Système
                  </Button>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
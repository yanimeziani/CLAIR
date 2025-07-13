'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Bell, Users, MessageSquare, FileText, Calendar, 
  Settings, LogOut, Activity, BarChart3, Plus, Search,
  AlertTriangle, Clock, User, Brain, Check, X, Eye
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
  const [stats, setStats] = useState({
    urgentMessages: 0,
    activeResidents: 0,
    todayReports: 0,
    connectedTeam: 0
  });
  const [recentCommunications, setRecentCommunications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkSession();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [patientsRes, reportsRes, usersRes, communicationsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/reports'),
        fetch('/api/users'),
        fetch('/api/communications')
      ]);

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        const activeResidents = patientsData.patients?.filter((p: any) => p.isActive).length || 0;
        setStats(prev => ({ ...prev, activeResidents }));
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        const today = new Date().toISOString().split('T')[0];
        const todayReports = reportsData.reports?.filter((r: any) => 
          r.reportDate.startsWith(today)
        ).length || 0;
        setStats(prev => ({ ...prev, todayReports }));
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const connectedTeam = usersData.users?.filter((u: any) => u.isActive).length || 0;
        setStats(prev => ({ ...prev, connectedTeam }));
      }

      if (communicationsRes.ok) {
        const communicationsData = await communicationsRes.json();
        const communications = communicationsData.communications || [];
        
        // Get urgent unread messages count
        const urgentMessages = communications.filter((c: any) => 
          c.isUrgent && !c.readBy?.some((r: any) => r.userId === user?.userId)
        ).length || 0;
        setStats(prev => ({ ...prev, urgentMessages }));
        
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
      console.error('Error fetching dashboard stats:', error);
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
        fetchDashboardStats(); // Refresh stats
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
      fetchDashboardStats();
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
    <div className="min-h-screen bg-gradient-healthcare">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500/10 p-2 rounded-lg">
                <Image 
                  src="/logo.png" 
                  alt="Logo Irielle - Plateforme de gestion pour résidences DI-TSA" 
                  width={32} 
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Plateforme Irielle</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.isReplacement ? `Remplacement: ${user.name.replace('Remplacement: ', '')}` : user?.name}
                  {user?.role && !user?.isReplacement && ` • ${user.role}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Irielle AI Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/patient-query')}
                className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:from-blue-500/20 hover:to-blue-600/20"
              >
                <Brain className="h-4 w-4 mr-2 text-blue-500" />
                <span className="hidden sm:inline">Irielle IA</span>
              </Button>

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

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bon{new Date().getHours() < 12 ? 'jour' : new Date().getHours() < 18 ? ' après-midi' : 'soir'}
          </h2>
          <p className="text-muted-foreground">
            Voici un aperçu des activités importantes d'aujourd'hui
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Messages Urgents</p>
                  <p className="text-2xl font-bold text-foreground">{stats.urgentMessages}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Résidents Actifs</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeResidents}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Rapports Aujourd'hui</p>
                  <p className="text-2xl font-bold text-foreground">{stats.todayReports}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Équipe Connectée</p>
                  <p className="text-2xl font-bold text-foreground">{stats.connectedTeam}</p>
                </div>
                <Activity className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Moved to top for instant visibility */}
        <Card className="bg-card/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Button variant="outline" className="h-16 flex flex-col" onClick={() => router.push('/reports/new')}>
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-sm">Nouveau Rapport</span>
              </Button>
              <QuickObservationForm />
              <Button variant="outline" className="h-16 flex flex-col" onClick={() => router.push('/bristol')}>
                <BarChart3 className="h-5 w-5 mb-1" />
                <span className="text-sm">Suivi Bristol</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col" onClick={() => router.push('/communications/new')}>
                <MessageSquare className="h-5 w-5 mb-1" />
                <span className="text-sm">Envoyer Message</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col" onClick={() => router.push('/patients')}>
                <Users className="h-5 w-5 mb-1" />
                <span className="text-sm">Gérer Résidents</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Communications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Important Messages */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Communications Importantes - {new Date().toLocaleDateString('fr-FR')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCommunications.length > 0 ? recentCommunications.map((comm, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${comm.isUrgent ? 'border-red-500/50 bg-red-500/10' : 'border-border bg-muted/30'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{comm.authorDisplayName}</span>
                        {comm.isUrgent && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">URGENT</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(comm.creationDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comm.content}</p>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune communication aujourd'hui</p>
                  </div>
                )}
                
                <Button className="w-full mt-4" onClick={() => router.push('/communications')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Voir toutes les communications
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Residents & Admin */}
          <div className="space-y-6">
            {/* Residents Quick View */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Résidents
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => router.push('/patients')}>
                    Voir tout
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher un résident..." className="pl-10" />
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: "Marie Lavoie", status: "Nouvelle" },
                    { name: "Pierre Gagnon", status: "Suivi médical" },
                    { name: "Julie Bouchard", status: "Stable" }
                  ].map((resident, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer">
                      <div>
                        <p className="font-medium text-sm">{resident.name}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        resident.status === 'Nouvelle' ? 'bg-blue-500/20 text-blue-600' :
                        resident.status === 'Suivi médical' ? 'bg-amber-500/20 text-amber-600' :
                        'bg-green-500/20 text-green-600'
                      }`}>
                        {resident.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Observations (only for admins) */}
            {user?.role === 'admin' && (
              <RecentObservationsView 
                limit={5} 
                className="bg-card/50 backdrop-blur-sm border-primary/20" 
              />
            )}

            {/* Admin Panel (only for admins) */}
            {user?.role === 'admin' && (
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-primary" />
                    Administration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/users')}>
                    <Users className="h-4 w-4 mr-2" />
                    Gestion Utilisateurs
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/templates')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Modèles de Rapports
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/exports')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Statistiques & Exports
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
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
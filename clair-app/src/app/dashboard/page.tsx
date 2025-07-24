'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Bell, Users, MessageSquare, FileText, Calendar, 
  Settings, LogOut, BarChart3, Plus, Search, TrendingUp,
  Clock, User, Brain, Check, X, Eye, ExternalLink, Globe, Shield,
  Activity, AlertTriangle, Zap, Star, CheckCircle, Filter,
  ArrowRight, Sparkles, Target, Award, Clipboard, Stethoscope
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface DashboardStats {
  totalPatients: number;
  todayReports: number;
  urgentMessages: number;
  completedTasks: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayReports: 0,
    urgentMessages: 0,
    completedTasks: 0
  });
  const [recentCommunications, setRecentCommunications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const initDashboard = async () => {
      await checkSession();
    };
    
    initDashboard();
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch dashboard data when user is available
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]); // Fetch data when user state changes

  const fetchDashboardData = async () => {
    try {
      // Ensure we have a user before fetching notifications
      if (!user?.userId) {
        console.warn('No user ID available for filtering notifications');
        return;
      }

      const communicationsRes = await fetch('/api/communications');
      const patientsRes = await fetch('/api/patients');

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
        // Make sure to use the current user's ID
        const currentUserId = user.userId;
        const unreadNotifications = communications.filter((c: any) => {
          // Check if this communication has been read by the current user
          const isReadByCurrentUser = c.readBy?.some((r: any) => 
            r.userId === currentUserId || r.userId?.toString() === currentUserId?.toString()
          );
          return !isReadByCurrentUser;
        }).slice(0, 5);
        setNotifications(unreadNotifications);

        // Calculate stats
        const urgentCount = communications.filter((c: any) => c.isUrgent).length;
        setStats(prev => ({ ...prev, urgentMessages: urgentCount, todayReports: todayCommunications.length }));
      }

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        const patients = patientsData.patients || [];
        setStats(prev => ({ ...prev, totalPatients: patients.length, completedTasks: Math.floor(Math.random() * 10) + 5 }));
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
        fetchDashboardData();
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const userName = user?.isReplacement ? user.name.replace('Remplacement: ', '') : user?.name?.split(' ')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Heart className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
            <Sparkles className="h-6 w-6 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">CLAIR</h2>
          <p className="text-gray-600 animate-pulse">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Modern Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/50 shadow-lg shadow-blue-100/50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CLAIR
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.isReplacement ? `Remplacement: ${user.name.replace('Remplacement: ', '')}` : user?.name}
                  {user?.role && !user?.isReplacement && ` • ${user.role}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* CIUSSCN Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full bg-white/50 hover:bg-white/80 border border-white/50">
                    <Globe className="h-5 w-5 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Outils CIUSSS-CN</h3>
                    <p className="text-sm text-gray-600">Accès sécurisé aux systèmes</p>
                  </div>
                  
                  <DropdownMenuItem className="p-0">
                    <a 
                      href="https://teams.microsoft.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full p-3 hover:bg-blue-50/50 transition-colors flex items-center space-x-3"
                    >
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 block">Microsoft Teams</span>
                        <span className="text-xs text-gray-500">Collaboration en ligne</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="p-0">
                    <a 
                      href="https://intranet.ciusss-cn.ca" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full p-3 hover:bg-green-50/50 transition-colors flex items-center space-x-3"
                    >
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Globe className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 block">Intranet CIUSSS</span>
                        <span className="text-xs text-gray-500">Portail principal</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="p-0">
                    <a 
                      href="https://ah-223.ciusss-cn.ca/incident" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full p-3 hover:bg-red-50/50 transition-colors flex items-center space-x-3"
                    >
                      <div className="bg-red-100 p-2 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 block">AH-223</span>
                        <span className="text-xs text-gray-500">Déclaration incident/accident</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="p-0">
                    <a 
                      href="https://registre.ciusss-cn.ca/mesures-controle" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full p-3 hover:bg-purple-50/50 transition-colors flex items-center space-x-3"
                    >
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Clipboard className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 block">Registre Mesures</span>
                        <span className="text-xs text-gray-500">Mesures de contrôle</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="p-3">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-900">Accès Sécurisé</p>
                        <p className="text-xs text-blue-700">Authentification réseau requise</p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications with advanced styling */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full bg-white/50 hover:bg-white/80 border border-white/50">
                    <Bell className="h-5 w-5 text-gray-700" />
                    {notifications.length > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                        {notifications.length}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {notifications.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-blue-600 hover:text-blue-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Tout lire
                      </Button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="h-6 w-6 text-blue-500" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Tout est à jour!</h4>
                      <p className="text-sm text-gray-500">Aucune nouvelle notification</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification._id} className="p-0">
                        <div className="w-full p-4 hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="font-medium text-sm text-gray-900">{notification.authorDisplayName}</span>
                                {notification.isUrgent && (
                                  <Badge className="ml-2 bg-red-500 hover:bg-red-600">URGENT</Badge>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(notification._id);
                              }}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div 
                            className="text-sm text-gray-700 mb-2 rich-content prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: notification.content }}
                          />
                          <p className="text-xs text-gray-500">
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
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="h-10 px-4 rounded-full bg-white/50 hover:bg-white/80 border border-white/50 text-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Hero Welcome Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-white/5 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                <span className="text-yellow-300 font-medium text-lg">
                  {getGreeting()}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {userName} 👋
              </h1>
              
              <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                Bienvenue dans votre espace de travail personnalisé. Voici un aperçu de vos activités importantes pour aujourd'hui.
              </p>
              
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions Section */}
        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl shadow-blue-100/50 mb-12">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Actions Principales</CardTitle>
                <p className="text-gray-600">Accès rapide aux fonctionnalités essentielles</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <button 
                onClick={() => router.push('/reports')}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[120px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="bg-blue-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800 text-center">Rapports</span>
                </div>
              </button>
              
              <QuickObservationForm 
                trigger={
                  <button className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 w-full h-full min-h-[120px] flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-3 flex-1">
                      <div className="bg-green-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800 text-center">Observation</span>
                    </div>
                  </button>
                }
              />
              
              <button 
                onClick={() => router.push('/bristol')}
                className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border-2 border-cyan-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[120px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="bg-cyan-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800 text-center">Suivi Bristol</span>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/communications/new')}
                className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[120px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="bg-purple-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800 text-center">Envoyer Message</span>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/patients')}
                className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[120px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="bg-amber-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800 text-center">Gérer Usagers</span>
                </div>
              </button>

              <button 
                onClick={() => router.push('/communications')}
                className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-2 border-indigo-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[120px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="bg-indigo-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800 text-center">Voir Messages</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>



        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Communications Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl shadow-blue-100/50">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">Communications d'aujourd'hui</CardTitle>
                      <p className="text-gray-600">{currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push('/communications')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg"
                  >
                    Voir tout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {recentCommunications.length > 0 ? recentCommunications.map((comm, index) => (
                    <div key={index} className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
                      comm.isUrgent 
                        ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50' 
                        : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${comm.isUrgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <User className={`h-5 w-5 ${comm.isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{comm.authorDisplayName}</span>
                            {comm.isUrgent && (
                              <Badge className="ml-2 bg-red-500 hover:bg-red-600 animate-pulse">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                URGENT
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(comm.creationDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div 
                        className="rich-content"
                        dangerouslySetInnerHTML={{ __html: comm.content }}
                      />
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-10 w-10 text-blue-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Journée calme</h4>
                      <p className="text-gray-600 mb-6">Aucune communication pour aujourd'hui</p>
                      <Button 
                        onClick={() => router.push('/communications/new')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Envoyer le premier message
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Residents Quick Access */}
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl shadow-blue-100/50">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Usagers</CardTitle>
                      <p className="text-gray-600">{stats.totalPatients} actifs</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push('/patients')}
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    Voir tout
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Rechercher un usager..." 
                    className="pl-10 border-2 border-gray-200 rounded-xl focus:border-emerald-300 focus:ring-emerald-200"
                  />
                </div>
                
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gestion des usagers</h4>
                  <p className="text-sm text-gray-600 mb-4">Accédez à la liste complète pour voir les profils détaillés</p>
                  <Button 
                    onClick={() => router.push('/patients')}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Accéder aux usagers
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Admin Panel */}
            {user?.role === 'admin' && (
              <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl shadow-blue-100/50">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Administration</CardTitle>
                      <p className="text-gray-600">Panneau de contrôle</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => router.push('/admin/users')}
                      className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <span className="text-sm font-semibold text-blue-800 block">Utilisateurs</span>
                    </button>
                    
                    <button 
                      onClick={() => router.push('/admin/templates')}
                      className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <span className="text-sm font-semibold text-green-800 block">Modèles</span>
                    </button>
                    
                    <button 
                      onClick={() => router.push('/admin/exports')}
                      className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <span className="text-sm font-semibold text-purple-800 block">Stats</span>
                    </button>
                    
                    <button 
                      onClick={() => router.push('/admin/settings')}
                      className="group bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <Settings className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                      <span className="text-sm font-semibold text-amber-800 block">Config</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
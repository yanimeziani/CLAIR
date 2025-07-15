'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, Plus, Search, ArrowLeft, Calendar,
  AlertTriangle, Clock, Eye, EyeOff, 
  CheckCircle, Circle, User, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Communication {
  _id: string;
  authorId: string;
  authorDisplayName: string;
  recipientIds: string[];
  content: string;
  isUrgent: boolean;
  creationDate: string;
  destinationDates: string[];
  patientId?: string;
  readBy: { userId: string; timestamp: string }[];
}


export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [urgentFilter, setUrgentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  const router = useRouter();

  useEffect(() => {
    checkSession();
    fetchData();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      
      setCurrentUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      const commsRes = await fetch('/api/communications');

      if (commsRes.ok) {
        const commsData = await commsRes.json();
        setCommunications(commsData.communications || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const today = new Date().toISOString().split('T')[0];
    
    // Search filter
    const matchesSearch = searchTerm === '' || 
      comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.authorDisplayName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Urgent filter
    const matchesUrgent = urgentFilter === 'all' || 
      (urgentFilter === 'urgent' && comm.isUrgent) ||
      (urgentFilter === 'normal' && !comm.isUrgent);
    
    // Date filter
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = comm.destinationDates.some(date => date.startsWith(today));
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      matchesDate = comm.destinationDates.some(date => date >= weekAgoStr);
    } else if (dateFilter === 'all') {
      matchesDate = true;
    }
    
    return matchesSearch && matchesUrgent && matchesDate;
  });


  const markAsRead = async (communicationId: string) => {
    try {
      const response = await fetch(`/api/communications/${communicationId}/read`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isReadByCurrentUser = (comm: Communication) => {
    return comm.readBy.some(read => read.userId === currentUser?.userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement des communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <Button variant="ghost" onClick={() => router.push('/dashboard')} size="sm" className="shrink-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Centre de Communications</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Messages sécurisés de l'équipe</p>
              </div>
            </div>
            <Button onClick={() => router.push('/communications/new')} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto shrink-0" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:inline">Nouveau Message</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={urgentFilter} onValueChange={setUrgentFilter}>
                <SelectTrigger>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les messages</SelectItem>
                  <SelectItem value="urgent">Messages urgents</SelectItem>
                  <SelectItem value="normal">Messages normaux</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="space-y-4">
          {filteredCommunications.map((comm) => {
            const isRead = isReadByCurrentUser(comm);
            
            return (
              <Card key={comm._id} className={`transition-all hover:shadow-md ${
                comm.isUrgent ? 'border-red-500/50 bg-red-500/5' : ''
              } ${!isRead ? 'border-l-4 border-l-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{comm.authorDisplayName}</span>
                      </div>
                      
                      {!isRead && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsRead(comm._id)}
                          className="shrink-0 text-xs px-2 py-1"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Marquer lu</span>
                          <span className="sm:hidden">Lu</span>
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {comm.isUrgent && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center shrink-0">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          URGENT
                        </span>
                      )}
                      
                      {!isRead && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded shrink-0">
                          Non lu
                        </span>
                      )}
                    </div>
                      
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">{formatDate(comm.creationDate)} à {formatTime(comm.creationDate)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">{comm.destinationDates.map(date => formatDate(date)).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div 
                    className="text-foreground mb-4 prose prose-sm max-w-none dark:prose-invert prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground [&_.highlight]:bg-yellow-200 [&_.highlight]:px-1 [&_.highlight]:rounded" 
                    dangerouslySetInnerHTML={{ __html: comm.content }}
                  />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-border">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1 shrink-0" />
                      <span className="truncate">Destinataires: {comm.recipientIds.length} personne(s)</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Lu par {comm.readBy.length} personne(s)
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCommunications.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun message trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || urgentFilter !== 'all' || dateFilter !== 'today' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Aucun message pour aujourd\'hui'
                }
              </p>
              <Button onClick={() => router.push('/communications/new')} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Envoyer le premier message
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}

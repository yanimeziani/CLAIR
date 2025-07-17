'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Download, Filter, Search, RefreshCw, 
  Eye, AlertTriangle, CheckCircle, Clock, User,
  Calendar, FileText, Shield, Activity, ChevronDown,
  ExternalLink, Database, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AuditLog {
  _id: string;
  timestamp: string;
  action: string;
  entity: string;
  entityId?: string;
  userName: string;
  userRole: string;
  userEmployeeNumber?: string;
  isReplacement: boolean;
  module: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
  description: string;
  ipAddress?: string;
  changedFields?: string[];
  errorMessage?: string;
  duration?: number;
}

interface ActivitySummary {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  actionsByModule: string[];
  actionsByUser: string[];
  severityBreakdown: string[];
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pagination, setPagination] = useState({
    limit: 50,
    skip: 0,
    total: 0,
    hasMore: false
  });

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userRole: '',
    action: '',
    entity: '',
    module: '',
    severity: '',
    success: '',
    search: ''
  });

  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (!data.authenticated || data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      setCurrentUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  const fetchLogs = useCallback(async (resetPagination = false) => {
    try {
      setLoading(true);
      
      const skip = resetPagination ? 0 : pagination.skip;
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('limit', pagination.limit.toString());
      params.append('skip', skip.toString());
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'search') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        if (resetPagination) {
          setLogs(data.logs);
          setPagination(prev => ({ ...prev, skip: 0, total: data.total, hasMore: data.pagination.hasMore }));
        } else {
          setLogs(prev => [...prev, ...data.logs]);
          setPagination(prev => ({ ...prev, skip: skip + data.logs.length, total: data.total, hasMore: data.pagination.hasMore }));
        }
      } else {
        toast.error(data.error || 'Erreur lors du chargement des logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.skip]);

  const fetchSummary = useCallback(async () => {
    try {
      const dateRange = filters.startDate && filters.endDate ? {
        start: new Date(filters.startDate),
        end: new Date(filters.endDate)
      } : undefined;

      const response = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summary', dateRange })
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (currentUser) {
      fetchLogs(true);
      fetchSummary();
    }
  }, [currentUser, filters, fetchLogs, fetchSummary]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      userRole: '',
      action: '',
      entity: '',
      module: '',
      severity: '',
      success: '',
      search: ''
    });
  };

  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchLogs(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      
      const { search, ...exportFilters } = filters; // Remove search from export filters
      
      const response = await fetch('/api/admin/audit-logs/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: exportFilters, format })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Export ${format.toUpperCase()} réussi`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Eye className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      log.description.toLowerCase().includes(searchTerm) ||
      log.userName.toLowerCase().includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm) ||
      log.entity.toLowerCase().includes(searchTerm) ||
      log.module.toLowerCase().includes(searchTerm)
    );
  });

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement des logs d'audit...</p>
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Logs d'Audit</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Historique des actions sur la plateforme</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => fetchLogs(true)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={exporting}
                    className="w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <Database className="h-4 w-4 mr-2" />
                    Export JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Actions</p>
                    <p className="text-2xl font-bold">{summary.totalActions}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Réussies</p>
                    <p className="text-2xl font-bold text-green-600">{summary.successfulActions}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Échecs</p>
                    <p className="text-2xl font-bold text-red-600">{summary.failedActions}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux Succès</p>
                    <p className="text-2xl font-bold">
                      {summary.totalActions > 0 ? Math.round((summary.successfulActions / summary.totalActions) * 100) : 0}%
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtres
              </span>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Effacer
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Date début</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Date fin</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Rôle utilisateur</Label>
                <Select value={filters.userRole} onValueChange={(value) => handleFilterChange('userRole', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les rôles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les rôles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="replacement">Remplacement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sévérité</Label>
                <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Action</Label>
                <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="create">Créer</SelectItem>
                    <SelectItem value="update">Modifier</SelectItem>
                    <SelectItem value="delete">Supprimer</SelectItem>
                    <SelectItem value="view">Consulter</SelectItem>
                    <SelectItem value="login">Connexion</SelectItem>
                    <SelectItem value="logout">Déconnexion</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Module</Label>
                <Select value={filters.module} onValueChange={(value) => handleFilterChange('module', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="patients">Usagers</SelectItem>
                    <SelectItem value="reports">Rapports</SelectItem>
                    <SelectItem value="communications">Communications</SelectItem>
                    <SelectItem value="observations">Observations</SelectItem>
                    <SelectItem value="bristol">Bristol</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                    <SelectItem value="auth">Authentification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={filters.success} onValueChange={(value) => handleFilterChange('success', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="true">Succès</SelectItem>
                    <SelectItem value="false">Échec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Logs d'Audit ({pagination.total} total)</span>
              {filteredLogs.length !== logs.length && (
                <Badge variant="secondary">
                  {filteredLogs.length} sur {logs.length} affichés
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log._id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        {getSeverityIcon(log.severity)}
                        {getSuccessIcon(log.success)}
                        <Badge variant={log.success ? 'secondary' : 'destructive'}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline">
                          {log.entity}
                        </Badge>
                        <Badge variant="outline">
                          {log.module}
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium">{log.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {log.userName} ({log.userRole})
                          {log.isReplacement && <Badge variant="outline" className="ml-1 text-xs">Remplacement</Badge>}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {log.ipAddress && (
                          <span>IP: {log.ipAddress}</span>
                        )}
                        {log.duration && (
                          <span>{log.duration}ms</span>
                        )}
                      </div>
                      
                      {log.changedFields && log.changedFields.length > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Champs modifiés: </span>
                          <span className="font-mono">{log.changedFields.join(', ')}</span>
                        </div>
                      )}
                      
                      {log.errorMessage && (
                        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                          <strong>Erreur:</strong> {log.errorMessage}
                        </div>
                      )}
                    </div>
                    
                    {log.entityId && (
                      <div className="text-xs text-muted-foreground">
                        ID: {log.entityId}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun log trouvé avec les filtres appliqués</p>
                </div>
              )}
              
              {pagination.hasMore && filteredLogs.length === logs.length && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    Charger plus
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
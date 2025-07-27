'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Database, Download, Upload, Activity, RefreshCw,
  Server, HardDrive, Clock, AlertTriangle, CheckCircle, 
  Settings, Terminal, FileText, Shield, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SystemStats {
  uptime: string;
  memoryUsage: number;
  diskUsage: number;
  cpuUsage: number;
  dbConnections: number;
  dbSize: string;
  lastBackup: string;
  totalBackups: number;
  servicesTotals: {
    users: number;
    patients: number;
    reports: number;
    communications: number;
    auditLogs: number;
  };
}

interface BackupInfo {
  filename: string;
  size: string;
  date: string;
  type: string;
}

export default function SystemAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [operations, setOperations] = useState({
    backup: false,
    restore: false,
    monitoring: false
  });
  
  // Dialogs
  const [backupDialog, setBackupDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

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

  const fetchSystemStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system/stats');
      const data = await response.json();
      
      if (data.success) {
        setSystemStats(data.stats);
      } else {
        toast.error('Erreur lors du chargement des statistiques système');
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system/backups');
      const data = await response.json();
      
      if (data.success) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (currentUser) {
      fetchSystemStats();
      fetchBackups();
      setLoading(false);
    }
  }, [currentUser, fetchSystemStats, fetchBackups]);

  const handleCreateBackup = async () => {
    setOperations(prev => ({ ...prev, backup: true }));
    
    try {
      const response = await fetch('/api/admin/system/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Sauvegarde créée: ${data.filename}`);
        await fetchBackups();
        await fetchSystemStats();
        setBackupDialog(false);
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setOperations(prev => ({ ...prev, backup: false }));
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup && !uploadFile) {
      toast.error('Veuillez sélectionner une sauvegarde ou uploader un fichier');
      return;
    }

    setOperations(prev => ({ ...prev, restore: true }));

    try {
      const formData = new FormData();
      
      if (uploadFile) {
        formData.append('file', uploadFile);
        formData.append('type', 'upload');
      } else {
        formData.append('backup', selectedBackup);
        formData.append('type', 'existing');
      }

      const response = await fetch('/api/admin/system/restore', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Restauration terminée avec succès');
        await fetchSystemStats();
        setRestoreDialog(false);
        setSelectedBackup('');
        setUploadFile(null);
      } else {
        toast.error(data.error || 'Erreur lors de la restauration');
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Erreur lors de la restauration');
    } finally {
      setOperations(prev => ({ ...prev, restore: false }));
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      const response = await fetch(`/api/admin/system/backups/${filename}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Téléchargement commencé');
      } else {
        toast.error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const refreshStats = async () => {
    setOperations(prev => ({ ...prev, monitoring: true }));
    await fetchSystemStats();
    await fetchBackups();
    setOperations(prev => ({ ...prev, monitoring: false }));
    toast.success('Statistiques mises à jour');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Server className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement du système...</p>
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
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Administration Système</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Gestion des opérations système</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={refreshStats}
              disabled={operations.monitoring}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${operations.monitoring ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* System Status Cards */}
        {systemStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="text-lg font-semibold">{systemStats.uptime}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-sm text-muted-foreground">Mémoire</p>
                    <p className="text-lg font-semibold">{systemStats.memoryUsage}%</p>
                    <Progress value={systemStats.memoryUsage} className="mt-1" />
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-sm text-muted-foreground">Disque</p>
                    <p className="text-lg font-semibold">{systemStats.diskUsage}%</p>
                    <Progress value={systemStats.diskUsage} className="mt-1" />
                  </div>
                  <HardDrive className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Base de données</p>
                    <p className="text-lg font-semibold">{systemStats.dbSize}</p>
                    <p className="text-xs text-muted-foreground">{systemStats.dbConnections} connexions</p>
                  </div>
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Operations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Backup Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Gestion des sauvegardes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => setBackupDialog(true)}
                  disabled={operations.backup}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {operations.backup ? 'Sauvegarde...' : 'Créer sauvegarde'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setRestoreDialog(true)}
                  disabled={operations.restore}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {operations.restore ? 'Restauration...' : 'Restaurer'}
                </Button>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Dernières sauvegardes:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {backups.slice(0, 5).map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{backup.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {backup.date} • {backup.size} • {backup.type}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadBackup(backup.filename)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {backups.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune sauvegarde disponible
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Surveillance système
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Utilisateurs:</span>
                      <span className="ml-2 font-medium">{systemStats.servicesTotals.users}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Patients:</span>
                      <span className="ml-2 font-medium">{systemStats.servicesTotals.patients}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rapports:</span>
                      <span className="ml-2 font-medium">{systemStats.servicesTotals.reports}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Communications:</span>
                      <span className="ml-2 font-medium">{systemStats.servicesTotals.communications}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-2">État des services:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Base de données</span>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Service IA</span>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dernière sauvegarde</span>
                        <span className="text-sm text-muted-foreground">{systemStats.lastBackup}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => router.push('/admin/audit-logs')}>
                <Shield className="h-4 w-4 mr-2" />
                Logs d'audit
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/users')}>
                <Settings className="h-4 w-4 mr-2" />
                Gestion utilisateurs
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/exports')}>
                <FileText className="h-4 w-4 mr-2" />
                Export données
              </Button>
              <Button variant="outline" onClick={() => window.open('/api/admin/system/health', '_blank')}>
                <Terminal className="h-4 w-4 mr-2" />
                Health Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Dialog */}
      <Dialog open={backupDialog} onOpenChange={setBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une sauvegarde</DialogTitle>
            <DialogDescription>
              Cette opération va créer une sauvegarde complète du système incluant la base de données et les configurations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Cette opération peut prendre plusieurs minutes.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateBackup} disabled={operations.backup}>
              {operations.backup ? 'Création...' : 'Créer sauvegarde'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialog} onOpenChange={setRestoreDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restaurer une sauvegarde</DialogTitle>
            <DialogDescription>
              Choisissez une sauvegarde existante ou uploadez un fichier de sauvegarde.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sauvegarde existante</Label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedBackup}
                onChange={(e) => setSelectedBackup(e.target.value)}
              >
                <option value="">Sélectionner une sauvegarde...</option>
                {backups.map((backup, index) => (
                  <option key={index} value={backup.filename}>
                    {backup.filename} ({backup.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">ou</span>
            </div>

            <div>
              <Label>Uploader un fichier</Label>
              <Input
                type="file"
                accept=".tar.gz,.zip"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Cette opération remplacera toutes les données actuelles.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleRestoreBackup} 
              disabled={operations.restore || (!selectedBackup && !uploadFile)}
              variant="destructive"
            >
              {operations.restore ? 'Restauration...' : 'Restaurer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
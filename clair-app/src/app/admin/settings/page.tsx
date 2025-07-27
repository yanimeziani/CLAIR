'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Settings, Shield, Database, Clock, 
  Globe, Lock, AlertTriangle, Save, Server, HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    // Critical System Settings
    systemName: 'CLAIR',
    organizationName: 'Résidence DI-TSA',
    adminEmail: 'admin@residence.ca',
    emergencyContact: '+1-418-xxx-xxxx',
    
    // Database & Backup
    backupRetention: 90, // days to keep backups
    backupFrequency: 'daily',
    maxBackupSize: 5, // GB
    autoCleanupOldData: false,
    dataRetentionYears: 7,
    
    // Security & Sessions
    sessionTimeout: 480, // 8 hours in minutes
    maxFailedLogins: 5,
    auditLogRetention: 365, // days
    forcePasswordChange: false,
    
    // System Maintenance
    maintenanceMode: false,
    maintenanceMessage: '',
    maxDiskUsage: 85, // percentage before alerts
    maxMemoryUsage: 80, // percentage before alerts
    
    // Integration Settings
    aiServiceEnabled: true,
    aiModelName: 'gemma3:4b',
    maxConcurrentUsers: 50,
    
    // Alerts & Monitoring
    healthCheckInterval: 300, // seconds
    alertEmail: '',
    diskSpaceAlerts: true,
    performanceAlerts: true
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
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Paramètres sauvegardés avec succès!');
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      systemName: 'CLAIR',
      organizationName: 'Résidence DI-TSA',
      adminEmail: 'admin@residence.ca',
      emergencyContact: '+1-418-xxx-xxxx',
      backupRetention: 90,
      backupFrequency: 'daily',
      maxBackupSize: 5,
      autoCleanupOldData: false,
      dataRetentionYears: 7,
      sessionTimeout: 480,
      maxFailedLogins: 5,
      auditLogRetention: 365,
      forcePasswordChange: false,
      maintenanceMode: false,
      maintenanceMessage: '',
      maxDiskUsage: 85,
      maxMemoryUsage: 80,
      aiServiceEnabled: true,
      aiModelName: 'gemma3:4b',
      maxConcurrentUsers: 50,
      healthCheckInterval: 300,
      alertEmail: '',
      diskSpaceAlerts: true,
      performanceAlerts: true
    });
    toast.info('Paramètres remis aux valeurs par défaut');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Paramètres Système</h1>
                <p className="text-muted-foreground">Configuration générale de la plateforme</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleResetDefaults}>
                Restaurer défauts
              </Button>
              <Button onClick={handleSaveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Organization Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Configuration Résidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Nom du système</Label>
                <Input
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  placeholder="CLAIR"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nom de l'organisation</Label>
                <Input
                  value={settings.organizationName}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                  placeholder="Résidence DI-TSA"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email administrateur principal</Label>
                <Input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  placeholder="admin@residence.ca"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Contact d'urgence système</Label>
                <Input
                  value={settings.emergencyContact}
                  onChange={(e) => setSettings({ ...settings, emergencyContact: e.target.value })}
                  placeholder="+1-418-xxx-xxxx"
                />
              </div>

              <div className="space-y-2">
                <Label>Email pour alertes système</Label>
                <Input
                  type="email"
                  value={settings.alertEmail}
                  onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                  placeholder="support@residence.ca"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Sécurité & Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Expiration de session (minutes)</Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 480 })}
                  min="30"
                  max="1440"
                />
                <p className="text-xs text-muted-foreground">
                  Recommandé: 480 minutes (8h) pour les environnements de soins
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Tentatives de connexion max</Label>
                <Input
                  type="number"
                  value={settings.maxFailedLogins}
                  onChange={(e) => setSettings({ ...settings, maxFailedLogins: parseInt(e.target.value) || 5 })}
                  min="3"
                  max="10"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rétention logs d'audit (jours)</Label>
                <Input
                  type="number"
                  value={settings.auditLogRetention}
                  onChange={(e) => setSettings({ ...settings, auditLogRetention: parseInt(e.target.value) || 365 })}
                  min="90"
                  max="2555"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Forcer changement mot de passe</Label>
                  <p className="text-sm text-muted-foreground">Expiration automatique des PINs</p>
                </div>
                <Switch
                  checked={settings.forcePasswordChange}
                  onCheckedChange={(checked) => setSettings({ ...settings, forcePasswordChange: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Backup & Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Sauvegardes & Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Fréquence des sauvegardes</Label>
                <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidienne (recommandé)</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Rétention sauvegardes (jours)</Label>
                <Input
                  type="number"
                  value={settings.backupRetention}
                  onChange={(e) => setSettings({ ...settings, backupRetention: parseInt(e.target.value) || 90 })}
                  min="30"
                  max="365"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Taille max sauvegarde (GB)</Label>
                <Input
                  type="number"
                  value={settings.maxBackupSize}
                  onChange={(e) => setSettings({ ...settings, maxBackupSize: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label>Rétention données (années)</Label>
                <Input
                  type="number"
                  value={settings.dataRetentionYears}
                  onChange={(e) => setSettings({ ...settings, dataRetentionYears: parseInt(e.target.value) || 7 })}
                  min="3"
                  max="20"
                />
                <p className="text-xs text-muted-foreground">
                  Réglementations DI-TSA: minimum 7 ans
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Nettoyage automatique anciennes données</Label>
                  <p className="text-sm text-muted-foreground">Suppression après période de rétention</p>
                </div>
                <Switch
                  checked={settings.autoCleanupOldData}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoCleanupOldData: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Performance Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Seuil d'alerte disque (%)</Label>
                <Input
                  type="number"
                  value={settings.maxDiskUsage}
                  onChange={(e) => setSettings({ ...settings, maxDiskUsage: parseInt(e.target.value) || 85 })}
                  min="50"
                  max="95"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Seuil d'alerte mémoire (%)</Label>
                <Input
                  type="number"
                  value={settings.maxMemoryUsage}
                  onChange={(e) => setSettings({ ...settings, maxMemoryUsage: parseInt(e.target.value) || 80 })}
                  min="50"
                  max="95"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Utilisateurs simultanés max</Label>
                <Input
                  type="number"
                  value={settings.maxConcurrentUsers}
                  onChange={(e) => setSettings({ ...settings, maxConcurrentUsers: parseInt(e.target.value) || 50 })}
                  min="10"
                  max="200"
                />
              </div>

              <div className="space-y-2">
                <Label>Intervalle health check (secondes)</Label>
                <Input
                  type="number"
                  value={settings.healthCheckInterval}
                  onChange={(e) => setSettings({ ...settings, healthCheckInterval: parseInt(e.target.value) || 300 })}
                  min="60"
                  max="3600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertes espace disque</Label>
                  <p className="text-sm text-muted-foreground">Notifications quand seuil atteint</p>
                </div>
                <Switch
                  checked={settings.diskSpaceAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, diskSpaceAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertes performance</Label>
                  <p className="text-sm text-muted-foreground">Notifications lenteur système</p>
                </div>
                <Switch
                  checked={settings.performanceAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, performanceAlerts: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI & Integration Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Intelligence Artificielle & Intégrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Service IA activé</Label>
                <p className="text-sm text-muted-foreground">Assistant IA pour correction de texte</p>
              </div>
              <Switch
                checked={settings.aiServiceEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, aiServiceEnabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Modèle IA</Label>
              <Select value={settings.aiModelName} onValueChange={(value) => setSettings({ ...settings, aiModelName: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemma3:4b">Gemma3 4B (recommandé)</SelectItem>
                  <SelectItem value="llama3:8b">Llama3 8B (plus puissant)</SelectItem>
                  <SelectItem value="mistral:7b">Mistral 7B (alternatif)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="mt-8 border-orange-500/20 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Mode Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Activer mode maintenance</Label>
                <p className="text-sm text-muted-foreground">Empêche l'accès aux utilisateurs normaux</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>

            {settings.maintenanceMode && (
              <div className="space-y-2">
                <Label>Message de maintenance</Label>
                <Textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  placeholder="Le système est temporairement indisponible pour maintenance..."
                  rows={3}
                />
              </div>
            )}

            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <strong>Important:</strong> En mode maintenance, seuls les administrateurs peuvent accéder au système. 
                Utilisez cette fonction avec précaution.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="mt-8 border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Database className="h-5 w-5 mr-2" />
              Informations Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Version CLAIR</h4>
                <p className="text-muted-foreground">v1.2.0</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Base de données</h4>
                <p className="text-muted-foreground">MongoDB 7.0</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Runtime</h4>
                <p className="text-muted-foreground">Node.js 20 LTS</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Dernière modification</h4>
                <p className="text-muted-foreground">{new Date().toLocaleString('fr-CA')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Settings, Shield, Database, Bell, 
  Globe, Users, Lock, Zap, AlertTriangle, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'Plateforme Irielle',
    timezone: 'America/Montreal',
    language: 'fr-CA',
    dateFormat: 'dd/MM/yyyy',
    
    // Security Settings
    sessionTimeout: 480, // 8 hours in minutes
    passwordPolicy: 'medium',
    twoFactorRequired: false,
    auditLogging: true,
    
    // Notification Settings
    emailNotifications: true,
    urgentAlerts: true,
    systemMaintenance: true,
    backupNotifications: true,
    
    // Data Settings
    dataRetention: 2555, // 7 years in days
    automaticBackup: true,
    backupFrequency: 'daily',
    exportFormat: 'csv'
  });

  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
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
  };

  const handleSaveSettings = async () => {
    try {
      // In a real implementation, this would save to database
      toast.success('Paramètres sauvegardés avec succès!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      systemName: 'Plateforme Irielle',
      timezone: 'America/Montreal',
      language: 'fr-CA',
      dateFormat: 'dd/MM/yyyy',
      sessionTimeout: 480,
      passwordPolicy: 'medium',
      twoFactorRequired: false,
      auditLogging: true,
      emailNotifications: true,
      urgentAlerts: true,
      systemMaintenance: true,
      backupNotifications: true,
      dataRetention: 2555,
      automaticBackup: true,
      backupFrequency: 'daily',
      exportFormat: 'csv'
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
          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Configuration Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Nom du système</Label>
                <Input
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Montreal">Montréal (UTC-5/-4)</SelectItem>
                    <SelectItem value="America/Toronto">Toronto (UTC-5/-4)</SelectItem>
                    <SelectItem value="America/Vancouver">Vancouver (UTC-8/-7)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr-CA">Français (Canada)</SelectItem>
                    <SelectItem value="en-CA">English (Canada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Format de date</Label>
                <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">JJ/MM/AAAA</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/JJ/AAAA</SelectItem>
                    <SelectItem value="yyyy-MM-dd">AAAA-MM-JJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Paramètres de Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Expiration de session (minutes)</Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 480 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Politique de mot de passe</Label>
                <Select value={settings.passwordPolicy} onValueChange={(value) => setSettings({ ...settings, passwordPolicy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible (4 caractères min)</SelectItem>
                    <SelectItem value="medium">Moyenne (6 caractères, PIN)</SelectItem>
                    <SelectItem value="high">Élevée (8+ caractères, complexe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">Exiger une vérification supplémentaire</p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorRequired: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Journalisation d'audit</Label>
                  <p className="text-sm text-muted-foreground">Enregistrer toutes les actions</p>
                </div>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => setSettings({ ...settings, auditLogging: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Alertes système par email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertes urgentes</Label>
                  <p className="text-sm text-muted-foreground">Notifications critiques immédiates</p>
                </div>
                <Switch
                  checked={settings.urgentAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, urgentAlerts: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Maintenance système</Label>
                  <p className="text-sm text-muted-foreground">Notifications de maintenance</p>
                </div>
                <Switch
                  checked={settings.systemMaintenance}
                  onCheckedChange={(checked) => setSettings({ ...settings, systemMaintenance: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sauvegardes</Label>
                  <p className="text-sm text-muted-foreground">État des sauvegardes automatiques</p>
                </div>
                <Switch
                  checked={settings.backupNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, backupNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Gestion des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Rétention des données (jours)</Label>
                <Input
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) || 2555 })}
                />
                <p className="text-xs text-muted-foreground">
                  Actuellement: {Math.round(settings.dataRetention / 365 * 10) / 10} années
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sauvegarde automatique</Label>
                  <p className="text-sm text-muted-foreground">Sauvegardes planifiées</p>
                </div>
                <Switch
                  checked={settings.automaticBackup}
                  onCheckedChange={(checked) => setSettings({ ...settings, automaticBackup: checked })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Fréquence des sauvegardes</Label>
                <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Format d'export par défaut</Label>
                <Select value={settings.exportFormat} onValueChange={(value) => setSettings({ ...settings, exportFormat: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card className="mt-8 border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Informations Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Version de la plateforme</h4>
                <p className="text-muted-foreground">Irielle v1.0.0</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Base de données</h4>
                <p className="text-muted-foreground">MongoDB 7.0</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Dernière sauvegarde</h4>
                <p className="text-muted-foreground">{new Date().toLocaleString('fr-CA')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
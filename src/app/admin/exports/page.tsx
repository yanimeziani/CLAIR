'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, ArrowLeft, Calendar, Users, FileText, Activity,
  Filter, Search, Database, BarChart3, AlertCircle, FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CustomPieChart, CustomBarChart, CustomLineChart } from '@/components/charts';
import { 
  processPatientData, 
  processReportsData, 
  processTimelineData
} from '@/lib/chart-utils';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export default function AdminExportsPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  
  // Export filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');

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
      
      // Only admin users can access exports
      if (data.user.role !== 'admin') {
        toast.error('Accès refusé: Seuls les administrateurs peuvent exporter des données');
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

  const fetchData = async () => {
    try {
      const [patientsRes, reportsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/reports')
      ]);

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData.patients || []);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleExport = async (type: 'patients' | 'reports' | 'bristol', format: 'csv' = 'csv') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (type === 'patients') {
        params.append('activeOnly', 'false');
      } else {
        // For reports and bristol, apply filters
        if (selectedPatient !== 'all') {
          params.append('patientId', selectedPatient);
        }
        if (selectedShift !== 'all') {
          params.append('shift', selectedShift);
        }
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }
      
      const response = await fetch(`/api/export/${type}?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let filename = '';
        switch (type) {
          case 'patients':
            filename = `residents-${new Date().toISOString().split('T')[0]}.${format}`;
            break;
          case 'reports':
            filename = `rapports-${dateRange.startDate}-${dateRange.endDate}.${format}`;
            break;
          case 'bristol':
            filename = `bristol-${dateRange.startDate}-${dateRange.endDate}.${format}`;
            break;
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export réussi!');
      } else {
        toast.error('Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  };


  // Process data for charts
  const patientChartData = processPatientData(patients);
  const reportsChartData = processReportsData(reports);
  const timelineData = processTimelineData(reports, 'reportDate');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement des exports...</p>
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
                <h1 className="text-2xl font-bold text-foreground">Exports & Statistiques</h1>
                <p className="text-muted-foreground">Centre d'exportation des données</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Export Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtres d'Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Résident</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les résidents</SelectItem>
                    {patients.map(patient => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Équipe</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les équipes</SelectItem>
                    <SelectItem value="day">Jour (6h-14h)</SelectItem>
                    <SelectItem value="evening">Soir (14h-22h)</SelectItem>
                    <SelectItem value="night">Nuit (22h-6h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Patients Export */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Données des Résidents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export complet des profils résidents avec informations personnelles, 
                contacts d'urgence et données médicales.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span>Résidents actifs: {patients.filter(p => p.isActive).length}</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
                  <span>Résidents archivés: {patients.filter(p => !p.isActive).length}</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleExport('patients', 'csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </CardContent>
          </Card>

          {/* Reports Export */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-500" />
                Rapports Quotidiens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export des rapports d'équipe avec résumés, champs personnalisés 
                et historique complet.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Période: {new Date(dateRange.startDate).toLocaleDateString('fr-FR')} - {new Date(dateRange.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
                {selectedPatient !== 'all' && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Filtré par résident</span>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleExport('reports', 'csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </CardContent>
          </Card>

          {/* Bristol Export */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-amber-500" />
                Suivi Bristol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export des données de surveillance Bristol avec échelles, 
                équipes et historique détaillé.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Données de surveillance</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Suivi par équipe et date</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleExport('bristol', 'csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mt-8" ref={chartsRef}>
          <h2 className="text-xl font-bold text-foreground mb-6">Visualisations Statistiques</h2>
          
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div data-chart>
              <CustomPieChart 
                data={patientChartData} 
                title="Répartition des Résidents" 
                className="border"
              />
            </div>
            
            <div data-chart>
              <CustomPieChart 
                data={reportsChartData} 
                title="Rapports par Équipe" 
                className="border"
              />
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            
            <div data-chart>
              <CustomLineChart 
                data={timelineData} 
                title="Évolution des Rapports (30 derniers jours)" 
                className="border"
              />
            </div>
          </div>
        </div>

        {/* Information Section */}
        <Card className="mt-6 border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Informations sur les Exports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Format CSV</h4>
              <p className="text-muted-foreground">
                Les fichiers CSV sont compatibles avec Excel, Google Sheets et autres outils d'analyse. 
                L'encodage UTF-8 préserve les caractères français.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Filtres Disponibles</h4>
              <p className="text-muted-foreground">
                Les filtres de date, résident et équipe s'appliquent aux rapports et données Bristol. 
                L'export des résidents inclut toujours tous les profils.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Données Personnelles</h4>
              <p className="text-muted-foreground">
                Tous les exports respectent la confidentialité des données. Utilisez uniquement 
                dans le cadre professionnel selon les politiques de l'établissement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, ArrowLeft, Plus, Search, Filter, Calendar, 
  User, Clock, Edit, Eye, MoreHorizontal, Sun, Moon, Sunset, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { SHIFTS } from '@/lib/constants/shifts';
import { HtmlContent } from '@/components/ui/html-content';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface ReportTemplate {
  _id: string;
  templateName: string;
  fields: {
    fieldName: string;
    fieldType: 'text' | 'textarea' | 'dropdown' | 'checkbox';
    options: string[];
  }[];
  isActive: boolean;
}

interface DailyReport {
  _id: string;
  patientId: string;
  authorId: string;
  shift: 'day' | 'evening' | 'night';
  reportDate: string;
  summary: string;
  customFields: Record<string, any>;
  createdAt: string;
  patient?: Patient;
  authorName?: string;
}


export default function ReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    shift: 'night' as 'day' | 'evening' | 'night',
    reportDate: new Date().toISOString().split('T')[0],
    summary: '',
    customFields: {} as Record<string, any>
  });

  const router = useRouter();

  useEffect(() => {
    const initReports = async () => {
      await checkSession();
      await fetchData();
    };
    initReports();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async (format: 'csv' = 'csv') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (patientFilter !== 'all') {
        params.append('patientId', patientFilter);
      }
      if (shiftFilter !== 'all') {
        params.append('shift', shiftFilter);
      }
      
      const response = await fetch(`/api/export/reports?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapports-quotidiens-${new Date().toISOString().split('T')[0]}.${format}`;
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
      const [reportsRes, patientsRes, templatesRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/patients'),
        fetch('/api/admin/templates')
      ]);

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData.patients?.filter((p: Patient) => p.isActive) || []);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates?.filter((t: ReportTemplate) => t.isActive) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const today = new Date().toISOString().split('T')[0];
    
    // Search filter
    const matchesSearch = searchTerm === '' || 
      report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.patient && 
        `${report.patient.firstName} ${report.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Patient filter
    const matchesPatient = patientFilter === 'all' || report.patientId === patientFilter;
    
    // Shift filter
    const matchesShift = shiftFilter === 'all' || report.shift === shiftFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = report.reportDate.startsWith(today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(report.reportDate) >= weekAgo;
    }
    
    return matchesSearch && matchesPatient && matchesShift && matchesDate;
  });

  const openCreateDialog = () => {
    setSelectedReport(null);
    setIsEditMode(false);
    setIsViewMode(false);
    setFormData({
      patientId: '',
      shift: 'night',
      reportDate: new Date().toISOString().split('T')[0],
      summary: '',
      customFields: {}
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (report: DailyReport) => {
    setSelectedReport(report);
    setIsEditMode(true);
    setIsViewMode(false);
    setFormData({
      patientId: report.patientId,
      shift: report.shift,
      reportDate: report.reportDate,
      summary: report.summary,
      customFields: report.customFields || {}
    });
    setIsDialogOpen(true);
  };

  const openViewDialog = (report: DailyReport) => {
    setSelectedReport(report);
    setIsEditMode(false);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.summary.trim()) {
      toast.error('Usager et résumé sont requis');
      return;
    }

    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const payload = isEditMode 
        ? { ...formData, reportId: selectedReport!._id }
        : formData;

      const response = await fetch('/api/reports', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEditMode ? 'Rapport modifié avec succès' : 'Rapport créé avec succès');
        setIsDialogOpen(false);
        setSelectedReport(null);
        setIsEditMode(false);
        setIsViewMode(false);
        fetchData();
      } else {
        toast.error(data.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du rapport`);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error(`Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du rapport`);
    }
  };

  const getShiftInfo = (shift: string) => {
    return SHIFTS.find(s => s.value === shift);
  };

  const getCurrentTemplate = () => {
    return templates.find(t => t.isActive) || null;
  };

  const renderCustomField = (field: any, value: any, onChange: (value: any) => void) => {
    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Entrez ${field.fieldName.toLowerCase()}`}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Entrez ${field.fieldName.toLowerCase()}`}
            className="w-full p-3 border border-border rounded-md bg-background text-foreground min-h-[80px] resize-vertical"
          />
        );
      
      case 'dropdown':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Sélectionner ${field.fieldName.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded"
            />
            <Label className="text-sm">Oui</Label>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement des rapports...</p>
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
                <h1 className="text-2xl font-bold text-foreground">Rapports Quotidiens</h1>
                <p className="text-muted-foreground">Suivi des équipes par usager</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {currentUser?.role === 'admin' && (
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
              )}
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Rapport
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les rapports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger>
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les usagers</SelectItem>
                  {patients.map(patient => (
                    <SelectItem key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger>
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les équipes</SelectItem>
                  {SHIFTS.map(shift => (
                    <SelectItem key={shift.value} value={shift.value}>
                      {shift.label}
                    </SelectItem>
                  ))}
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

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const shiftInfo = getShiftInfo(report.shift);
            const ShiftIcon = shiftInfo?.icon || Clock;
            
            return (
              <Card key={report._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {report.patient ? 
                              `${report.patient.firstName} ${report.patient.lastName}` : 
                              'Usager inconnu'
                            }
                          </span>
                        </div>
                        
                        <div className={`flex items-center space-x-2 ${shiftInfo?.color}`}>
                          <ShiftIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{shiftInfo?.label}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date(report.reportDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      
                      <HtmlContent 
                        content={report.summary}
                        className="text-foreground mb-3 line-clamp-2"
                      />
                      
                      <div className="text-sm text-muted-foreground">
                        <span>Par {report.authorName || 'Auteur inconnu'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(report.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(report)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(report)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl shadow-blue-100/50 text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Aucun rapport trouvé</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || patientFilter !== 'all' || shiftFilter !== 'all' || dateFilter !== 'today' 
                  ? 'Essayez de modifier vos critères de recherche pour voir plus de rapports'
                  : 'Aucun rapport disponible pour la période sélectionnée'
                }
              </p>
              <Button 
                onClick={openCreateDialog}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier rapport
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Report Dialog */}
      <Dialog open={isDialogOpen && !isViewMode} onOpenChange={(open) => {
        if (!isViewMode) {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedReport(null);
            setIsEditMode(false);
            setIsViewMode(false);
          }
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Modifier le Rapport' : 'Nouveau Rapport Quotidien'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usager *</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un usager" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Équipe *</Label>
                <Select value={formData.shift} onValueChange={(value: any) => setFormData({ ...formData, shift: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map(shift => (
                      <SelectItem key={shift.value} value={shift.value}>
                        {shift.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date du rapport</Label>
              <Input
                type="date"
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Résumé de l'équipe *</Label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Résumé général de l'équipe pour cet usager..."
                className="w-full p-3 border border-border rounded-md bg-background text-foreground min-h-[100px] resize-vertical"
                required
              />
            </div>

            {/* Custom Fields */}
            {getCurrentTemplate() && getCurrentTemplate()!.fields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Champs personnalisés</h3>
                {getCurrentTemplate()!.fields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <Label>{field.fieldName}</Label>
                    {renderCustomField(
                      field,
                      formData.customFields[field.fieldName],
                      (value) => setFormData({
                        ...formData,
                        customFields: {
                          ...formData.customFields,
                          [field.fieldName]: value
                        }
                      })
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setSelectedReport(null);
                setIsEditMode(false);
                setIsViewMode(false);
              }} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                {isEditMode ? 'Modifier le rapport' : 'Créer le rapport'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={isDialogOpen && isViewMode} onOpenChange={(open) => {
        if (isViewMode) {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedReport(null);
            setIsEditMode(false);
            setIsViewMode(false);
          }
        }
      }}>
        <DialogContent className="max-w-2xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>Détails du Rapport</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Usager</Label>
                    <p className="font-medium">
                      {selectedReport.patient ? 
                        `${selectedReport.patient.firstName} ${selectedReport.patient.lastName}` : 
                        'Usager inconnu'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Équipe</Label>
                    <p className="font-medium">{getShiftInfo(selectedReport.shift)?.label}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{new Date(selectedReport.reportDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Auteur</Label>
                    <p className="font-medium">{selectedReport.authorName || 'Auteur inconnu'}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Résumé de l'équipe</Label>
                  <div className="mt-1 bg-muted/50 p-3 rounded-lg">
                    <HtmlContent content={selectedReport.summary} />
                  </div>
                </div>

                {selectedReport.customFields && Object.keys(selectedReport.customFields).length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Champs personnalisés</Label>
                    <div className="space-y-2 mt-1">
                      {Object.entries(selectedReport.customFields).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="font-medium">{key}:</span>
                          <span>{typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
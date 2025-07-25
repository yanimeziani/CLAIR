'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, ArrowLeft, Plus, Search, Calendar, 
  User, Clock, Edit, Save, X, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SHIFTS } from '@/lib/constants/shifts';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

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

interface PatientReport {
  patientId: string;
  summary: string;
  customFields: Record<string, any>;
  authorId?: string;
}

interface DailyReport {
  _id: string;
  shift: 'day' | 'evening' | 'night';
  reportDate: string;
  shiftSummary: string;
  patientReports: PatientReport[];
  createdAt: string;
  updatedAt: string;
}

interface PatientReportData {
  patientId: string;
  summary: string;
  customFields: Record<string, any>;
  isEditing: boolean;
  hasChanges: boolean;
}


export default function ReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Current shift and date
  const [currentShift, setCurrentShift] = useState<'day' | 'evening' | 'night'>('night');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Patient reports data
  const [patientReports, setPatientReports] = useState<Record<string, PatientReportData>>({});

  const router = useRouter();

  useEffect(() => {
    const initReports = async () => {
      await checkSession();
      await fetchData();
    };
    initReports();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Load existing reports when shift or date changes
    loadExistingReports();
  }, [currentShift, currentDate, patients]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const [patientsRes, templatesRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/admin/templates')
      ]);

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

  const loadExistingReports = async () => {
    if (patients.length === 0) return;

    try {
      // Get existing daily report for current shift and date
      const response = await fetch(`/api/reports?shift=${currentShift}&date=${currentDate}`);
      const data = await response.json();
      
      const newPatientReports: Record<string, PatientReportData> = {};
      
      // Initialize all patients with empty reports
      patients.forEach(patient => {
        newPatientReports[patient._id] = {
          patientId: patient._id,
          summary: '',
          customFields: {},
          isEditing: false,
          hasChanges: false
        };
      });

      // If we have existing reports, populate them
      if (data.success && data.reports && data.reports.length > 0) {
        const dailyReport = data.reports[0]; // Should be only one for this shift/date
        if (dailyReport.patientReports) {
          dailyReport.patientReports.forEach((report: PatientReport) => {
            if (newPatientReports[report.patientId]) {
              newPatientReports[report.patientId] = {
                patientId: report.patientId,
                summary: report.summary,
                customFields: report.customFields || {},
                isEditing: false,
                hasChanges: false
              };
            }
          });
        }
      }

      setPatientReports(newPatientReports);
    } catch (error) {
      console.error('Error loading existing reports:', error);
      // Initialize empty reports for all patients
      const emptyReports: Record<string, PatientReportData> = {};
      patients.forEach(patient => {
        emptyReports[patient._id] = {
          patientId: patient._id,
          summary: '',
          customFields: {},
          isEditing: false,
          hasChanges: false
        };
      });
      setPatientReports(emptyReports);
    }
  };

  const toggleEdit = (patientId: string) => {
    setPatientReports(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        isEditing: !prev[patientId].isEditing
      }
    }));
  };

  const updatePatientReport = (patientId: string, field: string, value: any) => {
    setPatientReports(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        [field]: value,
        hasChanges: true
      }
    }));
  };

  const updateCustomField = (patientId: string, fieldName: string, value: any) => {
    setPatientReports(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        customFields: {
          ...prev[patientId].customFields,
          [fieldName]: value
        },
        hasChanges: true
      }
    }));
  };

  const savePatientReport = async (patientId: string) => {
    const reportData = patientReports[patientId];
    if (!reportData.summary.trim()) {
      toast.error('Le résumé est requis');
      return;
    }

    setSaving(patientId);
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          shift: currentShift,
          reportDate: currentDate,
          summary: reportData.summary,
          customFields: reportData.customFields
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Rapport sauvegardé avec succès');
        setPatientReports(prev => ({
          ...prev,
          [patientId]: {
            ...prev[patientId],
            isEditing: false,
            hasChanges: false
          }
        }));
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde du rapport');
      }
    } catch (error) {
      console.error('Error saving patient report:', error);
      toast.error('Erreur lors de la sauvegarde du rapport');
    } finally {
      setSaving(null);
    }
  };

  const getCurrentTemplate = () => {
    return templates.find(t => t.isActive) || null;
  };

  const renderCustomField = (patientId: string, field: any, value: any) => {
    const onChange = (newValue: any) => updateCustomField(patientId, field.fieldName, newValue);
    
    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Entrez ${field.fieldName.toLowerCase()}`}
            disabled={!patientReports[patientId]?.isEditing}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Entrez ${field.fieldName.toLowerCase()}`}
            disabled={!patientReports[patientId]?.isEditing}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Entrez ${field.fieldName.toLowerCase()}`}
            className="w-full p-3 border border-border rounded-md bg-background text-foreground min-h-[80px] resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!patientReports[patientId]?.isEditing}
          />
        );
      
      case 'dropdown':
        return (
          <Select 
            value={value || ''} 
            onValueChange={onChange}
            disabled={!patientReports[patientId]?.isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Sélectionner ${field.fieldName.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.filter((option: string) => option && option.trim()).map((option: string) => (
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
              className="rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!patientReports[patientId]?.isEditing}
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

  const currentShiftInfo = SHIFTS.find(s => s.value === currentShift);

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
                <p className="text-muted-foreground">Tous les usagers - Vue d'ensemble</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Shift and Date Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Configuration du rapport</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Équipe</Label>
                <Select value={currentShift} onValueChange={(value: any) => setCurrentShift(value)}>
                  <SelectTrigger>
                    <Clock className="h-4 w-4 mr-2" />
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
              
              <div className="space-y-2">
                <Label>Date du rapport</Label>
                <Input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Patients Reports */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Rapports - {currentShiftInfo?.label} du {new Date(currentDate).toLocaleDateString('fr-FR')}
            </h2>
            <div className="text-sm text-muted-foreground">
              {patients.length} usager{patients.length > 1 ? 's' : ''}
            </div>
          </div>

          {patients.map((patient) => {
            const reportData = patientReports[patient._id];
            if (!reportData) return null;

            const isEditing = reportData.isEditing;
            const isSaving = saving === patient._id;
            const hasChanges = reportData.hasChanges;
            const currentTemplate = getCurrentTemplate();

            return (
              <Card key={patient._id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">
                        {patient.firstName} {patient.lastName}
                      </CardTitle>
                      {hasChanges && !isEditing && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Modifications non sauvegardées
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleEdit(patient._id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEdit(patient._id)}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => savePatientReport(patient._id)}
                            disabled={isSaving || !reportData.summary.trim()}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Résumé de l'équipe *</Label>
                      {isEditing ? (
                        <RichTextEditor
                          content={reportData.summary}
                          onChange={(content) => updatePatientReport(patient._id, 'summary', content)}
                          placeholder={`Décrivez l'état général de ${patient.firstName}, les observations importantes, les interventions effectuées...`}
                          className="min-h-[200px]"
                          showAIToolbar={true}
                        />
                      ) : (
                        <div className="min-h-[100px] p-4 border border-border rounded-md bg-muted/20">
                          {reportData.summary ? (
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: reportData.summary }}
                            />
                          ) : (
                            <p className="text-muted-foreground italic">Aucun résumé saisi</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Custom Fields */}
                    {currentTemplate && currentTemplate.fields.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="text-base font-medium">Champs personnalisés</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentTemplate.fields.map((field, index) => (
                              <div key={index} className="space-y-2">
                                <Label className="text-sm font-medium">{field.fieldName}</Label>
                                {renderCustomField(
                                  patient._id,
                                  field,
                                  reportData.customFields[field.fieldName]
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {patients.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">Aucun usager actif</h3>
                <p className="text-muted-foreground">
                  Aucun usager actif n'est disponible pour créer des rapports.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
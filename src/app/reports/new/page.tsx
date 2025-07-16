'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, ArrowLeft, Save, X, User, Clock, Calendar, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Stepper, 
  StepperItem, 
  StepperContent, 
  StepperHeader, 
  StepperTitle, 
  StepperDescription, 
  StepperNavigation 
} from '@/components/ui/stepper';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { SHIFTS } from '@/lib/constants/shifts';

const STEPS = [
  {
    id: 1,
    title: "Résident & Équipe",
    description: "Sélectionner le résident et l'équipe"
  },
  {
    id: 2,
    title: "Informations de base",
    description: "Date et résumé du rapport"
  },
  {
    id: 3,
    title: "Champs personnalisés",
    description: "Informations spécifiques du modèle"
  },
  {
    id: 4,
    title: "Révision",
    description: "Vérifier et créer le rapport"
  }
];

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
    fieldType: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'number';
    options: string[];
  }[];
  isActive: boolean;
}


export default function NewReportPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);

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
    checkSession();
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.patientId || !formData.shift) {
          toast.error('Veuillez sélectionner un résident et une équipe');
          return false;
        }
        return true;
      case 2:
        if (!formData.summary.trim()) {
          toast.error('Veuillez saisir le résumé de l\'équipe');
          return false;
        }
        return true;
      case 3:
        // Custom fields are optional
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Rapport créé avec succès');
        router.push('/reports');
      } else {
        toast.error(data.error || 'Erreur lors de la création du rapport');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Erreur lors de la création du rapport');
    } finally {
      setSaving(false);
    }
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
      
      case 'number':
        return (
          <Input
            type="number"
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
              className="rounded"
            />
            <Label className="text-sm">Oui</Label>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepperContent>
            <StepperHeader>
              <StepperTitle>Sélection du résident et de l'équipe</StepperTitle>
              <StepperDescription>
                Choisissez le résident concerné et l'équipe qui effectue le rapport
              </StepperDescription>
            </StepperHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Résident *</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                  <SelectTrigger>
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sélectionner un résident" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez le résident pour lequel vous créez ce rapport
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Équipe *</Label>
                <Select value={formData.shift} onValueChange={(value: any) => setFormData({ ...formData, shift: value })}>
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
                <p className="text-sm text-muted-foreground">
                  Indiquez l'équipe qui effectue ce rapport
                </p>
              </div>
            </div>
          </StepperContent>
        );

      case 2:
        return (
          <StepperContent>
            <StepperHeader>
              <StepperTitle>Informations du rapport</StepperTitle>
              <StepperDescription>
                Saisissez la date et le résumé de l'équipe
              </StepperDescription>
            </StepperHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Date du rapport</Label>
                <Input
                  type="date"
                  value={formData.reportDate}
                  onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                  className="w-fit"
                />
                <p className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date à laquelle ce rapport s'applique
                </p>
              </div>

              <div className="space-y-2">
                <Label>Résumé de l'équipe *</Label>
                <RichTextEditor
                  content={formData.summary}
                  onChange={(content) => setFormData({ ...formData, summary: content })}
                  placeholder="Décrivez l'état général du résident, les observations importantes, les interventions effectuées..."
                  className="min-h-[200px]"
                />
                <p className="text-sm text-muted-foreground">
                  Utilisez les fonctions IA pour corriger et résumer votre texte - Soyez précis et professionnel
                </p>
              </div>
            </div>
          </StepperContent>
        );

      case 3:
        const currentTemplate = getCurrentTemplate();
        return (
          <StepperContent>
            <StepperHeader>
              <StepperTitle>Champs personnalisés</StepperTitle>
              <StepperDescription>
                {currentTemplate && currentTemplate.fields.length > 0 
                  ? "Complétez les informations spécifiques du modèle"
                  : "Aucun champ personnalisé configuré"
                }
              </StepperDescription>
            </StepperHeader>

            <div className="space-y-6">
              {currentTemplate && currentTemplate.fields.length > 0 ? (
                currentTemplate.fields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-base font-medium">{field.fieldName}</Label>
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
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun champ personnalisé n'est configuré pour les rapports.</p>
                  <p className="text-sm">Vous pouvez passer à l'étape suivante.</p>
                </div>
              )}
            </div>
          </StepperContent>
        );

      case 4:
        const template = getCurrentTemplate();
        const selectedPatient = patients.find(p => p._id === formData.patientId);
        const selectedShift = SHIFTS.find(s => s.value === formData.shift);
        
        return (
          <StepperContent>
            <StepperHeader>
              <StepperTitle>Révision du rapport</StepperTitle>
              <StepperDescription>
                Vérifiez les informations avant de créer le rapport
              </StepperDescription>
            </StepperHeader>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Résident</Label>
                      <p className="text-sm">
                        {selectedPatient 
                          ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                          : 'Aucun résident sélectionné'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Équipe</Label>
                      <p className="text-sm">{selectedShift?.label || 'Aucune équipe sélectionnée'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date du rapport</Label>
                    <p className="text-sm">
                      {new Date(formData.reportDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Résumé de l'équipe</Label>
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{formData.summary}</p>
                    </div>
                  </div>

                  {template && template.fields.length > 0 && formData.customFields && Object.keys(formData.customFields).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Champs personnalisés</Label>
                        <div className="space-y-2 mt-2">
                          {Object.entries(formData.customFields).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <span className="font-medium text-sm">{key}:</span>
                              <span className="text-sm">{typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </StepperContent>
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
          <p className="text-muted-foreground">Chargement...</p>
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
              <Button variant="ghost" onClick={() => router.push('/reports')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux rapports
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Nouveau Rapport Quotidien</h1>
                <p className="text-muted-foreground">Créer un rapport d'équipe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Stepper */}
        <Stepper className="mb-8">
          {STEPS.map((step, index) => (
            <StepperItem
              key={step.id}
              isActive={currentStep === step.id}
              isCompleted={currentStep > step.id}
              isLast={index === STEPS.length - 1}
            >
              {step.id}
            </StepperItem>
          ))}
        </Stepper>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {renderStepContent()}

            {/* Navigation */}
            <StepperNavigation>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Précédent
              </Button>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => router.push('/reports')}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                
                {currentStep < STEPS.length ? (
                  <Button onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    Suivant
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={saving} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Création...' : 'Créer le rapport'}
                  </Button>
                )}
              </div>
            </StepperNavigation>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
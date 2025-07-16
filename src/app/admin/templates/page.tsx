'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, ArrowLeft, Plus, Trash2, Edit, Save, X,
  MoveUp, MoveDown, Type, AlignLeft, List, CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TemplateField {
  fieldName: string;
  fieldType: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'number';
  options: string[];
}

interface ReportTemplate {
  _id: string;
  templateName: string;
  fields: TemplateField[];
  isActive: boolean;
  assignedPatientId?: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texte court', icon: Type },
  { value: 'textarea', label: 'Texte long', icon: AlignLeft },
  { value: 'number', label: 'Nombre', icon: Type },
  { value: 'dropdown', label: 'Liste déroulante', icon: List },
  { value: 'checkbox', label: 'Case à cocher', icon: CheckSquare }
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [formData, setFormData] = useState({
    templateName: '',
    fields: [] as TemplateField[],
    assignedPatientId: ''
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
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

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erreur lors du chargement des modèles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients?.filter((p: Patient) => p.isActive) || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }, []);

  useEffect(() => {
    checkSession();
    fetchTemplates();
    fetchPatients();
  }, [checkSession, fetchTemplates, fetchPatients]);

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormData({
      templateName: '',
      fields: [],
      assignedPatientId: ''
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setFormData({
      templateName: template.templateName,
      fields: [...template.fields],
      assignedPatientId: template.assignedPatientId || ''
    });
    setIsDialogOpen(true);
  };

  const addField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { fieldName: '', fieldType: 'text', options: [] }]
    });
  };

  const removeField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  const updateField = (index: number, field: Partial<TemplateField>) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...field };
    setFormData({ ...formData, fields: newFields });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...formData.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFormData({ ...formData, fields: newFields });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.templateName.trim()) {
      toast.error('Nom du modèle requis');
      return;
    }

    if (formData.fields.length === 0) {
      toast.error('Au moins un champ est requis');
      return;
    }

    // Validate fields
    for (const field of formData.fields) {
      if (!field.fieldName.trim()) {
        toast.error('Tous les champs doivent avoir un nom');
        return;
      }
      if (field.fieldType === 'dropdown' && field.options.length === 0) {
        toast.error('Les listes déroulantes doivent avoir des options');
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Modèle sauvegardé');
        setIsDialogOpen(false);
        fetchTemplates();
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getFieldTypeInfo = (type: string) => {
    return FIELD_TYPES.find(t => t.value === type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement des modèles...</p>
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
                <h1 className="text-2xl font-bold text-foreground">Modèles de Rapports</h1>
                <p className="text-muted-foreground">Personnaliser les champs des rapports quotidiens</p>
              </div>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Modèle
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Current Templates */}
        <div className="space-y-6">
          {templates.map((template) => (
            <Card key={template._id} className={`${template.isActive ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {template.templateName}
                      {template.isActive && (
                        <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          ACTIF
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.fields.length} champ(s) personnalisé(s)
                      {template.assignedPatientId && (
                        <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                          Assigné à un patient
                        </span>
                      )}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => openEditDialog(template)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {template.fields.map((field, index) => {
                    const typeInfo = getFieldTypeInfo(field.fieldType);
                    const TypeIcon = typeInfo?.icon || Type;
                    
                    return (
                      <div key={index} className="border border-border rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{field.fieldName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{typeInfo?.label}</p>
                        {field.fieldType === 'dropdown' && field.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Options:</p>
                            <div className="flex flex-wrap gap-1">
                              {field.options.slice(0, 3).map((option, optIndex) => (
                                <span key={optIndex} className="text-xs bg-muted px-1 py-0.5 rounded">
                                  {option}
                                </span>
                              ))}
                              {field.options.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{field.options.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun modèle configuré</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier modèle pour personnaliser les rapports quotidiens
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un modèle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Nom du modèle *</Label>
                <Input
                  id="templateName"
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                  placeholder="ex: Rapport Standard"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientSelect">Assigner à un patient (optionnel)</Label>
                <Select 
                  value={formData.assignedPatientId || "none"} 
                  onValueChange={(value) => setFormData({ ...formData, assignedPatientId: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="patientSelect">
                    <SelectValue placeholder="Sélectionner un patient spécifique..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun patient (modèle général)</SelectItem>
                    {patients.map(patient => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Si un patient est sélectionné, ce modèle ne sera disponible que pour ce patient
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Champs personnalisés</Label>
                <Button type="button" variant="outline" onClick={addField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un champ
                </Button>
              </div>

              {formData.fields.map((field, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nom du champ *</Label>
                      <Input
                        value={field.fieldName}
                        onChange={(e) => updateField(index, { fieldName: e.target.value })}
                        placeholder="ex: Humeur générale"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type de champ</Label>
                      <Select 
                        value={field.fieldType} 
                        onValueChange={(value: any) => updateField(index, { fieldType: value, options: value === 'dropdown' ? [''] : [] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(type => {
                            const TypeIcon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center space-x-2">
                                  <TypeIcon className="h-4 w-4" />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => moveField(index, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => moveField(index, 'down')}
                        disabled={index === formData.fields.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {field.fieldType === 'dropdown' && (
                    <div className="mt-4 space-y-2">
                      <Label>Options (une par ligne)</Label>
                      <textarea
                        value={field.options.join('\n')}
                        onChange={(e) => updateField(index, { 
                          options: e.target.value.split('\n').filter(opt => opt.trim()) 
                        })}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        className="w-full p-3 border border-border rounded-md bg-background text-foreground min-h-[80px] resize-vertical"
                      />
                    </div>
                  )}
                </Card>
              ))}

              {formData.fields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucun champ configuré</p>
                  <Button type="button" variant="outline" onClick={addField} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le premier champ
                  </Button>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingTemplate ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
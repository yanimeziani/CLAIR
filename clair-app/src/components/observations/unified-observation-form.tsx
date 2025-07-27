'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, X, FileText, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SwitchSetting } from '@/components/ui/switch-setting';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface UnifiedObservationFormProps {
  // Quick mode (dashboard): no patientId, user selects from dropdown
  // Patient mode (patients page): patientId provided, skip selection
  patientId?: string;
  patientName?: string;
  // UI customization
  mode?: 'quick' | 'detailed'; // 'quick' = simple interface, 'detailed' = full features
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

interface FormData {
  patientId: string;
  content: string;
  isSignificant: boolean;
}

export function UnifiedObservationForm({ 
  patientId: initialPatientId,
  patientName,
  mode = 'detailed',
  onSuccess,
  trigger 
}: UnifiedObservationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<FormData>({
    patientId: initialPatientId || '',
    content: '',
    isSignificant: false,
  });

  const isQuickMode = mode === 'quick';
  const isPatientMode = !!initialPatientId;

  useEffect(() => {
    if (isOpen) {
      checkSession();
      if (!isPatientMode) {
        fetchPatients();
      }
    }
  }, [isOpen, isPatientMode]);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (!data.authenticated) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setIsOpen(false);
        return;
      }
      
      setCurrentUser(data.user);
    } catch (error) {
      toast.error('Erreur de session. Veuillez vous reconnecter.');
      setIsOpen(false);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      
      if (data.success) {
        const activePatients = data.patients.filter((p: Patient) => p.isActive);
        setPatients(activePatients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Erreur lors du chargement des usagers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.content.trim()) {
      toast.error('Veuillez sélectionner un usager et ajouter du contenu');
      return;
    }

    if (!currentUser) {
      toast.error('Utilisateur non authentifié');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        patientId: formData.patientId,
        content: formData.content,
        isSignificant: formData.isSignificant,
        authorName: `${currentUser.firstName} ${currentUser.lastName}`,
        authorEmployeeNumber: currentUser.employeeNumber || currentUser.userId,
        signature: {
          signedAt: new Date().toISOString(),
          ipAddress: '',
          userAgent: navigator.userAgent,
        }
      };

      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Observation enregistrée avec succès');
        handleClose();
        onSuccess?.();
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error saving observation:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      patientId: initialPatientId || '',
      content: '',
      isSignificant: false,
    });
  };

  const selectedPatient = patients.find(p => p._id === formData.patientId);
  const displayTitle = isPatientMode ? `Nouvelle observation - ${patientName}` : 'Nouvelle Observation';

  // Default triggers based on mode
  const defaultTrigger = isQuickMode ? (
    <Button variant="outline" className="h-20 flex flex-col min-h-[44px] border-2 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/20 hover:to-green-600/10 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg mb-2 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300">
        <FileText className="h-5 w-5 text-white" />
      </div>
      <span className="text-xs sm:text-sm font-medium">Nouvelle Observation</span>
    </Button>
  ) : (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Nouvelle observation
    </Button>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger || defaultTrigger}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{displayTitle}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Selection (only for quick mode) */}
            {!isPatientMode && (
              <div className="space-y-2">
                <Label htmlFor="patient">Usager *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un usager">
                      {selectedPatient && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>Chargement...</SelectItem>
                    ) : patients.length > 0 ? (
                      patients.map((patient) => (
                        <SelectItem key={patient._id} value={patient._id}>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {patient.firstName} {patient.lastName}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Aucun usager actif</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}


            {/* Significance Toggle (detailed mode only) */}
            {!isQuickMode && (
              <SwitchSetting
                label="Événement significatif"
                description="Marquer cette observation comme particulièrement importante pour les professionnels"
                checked={formData.isSignificant}
                onCheckedChange={(checked) => setFormData({ ...formData, isSignificant: checked })}
              />
            )}

            {/* Content Editor */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Contenu de l'observation *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder={isQuickMode 
                  ? "Décrivez l'observation, comportement, ou événement notable..."
                  : "Décrivez votre observation de manière détaillée et professionnelle..."
                }
                className={isQuickMode ? "min-h-[150px]" : "min-h-[200px]"}
              />
              <p className="text-sm text-muted-foreground">
                Cette observation sera signée électroniquement avec votre nom et horodatage.
              </p>
            </div>

            {/* Digital Signature Info (detailed mode only) */}
            {!isQuickMode && currentUser && (
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Signature électronique</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Cette observation sera signée par <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                        {currentUser.employeeNumber && <span> (#{currentUser.employeeNumber})</span>}
                        {' '}le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || !formData.patientId || !formData.content.trim()}
                className={isQuickMode 
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  : ""
                }
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement...' : (isQuickMode ? 'Enregistrer' : 'Enregistrer et signer')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
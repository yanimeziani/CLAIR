'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Save, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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

interface QuickObservationFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

interface FormData {
  patientId: string;
  content: string;
}

export function QuickObservationForm({ 
  onSuccess,
  trigger 
}: QuickObservationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    content: '',
  });

  useEffect(() => {
    if (isOpen) {
      checkSession();
      fetchPatients();
    }
  }, [isOpen]);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.authenticated) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Session check error:', error);
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
      toast.error('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patientId: formData.patientId,
        content: formData.content,
        authorName: currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`,
        authorEmployeeNumber: currentUser.employeeNumber || currentUser.userId,
        signature: {
          userAgent: navigator.userAgent
        }
      };

      console.log('Sending payload:', payload);

      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Observation ajoutée avec succès');
        handleClose();
        onSuccess?.();
      } else {
        toast.error(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating observation:', error);
      toast.error('Erreur lors de la création de l\'observation');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      patientId: '',
      content: '',
    });
  };

  const selectedPatient = patients.find(p => p._id === formData.patientId);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button variant="outline" className="h-20 flex flex-col min-h-[44px] border-2 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/20 hover:to-green-600/10 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg mb-2 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium">Nouvelle Observation</span>
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Nouvelle Observation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Selection */}
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

            {/* Observation Content */}
            <div className="space-y-2">
              <Label>Contenu de l'observation *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Décrivez l'observation, comportement, ou événement notable..."
              />
            </div>


            {/* Action Buttons */}
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
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}